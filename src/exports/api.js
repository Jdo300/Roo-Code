import { EventEmitter } from "events"
import * as vscode from "vscode"
import fs from "fs/promises"
import * as path from "path"
import { getWorkspacePath } from "../utils/path"
import { openClineInNewTab } from "../activate/registerCommands"
import { RooCodeEventName } from "../schemas"
import { IpcMessageType, TaskCommandName, IpcOrigin } from "evals/packages/types/src/ipc"
import { IpcServer } from "./ipc"
import { outputChannelLog } from "./log"
// Add a comment to trigger type re-check
export class API extends EventEmitter {
	outputChannel
	sidebarProvider
	context
	ipc
	taskMap = new Map()
	log
	logfile
	constructor(outputChannel, provider, socketPath, enableLogging = false) {
		super()
		this.outputChannel = outputChannel
		this.sidebarProvider = provider
		this.context = provider.context
		if (enableLogging) {
			this.log = (...args) => {
				outputChannelLog(this.outputChannel, ...args)
				console.log(args)
			}
			this.logfile = path.join(getWorkspacePath(), "roo-code-messages.log")
		} else {
			this.log = () => {}
		}
		this.registerListeners(this.sidebarProvider)
		if (socketPath) {
			const ipc = (this.ipc = new IpcServer(socketPath, this.log))
			ipc.listen()
			this.log(`[API] ipc server started: socketPath=${socketPath}, pid=${process.pid}, ppid=${process.ppid}`)
			// Removed async keyword for debugging 'never' type error
			ipc.on(IpcMessageType.TaskCommand, (clientId, data) => {
				switch (data.commandName) {
					case TaskCommandName.StartNewTask: {
						const { configuration, text, images, newTab } = data.data
						this.log(`[API] ${TaskCommandName.StartNewTask} -> ${text}, ${JSON.stringify(configuration)}`)
						this.startNewTask({ configuration, text, images, newTab }).catch((err) =>
							this.log("Error in startNewTask:", err),
						) // Handle promise
						break
					}
					case TaskCommandName.CancelTask: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.CancelTask} -> ${taskId}`)
						this.cancelTask(taskId).catch((err) => this.log("Error in cancelTask:", err)) // Handle promise
						break
					}
					case TaskCommandName.CloseTask: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.CloseTask} -> ${taskId}`)
						// These are async but we don't need to wait in the listener
						vscode.commands.executeCommand("workbench.action.files.saveFiles")
						vscode.commands.executeCommand("workbench.action.closeWindow")
						break
					}
					case TaskCommandName.GetCurrentTaskStack: {
						this.log(`[API] ${TaskCommandName.GetCurrentTaskStack}`)
						this.getCurrentTaskStack() // Not async
						break
					}
					case TaskCommandName.ClearCurrentTask: {
						const lastMessage = data.data
						this.log(`[API] ${TaskCommandName.ClearCurrentTask} -> ${lastMessage}`)
						this.clearCurrentTask(lastMessage).catch((err) => this.log("Error in clearCurrentTask:", err)) // Handle promise
						break
					}
					case TaskCommandName.CancelCurrentTask: {
						this.log(`[API] ${TaskCommandName.CancelCurrentTask}`)
						this.cancelCurrentTask().catch((err) => this.log("Error in cancelCurrentTask:", err)) // Handle promise
						break
					}
					case TaskCommandName.SendMessage: {
						const { message, images } = data.data
						this.log(`[API] ${TaskCommandName.SendMessage} -> ${message}, ${images?.length} images`)
						this.sendMessage(message, images).catch((err) => this.log("Error in sendMessage:", err)) // Handle promise
						break
					}
					case TaskCommandName.PressPrimaryButton: {
						this.log(`[API] ${TaskCommandName.PressPrimaryButton}`)
						this.pressPrimaryButton().catch((err) => this.log("Error in pressPrimaryButton:", err)) // Handle promise
						break
					}
					case TaskCommandName.PressSecondaryButton: {
						this.log(`[API] ${TaskCommandName.PressSecondaryButton}`)
						this.pressSecondaryButton().catch((err) => this.log("Error in pressSecondaryButton:", err)) // Handle promise
						break
					}
					case TaskCommandName.SetConfiguration: {
						const values = data.data
						this.log(`[API] ${TaskCommandName.SetConfiguration} -> ${JSON.stringify(values)}`)
						this.setConfiguration(values).catch((err) => this.log("Error in setConfiguration:", err)) // Handle promise
						break
					}
					case TaskCommandName.IsReady: {
						this.log(`[API] ${TaskCommandName.IsReady}`)
						this.isReady() // Not async
						break
					}
					case TaskCommandName.GetMessages: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.GetMessages} -> ${taskId}`)
						this.getMessages(taskId) // Not async
						break
					}
					case TaskCommandName.GetTokenUsage: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.GetTokenUsage} -> ${taskId}`)
						this.getTokenUsage(taskId) // Not async
						break
					}
					case TaskCommandName.Log: {
						const message = data.data
						this.log(`[API] ${TaskCommandName.Log} -> ${message}`)
						this.log(message) // Not async
						break
					}
					case TaskCommandName.ResumeTask: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.ResumeTask} -> ${taskId}`)
						this.resumeTask(taskId).catch((err) => this.log("Error in resumeTask:", err)) // Handle promise
						break
					}
					case TaskCommandName.IsTaskInHistory: {
						const taskId = data.data
						this.log(`[API] ${TaskCommandName.IsTaskInHistory} -> ${taskId}`)
						this.isTaskInHistory(taskId) // Not async (but returns promise, should be handled if result needed)
						break
					}
					case TaskCommandName.CreateProfile: {
						const name = data.data
						this.log(`[API] ${TaskCommandName.CreateProfile} -> ${name}`)
						this.createProfile(name).catch((err) => this.log("Error in createProfile:", err)) // Handle promise
						break
					}
					case TaskCommandName.GetProfiles: {
						this.log(`[API] ${TaskCommandName.GetProfiles}`)
						this.getProfiles() // Not async
						break
					}
					case TaskCommandName.SetActiveProfile: {
						const name = data.data
						this.log(`[API] ${TaskCommandName.SetActiveProfile} -> ${name}`)
						this.setActiveProfile(name).catch((err) => this.log("Error in setActiveProfile:", err)) // Handle promise
						break
					}
					case TaskCommandName.getActiveProfile: {
						this.log(`[API] ${TaskCommandName.getActiveProfile}`)
						this.getActiveProfile() // Not async
						break
					}
					case TaskCommandName.DeleteProfile: {
						const name = data.data
						this.log(`[API] ${TaskCommandName.DeleteProfile} -> ${name}`)
						this.deleteProfile(name).catch((err) => this.log("Error in deleteProfile:", err)) // Handle promise
						break
					}
				}
			})
		} // Closing the if (socketPath) block
	} // Closing the constructor
	emit(eventName, ...args) {
		if (this.ipc) {
			const taskEvent = {
				eventName,
				payload: args,
			}
			this.ipc.broadcast({
				type: IpcMessageType.TaskEvent,
				data: taskEvent,
				origin: IpcOrigin.Server,
			})
		}
		return super.emit(eventName, ...args)
	}
	async startNewTask({ configuration, text, images, newTab }) {
		let provider
		if (newTab) {
			await vscode.commands.executeCommand("workbench.action.files.revert")
			await vscode.commands.executeCommand("workbench.action.closeAllEditors")
			provider = await openClineInNewTab({ context: this.context, outputChannel: this.outputChannel })
			this.registerListeners(provider)
		} else {
			await vscode.commands.executeCommand("roo-cline.SidebarProvider.focus")
			provider = this.sidebarProvider
		}
		if (configuration) {
			await provider.setValues(configuration)
			if (configuration.allowedCommands) {
				await vscode.workspace
					.getConfiguration("roo-cline")
					.update("allowedCommands", configuration.allowedCommands, vscode.ConfigurationTarget.Global)
			}
		}
		await provider.removeClineFromStack()
		await provider.postStateToWebview()
		await provider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
		await provider.postMessageToWebview({ type: "invoke", invoke: "newChat", text, images })
		const { taskId } = await provider.initClineWithTask(text, images, undefined, {
			consecutiveMistakeLimit: Number.MAX_SAFE_INTEGER,
		})
		return taskId
	}
	async resumeTask(taskId) {
		const { historyItem } = await this.sidebarProvider.getTaskWithId(taskId)
		await this.sidebarProvider.initClineWithHistoryItem(historyItem)
		await this.sidebarProvider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
	}
	async isTaskInHistory(taskId) {
		try {
			await this.sidebarProvider.getTaskWithId(taskId)
			return true
		} catch {
			return false
		}
	}
	getCurrentTaskStack() {
		return this.sidebarProvider.getCurrentTaskStack()
	}
	async clearCurrentTask(lastMessage) {
		await this.sidebarProvider.finishSubTask(lastMessage ?? "")
		await this.sidebarProvider.postStateToWebview()
	}
	async cancelCurrentTask() {
		await this.sidebarProvider.cancelTask()
	}
	async cancelTask(taskId) {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			await provider.cancelTask()
			this.taskMap.delete(taskId)
		}
	}
	async sendMessage(text, images) {
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "sendMessage", text, images })
	}
	async pressPrimaryButton() {
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "primaryButtonClick" })
	}
	async pressSecondaryButton() {
		await this.sidebarProvider.postMessageToWebview({ type: "invoke", invoke: "secondaryButtonClick" })
	}
	getConfiguration() {
		return this.sidebarProvider.getValues()
	}
	async setConfiguration(values) {
		await this.sidebarProvider.setValues(values)
		await this.sidebarProvider.providerSettingsManager.saveConfig(values.currentApiConfigName || "default", values)
		await this.sidebarProvider.postStateToWebview()
	}
	async createProfile(name) {
		if (!name || !name.trim()) {
			throw new Error("Profile name cannot be empty")
		}
		const currentSettings = this.getConfiguration()
		const profiles = currentSettings.listApiConfigMeta || []
		if (profiles.some((profile) => profile.name === name)) {
			throw new Error(`A profile with the name "${name}" already exists`)
		}
		const id = this.sidebarProvider.providerSettingsManager.generateId()
		await this.setConfiguration({
			...currentSettings,
			listApiConfigMeta: [
				...profiles,
				{
					id,
					name: name.trim(),
					apiProvider: "openai",
				},
			],
		})
		return id
	}
	getProfiles() {
		return (this.getConfiguration().listApiConfigMeta || []).map((profile) => profile.name)
	}
	async setActiveProfile(name) {
		const currentSettings = this.getConfiguration()
		const profiles = currentSettings.listApiConfigMeta || []
		const profile = profiles.find((p) => p.name === name)
		if (!profile) {
			throw new Error(`Profile with name "${name}" does not exist`)
		}
		await this.setConfiguration({ ...currentSettings, currentApiConfigName: profile.name })
	}
	getActiveProfile() {
		return this.getConfiguration().currentApiConfigName
	}
	async deleteProfile(name) {
		const currentSettings = this.getConfiguration()
		const profiles = currentSettings.listApiConfigMeta || []
		const targetIndex = profiles.findIndex((p) => p.name === name)
		if (targetIndex === -1) {
			throw new Error(`Profile with name "${name}" does not exist`)
		}
		const profileToDelete = profiles[targetIndex]
		profiles.splice(targetIndex, 1)
		// If we're deleting the active profile, clear the currentApiConfigName.
		const newSettings = {
			...currentSettings,
			listApiConfigMeta: profiles,
			currentApiConfigName:
				currentSettings.currentApiConfigName === profileToDelete.name
					? undefined
					: currentSettings.currentApiConfigName,
		}
		await this.setConfiguration(newSettings)
	}
	isReady() {
		return this.sidebarProvider.viewLaunched
	}
	registerListeners(provider) {
		provider.on("clineCreated", (cline) => {
			// Explicitly type cline as any for now
			cline.on("taskStarted", async () => {
				this.emit(RooCodeEventName.TaskStarted, cline.taskId)
				this.taskMap.set(cline.taskId, provider)
				await this.fileLog(`[${new Date().toISOString()}] taskStarted -> ${cline.taskId}\n`)
			})
			cline.on("message", async (message) => {
				// Explicitly type message as any for now
				this.emit(RooCodeEventName.Message, { taskId: cline.taskId, ...message })
				if (message.message.partial !== true) {
					await this.fileLog(`[${new Date().toISOString()}] ${JSON.stringify(message.message, null, 2)}\n`)
				}
			})
			cline.on("taskModeSwitched", (taskId, mode) => this.emit(RooCodeEventName.TaskModeSwitched, taskId, mode))
			cline.on("taskAskResponded", () => this.emit(RooCodeEventName.TaskAskResponded, cline.taskId))
			cline.on("taskAborted", () => {
				this.emit(RooCodeEventName.TaskAborted, cline.taskId)
				this.taskMap.delete(cline.taskId)
			})
			cline.on("taskCompleted", async (_, tokenUsage, toolUsage) => {
				// Explicitly type parameters as any for now
				this.emit(RooCodeEventName.TaskCompleted, cline.taskId, tokenUsage, toolUsage)
				this.taskMap.delete(cline.taskId)
				await this.fileLog(
					`[${new Date().toISOString()}] taskCompleted -> ${cline.taskId} | ${JSON.stringify(tokenUsage, null, 2)} | ${JSON.stringify(toolUsage, null, 2)}\n`,
				)
			})
			cline.on("taskSpawned", (childTaskId) => this.emit(RooCodeEventName.TaskSpawned, cline.taskId, childTaskId))
			cline.on("taskPaused", () => this.emit(RooCodeEventName.TaskPaused, cline.taskId))
			cline.on("taskUnpaused", () => this.emit(RooCodeEventName.TaskUnpaused, cline.taskId))
			cline.on("taskTokenUsageUpdated", (_, usage) =>
				this.emit(RooCodeEventName.TaskTokenUsageUpdated, cline.taskId, usage),
			)
			cline.on("taskToolFailed", (taskId, tool, error) =>
				this.emit(RooCodeEventName.TaskToolFailed, taskId, tool, error),
			)
			this.emit(RooCodeEventName.TaskCreated, cline.taskId)
		})
	}
	async fileLog(message) {
		if (!this.logfile) {
			return
		}
		try {
			await fs.appendFile(this.logfile, message, "utf8")
		} catch (_) {
			this.logfile = undefined
		}
	}
	/**
	 * Retrieves messages for a given task ID.
	 * @param taskId The ID of the task.
	 */
	getMessages(taskId) {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			// Emit messages through IPC if available
			const messages = provider.messages || []
			if (messages.length > 0) {
				this.emit(RooCodeEventName.Message, {
					taskId,
					message: messages[0],
					action: "created",
				})
			}
		}
	}
	/**
	 * Retrieves token usage for a given task ID.
	 * @param taskId The ID of the task.
	 */
	getTokenUsage(taskId) {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			// Emit token usage through IPC if available
			const usage = provider.getCurrentCline()?.getTokenUsage() || {
				totalCost: 0,
				totalTokensIn: 0,
				totalTokensOut: 0,
				contextTokens: 0,
			}
			this.emit(RooCodeEventName.TaskTokenUsageUpdated, taskId, usage)
		}
	}
}
//# sourceMappingURL=api.js.map
