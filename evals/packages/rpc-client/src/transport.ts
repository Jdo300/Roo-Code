import { EventEmitter } from "events"
import { Socket } from "net"
import { IPC } from "node-ipc"

export interface Transport extends EventEmitter {
	connect(): Promise<void>
	disconnect(): void
	send(data: string): void
	isConnected(): boolean
}

export class TcpTransport extends EventEmitter implements Transport {
	private socket: Socket | null = null
	private connected = false

	constructor(
		private host: string,
		private port: number,
		private connectTimeout: number,
	) {
		super()
	}

	public async connect(): Promise<void> {
		if (this.connected) {
			return
		}

		return new Promise((resolve, reject) => {
			const connectTimeout = setTimeout(() => {
				if (this.socket) {
					this.socket.destroy()
					this.socket = null
				}
				reject(new Error("Connection timeout"))
			}, this.connectTimeout)

			this.socket = new Socket()

			this.socket.on("connect", () => {
				clearTimeout(connectTimeout)
				this.connected = true
				resolve()
			})

			this.socket.on("data", (data) => {
				this.emit("data", data.toString())
			})

			this.socket.on("error", (error) => {
				if (!this.connected) {
					clearTimeout(connectTimeout)
					reject(error)
				}
				this.emit("error", error)
			})

			this.socket.on("close", () => {
				this.connected = false
				this.socket = null
				this.emit("close")
			})

			this.socket.connect({
				host: this.host,
				port: this.port,
			})
		})
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.destroy()
			this.socket = null
		}
		this.connected = false
	}

	public send(data: string): void {
		if (!this.connected || !this.socket) {
			throw new Error("Not connected")
		}
		this.socket.write(data + "\n")
	}

	public isConnected(): boolean {
		return this.connected
	}
}

export class RpcTransport extends EventEmitter implements Transport {
	private connected = false
	private ipc: InstanceType<typeof IPC>

	constructor(
		private appspace: string,
		private id: string,
		private connectTimeout: number,
	) {
		super()
		this.ipc = new IPC()
		this.ipc.config.id = this.id
		this.ipc.config.retry = 1500
		this.ipc.config.silent = true
	}

	public async connect(): Promise<void> {
		if (this.connected) {
			return
		}

		return new Promise((resolve, reject) => {
			const connectTimeout = setTimeout(() => {
				reject(new Error("Connection timeout"))
				this.disconnect()
			}, this.connectTimeout)

			this.ipc.connectTo(this.appspace, () => {
				const socket = this.ipc.of[this.appspace]

				socket.on("connect", () => {
					clearTimeout(connectTimeout)
					this.connected = true
					resolve()
				})

				socket.on("data", (data: string) => {
					this.emit("data", data)
				})

				socket.on("error", (error: Error) => {
					if (!this.connected) {
						clearTimeout(connectTimeout)
						reject(error)
					}
					this.emit("error", error)
				})

				socket.on("disconnect", () => {
					this.connected = false
					this.emit("close")
				})
			})
		})
	}

	public disconnect(): void {
		if (this.connected) {
			this.ipc.disconnect(this.appspace)
		}
		this.connected = false
	}

	public send(data: string): void {
		if (!this.connected) {
			throw new Error("Not connected")
		}
		this.ipc.of[this.appspace].emit("message", data)
	}

	public isConnected(): boolean {
		return this.connected
	}
}
