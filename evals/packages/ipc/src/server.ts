import EventEmitter from "node:events"
import { Socket } from "node:net"
import * as crypto from "node:crypto"

import ipc from "node-ipc"

import { IpcOrigin, IpcMessageType, IpcMessage, ipcMessageSchema, TaskCommand, TaskEvent } from "@evals/types"

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

		ipc.config.silent = true

		const serverCallback = () => {
			this.log("[serverCallback] Server callback executed after serveNet/serve. Setting up event listeners.")
			ipc.server.on("connect", (socket) => this.onConnect(socket))
			ipc.server.on("socket.disconnected", (socket) => this.onDisconnect(socket))
			ipc.server.on("message", (data) => this.onMessage(data))
		}

		if (this._socketPath) {
			ipc.serve(this._socketPath, serverCallback)
		} else if (this._host && this._port) {
			this.log(`[IpcServer] About to call ipc.serveNet with host=${this._host}, port=${this._port}`)
			ipc.serveNet(this._host, this._port, serverCallback)
		}

		ipc.server.start()
	}

	private onConnect(socket: Socket) {
		const clientId = crypto.randomBytes(6).toString("hex")
		this._clients.set(clientId, socket)
		socket.on("data", (data) => {
			this.log(`[server#onConnect#data] Received raw data from client ${clientId}:`, data.toString())
		})
		let remoteInfo = ""
		if (socket && socket.remoteAddress && socket.remotePort) {
			remoteInfo = `, remote=${socket.remoteAddress}:${socket.remotePort}`
		}
		this.log(`[server#onConnect] clientId = ${clientId}, # clients = ${this._clients.size}${remoteInfo}`)

		this.send(socket, {
			type: IpcMessageType.Ack,
			origin: IpcOrigin.Server,
			data: { clientId, pid: process.pid, ppid: process.ppid },
		})

		this.emit(IpcMessageType.Connect, clientId)
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

		this.log(`[server#socket.disconnected] clientId = ${disconnectedClientId}, # clients = ${this._clients.size}`)

		if (disconnectedClientId) {
			this.emit(IpcMessageType.Disconnect, disconnectedClientId)
		}
	}

	private onMessage(data: unknown) {
		this.log("[server#onMessage] Received data:", data)
		if (typeof data !== "object") {
			this.log("[server#onMessage] invalid data", data)
			return
		}

		const result = ipcMessageSchema.safeParse(data)

		if (!result.success) {
			this.log("[server#onMessage] invalid payload", result.error, data)
			return
		}

		const payload = result.data

		if (payload.origin === IpcOrigin.Client) {
			switch (payload.type) {
				case IpcMessageType.TaskCommand:
					// Emit the generic TaskCommand event for now.
					// The handling of specific command names will be done in src/exports/api.ts
					this.emit(IpcMessageType.TaskCommand, payload.clientId, payload.data)
					break
			}
		}
	}

	private log(...args: unknown[]) {
		this._log(...args)
	}

	public broadcast(message: IpcMessage) {
		this.log("[server#broadcast] message =", message)
		ipc.server.broadcast("message", message)
	}

	public send(client: string | Socket, message: IpcMessage) {
		this.log("[server#send] message =", message)

		if (typeof client === "string") {
			const socket = this._clients.get(client)

			if (socket) {
				ipc.server.emit(socket, "message", message)
			}
		} else {
			ipc.server.emit(client, "message", message)
		}
	}

	public get socketPath() {
		return this._socketPath
	}

	public get host() {
		return this._host
	}

	public get port() {
		return this._port
	}

	public get isListening() {
		return this._isListening
	}
}
