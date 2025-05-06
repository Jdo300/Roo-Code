import EventEmitter from "node:events"
import { Socket } from "node:net"
import * as crypto from "node:crypto"

import ipc from "node-ipc"

import { IpcOrigin, IpcMessageType, IpcMessage, ipcMessageSchema, TaskCommand, TaskEvent } from "../schemas/ipc"

/**
 * IpcServer
 */

type IpcServerEvents = {
	[IpcMessageType.Connect]: [clientId: string]
	[IpcMessageType.Disconnect]: [clientId: string]
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}

export class IpcServer extends EventEmitter<IpcServerEvents> {
	private readonly _socketPath?: string
	private readonly _host?: string
	private readonly _port?: number | string
	private readonly _log: (...args: unknown[]) => void
	private readonly _clients: Map<string, Socket>

	private _isListening = false

	constructor(options: { socketPath?: string; host?: string; port?: number | string }, log = console.log) {
		super()

		this._socketPath = options.socketPath
		this._host = options.host
		this._port = options.port
		this._log = log
		this._clients = new Map()

		if (!this._socketPath && (!this._host || !this._port)) {
			throw new Error("Either socketPath or both host and port must be provided")
		}
	}

	public listen() {
		this._isListening = true

		ipc.config.silent = false // Enable IPC logging

		const serverCallback = () => {
			this._log("[RPC Server] Initializing event handlers...")
			ipc.server.on("connect", (socket) => this.onConnect(socket))
			ipc.server.on("socket.disconnected", (socket) => this.onDisconnect(socket))
			ipc.server.on("message", (data) => this.onMessage(data))
			this._log("[RPC Server] Event handlers initialized")
		}

		if (this._socketPath) {
			this._log(`[RPC Server] Starting on socket path: ${this._socketPath}`)
			ipc.serve(this._socketPath, serverCallback)
		} else if (this._host && this._port) {
			this._log(`[RPC Server] Starting on ${this._host}:${this._port}`)
			ipc.serveNet(
				this._host,
				typeof this._port === "string" ? parseInt(this._port, 10) : this._port,
				serverCallback,
			)
		}

		ipc.server.start()
		this._log("[RPC Server] Started and ready for connections")
	}

	private onConnect(socket: Socket) {
		const clientId = crypto.randomBytes(6).toString("hex")
		this._clients.set(clientId, socket)
		this._log(`[RPC Server] Client connected: ${clientId}, total clients: ${this._clients.size}`)

		this.send(socket, {
			type: IpcMessageType.Ack,
			origin: IpcOrigin.Server,
			data: { clientId, pid: process.pid, ppid: process.ppid },
		})

		this.emit(IpcMessageType.Connect, clientId)
		this._log(`[RPC Server] Sent acknowledgment to client: ${clientId}`)
	}

	private onDisconnect(destroyedSocket: Socket) {
		let disconnectedClientId: string | undefined

		for (const [clientId, socket] of this._clients.entries()) {
			if (socket === destroyedSocket) {
				disconnectedClientId = clientId
				this._clients.delete(clientId)
				break
			}
		}

		this._log(`[RPC Server] Client disconnected: ${disconnectedClientId}, remaining clients: ${this._clients.size}`)

		if (disconnectedClientId) {
			this.emit(IpcMessageType.Disconnect, disconnectedClientId)
		}
	}

	private onMessage(data: unknown) {
		if (typeof data !== "object") {
			this._log("[RPC Server] Received invalid data:", data)
			return
		}

		const result = ipcMessageSchema.safeParse(data)

		if (!result.success) {
			this._log("[RPC Server] Received invalid payload:", result.error.format(), data)
			return
		}

		const payload = result.data

		if (payload.origin === IpcOrigin.Client) {
			switch (payload.type) {
				case IpcMessageType.TaskCommand:
					this._log(`[RPC Server] Received task command from client ${payload.clientId}`)
					this.emit(IpcMessageType.TaskCommand, payload.clientId, payload.data)
					break
				default:
					this._log(`[RPC Server] Received unhandled payload: ${JSON.stringify(payload)}`)
					break
			}
		}
	}

	private log(...args: unknown[]) {
		this._log(...args)
	}

	public broadcast(message: IpcMessage) {
		this._log("[RPC Server] Broadcasting message:", message)
		ipc.server.broadcast("message", message)
	}

	public send(client: string | Socket, message: IpcMessage) {
		this._log("[RPC Server] Sending message:", message)

		if (typeof client === "string") {
			const socket = this._clients.get(client)

			if (socket) {
				this._log(`[RPC Server] Sending to client: ${client}`)
				ipc.server.emit(socket, "message", message)
			} else {
				this._log(`[RPC Server] Client not found: ${client}`)
			}
		} else {
			this._log("[RPC Server] Sending to socket directly")
			ipc.server.emit(client, "message", message)
		}
	}

	public get socketPath() {
		return this._socketPath
	}

	public get isListening() {
		return this._isListening
	}

	public getFirstClientId(): string | undefined {
		if (this._clients.size > 0) {
			return this._clients.keys().next().value
		}
		return undefined
	}
}
