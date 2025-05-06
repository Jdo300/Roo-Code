import { default as ipc } from "node-ipc"
import { EventEmitter } from "events"

// Message type definitions
const MessageType = {
	SAY: "say",
	ASK: "ask",
	THINKING: "thinking",
	TOOL_START: "tool_start",
	TOOL_END: "tool_end",
	ERROR: "error",
}

const MessageAction = {
	CREATED: "created",
	UPDATED: "updated",
}

// Payload type definitions
// Message validation schemas
const validateClineMessage = (message) => {
	const requiredFields = ["type", "text", "partial"]
	const validTypes = Object.values(MessageType)

	if (!message || typeof message !== "object") return false
	if (!requiredFields.every((field) => field in message)) return false
	if (!validTypes.includes(message.type)) return false
	if (typeof message.text !== "string") return false
	if (typeof message.partial !== "boolean") return false

	return true
}

const validateTokenUsage = (usage) => {
	const requiredFields = ["tokensIn", "tokensOut", "totalCost"]

	if (!usage || typeof usage !== "object") return false
	if (!requiredFields.every((field) => field in usage)) return false
	if (typeof usage.tokensIn !== "number") return false
	if (typeof usage.tokensOut !== "number") return false
	if (typeof usage.totalCost !== "number") return false

	return true
}

const validateToolUsage = (usage) => {
	const requiredFields = ["toolName", "startTime", "endTime", "success"]

	if (!usage || typeof usage !== "object") return false
	if (!requiredFields.every((field) => field in usage)) return false
	if (typeof usage.toolName !== "string") return false
	if (typeof usage.startTime !== "number") return false
	if (typeof usage.endTime !== "number") return false
	if (typeof usage.success !== "boolean") return false

	return true
}

