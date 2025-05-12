import { EventEmitter } from "events"
import * as vscode from "vscode"
import fs from "fs/promises"
import * as path from "path"

import { getWorkspacePath } from "../utils/path"
import { ClineProvider } from "../core/webview/ClineProvider"
import {
	RooCodeSettings,
	RooCodeEvents,
	RooCodeEventName,
	TokenUsage,
	ToolUsage,
	ToolName,
	ClineMessage,
} from "../schemas"
import { IpcMessageType, IpcOrigin, TaskCommandName, TaskCommand, IpcMessage, TaskEvent } from "../schemas/ipc"
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
	// Stores the full concatenated text of the last partial message used to calculate a delta for IPC. Keyed by taskId.
	private lastIPCDeltaBaseText: Map<string, string> = new Map()

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
			const extensionVersion = this.context.extension.packageJSON.version || "unknown"
			const ipcOptions = ipcConfig.tcpPort
				? { host: ipcConfig.tcpHost || "localhost", port: ipcConfig.tcpPort, serverVersion: extensionVersion }
				: { socketPath: ipcConfig.socketPath, serverVersion: extensionVersion }

			// Create a logger that writes to the output window
			const ipcLogger = (...args: unknown[]) => {
				outputChannelLog(this.outputChannel, "[IPC]", ...args)
				this.outputChannel.show()
			}

			this.log("[IPC] Starting server with options:", ipcOptions)
			const ipc = (this.ipc = new IpcServer(ipcOptions, ipcLogger))

			// Set up command handler before starting server
			ipc.on(IpcMessageType.TaskCommand, async (clientId, command) => {
				ipcLogger(`[API] Received TaskCommand from client ${clientId}: ${command.commandName}`)
				const { commandName, data, requestId } = command
				ipcLogger(`[API] Processing command ${commandName} from client ${clientId} (Request ID: ${requestId})`)
				ipcLogger(`[API] Command data: ${JSON.stringify(data)}`)

				try {
					switch (commandName) {
						case TaskCommandName.StartNewTask:
							this.log("[API] Handling StartNewTask command")
							const taskId = await this.startNewTask({
								...data,
								clientId,
								requestId, // Pass requestId to the method
							})
							this.sendResponse(clientId, commandName, taskId, requestId)
							break
						case TaskCommandName.CancelTask:
							await this.cancelTask(data, clientId)
							// Response handled by TaskAborted event
							break
						case TaskCommandName.CloseTask:
							const currentCline = this.sidebarProvider.getCurrentCline()
							if (currentCline?.taskId === data) {
								await this.clearCurrentTask(undefined, clientId)
								// Response handled by UI update based on task stack changes
							} else {
								this.log(
									`[API] CloseTask called for non-current task ${data}. Only current task close is supported directly.`,
								)
								this.sendResponse(
									clientId,
									commandName,
									{
										error: `Task ${data} is not the current active task. Cannot close.`,
									},
									requestId,
								) // Pass requestId
							}
							break
						case TaskCommandName.GetCurrentTaskStack:
							this.log("[API] Handling GetCurrentTaskStack command")
							const taskStack = this.getCurrentTaskStack(clientId)
							this.sendResponse(clientId, commandName, taskStack, requestId) // Pass requestId
							break
						case TaskCommandName.ClearCurrentTask:
							this.log("[API] Handling ClearCurrentTask command")
							await this.clearCurrentTask(data, clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.CancelCurrentTask:
							this.log("[API] Handling CancelCurrentTask command")
							await this.cancelCurrentTask(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.SendMessage:
							this.log("[API] Handling SendMessage command")
							await this.sendMessage(data.message, data.images, clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.PressPrimaryButton:
							this.log("[API] Handling PressPrimaryButton command")
							await this.pressPrimaryButton(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.PressSecondaryButton:
							this.log("[API] Handling PressSecondaryButton command")
							await this.pressSecondaryButton(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.SetConfiguration:
							this.log("[API] Handling SetConfiguration command")
							await this.setConfiguration(data, clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.GetConfiguration:
							this.log("[API] Handling GetConfiguration command")
							const config = this.getConfiguration(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, config, requestId)
							break
						case TaskCommandName.IsReady:
							this.log("[API] Handling IsReady command")
							const ready = this.isReady(clientId, requestId) // Call method and pass requestId
							this.sendResponse(clientId, commandName, ready, requestId)
							break
						case TaskCommandName.GetMessages:
							this.log("[API] Handling GetMessages command")
							// Pass clientId and requestId to the method.
							// The method itself will only send a response if requestId is undefined (direct call).
							// The handler's sendResponse is the authoritative one for the command.
							const messages = this.getMessages(data, clientId, requestId)
							this.sendResponse(clientId, commandName, messages, requestId)
							break
						case TaskCommandName.GetTokenUsage:
							this.log("[API] Handling GetTokenUsage command")
							// Pass clientId and requestId to the method.
							// The method itself will only send a response if requestId is undefined (direct call).
							// The handler's sendResponse is the authoritative one for the command.
							const usage = this.getTokenUsage(data, clientId, requestId)
							this.sendResponse(clientId, commandName, usage, requestId)
							break
						case TaskCommandName.Log:
							this.log(`[Client Log] ${data}`)
							// No response expected for Log command
							break
						case TaskCommandName.ResumeTask:
							this.log("[API] Handling ResumeTask command")
							await this.resumeTask(data, clientId)
							this.sendResponse(clientId, commandName, { success: true }, requestId) // Pass requestId
							break
						case TaskCommandName.IsTaskInHistory:
							this.log("[API] Handling IsTaskInHistory command")
							this.sendResponse(clientId, commandName, this.isTaskInHistory(data, clientId), requestId) // Pass requestId
							break
						case TaskCommandName.CreateProfile:
							this.log("[API] Handling CreateProfile command")
							await this.createProfile(data, clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						case TaskCommandName.GetProfiles:
							this.log("[API] Handling GetProfiles command")
							const profiles = await this.getProfiles(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, profiles, requestId)
							break
						case TaskCommandName.SetActiveProfile:
							this.log("[API] Handling SetActiveProfile command")
							await this.setActiveProfile(data, clientId)
							this.sendResponse(clientId, commandName, { success: true }, requestId) // Pass requestId
							break
						case TaskCommandName.GetActiveProfile:
							this.log("[API] Handling GetActiveProfile command")
							const profile = this.getActiveProfile(clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, profile, requestId)
							break
						case TaskCommandName.DeleteProfile:
							this.log("[API] Handling DeleteProfile command")
							await this.deleteProfile(data, clientId, requestId) // Pass requestId to the method
							this.sendResponse(clientId, commandName, { success: true }, requestId)
							break
						default:
							const unknownCommand = command as TaskCommand
							this.log(`[API] Received unknown TaskCommand: ${unknownCommand.commandName}`)
							this.sendResponse(
								clientId,
								unknownCommand.commandName,
								{
									error: `Unknown command: ${unknownCommand.commandName}`,
								},
								requestId,
							) // Pass requestId
							break
					}
				} catch (error) {
					this.log(`[API] Error processing TaskCommand ${commandName}: ${error}`)
					// Send an error response back to the client
					this.sendResponse(
						clientId,
						commandName,
						{
							error: error instanceof Error ? error.message : String(error),
						},
						requestId,
					) // Pass requestId
				}
			})

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

	public getMessages(taskId: string, clientId: string, requestId?: string): ClineMessage[] {
		const provider = this.taskMap.get(taskId)
		const messages = provider ? provider.messages || [] : []
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.GetMessages, messages, requestId)
		}
		return messages
	}

	public getTokenUsage(taskId: string, clientId: string, requestId?: string): TokenUsage | undefined {
		const provider = this.taskMap.get(taskId)
		let usage: TokenUsage | undefined = undefined
		if (provider) {
			const cline = provider.getCurrentCline()
			if (cline) {
				usage = getApiMetrics(cline.clineMessages)
			}
		}
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.GetTokenUsage, usage, requestId)
		}
		return usage
	}

	private sendResponse(
		clientId: string,
		originalCommandName: TaskCommandName,
		payload: any,
		requestId?: string,
	): void {
		if (this.ipc) {
			this.log(
				`[API] Sending command response for ${originalCommandName} to client ${clientId}${requestId ? ` (Request ID: ${requestId})` : ""}`,
			)
			this.log(`[API] Response payload: ${JSON.stringify(payload)}`)

			const response: Extract<IpcMessage, { type: IpcMessageType.TaskEvent }> = {
				type: IpcMessageType.TaskEvent,
				origin: IpcOrigin.Server,
				relayClientId: clientId,
				data: {
					eventName: RooCodeEventName.CommandResponse,
					payload: [
						{
							commandName: originalCommandName,
							requestId: requestId || "",
							payload: payload,
						},
					],
				} as Extract<TaskEvent, { eventName: RooCodeEventName.CommandResponse }>,
			}

			this.log(`[API] Full response: ${JSON.stringify(response)}`)
			this.ipc.send(clientId, response)
		}
	}

	private registerListeners(provider: ClineProvider): void {
		// Listen for events from the ClineProvider
		provider.on("clineCreated", (cline) => {
			// Store the ClineProvider instance associated with this task ID
			this.taskMap.set(cline.taskId, provider)

			// Emit TaskCreated event
			this.emit(RooCodeEventName.TaskCreated, cline.taskId)
			this.broadcastEvent(RooCodeEventName.TaskCreated, cline.taskId)

			// Task Started
			cline.on("taskStarted", async () => {
				this.emit(RooCodeEventName.TaskStarted, cline.taskId)
				await this.fileLog(`[${new Date().toISOString()}] taskStarted -> ${cline.taskId}\n`)
				this.broadcastEvent(RooCodeEventName.TaskStarted, cline.taskId)
			})

			// Message
			cline.on("message", async (data: { message: ClineMessage; action?: "created" | "updated" }) => {
				// data.message is ClineMessage from Cline (contains concatenated text for partials)

				const originalMessage = data.message
				const originalAction: "created" | "updated" = data.action === "updated" ? "updated" : "created"
				let messageForIPC = { ...originalMessage } // Start with a copy for IPC
				const isStreamingCompletionResult =
					originalMessage.type === "say" && originalMessage.say === "completion_result"

				if (isStreamingCompletionResult && originalMessage.partial) {
					const fullConcatenatedTextFromCline = originalMessage.text || ""
					const previouslySentFullTextToIPC = this.lastIPCDeltaBaseText.get(cline.taskId) || ""
					let deltaForIPC = fullConcatenatedTextFromCline

					if (fullConcatenatedTextFromCline.startsWith(previouslySentFullTextToIPC)) {
						deltaForIPC = fullConcatenatedTextFromCline.substring(previouslySentFullTextToIPC.length)
					}
					// Else (e.g., stream reset), send the full new text as a delta, and update base.

					messageForIPC.text = deltaForIPC
					this.lastIPCDeltaBaseText.set(cline.taskId, fullConcatenatedTextFromCline)
				} else if (isStreamingCompletionResult && !originalMessage.partial) {
					// Final part of the stream
					const finalFullTextFromCline = originalMessage.text || ""
					const previouslySentFullTextToIPC = this.lastIPCDeltaBaseText.get(cline.taskId) || ""
					let finalDeltaForIPC = finalFullTextFromCline

					if (finalFullTextFromCline.startsWith(previouslySentFullTextToIPC)) {
						finalDeltaForIPC = finalFullTextFromCline.substring(previouslySentFullTextToIPC.length)
					}
					messageForIPC.text = finalDeltaForIPC
					this.lastIPCDeltaBaseText.delete(cline.taskId) // Clean up for this task
				} else {
					// Not a streaming completion result, or a non-partial message that wasn't part of a stream.
					// Clear any existing delta tracking for this task.
					this.lastIPCDeltaBaseText.delete(cline.taskId)
				}

				// For local listeners, emit the original message from Cline (with concatenated text)
				const localEventDataPayload = {
					taskId: cline.taskId,
					message: originalMessage, // Original message from Cline
					action: originalAction,
				}
				this.emit(RooCodeEventName.Message, localEventDataPayload)

				if (originalMessage && !originalMessage.partial) {
					await this.fileLog(`[${new Date().toISOString()}] ${JSON.stringify(originalMessage, null, 2)}\n`)
				}

				// For IPC broadcast, send the message with delta text
				const ipcEventDataPayload = {
					taskId: cline.taskId,
					message: messageForIPC, // Contains delta if applicable
					action: originalAction,
				}
				this.broadcastEvent(RooCodeEventName.Message, ipcEventDataPayload)
			})

			// Mode Switch
			cline.on("taskModeSwitched", (taskId: string, mode: string) => {
				this.emit(RooCodeEventName.TaskModeSwitched, taskId, mode)
				this.broadcastEvent(RooCodeEventName.TaskModeSwitched, taskId, mode)
			})

			// Ask Responded
			cline.on("taskAskResponded", () => {
				this.emit(RooCodeEventName.TaskAskResponded, cline.taskId)
				this.broadcastEvent(RooCodeEventName.TaskAskResponded, cline.taskId)
			})

			// Task Aborted
			cline.on("taskAborted", () => {
				this.emit(RooCodeEventName.TaskAborted, cline.taskId)
				this.taskMap.delete(cline.taskId)
				this.broadcastEvent(RooCodeEventName.TaskAborted, cline.taskId)
				this.lastIPCDeltaBaseText.delete(cline.taskId) // Clean up delta tracking
			})

			// Task Completed
			cline.on("taskCompleted", async (_: unknown, tokenUsage: TokenUsage, toolUsage: ToolUsage) => {
				this.emit(RooCodeEventName.TaskCompleted, cline.taskId, tokenUsage, toolUsage)
				this.taskMap.delete(cline.taskId)
				this.lastIPCDeltaBaseText.delete(cline.taskId) // Clean up delta tracking
				await this.fileLog(
					`[${new Date().toISOString()}] taskCompleted -> ${cline.taskId} | ${JSON.stringify(tokenUsage, null, 2)} | ${JSON.stringify(toolUsage, null, 2)}\n`,
				)
				this.broadcastEvent(RooCodeEventName.TaskCompleted, cline.taskId, tokenUsage, toolUsage)
			})

			// Task Spawned
			cline.on("taskSpawned", (childTaskId: string) => {
				this.emit(RooCodeEventName.TaskSpawned, cline.taskId, childTaskId)
				this.broadcastEvent(RooCodeEventName.TaskSpawned, cline.taskId, childTaskId)
			})

			// Task Paused
			cline.on("taskPaused", () => {
				this.emit(RooCodeEventName.TaskPaused, cline.taskId)
				this.broadcastEvent(RooCodeEventName.TaskPaused, cline.taskId)
			})

			// Task Unpaused
			cline.on("taskUnpaused", () => {
				this.emit(RooCodeEventName.TaskUnpaused, cline.taskId)
				this.broadcastEvent(RooCodeEventName.TaskUnpaused, cline.taskId)
			})

			// Token Usage Updated
			cline.on("taskTokenUsageUpdated", (_: unknown, usage: TokenUsage) => {
				this.emit(RooCodeEventName.TaskTokenUsageUpdated, cline.taskId, usage)
				this.broadcastEvent(RooCodeEventName.TaskTokenUsageUpdated, cline.taskId, usage)
			})

			// Tool Failed
			cline.on("taskToolFailed", (taskId: string, tool: ToolName, error: string) => {
				this.emit(RooCodeEventName.TaskToolFailed, taskId, tool, error)
				this.broadcastEvent(RooCodeEventName.TaskToolFailed, taskId, tool, error)
			})
		})
	}

	private broadcastEvent<T extends keyof RooCodeEvents>(
		eventName: T,
		...args: RooCodeEvents[T] extends readonly [...infer P] ? P : never
	): void {
		if (this.ipc) {
			const eventData = {
				eventName,
				payload: args,
			} as unknown as TaskEvent // Use unknown assertion as a workaround for complex generic discriminated union

			this.ipc.broadcast({
				type: IpcMessageType.TaskEvent,
				origin: IpcOrigin.Server,
				data: eventData,
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
		requestId, // Add requestId parameter
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
		clientId: string
		requestId?: string // Add requestId to type definition
	}): Promise<string> {
		if (configuration) {
			await this.sidebarProvider.updateApiConfiguration(configuration)
		}
		const cline = await this.sidebarProvider.initClineWithTask(text, images)
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.StartNewTask, cline.taskId, requestId)
		}
		return cline.taskId
	}

	public async resumeTask(taskId: string, _clientId: string): Promise<void> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		if (!task || !task.historyItem) {
			throw new Error(`Task with ID ${taskId} not found or has no history item.`)
		}
		await this.sidebarProvider.initClineWithHistoryItem(task.historyItem)
		// No sendResponse here, handled by command handler
		return
	}

	public async isTaskInHistory(taskId: string, _clientId: string): Promise<boolean> {
		const task = await this.sidebarProvider.getTaskWithId(taskId)
		const result = !!task
		// Send response back to the specific client who asked
		// No sendResponse here, handled by command handler
		return result
	}

	public getCurrentTaskStack(_clientId: string): string[] {
		const stack = this.sidebarProvider.getCurrentTaskStack()
		return stack
	}

	public async clearCurrentTask(
		lastMessage: string | undefined,
		clientId: string,
		requestId?: string,
	): Promise<void> {
		// Add requestId parameter
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			await this.sidebarProvider.removeClineFromStack()
			if (lastMessage) {
				this.log(`[API] clearCurrentTask called with lastMessage: ${lastMessage}.`)
			}
			// If called directly (not via command handler), requestId will be undefined.
			// The command handler will always send its own response.
			if (!requestId && clientId) {
				this.sendResponse(clientId, TaskCommandName.ClearCurrentTask, true, requestId)
			}
		}
	}

	public async cancelCurrentTask(clientId: string, requestId?: string): Promise<void> {
		// Add requestId parameter
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline) {
			await this.sidebarProvider.cancelTask()
			// If called directly (not via command handler), requestId will be undefined.
			// The command handler will always send its own response.
			if (!requestId && clientId) {
				this.sendResponse(clientId, TaskCommandName.CancelCurrentTask, true, requestId)
			}
		}
	}

	public async cancelTask(taskId: string, _clientId: string): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (currentCline?.taskId === taskId) {
			await this.sidebarProvider.cancelTask()
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
		requestId?: string, // Add requestId parameter
	): Promise<void> {
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to send message to.")
		}
		await currentCline.handleWebviewAskResponse("messageResponse", message, images)
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.SendMessage, true, requestId)
		}
	}

	public async pressPrimaryButton(clientId: string, requestId?: string): Promise<void> {
		// Add requestId parameter
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press primary button on.")
		}
		await currentCline.handleWebviewAskResponse("yesButtonClicked")
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.PressPrimaryButton, true, requestId)
		}
	}

	public async pressSecondaryButton(clientId: string, requestId?: string): Promise<void> {
		// Add requestId parameter
		const currentCline = this.sidebarProvider.getCurrentCline()
		if (!currentCline) {
			throw new Error("No active task to press secondary button on.")
		}
		await currentCline.handleWebviewAskResponse("noButtonClicked")
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.PressSecondaryButton, true, requestId)
		}
	}

	// --- Configuration & Profiles ---
	public getConfiguration(clientId: string, requestId?: string): RooCodeSettings {
		const globalState = this.sidebarProvider.contextProxy.getValues()
		const providerSettings = this.sidebarProvider.contextProxy.getProviderSettings()
		const config = { ...globalState, ...providerSettings } as RooCodeSettings
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.GetConfiguration, config, requestId)
		}
		return config
	}

	public async setConfiguration(values: RooCodeSettings, clientId: string, requestId?: string): Promise<void> {
		// Add requestId parameter
		await this.sidebarProvider.updateApiConfiguration(values)
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.SetConfiguration, true, requestId)
		}
	}

	public async createProfile(name: string, clientId: string, requestId?: string): Promise<string> {
		// Add requestId parameter
		const config = this.getConfiguration(clientId, requestId) // Pass clientId and requestId to getConfiguration
		config.listApiConfigMeta = config.listApiConfigMeta || []
		// Check if profile already exists
		if (config.listApiConfigMeta.some((p) => p.name === name)) {
			throw new Error(`Profile with name "${name}" already exists.`)
		}

		config.listApiConfigMeta.push({ id: crypto.randomUUID(), name }) // Use UUID for ID
		await this.sidebarProvider.updateApiConfiguration(config) // This saves the updated list
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.CreateProfile, name, requestId)
		}
		return name
	}

	public getProfiles(clientId: string, requestId?: string): string[] {
		// Add requestId parameter
		const config = this.getConfiguration(clientId, requestId) // Pass clientId and requestId to getConfiguration
		const profiles = (config.listApiConfigMeta || []).map((profile) => profile.name)
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.GetProfiles, profiles, requestId)
		}
		return profiles
	}

	public getActiveProfile(clientId: string, requestId?: string): string | undefined {
		const config = this.getConfiguration(clientId, requestId) // Pass clientId and requestId to getConfiguration
		const activeProfile = config.currentApiConfigName
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.GetActiveProfile, activeProfile, requestId)
		}
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
	}

	public async deleteProfile(name: string, clientId: string, requestId?: string): Promise<void> {
		// Add requestId parameter
		const config = this.getConfiguration(clientId, requestId) // Pass clientId and requestId
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
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.DeleteProfile, true, requestId)
		}
	}

	// --- Status ---
	public isReady(clientId: string, requestId?: string): boolean {
		// Add requestId parameter
		const ready = this.sidebarProvider.isViewLaunched
		// If called directly (not via command handler), requestId will be undefined.
		// The command handler will always send its own response.
		if (!requestId && clientId) {
			this.sendResponse(clientId, TaskCommandName.IsReady, ready, requestId)
		}
		return ready
	}
}
