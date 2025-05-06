import { EventEmitter } from "events"
import * as vscode from "vscode"
import fs from "fs/promises"
import * as path from "path"

import { getWorkspacePath } from "../utils/path"
import { ClineProvider } from "../core/webview/ClineProvider"
import { RooCodeSettings, RooCodeEvents, RooCodeEventName } from "../schemas"
import { IpcMessageType, IpcOrigin, TaskCommandName, TaskCommand } from "../schemas/ipc"
import { getApiMetrics } from "../shared/getApiMetrics"

import { RooCodeAPI } from "./interface"
import { IpcServer } from "./ipc"
import { outputChannelLog } from "./log"

export class API extends EventEmitter<RooCodeEvents> implements RooCodeAPI {
	private readonly outputChannel: vscode.OutputChannel
	private readonly sidebarProvider: ClineProvider
	private readonly context: vscode.ExtensionContext
	private readonly ipc?: IpcServer
	private readonly taskMap = new Map<string, ClineProvider>()
	private readonly log: (...args: unknown[]) => void
	private logfile?: string

	constructor(
		outputChannel: vscode.OutputChannel,
		provider: ClineProvider,
		ipcConfig?: {
			socketPath?: string
			tcpHost?: string
			tcpPort?: string | number
		},
		enableLogging = false,
	) {
		super()
		this.outputChannel = outputChannel
		this.sidebarProvider = provider
		this.context = provider.context
		this.log = () => {}

		// Always enable logging to output window
		this.log = (...args: unknown[]) => {
			outputChannelLog(this.outputChannel, ...args)
			this.outputChannel.show()
		}

		if (enableLogging) {
			this.logfile = path.join(getWorkspacePath(), "roo-code-messages.log")
		}

		this.registerListeners(this.sidebarProvider)

		if (ipcConfig) {
			const ipcOptions = ipcConfig.tcpPort
				? { host: ipcConfig.tcpHost || "localhost", port: ipcConfig.tcpPort }
				: { socketPath: ipcConfig.socketPath }

			// Create a logger that writes to the output window
			const ipcLogger = (...args: unknown[]) => {
				outputChannelLog(this.outputChannel, "[IPC]", ...args)
				this.outputChannel.show()
			}

			this.log("[IPC] Starting server with options:", ipcOptions)
			const ipc = (this.ipc = new IpcServer(ipcOptions, ipcLogger))
			ipc.listen()
			this.log("[IPC] Server listening on", ipcOptions.socketPath || `${ipcOptions.host}:${ipcOptions.port}`)
		}
	}

	private async fileLog(message: string): Promise<void> {
		if (!this.logfile) {
			return
		}

		try {
			await fs.appendFile(this.logfile, message, "utf8")
		} catch (_) {
			this.logfile = undefined
		}
	}