class RooCodeClient extends EventEmitter {
	constructor() {
		super()
		this.buffer = ""
		this.clientId = Math.random().toString(36).substring(2)
		this.pendingRequests = new Map()
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
			if (parsedMsg.type === RooCodeClient.IpcMessageType.Ack) {
				this.emit("connect", parsedMsg.data)
			} else if (parsedMsg.type === RooCodeClient.IpcMessageType.TaskEvent) {
				const { eventName, payload } = parsedMsg.data

				// Validate event payloads
				if (eventName === "Message") {
					if (!validateClineMessage(payload.message)) {
						this.emit("error", `Invalid message format: ${JSON.stringify(payload.message)}`)
						return
					}
					if (payload.action && !Object.values(MessageAction).includes(payload.action)) {
						this.emit("error", `Invalid message action: ${payload.action}`)
						return
					}
				} else if (eventName === "TaskCompleted") {
					if (!validateTokenUsage(payload.tokenUsage)) {
						this.emit("error", `Invalid token usage format: ${JSON.stringify(payload.tokenUsage)}`)
						return
					}
					if (!validateToolUsage(payload.toolUsage)) {
						this.emit("error", `Invalid tool usage format: ${JSON.stringify(payload.toolUsage)}`)
						return
					}
				} else if (eventName === "TaskTokenUsageUpdated") {
					if (!validateTokenUsage(payload.usage)) {
						this.emit("error", `Invalid token usage format: ${JSON.stringify(payload.usage)}`)
						return
					}
				} else if (eventName === "TaskToolFailed") {
					if (!payload.toolName || typeof payload.toolName !== "string") {
						this.emit("error", `Invalid tool name: ${payload.toolName}`)
						return
					}
					if (!payload.error) {
						this.emit("error", "Missing error details in TaskToolFailed event")
						return
					}
				}

				this.emit(eventName, payload)
			} else if (parsedMsg.type === RooCodeClient.IpcMessageType.TaskResponse) {
				if (parsedMsg.clientId && this.pendingRequests.has(parsedMsg.clientId)) {
					const request = this.pendingRequests.get(parsedMsg.clientId)
					clearTimeout(request.timeout)
					this.pendingRequests.delete(parsedMsg.clientId)
					request.resolve(parsedMsg.data)
				}
			} else {
				this.emit("error", `Unknown message type: ${parsedMsg.type}`)
			}
		} catch (error) {
			this.emit("error", `Failed to handle message: ${error}`)
		}
	}

	static IpcMessageType = {
		Connect: "Connect",
		Disconnect: "Disconnect",
		Ack: "Ack",
		TaskCommand: "TaskCommand",
		TaskEvent: "TaskEvent",
		TaskResponse: "TaskResponse",
		EvalEvent: "EvalEvent",
	}

	static IpcOrigin = {
		Client: "client",
		Server: "server",
	}

	static TaskCommandName = {
		START_NEW_TASK: "StartNewTask",
		RESUME_TASK: "ResumeTask",
		IS_TASK_IN_HISTORY: "IsTaskInHistory",
		GET_CURRENT_TASK_STACK: "GetCurrentTaskStack",
		CLEAR_CURRENT_TASK: "ClearCurrentTask",
		CANCEL_TASK: "CancelTask",
		CLOSE_TASK: "CloseTask",
		SEND_MESSAGE: "SendMessage",
		PRESS_PRIMARY_BUTTON: "PressPrimaryButton",
		PRESS_SECONDARY_BUTTON: "PressSecondaryButton",
		SET_CONFIGURATION: "SetConfiguration",
		GET_CONFIGURATION: "GetConfiguration",
		IS_READY: "IsReady",
		GET_MESSAGES: "GetMessages",
		GET_TOKEN_USAGE: "GetTokenUsage",
		LOG: "Log",
		CREATE_PROFILE: "CreateProfile",
		GET_PROFILES: "GetProfiles",
		SET_ACTIVE_PROFILE: "SetActiveProfile",
		GET_ACTIVE_PROFILE: "GetActiveProfile",
		DELETE_PROFILE: "DeleteProfile",
	}

	_sendCommand(commandName, commandData = {}) {
		return new Promise((resolve, reject) => {
			const socket = ipc.of["roo-tcp-server"]
			if (!socket) {
				reject(new Error("Not connected to server"))
				return
			}

			// Create message object according to schema
			const message = {
				type: RooCodeClient.IpcMessageType.TaskCommand,
				origin: RooCodeClient.IpcOrigin.Client,
				clientId: this.clientId,
				data: {
					commandName: commandName,
					data: commandData,
				},
			}

			// Store the pending request with 60s timeout
			const timeoutId = setTimeout(() => {
				this.pendingRequests.delete(this.clientId)
				reject(new Error(`${commandName} timeout after 60s`))
			}, 60000)

			this.pendingRequests.set(this.clientId, {
				resolve,
				timeout: timeoutId,
			})

			console.log("[RPC Client] Sending command:", commandName, "with data:", JSON.stringify(commandData))

			socket.emit("message", message)
		})
	}

	connect() {
		return new Promise((resolve, reject) => {
			const host = process.env.ROO_CODE_IPC_TCP_HOST || "localhost"
			const port = 7800

			console.log(`Attempting to connect to ${host}:${port}...`)

			const timeout = setTimeout(() => {
				reject(new Error("Connection timeout after 5s"))
			}, 5000)

			try {
				// Configure IPC
				ipc.config.id = "test-node-client"
				ipc.config.retry = 1500
				ipc.config.maxRetries = 3
				ipc.config.silent = false
				ipc.config.sync = false
				ipc.config.unlink = false
				ipc.config.appspace = ""
				ipc.config.socketRoot = ""
				ipc.config.stopRetrying = true

				// Connect using TCP
				ipc.connectToNet("roo-tcp-server", host, port, () => {
					if (!ipc.of["roo-tcp-server"]) {
						clearTimeout(timeout)
						reject(new Error("Failed to establish connection"))
						return
					}

					const socket = ipc.of["roo-tcp-server"]

					socket.on("message", (data) => {
						if (typeof data === "string") {
							this.buffer += data
							this._processBuffer()
						} else {
							this._handleMessage(data)
						}
					})

					socket.on("error", (err) => {
						console.error("Connection error:", err)
						this.emit("error", err)
					})

					socket.on("disconnect", () => {
						console.log("Disconnected from server")
						this.emit("disconnect")
					})

					console.log("Initiating connection...")
					resolve()
				})
			} catch (error) {
				clearTimeout(timeout)
				reject(error)
			}
		})
	}

	disconnect() {
		ipc.disconnect("roo-tcp-server")
	}

	async getConfiguration() {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_CONFIGURATION, {})
	}

	async setConfiguration(settings) {
		this._validateConfiguration(settings)
		return this._sendCommand(RooCodeClient.TaskCommandName.SET_CONFIGURATION, settings)
	}

	async startNewTask(text, configuration, options = {}) {
		this._validateConfiguration(configuration)

		const data = {
			configuration: {
				...configuration,
				__type__: "RooCodeSettings",
			},
			text: text,
			images: options.images || [],
			newTab: options.newTab || false,
		}
		return this._sendCommand(RooCodeClient.TaskCommandName.START_NEW_TASK, data)
	}

	async resumeTask(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.RESUME_TASK, taskId)
	}

	async isTaskInHistory(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.IS_TASK_IN_HISTORY, taskId)
	}

	async getCurrentTaskStack() {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_CURRENT_TASK_STACK, {})
	}

	async getMessages(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_MESSAGES, taskId)
	}

	async getTokenUsage(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_TOKEN_USAGE, taskId)
	}

	async isTaskInHistory(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.IS_TASK_IN_HISTORY, taskId)
	}

	async getCurrentTaskStack() {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_CURRENT_TASK_STACK, {})
	}

	async sendMessage(message, images = []) {
		return this._sendCommand(RooCodeClient.TaskCommandName.SEND_MESSAGE, {
			message,
			images,
		})
	}

	async pressPrimaryButton() {
		return this._sendCommand(RooCodeClient.TaskCommandName.PRESS_PRIMARY_BUTTON, {})
	}

	async pressSecondaryButton() {
		return this._sendCommand(RooCodeClient.TaskCommandName.PRESS_SECONDARY_BUTTON, {})
	}

	async log(message) {
		return this._sendCommand(RooCodeClient.TaskCommandName.LOG, message)
	}

	async createProfile(name) {
		return this._sendCommand(RooCodeClient.TaskCommandName.CREATE_PROFILE, name)
	}

	async getProfiles() {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_PROFILES, {})
	}

	async setActiveProfile(name) {
		return this._sendCommand(RooCodeClient.TaskCommandName.SET_ACTIVE_PROFILE, name)
	}

	async getActiveProfile() {
		return this._sendCommand(RooCodeClient.TaskCommandName.GET_ACTIVE_PROFILE, {})
	}

	async deleteProfile(name) {
		return this._sendCommand(RooCodeClient.TaskCommandName.DELETE_PROFILE, name)
	}

	async clearCurrentTask(reason) {
		return this._sendCommand(RooCodeClient.TaskCommandName.CLEAR_CURRENT_TASK, reason)
	}

	async cancelTask(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.CANCEL_TASK, taskId)
	}

	async closeTask(taskId) {
		return this._sendCommand(RooCodeClient.TaskCommandName.CLOSE_TASK, taskId)
	}

	_validateConfiguration(config) {
		if (config.__type__ && config.__type__ !== "RooCodeSettings") {
			throw new Error("Invalid __type__ field in configuration")
		}

		const requiredFields = [
			"apiProvider",
			"currentApiConfigName",
			"autoApprovalEnabled",
			"alwaysAllowReadOnly",
			"alwaysAllowWrite",
			"alwaysAllowBrowser",
			"alwaysAllowExecute",
		]

		for (const field of requiredFields) {
			if (!(field in config)) {
				throw new Error(`Missing required field: ${field}`)
			}
		}

		if (typeof config.apiProvider !== "string") throw new Error("apiProvider must be a string")
		if (typeof config.currentApiConfigName !== "string") throw new Error("currentApiConfigName must be a string")
		if (typeof config.autoApprovalEnabled !== "boolean") throw new Error("autoApprovalEnabled must be a boolean")
		if (typeof config.alwaysAllowReadOnly !== "boolean") throw new Error("alwaysAllowReadOnly must be a boolean")
		if (typeof config.alwaysAllowWrite !== "boolean") throw new Error("alwaysAllowWrite must be a boolean")
		if (typeof config.alwaysAllowBrowser !== "boolean") throw new Error("alwaysAllowBrowser must be a boolean")
		if (typeof config.alwaysAllowExecute !== "boolean") throw new Error("alwaysAllowExecute must be a boolean")

		return true
	}
}

