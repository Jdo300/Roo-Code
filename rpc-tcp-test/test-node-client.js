const ipc = require("node-ipc").default

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

class RooCodeClient {
	constructor() {
		this.eventHandlers = new Map()
		this.buffer = "" // Message buffer like Python client
		this.clientId = Math.random().toString(36).substring(2)
		this.pendingRequests = new Map() // Track pending requests by clientId
	}

	_processBuffer() {
		const messages = this.buffer.split("\n")
		this.buffer = messages.pop() || "" // Keep partial message in buffer

		for (const message of messages) {
			try {
				const parsed = JSON.parse(message)
				this._handleMessage(parsed)
			} catch (error) {
				if (this.eventHandlers.has("error")) {
					this.eventHandlers.get("error")(`Failed to parse message: ${error}`)
				}
			}
		}
	}

	_handleMessage(message) {
		try {
			if (message.type === RooCodeClient.IpcMessageType.ACK) {
				if (this.eventHandlers.has("connect")) {
					this.eventHandlers.get("connect")(message.data)
				}
			} else if (message.type === RooCodeClient.IpcMessageType.TASK_EVENT) {
				const event = message.data
				if (this.eventHandlers.has(event.event_name)) {
					this.eventHandlers.get(event.event_name)(event.payload)
				}
			} else if (message.type === RooCodeClient.IpcMessageType.TASK_COMMAND) {
				if (message.clientId && this.pendingRequests.has(message.clientId)) {
					const request = this.pendingRequests.get(message.clientId)
					clearTimeout(request.timeout)
					this.pendingRequests.delete(message.clientId)
					request.resolve(message.data)
				}
			} else {
				if (this.eventHandlers.has("error")) {
					this.eventHandlers.get("error")(`Unknown message type: ${message.type}`)
				}
			}
		} catch (error) {
			if (this.eventHandlers.has("error")) {
				this.eventHandlers.get("error")(`Failed to handle message: ${error}`)
			}
		}
	}

	_processBuffer() {
		const messages = this.buffer.split("\n")
		this.buffer = messages.pop() || "" // Keep partial message in buffer

		for (const message of messages) {
			try {
				const parsed = JSON.parse(message)
				this._handleMessage(parsed)
			} catch (error) {
				if (this.eventHandlers.has("error")) {
					this.eventHandlers.get("error")(`Failed to parse message: ${error}`)
				}
			}
		}
	}

	_handleMessage(parsedMsg) {
		try {
			if (parsedMsg.type === RooCodeClient.IpcMessageType.ACK) {
				if (this.eventHandlers.has("connect")) {
					this.eventHandlers.get("connect")(parsedMsg.data)
				}
			} else if (parsedMsg.type === RooCodeClient.IpcMessageType.TASK_EVENT) {
				const event = parsedMsg.data
				if (this.eventHandlers.has(event.event_name)) {
					this.eventHandlers.get(event.event_name)(event.payload)
				}
			} else if (parsedMsg.type === RooCodeClient.IpcMessageType.TASK_COMMAND) {
				if (parsedMsg.client_id && this.pendingRequests.has(parsedMsg.client_id)) {
					const request = this.pendingRequests.get(parsedMsg.client_id)
					clearTimeout(request.timeout)
					this.pendingRequests.delete(parsedMsg.client_id)
					request.resolve(parsedMsg.data)
				}
			} else {
				if (this.eventHandlers.has("error")) {
					this.eventHandlers.get("error")(`Unknown message type: ${parsedMsg.type}`)
				}
			}
		} catch (error) {
			if (this.eventHandlers.has("error")) {
				this.eventHandlers.get("error")(`Failed to handle message: ${error}`)
			}
		}
	}

	// Message types matching Python enums exactly
	static IpcMessageType = {
		ACK: "Ack",
		TASK_COMMAND: "TaskCommand",
		TASK_EVENT: "TaskEvent",
	}

	static IpcOrigin = {
		CLIENT: "client",
		SERVER: "server",
	}

	// Command names matching Python enum values exactly
	static TaskCommandName = {
		START_NEW_TASK: "StartNewTask",
		RESUME_TASK: "ResumeTask",
		IS_TASK_IN_HISTORY: "IsTaskInHistory",
		GET_CURRENT_TASK_STACK: "GetCurrentTaskStack",
		CLEAR_CURRENT_TASK: "ClearCurrentTask",
		CANCEL_CURRENT_TASK: "CancelCurrentTask",
		SEND_MESSAGE: "SendMessage",
		PRESS_PRIMARY_BUTTON: "PressPrimaryButton",
		PRESS_SECONDARY_BUTTON: "PressSecondaryButton",
		SET_CONFIGURATION: "SetConfiguration",
		GET_CONFIGURATION: "GetConfiguration",
		IS_READY: "IsReady",
		GET_MESSAGES: "GetMessages",
		GET_TOKEN_USAGE: "GetTokenUsage",
		CREATE_PROFILE: "CreateProfile",
		GET_PROFILES: "GetProfiles",
		SET_ACTIVE_PROFILE: "SetActiveProfile",
		GET_ACTIVE_PROFILE: "getActiveProfile",
		DELETE_PROFILE: "DeleteProfile",
	}