	public getMessages(taskId: string, clientId: string): void {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			this.sendResponse(clientId, TaskCommandName.GetMessages, provider.messages || [])
		} else {
			this.sendResponse(clientId, TaskCommandName.GetMessages, [])
		}
	}

	public getTokenUsage(taskId: string, clientId: string): void {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			const cline = provider.getCurrentCline()
			if (cline) {
				this.sendResponse(clientId, TaskCommandName.GetTokenUsage, getApiMetrics(cline.clineMessages))
			} else {
				this.sendResponse(clientId, TaskCommandName.GetTokenUsage, undefined)
			}
		} else {
			this.sendResponse(clientId, TaskCommandName.GetTokenUsage, undefined)
		}
	}

	private sendResponse(clientId: string, commandName: TaskCommandName, data: any): void {
		if (this.ipc) {
			this.ipc.send(clientId, {
				type: IpcMessageType.TaskEvent,
				origin: IpcOrigin.Server,
				relayClientId: clientId,
				data: {
					eventName: RooCodeEventName.Message,
					payload: [
						{
							taskId: clientId,
							action: "created",
							message: {
								ts: Date.now(),
								type: "say",
								text: JSON.stringify({ commandName, data }),
								partial: false,
							},
						},
					],
				},
			})
		}
	}

	private registerListeners(provider: ClineProvider): void {
		// Listen for events from the ClineProvider
		provider.on("clineCreated", (cline) => {
			cline.on("taskStarted", async () => {
				this.emit(RooCodeEventName.TaskStarted, cline.taskId)
				// Store the ClineProvider instance associated with this task ID
				this.taskMap.set(cline.taskId, provider)
				await this.fileLog(`[${new Date().toISOString()}] taskStarted -> ${cline.taskId}\n`)
			})

			cline.on("message", async (message: { message: any; action?: string }) => {
				this.emit(RooCodeEventName.Message, {
					taskId: cline.taskId,
					message: message.message,
					action: message.action === "updated" ? "updated" : "created",
				})
				if (message.message && message.message.partial !== true) {
					await this.fileLog(`[${new Date().toISOString()}] ${JSON.stringify(message.message, null, 2)}\n`)
				}
			})

			cline.on("taskModeSwitched", (taskId: string, mode: string) => {
				this.emit(RooCodeEventName.TaskModeSwitched, taskId, mode)
			})

			cline.on("taskAskResponded", () => {
				this.emit(RooCodeEventName.TaskAskResponded, cline.taskId)
			})

			cline.on("taskAborted", () => {
				this.emit(RooCodeEventName.TaskAborted, cline.taskId)
				this.taskMap.delete(cline.taskId)
			})

			cline.on("taskCompleted", async (_: any, tokenUsage: any, toolUsage: any) => {
				this.emit(RooCodeEventName.TaskCompleted, cline.taskId, tokenUsage, toolUsage)
				this.taskMap.delete(cline.taskId)
				await this.fileLog(
					`[${new Date().toISOString()}] taskCompleted -> ${cline.taskId} | ${JSON.stringify(tokenUsage, null, 2)} | ${JSON.stringify(toolUsage, null, 2)}\n`,
				)
			})

			cline.on("taskSpawned", (childTaskId: string) => {
				this.emit(RooCodeEventName.TaskSpawned, cline.taskId, childTaskId)
			})

			cline.on("taskPaused", () => {
				this.emit(RooCodeEventName.TaskPaused, cline.taskId)
			})

			cline.on("taskUnpaused", () => {
				this.emit(RooCodeEventName.TaskUnpaused, cline.taskId)
			})

			cline.on("taskTokenUsageUpdated", (_: any, usage: any) => {
				this.emit(RooCodeEventName.TaskTokenUsageUpdated, cline.taskId, usage)
			})

			cline.on("taskToolFailed", (taskId: string, tool: any, error: any) => {
				this.emit(RooCodeEventName.TaskToolFailed, taskId, tool, error)
			})

			this.emit(RooCodeEventName.TaskCreated, cline.taskId)
		})

		// Listen for TaskCommand messages from the IPC server
		if (this.ipc) {
			this.ipc.on(IpcMessageType.TaskCommand, async (clientId, command) => {
				this.log(`[API] Received TaskCommand from client ${clientId}: ${command.commandName}`)
				try {
					// Call the corresponding API method based on commandName
					// Pass clientId to methods that need to send a response back to the specific client
					switch (command.commandName) {
						case TaskCommandName.StartNewTask:
							await this.startNewTask({
								...command.data,
								clientId,
							})
							break
						case TaskCommandName.CancelTask:
							await this.cancelTask(command.data, clientId)
							// Response handled by TaskAborted event
							break
						case TaskCommandName.CloseTask:
							const currentCline = this.sidebarProvider.getCurrentCline()
							if (currentCline?.taskId === command.data) {
								await this.clearCurrentTask(undefined, clientId)
								// Response handled by UI update based on task stack changes
							} else {
								this.log(
									`[API] CloseTask called for non-current task ${command.data}. Only current task close is supported directly.`,
								)
								this.sendResponse(clientId, command.commandName, {
									error: `Task ${command.data} is not the current active task. Cannot close.`,
								})
							}
							break
						case TaskCommandName.GetCurrentTaskStack:
							this.getCurrentTaskStack(clientId)
							break
						case TaskCommandName.ClearCurrentTask:
							await this.clearCurrentTask(command.data, clientId)
							break
						case TaskCommandName.CancelCurrentTask:
							await this.cancelCurrentTask(clientId)
							break
						case TaskCommandName.SendMessage:
							await this.sendMessage(command.data.message, command.data.images, clientId)
							break
						case TaskCommandName.PressPrimaryButton:
							await this.pressPrimaryButton(clientId)
							break
						case TaskCommandName.PressSecondaryButton:
							await this.pressSecondaryButton(clientId)
							break
						case TaskCommandName.SetConfiguration:
							await this.setConfiguration(command.data, clientId)
							break
						case TaskCommandName.GetConfiguration:
							// This method now takes clientId to send response
							this.getConfiguration(clientId)
							break
						case TaskCommandName.IsReady:
							// This method now takes clientId to send response
							this.isReady(clientId)
							break
						case TaskCommandName.GetMessages:
							this.getMessages(command.data, clientId)
							break
						case TaskCommandName.GetTokenUsage:
							this.getTokenUsage(command.data, clientId)
							break
						case TaskCommandName.Log:
							this.log(`[Client Log] ${command.data}`)
							// No response expected for Log command
							break
						case TaskCommandName.ResumeTask:
							await this.resumeTask(command.data, clientId)
							break
						case TaskCommandName.IsTaskInHistory:
							// This method now takes clientId to send response
							this.isTaskInHistory(command.data, clientId)
							break
						case TaskCommandName.CreateProfile:
							await this.createProfile(command.data, clientId)
							break
						case TaskCommandName.GetProfiles:
							this.getProfiles(clientId)
							break
						case TaskCommandName.SetActiveProfile:
							await this.setActiveProfile(command.data, clientId)
							break
						case TaskCommandName.GetActiveProfile:
							this.getActiveProfile(clientId)
							break
						case TaskCommandName.DeleteProfile:
							await this.deleteProfile(command.data, clientId)
							break
						default:
							const unknownCommand = command as TaskCommand
							this.log(`[API] Received unknown TaskCommand: ${unknownCommand.commandName}`)
							this.sendResponse(clientId, unknownCommand.commandName, {
								error: `Unknown command: ${unknownCommand.commandName}`,
							})
							break
					}
				} catch (error) {
					this.log(`[API] Error processing TaskCommand ${command.commandName}: ${error}`)
					// Send an error response back to the client
					this.sendResponse(clientId, command.commandName, {
						error: error instanceof Error ? error.message : String(error),
					})
				}
			})
		}
	}

	// --- Task Management ---
	public async startNewTask({
		configuration,
		text,
		images,
		newTab: _newTab, // Rename in destructuring, ignoring _newTab
		clientId,
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
		clientId: string
	}): Promise<string> {
		if (configuration) {
			await this.sidebarProvider.updateApiConfiguration(configuration)
		}
		const cline = await this.sidebarProvider.initClineWithTask(text, images)
		this.sendResponse(clientId, TaskCommandName.StartNewTask, cline.taskId)
		return cline.taskId
	}

	public async resumeTask(taskId: string, clientId: string): Promise<void> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		if (!task || !task.historyItem) {
			throw new Error(`Task with ID ${taskId} not found or has no history item.`)
		}
		await this.sidebarProvider.initClineWithHistoryItem(task.historyItem)
		this.sendResponse(clientId, TaskCommandName.ResumeTask, true)
	}

	public async isTaskInHistory(taskId: string, clientId: string): Promise<boolean> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		const result = !!task
		// Send response back to the specific client who asked
		this.sendResponse(clientId, TaskCommandName.IsTaskInHistory, result)
		return result
	}

	public getCurrentTaskStack(clientId: string): string[] {
		const stack = this.sidebarProvider.getCurrentTaskStack()
		this.sendResponse(clientId, TaskCommandName.GetCurrentTaskStack, stack)
		return stack
	}

	public async clearCurrentTask(lastMessage: string | undefined, clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			await this.sidebarProvider.removeClineFromStack()
			if (lastMessage) {
				this.log(`[API] clearCurrentTask called with lastMessage: ${lastMessage}.`)
			}
			this.sendResponse(clientId, TaskCommandName.ClearCurrentTask, true)
		}
	}

	public async cancelCurrentTask(clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			await this.sidebarProvider.cancelTask()
			this.sendResponse(clientId, TaskCommandName.CancelCurrentTask, true)
		}
	}

	public async cancelTask(taskId: string, clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline?.taskId === taskId) {
			await this.sidebarProvider.cancelTask()
			this.sendResponse(clientId, TaskCommandName.CancelTask, true)
		} else {
			this.log(
				`[API] cancelTask called for non-current task ${taskId}. Only current task cancellation is supported directly.`,
			)
			throw new Error(`Task ${taskId} is not the current active task. Cannot cancel.`)
		}
	}

	// --- User Interaction ---
	public async sendMessage(
		message: string | undefined,
		images: string[] | undefined,
		clientId: string,
	): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to send message to.")
		}
		await currentCline.handleWebviewAskResponse("messageResponse", message, images)
		this.sendResponse(clientId, TaskCommandName.SendMessage, true)
	}

	public async pressPrimaryButton(clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press primary button on.")
		}
		await currentCline.handleWebviewAskResponse("yesButtonClicked")
		this.sendResponse(clientId, TaskCommandName.PressPrimaryButton, true)
	}

	public async pressSecondaryButton(clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press secondary button on.")
		}
		await currentCline.handleWebviewAskResponse("noButtonClicked")
		this.sendResponse(clientId, TaskCommandName.PressSecondaryButton, true)
	}

	// --- Configuration & Profiles ---
	public getConfiguration(clientId: string): RooCodeSettings {
		const globalState = this.sidebarProvider.contextProxy.getValues()
		const providerSettings = this.sidebarProvider.contextProxy.getProviderSettings()
		const config = { ...globalState, ...providerSettings } as RooCodeSettings
		this.sendResponse(clientId, TaskCommandName.GetConfiguration, config)
		return config
	}

	public async setConfiguration(values: RooCodeSettings, clientId: string): Promise<void> {
		await this.sidebarProvider.updateApiConfiguration(values)
		this.sendResponse(clientId, TaskCommandName.SetConfiguration, true) // Acknowledge success
	}

	public async createProfile(name: string, clientId: string): Promise<string> {
		const config = this.getConfiguration(clientId) // Pass clientId to getConfiguration
		config.listApiConfigMeta = config.listApiConfigMeta || []
		// Check if profile already exists
		if (config.listApiConfigMeta.some((p) => p.name === name)) {
			throw new Error(`Profile with name "${name}" already exists.`)
		}
		config.listApiConfigMeta.push({ id: crypto.randomUUID(), name }) // Use UUID for ID
		await this.sidebarProvider.updateApiConfiguration(config) // This saves the updated list
		this.sendResponse(clientId, TaskCommandName.CreateProfile, name) // Respond with the created profile name
		return name
	}

	public getProfiles(clientId: string): string[] {
		const config = this.getConfiguration(clientId) // Pass clientId to getConfiguration
		const profiles = (config.listApiConfigMeta || []).map((profile) => profile.name)
		this.sendResponse(clientId, TaskCommandName.GetProfiles, profiles)
		return profiles
	}

	public getActiveProfile(clientId: string): string | undefined {
		const config = this.getConfiguration(clientId) // Pass clientId to getConfiguration
		const activeProfile = config.currentApiConfigName
		this.sendResponse(clientId, TaskCommandName.GetActiveProfile, activeProfile)
		return activeProfile
	}

	public async setActiveProfile(name: string, clientId: string): Promise<void> {
		const config = this.getConfiguration(clientId)
		// Verify profile exists
		if (!(config.listApiConfigMeta || []).some((p) => p.name === name)) {
			throw new Error(`Profile with name "${name}" not found.`)
		}
		config.currentApiConfigName = name
		await this.sidebarProvider.updateApiConfiguration(config)
		this.sendResponse(clientId, TaskCommandName.SetActiveProfile, true) // Acknowledge success
	}

	public async deleteProfile(name: string, clientId: string): Promise<void> {
		const config = this.getConfiguration(clientId)
		const initialLength = (config.listApiConfigMeta || []).length
		config.listApiConfigMeta = (config.listApiConfigMeta || []).filter((p) => p.name !== name)
		if (config.listApiConfigMeta.length === initialLength) {
			throw new Error(`Profile with name "${name}" not found.`)
		}
		// If deleting the active profile, reset to default or first available
		if (config.currentApiConfigName === name) {
			config.currentApiConfigName = config.listApiConfigMeta?.[0]?.name || "default"
		}
		await this.sidebarProvider.updateApiConfiguration(config)
		this.sendResponse(clientId, TaskCommandName.DeleteProfile, true) // Acknowledge success
	}

	// --- Status ---
	public isReady(clientId: string): boolean {
		const ready = this.sidebarProvider.isViewLaunched
		this.sendResponse(clientId, TaskCommandName.IsReady, ready)
		return ready
	}
} // Ensure class closing brace is present
