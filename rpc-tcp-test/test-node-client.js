import { EventEmitter } from "events"
import ipc from "node-ipc"

class RooCodeClient extends EventEmitter {
	constructor() {
		super()
		this.buffer = ""
		this.clientId = null
		this.pendingRequests = new Map()
		this.requestIdCounter = 0
	}

	connect() {
		return new Promise((resolve, reject) => {
			const host = process.env.ROO_CODE_IPC_TCP_HOST || "localhost"
			const port = 7800

			console.log(`Attempting to connect to ${host}:${port}...`)

			let connectionTimeout = setTimeout(() => {
				reject(new Error("Connection timeout after 10s"))
			}, 10000)

			// Configure IPC
			ipc.config.id = "test-node-client"
			ipc.config.retry = 3000
			ipc.config.maxRetries = 5
			ipc.config.silent = false
			ipc.config.sync = false
			ipc.config.unlink = false
			ipc.config.appspace = ""
			ipc.config.socketRoot = ""
			ipc.config.stopRetrying = false
			ipc.config.logger = console.log

			// Connect using TCP
			ipc.connectToNet("roo-tcp-server", host, port, () => {
				const socket = ipc.of["roo-tcp-server"]
				if (!socket) {
					clearTimeout(connectionTimeout)
					reject(new Error("Failed to establish connection"))
					return
				}

				socket.on("connect", () => {
					console.log("[RPC Client] Socket connected")
				})

				socket.on("message", (data) => {
					if (typeof data === "string") {
						this.buffer += data
						this._processBuffer()
					} else {
						this._handleMessage(data)
					}
				})

				socket.on("error", (err) => {
					console.error("[RPC Client] Connection error:", err)
					this.emit("error", err)
				})

				socket.on("disconnect", () => {
					console.log("[RPC Client] Disconnected from server")
					this.emit("disconnect")
				})

				// Wait for server's Ack message
				this.once("connect", (data) => {
					clearTimeout(connectionTimeout)
					resolve(data)
				})
			})
		})
	}

	disconnect() {
		ipc.disconnect("roo-tcp-server")
	}

	async getConfiguration() {
		return this._sendCommand("GetConfiguration")
	}

	async startNewTask(text, configuration, options = {}) {
		const data = {
			configuration: {
				...configuration,
				__type__: "RooCodeSettings",
			},
			text: text,
			images: options.images || [],
			newTab: options.newTab || false,
		}
		return this._sendCommand("StartNewTask", data)
	}

	_processBuffer() {
		const messages = this.buffer.split("\n")
		this.buffer = messages.pop() || ""

		for (const message of messages) {
			try {
				const parsed = JSON.parse(message)
				this._handleMessage(parsed)
			} catch (error) {
				this.emit("error", `Failed to parse message: ${error}`)
			}
		}
	}

	_handleMessage(parsedMsg) {
		try {
			if (parsedMsg.type === "Ack") {
				this.clientId = parsedMsg.data.clientId
				console.log("[RPC Client] Received server-assigned clientId:", this.clientId)
				this.emit("connect", parsedMsg.data)
			} else if (parsedMsg.type === "TaskEvent") {
				const { eventName, payload } = parsedMsg.data

				if (eventName === "commandResponse") {
					const { commandName, requestId, payload: responsePayload } = payload[0]
					console.log(
						`[RPC Client] Received CommandResponse for command ${commandName} with request ID ${requestId}`,
					)

					if (requestId && this.pendingRequests.has(requestId)) {
						const request = this.pendingRequests.get(requestId)
						clearTimeout(request.timeout)
						this.pendingRequests.delete(requestId)
						request.resolve(responsePayload)
					}
				} else {
					this.emit(eventName, payload)
				}
			}
		} catch (error) {
			this.emit("error", `Failed to handle message: ${error}`)
		}
	}

	_sendCommand(commandName, commandData) {
		return new Promise((resolve, reject) => {
			if (!this.clientId) {
				reject(new Error("Client ID not yet assigned by server. Wait for 'connect' event."))
				return
			}

			const socket = ipc.of["roo-tcp-server"]
			if (!socket) {
				reject(new Error("Not connected to server"))
				return
			}

			const requestId = `${this.clientId}-${this.requestIdCounter++}-${Date.now()}`

			const message = {
				type: "TaskCommand",
				origin: "client",
				clientId: this.clientId,
				requestId: requestId,
				data: {
					commandName: commandName,
					data: commandData === undefined ? undefined : commandData,
				},
			}

			const timeoutId = setTimeout(() => {
				this.pendingRequests.delete(requestId)
				reject(new Error(`${commandName} timeout after 60s for request ID ${requestId}`))
			}, 60000)

			this.pendingRequests.set(requestId, {
				resolve,
				timeout: timeoutId,
			})

			socket.emit("message", message)
		})
	}
}

export default RooCodeClient