	_sendCommand(commandName, data) {
		return new Promise((resolve, reject) => {
			const socket = ipc.of["roo-tcp-server"]
			if (!socket) {
				reject(new Error("Not connected to server"))
				return
			}

			// Create IpcMessage according to schema
			const message = {
				type: RooCodeClient.IpcMessageType.TASK_COMMAND,
				origin: RooCodeClient.IpcOrigin.CLIENT,
				clientId: this.clientId, // Use camelCase like Python IpcMessage
				data: {
					commandName: RooCodeClient.TaskCommandName[commandName], // Use enum value
					data: data, // Command-specific payload
				},
			}

			// Store the pending request with 60s timeout like Python client
			const timeoutId = setTimeout(() => {
				this.pendingRequests.delete(this.clientId)
				reject(new Error(`${commandName} timeout after 60s`))
			}, 60000) // 60 seconds for potentially long AI responses

			// Store the pending request before sending like Python client
			this.pendingRequests.set(this.clientId, {
				resolve,
				timeout: timeoutId,
			})

			// Log message like Python transport
			console.log("[TcpTransport#send] Sending data:", JSON.stringify(message))

			// Send message with newline and ensure it's sent immediately like Python client
			const messageStr = JSON.stringify(message) + "\n"
			socket.emit("message", messageStr)
		})
	}

	setupEventHandlers() {
		const socket = ipc.of["roo-tcp-server"]
		if (!socket) {
			throw new Error("Cannot setup handlers - socket not connected")
		}

		// Handle task-related events
		socket.on("taskUpdate", (data) => {
			console.log("Event: Task Update:", data)
			if (this.eventHandlers.has("taskUpdate")) {
				this.eventHandlers.get("taskUpdate")(data)
			}
		})

		socket.on("taskStarted", (data) => {
			console.log("Event: Task Started:", data)
			if (this.eventHandlers.has("taskStarted")) {
				this.eventHandlers.get("taskStarted")(data)
			}
		})

		socket.on("taskCompleted", (data) => {
			console.log("Event: Task Completed:", data)
			if (this.eventHandlers.has("taskCompleted")) {
				this.eventHandlers.get("taskCompleted")(data)
			}
		})

		// Handle raw message events like Python client
		socket.on("message", (data) => {
			if (typeof data === "string") {
				this.buffer += data
				this._processBuffer()
			} else {
				this._handleMessage(data)
			}
		})

		// Handle error events
		socket.on("error", (error) => {
			if (this.eventHandlers.has("error")) {
				this.eventHandlers.get("error")(error)
			}
		})

		// Handle close events
		socket.on("close", () => {
			if (this.eventHandlers.has("close")) {
				this.eventHandlers.get("close")()
			}
		})

		// Handle tool events
		socket.on("toolUse", (data) => {
			console.log("Event: Tool Use:", data)
			if (this.eventHandlers.has("toolUse")) {
				this.eventHandlers.get("toolUse")(data)
			}
		})

		socket.on("toolResult", (data) => {
			console.log("Event: Tool Result:", data)
			if (this.eventHandlers.has("toolResult")) {
				this.eventHandlers.get("toolResult")(data)
			}
		})

		socket.on("toolError", (data) => {
			console.error("Event: Tool Error:", data)
			if (this.eventHandlers.has("toolError")) {
				this.eventHandlers.get("toolError")(data)
			}
		})
	}

	addEventListener(event, handler) {
		this.eventHandlers.set(event, handler)
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
				// Connect using TCP
				ipc.connectToNet("roo-tcp-server", host, port, () => {
					if (!ipc.of["roo-tcp-server"]) {
						clearTimeout(timeout)
						reject(new Error("Failed to establish connection"))
						return
					}

					const socket = ipc.of["roo-tcp-server"]

					// Set up message handler first like Python client
					socket.on("message", (data) => {
						if (typeof data === "string") {
							this.buffer += data
							this._processBuffer()
						} else {
							this._handleMessage(data)
						}
					})

					// Add connect handler for initial connection
					this.addEventListener("connect", (data) => {
						console.log("Connection acknowledged:", data)
						clearTimeout(timeout)
						resolve()
					})

					socket.on("connect", () => {
						console.log("Connected to server")

						// Send Connect message with process info
						const connectMessage = {
							type: "Connect", // Special message type for initial connection
							origin: RooCodeClient.IpcOrigin.CLIENT,
							clientId: this.clientId, // Use camelCase like Python IpcMessage
							data: {
								pid: process.pid,
								ppid: process.ppid,
							},
						}
						// Send connect message with newline like Python client
						socket.emit("message", JSON.stringify(connectMessage) + "\n")
					})

					socket.on("error", (err) => {
						console.error("Connection error:", err)
						clearTimeout(timeout)
						reject(err)
					})

					socket.on("disconnect", () => {
						console.log("Disconnected from server")
					})
				})

				console.log("Initiating connection...")
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
		return this._sendCommand("GetConfiguration", null)
	}

