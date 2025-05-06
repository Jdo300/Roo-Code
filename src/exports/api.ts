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

		if (enableLogging) {
			this.log = (...args: unknown[]) => {
				outputChannelLog(this.outputChannel, ...args)
				this.outputChannel.show()
				console.log(args)
			}
			this.logfile = path.join(getWorkspacePath(), "roo-code-messages.log")
		}

		this.registerListeners(this.sidebarProvider)

		if (ipcConfig) {
			const ipcOptions = ipcConfig.tcpPort
				? { host: ipcConfig.tcpHost || "localhost", port: ipcConfig.tcpPort }
				: { socketPath: ipcConfig.socketPath }

			const ipc = (this.ipc = new IpcServer(ipcOptions, this.log))
			ipc.listen()
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
				type: IpcMessageType.TaskCommand,
				origin: IpcOrigin.Client,
				clientId,
				data: {
					commandName,
					data,
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

	public async startNewTask(_options: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string> {
		throw new Error("Method not implemented.")
	}

	public async resumeTask(_taskId: string): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async isTaskInHistory(_taskId: string): Promise<boolean> {
		throw new Error("Method not implemented.")
	}

	public getCurrentTaskStack(): string[] {
		throw new Error("Method not implemented.")
	}

	public async clearCurrentTask(_lastMessage?: string): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async cancelCurrentTask(): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async cancelTask(taskId: string): Promise<void> {
		const provider = this.taskMap.get(taskId)
		if (provider) {
			await provider.cancelTask()
			this.taskMap.delete(taskId)
		}
	}

	public async sendMessage(_message?: string, _images?: string[]): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async pressPrimaryButton(): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async pressSecondaryButton(): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public getConfiguration(): RooCodeSettings {
		throw new Error("Method not implemented.")
	}

	public async setConfiguration(_values: RooCodeSettings): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public async createProfile(_name: string): Promise<string> {
		throw new Error("Method not implemented.")
	}

	public getProfiles(): string[] {
		throw new Error("Method not implemented.")
	}

	public async setActiveProfile(_name: string): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public getActiveProfile(): string | undefined {
		throw new Error("Method not implemented.")
	}

	public async deleteProfile(_name: string): Promise<void> {
		throw new Error("Method not implemented.")
	}

	public isReady(): boolean {
		throw new Error("Method not implemented.")
	}
}
