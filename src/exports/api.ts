import { EventEmitter } from "events"
import * as vscode from "vscode"
import fs from "fs/promises"
import * as path from "path"

import { getWorkspacePath } from "../utils/path"
import { ClineProvider } from "../core/webview/ClineProvider"
import { RooCodeSettings, RooCodeEvents, RooCodeEventName } from "../schemas"
import { IpcMessageType, IpcOrigin, TaskCommandName } from "../schemas/ipc"
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

	public getMessages(taskId: string): void {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			this.sendResponse(taskId, TaskCommandName.GetMessages, provider.messages || [])
		} else {
			this.sendResponse(taskId, TaskCommandName.GetMessages, [])
		}
	}

	public getTokenUsage(taskId: string): void {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			const cline = provider.getCurrentCline()
			if (cline) {
				this.sendResponse(taskId, TaskCommandName.GetTokenUsage, getApiMetrics(cline.clineMessages))
			} else {
				this.sendResponse(taskId, TaskCommandName.GetTokenUsage, undefined)
			}
		} else {
			this.sendResponse(taskId, TaskCommandName.GetTokenUsage, undefined)
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
		provider.on("clineCreated", (cline) => {
			cline.on("taskStarted", async () => {
				this.emit(RooCodeEventName.TaskStarted, cline.taskId)
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
	}

	// --- Task Management ---
	public async startNewTask({
		configuration,
		text,
		images,
		newTab: _newTab, // Rename in destructuring, ignoring _newTab
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string> {
		if (configuration) {
			await this.sidebarProvider.updateApiConfiguration(configuration)
		}
		const cline = await this.sidebarProvider.initClineWithTask(text, images)
		// No explicit response needed here, TaskCreated event will be emitted by ClineProvider listener
		return cline.taskId
	}

	public async resumeTask(taskId: string): Promise<void> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		if (!task || !task.historyItem) {
			throw new Error(`Task with ID ${taskId} not found or has no history item.`)
		}
		await this.sidebarProvider.initClineWithHistoryItem(task.historyItem)
		// No explicit response needed, events will signal task state changes
	}

	public async isTaskInHistory(taskId: string): Promise<boolean> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		const result = !!task
		// Send response back to the specific client who asked
		// Need clientId from the original TaskCommand for this - assuming it's passed somehow or using a default
		const requestingClientId = "unknown" // Placeholder - This needs the actual client ID
		this.sendResponse(requestingClientId, TaskCommandName.IsTaskInHistory, result)
		return result
	}

	public getCurrentTaskStack(): string[] {
		const stack = this.sidebarProvider.getCurrentTaskStack()
		const requestingClientId = this.ipc?.getFirstClientId() || "current" // Use first client as default context
		this.sendResponse(requestingClientId, TaskCommandName.GetCurrentTaskStack, stack)
		return stack
	}

	public async clearCurrentTask(lastMessage?: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			// const taskId = currentCline.taskId; // taskId not needed for response
			await this.sidebarProvider.removeClineFromStack()
			// No explicit response needed, UI should update based on task stack changes
			if (lastMessage) {
				this.log(`[API] clearCurrentTask called with lastMessage: ${lastMessage}.`)
			}
		}
	}

	public async cancelCurrentTask(): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			await this.sidebarProvider.cancelTask()
			// No explicit response needed, TaskAborted event will be emitted
		}
	}

	public async cancelTask(taskId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline?.taskId === taskId) {
			await this.sidebarProvider.cancelTask()
		} else {
			// Attempt to find and abort a non-current task if tracked by API (e.g., via taskMap if it exists and stores Clines)
			// For now, only supporting cancellation of the current task via this API endpoint.
			this.log(
				`[API] cancelTask called for non-current task ${taskId}. Only current task cancellation is supported directly.`,
			)
			throw new Error(`Task ${taskId} is not the current active task. Cannot cancel.`)
		}
		// No explicit response needed, TaskAborted event will be emitted
	}

	// --- User Interaction ---
	public async sendMessage(message?: string, images?: string[]): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to send message to.")
		}
		// Simulate webview response 'messageResponse' when sending a message
		await currentCline.handleWebviewAskResponse("messageResponse", message, images)
	}

	public async pressPrimaryButton(): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press primary button on.")
		}
		// Simulate webview response 'yesButtonClicked'
		await currentCline.handleWebviewAskResponse("yesButtonClicked")
	}

	public async pressSecondaryButton(): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press secondary button on.")
		}
		// Simulate webview response 'noButtonClicked'
		await currentCline.handleWebviewAskResponse("noButtonClicked")
	}

	// --- Configuration & Profiles ---
	public getConfiguration(): RooCodeSettings {
		const globalState = this.sidebarProvider.contextProxy.getValues()
		const providerSettings = this.sidebarProvider.contextProxy.getProviderSettings()
		const config = { ...globalState, ...providerSettings } as RooCodeSettings
		const requestingClientId = this.ipc?.getFirstClientId() || "config"
		this.sendResponse(requestingClientId, TaskCommandName.GetConfiguration, config)
		return config
	}

	public async setConfiguration(values: RooCodeSettings): Promise<void> {
		await this.sidebarProvider.updateApiConfiguration(values)
		const requestingClientId = this.ipc?.getFirstClientId() || "config"
		this.sendResponse(requestingClientId, TaskCommandName.SetConfiguration, true) // Acknowledge success
	}

	public async createProfile(name: string): Promise<string> {
		const config = this.getConfiguration() // Gets current config synchronously
		config.listApiConfigMeta = config.listApiConfigMeta || []
		// Check if profile already exists
		if (config.listApiConfigMeta.some((p) => p.name === name)) {
			throw new Error(`Profile with name "${name}" already exists.`)
		}
		config.listApiConfigMeta.push({ id: crypto.randomUUID(), name }) // Use UUID for ID
		await this.sidebarProvider.updateApiConfiguration(config) // This saves the updated list
		const requestingClientId = this.ipc?.getFirstClientId() || "profiles"
		this.sendResponse(requestingClientId, TaskCommandName.CreateProfile, name) // Respond with the created profile name
		return name
	}

	public getProfiles(): string[] {
		const config = this.getConfiguration()
		const profiles = (config.listApiConfigMeta || []).map((profile) => profile.name)
		const requestingClientId = this.ipc?.getFirstClientId() || "profiles"
		this.sendResponse(requestingClientId, TaskCommandName.GetProfiles, profiles)
		return profiles
	}

	public getActiveProfile(): string | undefined {
		const config = this.getConfiguration()
		const activeProfile = config.currentApiConfigName
		const requestingClientId = this.ipc?.getFirstClientId() || "activeProfile"
		this.sendResponse(requestingClientId, TaskCommandName.GetActiveProfile, activeProfile)
		return activeProfile
	}

	public async setActiveProfile(name: string): Promise<void> {
		const config = this.getConfiguration()
		// Verify profile exists
		if (!(config.listApiConfigMeta || []).some((p) => p.name === name)) {
			throw new Error(`Profile with name "${name}" not found.`)
		}
		config.currentApiConfigName = name
		await this.sidebarProvider.updateApiConfiguration(config)
		const requestingClientId = this.ipc?.getFirstClientId() || "profiles"
		this.sendResponse(requestingClientId, TaskCommandName.SetActiveProfile, true) // Acknowledge success
	}

	public async deleteProfile(name: string): Promise<void> {
		const config = this.getConfiguration()
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
		const requestingClientId = this.ipc?.getFirstClientId() || "profiles"
		this.sendResponse(requestingClientId, TaskCommandName.DeleteProfile, true) // Acknowledge success
	}

	// --- Status ---
	public isReady(): boolean {
		const ready = this.sidebarProvider.isViewLaunched
		const requestingClientId = this.ipc?.getFirstClientId() || "status"
		this.sendResponse(requestingClientId, TaskCommandName.IsReady, ready)
		return ready
	}
} // Ensure class closing brace is present