	async setConfiguration(settings) {
		return this._sendCommand("SetConfiguration", settings)
	}

	async startNewTask(text, configuration, options = {}) {
		const data = {
			configuration: configuration,
			text: text,
			images: options.images,
			newTab: options.newTab,
		}
		return this._sendCommand("StartNewTask", data)
	}

	async isTaskInHistory(taskId) {
		return this._sendCommand("IsTaskInHistory", taskId)
	}

	async getCurrentTaskStack() {
		return this._sendCommand("GetCurrentTaskStack", null)
	}

	async sendMessage(message) {
		const data = { message }
		return this._sendCommand("SendMessage", data)
	}

	async createProfile(name) {
		return this._sendCommand("CreateProfile", name)
	}

	async getProfiles() {
		return this._sendCommand("GetProfiles", null)
	}

	async setActiveProfile(name) {
		return this._sendCommand("SetActiveProfile", name)
	}

	async getActiveProfile() {
		return this._sendCommand("getActiveProfile", null)
	}

	async deleteProfile(name) {
		return this._sendCommand("DeleteProfile", name)
	}

	async clearCurrentTask(reason) {
		return this._sendCommand("ClearCurrentTask", reason)
	}
}

// Main test function
async function main() {
	const client = new RooCodeClient()

	try {
		// Connect to server
		await client.connect()
		console.log("Connected to server")

		// Test configuration commands
		console.log("\n--- Testing Configuration Commands ---")
		const initialConfig = await client.getConfiguration()
		console.log("Initial configuration:", initialConfig)

		const testSettings = {
			apiProvider: "test-provider",
			currentApiConfigName: "test-config",
			autoApprovalEnabled: false,
			alwaysAllowReadOnly: false,
			alwaysAllowWrite: false,
			alwaysAllowBrowser: false,
			alwaysAllowExecute: false,
			__type__: "RooCodeSettings", // Add type information to match Python
		}

		await client.setConfiguration(testSettings)
		console.log("Set configuration to test values")

		const updatedConfig = await client.getConfiguration()
		console.log("Updated configuration:", updatedConfig)

		// Test basic API commands
		console.log("\n--- Testing Basic API Commands ---")
		const taskId = await client.startNewTask("Hello from Node.js client! Test basic commands.", {
			apiProvider: "fake-ai",
			currentApiConfigName: "test",
			autoApprovalEnabled: true,
			alwaysAllowReadOnly: true,
			alwaysAllowWrite: true,
			alwaysAllowBrowser: true,
			alwaysAllowExecute: true,
		})
		console.log("Started new task:", taskId)

		const exists = await client.isTaskInHistory(taskId)
		console.log("Task exists in history:", exists)

		const stack = await client.getCurrentTaskStack()
		console.log("Current task stack:", stack)

		await client.sendMessage("Another test message from Node.js")
		console.log("Message sent")

		// Test profile operations
		console.log("\n--- Testing Profile Operations ---")
		const profileName = "test_profile"
		try {
			const createdProfile = await client.createProfile(profileName)
			console.log("Created profile:", createdProfile)

			const profiles = await client.getProfiles()
			console.log("Available profiles:", profiles)

			await client.setActiveProfile(profileName)
			console.log("Set active profile to:", profileName)

			const activeProfile = await client.getActiveProfile()
			console.log("Current active profile:", activeProfile)
		} catch (error) {
			console.warn("Profile operations test failed:", error)
		} finally {
			try {
				await client.deleteProfile(profileName)
				console.log("Deleted profile:", profileName)
			} catch (error) {
				// Ignore if delete fails
			}
		}

		// Test streaming functionality
		console.log("\n--- Testing Streaming Functionality ---")
		client.messageChunks = []
		client.fullMessage = ""

		await client.sendMessage(
			"Write a detailed explanation of quantum entanglement. Make it at least 500 words long.",
		)
		console.log("Sent message to trigger streaming.")

		// Wait for streaming to complete
		await new Promise((resolve) => setTimeout(resolve, 30000))

		console.log(`Streaming test: Received ${client.messageChunks.length} chunks.`)
		console.log(`Streaming test: Full received message length: ${client.fullMessage.length}`)

		if (client.messageChunks.length > 1 && client.fullMessage.length > 100) {
			console.log("Streaming test: Streaming appears to be working and chunks were assembled.")
		} else {
			console.warn("Streaming test: Streaming may not have worked as expected.")
			console.warn("Full received message content (first 200 chars):")
			console.warn(client.fullMessage.substring(0, 200) + "...")
		}

		// Clear current task
		await client.clearCurrentTask("All tests completed")
		console.log("Cleared current task")
	} catch (error) {
		console.error("Error during test execution:", error)
	} finally {
		client.disconnect()
		console.log("Disconnected from server")
	}
}

// Run the tests
if (require.main === module) {
	main().catch((error) => {
		console.error("Unexpected error:", error)
		process.exit(1)
	})
}

// Export the client class
module.exports = RooCodeClient
