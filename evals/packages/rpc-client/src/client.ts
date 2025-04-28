import { EventEmitter } from "events"
import { randomUUID } from "crypto"

import type { PendingRequest, RooCodeSettings, IpcMessage, TaskCommand, TaskEvent } from "./types.js"

import { IpcMessageType, IpcOrigin, TaskCommandName } from "@evals/types"
import { TcpTransport, RpcTransport, Transport } from "./transport.js"

export interface RooCodeClientConfig {
	clientId?: string
	connectTimeout?: number
	requestTimeout?: number
}

export interface TcpConfig extends RooCodeClientConfig {
	type: "tcp"
	host: string
	port: number
}

export interface RpcConfig extends RooCodeClientConfig {
	type: "rpc"
	appspace: string
}

export type ConnectionConfig = TcpConfig | RpcConfig

export class RooCodeClient extends EventEmitter {
	private transport: Transport
	private clientId: string
	private pendingRequests = new Map<string, PendingRequest>()
	private buffer = ""
	private options: Required<RooCodeClientConfig>

	constructor(config: ConnectionConfig) {
		super()
		this.clientId = config.clientId ?? randomUUID()
		this.options = {
			connectTimeout: 5000,
			requestTimeout: 30000,
			clientId: this.clientId,
			...config,
		}

		if (config.type === "tcp") {
			this.transport = new TcpTransport(config.host, config.port, this.options.connectTimeout)
		} else {
			this.transport = new RpcTransport(config.appspace, this.clientId, this.options.connectTimeout)
		}

		this.transport.on("data", (data: string) => {
			this.buffer += data
			this.processBuffer()
		})

		this.transport.on("error", (error) => {
			this.emit("error", error)
		})

		this.transport.on("close", () => {
			this.emit("disconnect")
		})
	}

	public async connect(): Promise<void> {
		return this.transport.connect()
	}

	public disconnect(): void {
		this.transport.disconnect()
	}

	private processBuffer(): void {
		const messages = this.buffer.split("\n")
		this.buffer = messages.pop() || ""

		for (const message of messages) {
			try {
				const parsed = JSON.parse(message) as IpcMessage
				this.handleMessage(parsed)
			} catch (error) {
				this.emit("error", new Error(`Failed to parse message: ${error}`))
			}
		}
	}

	private handleMessage(message: IpcMessage): void {
		switch (message.type) {
			case IpcMessageType.Ack:
				// Handle server acknowledgment
				this.emit("connect", message.data)
				break

			case IpcMessageType.TaskEvent: {
				// Handle task events
				const event = message.data as TaskEvent
				this.emit(event.eventName, event.payload)
				break
			}

			default:
				this.emit("error", new Error(`Unknown message type: ${message.type}`))
		}
	}

	private async sendCommand<T>(command: TaskCommand): Promise<T> {
		if (!this.transport.isConnected()) {
			throw new Error("Not connected")
		}

		return new Promise((resolve, reject) => {
			const message: IpcMessage = {
				type: IpcMessageType.TaskCommand,
				origin: IpcOrigin.Client,
				clientId: this.clientId,
				data: command,
			}

			const timeout = setTimeout(() => {
				this.pendingRequests.delete(this.clientId)
				reject(new Error("Request timeout"))
			}, this.options.requestTimeout)

			this.pendingRequests.set(this.clientId, {
				resolve,
				reject,
				timeout,
			})

			this.transport.send(JSON.stringify(message))
		})
	}

	// RooCodeAPI implementation methods

	public async startNewTask({
		configuration,
		text,
		images,
		newTab,
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string> {
		const command = {
			commandName: TaskCommandName.StartNewTask,
			data: {
				configuration: configuration ?? {},
				text,
				images,
				newTab,
			},
		} as const
		return this.sendCommand(command)
	}

	public async resumeTask(taskId: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.ResumeTask,
			data: taskId,
		}
		return this.sendCommand(command)
	}

	public async isTaskInHistory(taskId: string): Promise<boolean> {
		const command: TaskCommand = {
			commandName: TaskCommandName.IsTaskInHistory,
			data: taskId,
		}
		return this.sendCommand(command)
	}

	public async getCurrentTaskStack(): Promise<string[]> {
		const command: TaskCommand = {
			commandName: TaskCommandName.GetCurrentTaskStack,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async clearCurrentTask(lastMessage?: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.ClearCurrentTask,
			data: lastMessage,
		}
		return this.sendCommand(command)
	}

	public async cancelCurrentTask(): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.CancelCurrentTask,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async sendMessage(message?: string, images?: string[]): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.SendMessage,
			data: { message, images },
		}
		return this.sendCommand(command)
	}

	public async pressPrimaryButton(): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.PressPrimaryButton,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async pressSecondaryButton(): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.PressSecondaryButton,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async setConfiguration(values: RooCodeSettings): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.SetConfiguration,
			data: values,
		}
		return this.sendCommand(command)
	}

	public async isReady(): Promise<boolean> {
		const command: TaskCommand = {
			commandName: TaskCommandName.IsReady,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async getMessages(taskId: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.GetMessages,
			data: taskId,
		}
		return this.sendCommand(command)
	}

	public async getTokenUsage(taskId: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.GetTokenUsage,
			data: taskId,
		}
		return this.sendCommand(command)
	}

	public async createProfile(name: string): Promise<string> {
		const command: TaskCommand = {
			commandName: TaskCommandName.CreateProfile,
			data: name,
		}
		return this.sendCommand(command)
	}

	public async getProfiles(): Promise<string[]> {
		const command: TaskCommand = {
			commandName: TaskCommandName.GetProfiles,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async setActiveProfile(name: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.SetActiveProfile,
			data: name,
		}
		return this.sendCommand(command)
	}

	public async getActiveProfile(): Promise<string | undefined> {
		const command: TaskCommand = {
			commandName: TaskCommandName.getActiveProfile,
			data: undefined,
		}
		return this.sendCommand(command)
	}

	public async deleteProfile(name: string): Promise<void> {
		const command: TaskCommand = {
			commandName: TaskCommandName.DeleteProfile,
			data: name,
		}
		return this.sendCommand(command)
	}
}