// Main execution block - connect and wait
async function main() {
	const client = new RooCodeClient()

	// Connection events
	client.on("connect", (data) => {
		console.log("Event: Connected:", data)
		console.log("Client is connected and ready to send messages.")
	})

	client.on("disconnect", () => {
		console.log("Event: Disconnected")
	})

	client.on("error", (error) => {
		console.error("Event: Error:", error)
	})

	// Task lifecycle events
	client.on("Message", (data) => {
		console.log("Event: Message:", data)
	})

	client.on("TaskCreated", (taskId) => {
		console.log("Event: TaskCreated:", taskId)
	})

	client.on("TaskStarted", (taskId) => {
		console.log("Event: TaskStarted:", taskId)
	})

	client.on("TaskModeSwitched", (taskId, modeSlug) => {
		console.log("Event: TaskModeSwitched:", { taskId, modeSlug })
	})

	client.on("TaskPaused", (taskId) => {
		console.log("Event: TaskPaused:", taskId)
	})

	client.on("TaskUnpaused", (taskId) => {
		console.log("Event: TaskUnpaused:", taskId)
	})

	client.on("TaskAskResponded", (taskId) => {
		console.log("Event: TaskAskResponded:", taskId)
	})

	client.on("TaskAborted", (taskId) => {
		console.log("Event: TaskAborted:", taskId)
	})

	client.on("TaskSpawned", (taskId, childTaskId) => {
		console.log("Event: TaskSpawned:", { taskId, childTaskId })
	})

	client.on("TaskCompleted", (taskId, tokenUsage, toolUsage) => {
		console.log("Event: TaskCompleted:", { taskId, tokenUsage, toolUsage })
	})

	client.on("TaskTokenUsageUpdated", (taskId, usage) => {
		console.log("Event: TaskTokenUsageUpdated:", { taskId, usage })
	})

	client.on("TaskToolFailed", (taskId, toolName, error) => {
		console.log("Event: TaskToolFailed:", { taskId, toolName, error })
	})

	try {
		await client.connect()
		// Keep the process alive
		setInterval(() => {}, 1000)
	} catch (error) {
		console.error("Failed to connect:", error)
		process.exit(1)
	}
}

main().catch((error) => {
	console.error("Unexpected error in main:", error)
	process.exit(1)
})

// Export the client instance for potential manual interaction if needed
// module.exports = { RooCodeClient }; // Not needed for this test approach
