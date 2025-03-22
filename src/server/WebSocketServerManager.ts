import { WebSocketServer, WebSocket } from "ws"
import * as http from "http"
import * as vscode from "vscode"
import { API } from "../exports/api"
import { ClineProvider } from "../core/webview/ClineProvider"
import { RooCodeAPI } from "../exports/roo-code"
import { t } from "../i18n"

/**
 * WebSocketServerManager is responsible for managing the WebSocket server for the Roo Code extension.
 * It follows the singleton pattern and provides methods to start, stop, and restart the server.
 */
export class WebSocketServerManager {
	private static instance: WebSocketServerManager | undefined
	private server: WebSocketServer | undefined
	private outputChannel: vscode.OutputChannel
	private statusBarItem: vscode.StatusBarItem
	private api: API
	private provider: ClineProvider
	private currentPort: number = 7800
	private clients: Set<WebSocket> = new Set()
	private isRunning: boolean = false
	private disposables: vscode.Disposable[] = []

	/**
	 * Private constructor to enforce singleton pattern
	 */
	private constructor(
		readonly context: vscode.ExtensionContext,
		outputChannel: vscode.OutputChannel,
		api: API,
		provider: ClineProvider,
	) {
		this.outputChannel = outputChannel
		this.api = api
		this.provider = provider

		// Create status bar item
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
		this.statusBarItem.command = "roo-cline.toggleWebSocketServer"
		context.subscriptions.push(this.statusBarItem)

		// Register commands
		this.registerCommands(context)

		// Initialize server based on settings
		this.initialize()
	}

	/**
	 * Get the singleton instance of WebSocketServerManager
	 */
	public static getInstance(
		context: vscode.ExtensionContext,
		outputChannel: vscode.OutputChannel,
		api: API,
		provider: ClineProvider,
	): WebSocketServerManager {
		if (!WebSocketServerManager.instance) {
			WebSocketServerManager.instance = new WebSocketServerManager(context, outputChannel, api, provider)
		}
		return WebSocketServerManager.instance
	}

	/**
	 * Register commands for the WebSocket server
	 */
	private registerCommands(context: vscode.ExtensionContext): void {
		// Toggle WebSocket server command
		context.subscriptions.push(
			vscode.commands.registerCommand("roo-cline.toggleWebSocketServer", this.toggleServer.bind(this)),
		)
	}

	/**
	 * Initialize the WebSocket server based on the settings
	 */
	private async initialize(): Promise<void> {
		try {
			const state = await this.provider.getState()

			// Cast to 'any' to handle potential missing properties during development
			const anyState = state as any

			// Use proper null checking to distinguish between false and undefined
			let websocketServerEnabled =
				anyState.websocketServerEnabled !== undefined ? anyState.websocketServerEnabled : false
			let websocketServerPort = anyState.websocketServerPort !== undefined ? anyState.websocketServerPort : 7800

			// Store default values if they don't already exist in global state
			if (anyState.websocketServerEnabled === undefined) {
				this.log("Initializing websocketServerEnabled to default value: false")
				await this.provider.updateGlobalState("websocketServerEnabled", false)
				// Make sure our local value matches what was saved
				websocketServerEnabled = false
			}

			if (anyState.websocketServerPort === undefined) {
				this.log("Initializing websocketServerPort to default value: 7800")
				await this.provider.updateGlobalState("websocketServerPort", 7800)
				// Make sure our local value matches what was saved
				websocketServerPort = 7800
			}

			// Log the final state to help debug
			this.log(
				`Initialized WebSocket server with settings - enabled: ${websocketServerEnabled}, port: ${websocketServerPort}`,
			)

			// Update UI first
			this.updateStatusBarItem(websocketServerEnabled, websocketServerPort)

			// Then start server if enabled
			if (websocketServerEnabled) {
				this.log("Automatically starting WebSocket server based on saved settings")
				await this.startServer(websocketServerPort)
			}
		} catch (error) {
			this.log(`Error initializing WebSocket server: ${error instanceof Error ? error.message : String(error)}`)
			this.updateStatusBarItem(false, 7800)
		}
	}

	/**
	 * Start the WebSocket server
	 */
	public async startServer(port: number = 7800): Promise<void> {
		// If the server is already running on the same port, don't restart it
		if (this.server && this.currentPort === port) {
			this.log(`Server already running on port ${this.currentPort}`)
			return
		}

		// If the server is running on a different port, stop it first
		if (this.server && this.currentPort !== port) {
			this.log(`Stopping server on port ${this.currentPort} to restart on port ${port}`)
			this.stopServer()
			// Add a small delay to ensure clean shutdown
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		try {
			// Ensure the port is saved to global state before starting
			await this.provider.updateGlobalState("websocketServerPort", port)
			await this.provider.updateGlobalState("websocketServerEnabled", true)

			this.currentPort = port
			this.server = new WebSocketServer({ port, host: "0.0.0.0" })
			this.isRunning = true
			this.log(`WebSocket server started on port ${port}`)

			// Handle connections
			this.server.on("connection", this.handleConnection.bind(this))

			// Handle errors
			this.server.on("error", (error: Error) => {
				this.log(`WebSocket server error: ${error.message}`)
				this.isRunning = false
				this.server = undefined
				this.updateStatusBarItem(true, port, true)
				vscode.window.showErrorMessage(t("common:errors.websocket_server_error", { message: error.message }))
			})

			// Update status bar
			this.updateStatusBarItem(true, port)
		} catch (error) {
			this.log(`Failed to start WebSocket server: ${error instanceof Error ? error.message : String(error)}`)
			this.isRunning = false
			this.server = undefined
			this.updateStatusBarItem(true, port, true)
			vscode.window.showErrorMessage(
				t("common:errors.websocket_server_start_failed", {
					message: error instanceof Error ? error.message : String(error),
				}),
			)
		}
	}

	/**
	 * Stop the WebSocket server
	 */
	public stopServer(): void {
		if (!this.server) {
			return
		}

		try {
			// Close all client connections
			for (const client of this.clients) {
				client.terminate()
			}
			this.clients.clear()

			// Close the server
			this.server.close(() => {
				this.log(`WebSocket server stopped on port ${this.currentPort}`)
			})

			this.server = undefined
			this.isRunning = false
			this.updateStatusBarItem(false, this.currentPort)
		} catch (error) {
			this.log(`Failed to stop WebSocket server: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Restart the WebSocket server
	 */
	public async restartServer(): Promise<void> {
		this.log(`Restarting WebSocket server on port ${this.currentPort}`)
		this.stopServer()
		// Small delay to ensure server is fully closed
		await new Promise((resolve) => setTimeout(resolve, 100))
		this.startServer(this.currentPort)
	}

	/**
	 * Toggle the WebSocket server
	 */
	public async toggleServer(): Promise<void> {
		const state = await this.provider.getState()
		// Cast to 'any' to handle potential missing properties during development
		const anyState = state as any
		// Use proper null checking to distinguish between false and undefined
		const websocketServerEnabled =
			anyState.websocketServerEnabled !== undefined ? anyState.websocketServerEnabled : false
		const websocketServerPort = anyState.websocketServerPort !== undefined ? anyState.websocketServerPort : 7800

		this.log(`Toggle server - current state: ${websocketServerEnabled}, port: ${websocketServerPort}`)

		const newEnabledState = !websocketServerEnabled

		// Make sure we save the settings to persistent storage
		await this.provider.updateGlobalState("websocketServerEnabled", newEnabledState)

		// Also make sure we persist the port setting (even if unchanged)
		await this.provider.updateGlobalState("websocketServerPort", websocketServerPort)

		// Force a context state update to ensure the UI reflects the changes immediately
		await this.provider.postStateToWebview()

		// Update the actual server state based on the new setting
		if (newEnabledState) {
			await this.startServer(websocketServerPort)
		} else {
			this.stopServer()
		}

		// Update UI and state
		await this.provider.postStateToWebview()
		this.updateStatusBarItem(newEnabledState, websocketServerPort)
	}

	/**
	 * Handle a new WebSocket connection
	 */
	private handleConnection(socket: WebSocket, request: http.IncomingMessage): void {
		const remoteAddress = request.socket.remoteAddress || "unknown"
		this.log(`New WebSocket connection from ${remoteAddress}`)
		this.clients.add(socket)

		// Handle messages from client
		socket.on("message", (message: Buffer | ArrayBuffer | Buffer[]) => {
			this.handleClientMessage(socket, message)
		})

		// Handle client disconnection
		socket.on("close", () => {
			this.log("Client disconnected")
			this.clients.delete(socket)
		})

		// Handle errors
		socket.on("error", (error: Error) => {
			this.log(`WebSocket client error: ${error.message}`)
			this.clients.delete(socket)
		})

		// Send welcome message to client
		this.sendToClient(socket, {
			type: "response",
			status: "success",
			requestId: "welcome",
			commandName: "welcome",
			data: {
				message: "Connected to Roo Code WebSocket Server",
				version: vscode.extensions.getExtension("rooveterinaryinc.roo-cline")?.packageJSON.version || "unknown",
			},
		})
	}

	/**
	 * Handle a message from a WebSocket client
	 */
	private async handleClientMessage(socket: WebSocket, message: Buffer | ArrayBuffer | Buffer[]): Promise<void> {
		try {
			const messageStr = message.toString()
			this.log(`Received message: ${messageStr}`)

			// Parse the message
			const parsedMessage = JSON.parse(messageStr)

			// Check if the message is a command
			if (parsedMessage.type === "command") {
				await this.handleCommand(socket, parsedMessage)
			} else {
				this.sendErrorToClient(
					socket,
					"INVALID_COMMAND",
					"Message type must be 'command'",
					parsedMessage.requestId,
				)
			}
		} catch (error) {
			this.log(`Error handling client message: ${error instanceof Error ? error.message : String(error)}`)
			this.sendErrorToClient(
				socket,
				"SERVER_ERROR",
				`Failed to process message: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Handle a command from a client
	 */
	private async handleCommand(socket: WebSocket, command: any): Promise<void> {
		const { commandName, taskId, arguments: args, requestId } = command

		if (!requestId) {
			this.sendErrorToClient(socket, "INVALID_PARAMETER", "Missing 'requestId' in command", requestId)
			return
		}

		try {
			// Check if RooCodeAPI is ready
			if (!this.api.isReady()) {
				this.sendErrorToClient(socket, "API_NOT_READY", "Roo Code API is not ready", requestId, commandName)
				return
			}

			// Execute the command based on commandName
			switch (commandName) {
				case "startNewTask":
					this.handleStartNewTask(socket, args, requestId)
					break

				case "getCurrentTaskStack":
					this.handleGetCurrentTaskStack(socket, requestId)
					break

				case "clearCurrentTask":
					this.handleClearCurrentTask(socket, args, requestId)
					break

				case "cancelCurrentTask":
					this.handleCancelCurrentTask(socket, requestId)
					break

				case "sendMessage":
					this.handleSendMessage(socket, taskId, args, requestId)
					break

				case "pressPrimaryButton":
					this.handlePressButton(socket, taskId, "primary", requestId)
					break

				case "pressSecondaryButton":
					this.handlePressButton(socket, taskId, "secondary", requestId)
					break

				case "setConfiguration":
					this.handleSetConfiguration(socket, args, requestId)
					break

				case "getMessages":
					this.handleGetMessages(socket, taskId, requestId)
					break

				case "getTokenUsage":
					this.handleGetTokenUsage(socket, taskId, requestId)
					break

				case "isReady":
					this.handleIsReady(socket, requestId)
					break

				default:
					this.sendErrorToClient(
						socket,
						"INVALID_COMMAND",
						`Unknown command: ${commandName}`,
						requestId,
						commandName,
					)
			}
		} catch (error) {
			this.log(
				`Error executing command '${commandName}': ${error instanceof Error ? error.message : String(error)}`,
			)
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Error executing command: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				commandName,
			)
		}
	}

	/**
	 * Handle startNewTask command
	 */
	private async handleStartNewTask(socket: WebSocket, args: any, requestId: string): Promise<void> {
		try {
			const taskId = await this.api.startNewTask(args?.text, args?.images)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "startNewTask",
				data: { taskId },
			})

			// Setup event listeners for this task
			this.setupEventListeners(taskId)
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to start new task: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"startNewTask",
			)
		}
	}

	/**
	 * Handle getCurrentTaskStack command
	 */
	private handleGetCurrentTaskStack(socket: WebSocket, requestId: string): void {
		try {
			const taskStack = this.api.getCurrentTaskStack()

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "getCurrentTaskStack",
				data: { taskStack },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to get current task stack: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"getCurrentTaskStack",
			)
		}
	}

	/**
	 * Handle clearCurrentTask command
	 */
	private async handleClearCurrentTask(socket: WebSocket, args: any, requestId: string): Promise<void> {
		try {
			await this.api.clearCurrentTask(args?.lastMessage)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "clearCurrentTask",
				data: { result: "success" },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to clear current task: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"clearCurrentTask",
			)
		}
	}

	/**
	 * Handle cancelCurrentTask command
	 */
	private async handleCancelCurrentTask(socket: WebSocket, requestId: string): Promise<void> {
		try {
			await this.api.cancelCurrentTask()

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "cancelCurrentTask",
				data: { result: "success" },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to cancel current task: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"cancelCurrentTask",
			)
		}
	}

	/**
	 * Handle sendMessage command
	 */
	private async handleSendMessage(
		socket: WebSocket,
		taskId: string | undefined,
		args: any,
		requestId: string,
	): Promise<void> {
		if (!taskId) {
			this.sendErrorToClient(
				socket,
				"INVALID_PARAMETER",
				"Missing 'taskId' for sendMessage command",
				requestId,
				"sendMessage",
			)
			return
		}

		try {
			// Check if task exists
			if (!this.api.getCurrentTaskStack().includes(taskId)) {
				this.sendErrorToClient(
					socket,
					"TASK_NOT_FOUND",
					`Task with ID '${taskId}' not found`,
					requestId,
					"sendMessage",
				)
				return
			}

			await this.api.sendMessage(args?.message, args?.images)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "sendMessage",
				data: { result: "success" },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"sendMessage",
			)
		}
	}

	/**
	 * Handle pressPrimaryButton or pressSecondaryButton command
	 */
	private async handlePressButton(
		socket: WebSocket,
		taskId: string | undefined,
		buttonType: "primary" | "secondary",
		requestId: string,
	): Promise<void> {
		if (!taskId) {
			this.sendErrorToClient(
				socket,
				"INVALID_PARAMETER",
				`Missing 'taskId' for press${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}Button command`,
				requestId,
				`press${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}Button`,
			)
			return
		}

		try {
			// Check if task exists
			if (!this.api.getCurrentTaskStack().includes(taskId)) {
				this.sendErrorToClient(
					socket,
					"TASK_NOT_FOUND",
					`Task with ID '${taskId}' not found`,
					requestId,
					`press${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}Button`,
				)
				return
			}

			// Press the button
			if (buttonType === "primary") {
				await this.api.pressPrimaryButton()
			} else {
				await this.api.pressSecondaryButton()
			}

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: `press${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}Button`,
				data: { result: "success" },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to press ${buttonType} button: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				`press${buttonType.charAt(0).toUpperCase() + buttonType.slice(1)}Button`,
			)
		}
	}

	/**
	 * Handle setConfiguration command
	 */
	private async handleSetConfiguration(socket: WebSocket, args: any, requestId: string): Promise<void> {
		if (!args?.values || typeof args.values !== "object") {
			this.sendErrorToClient(
				socket,
				"INVALID_PARAMETER",
				"Missing or invalid 'values' parameter for setConfiguration command",
				requestId,
				"setConfiguration",
			)
			return
		}

		try {
			await this.api.setConfiguration(args.values)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "setConfiguration",
				data: { result: "success" },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to set configuration: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"setConfiguration",
			)
		}
	}

	/**
	 * Handle getMessages command
	 */
	private handleGetMessages(socket: WebSocket, taskId: string | undefined, requestId: string): void {
		if (!taskId) {
			this.sendErrorToClient(
				socket,
				"INVALID_PARAMETER",
				"Missing 'taskId' for getMessages command",
				requestId,
				"getMessages",
			)
			return
		}

		try {
			// Check if task exists first before getting messages
			if (!this.api.getCurrentTaskStack().includes(taskId)) {
				this.sendErrorToClient(
					socket,
					"TASK_NOT_FOUND",
					`Task with ID '${taskId}' not found`,
					requestId,
					"getMessages",
				)
				return
			}

			const messages = this.api.getMessages(taskId)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "getMessages",
				data: { messages },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to get messages: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"getMessages",
			)
		}
	}

	/**
	 * Handle getTokenUsage command
	 */
	private handleGetTokenUsage(socket: WebSocket, taskId: string | undefined, requestId: string): void {
		if (!taskId) {
			this.sendErrorToClient(
				socket,
				"INVALID_PARAMETER",
				"Missing 'taskId' for getTokenUsage command",
				requestId,
				"getTokenUsage",
			)
			return
		}

		try {
			// Check if task exists
			if (!this.api.getCurrentTaskStack().includes(taskId)) {
				this.sendErrorToClient(
					socket,
					"TASK_NOT_FOUND",
					`Task with ID '${taskId}' not found`,
					requestId,
					"getTokenUsage",
				)
				return
			}

			const usage = this.api.getTokenUsage(taskId)

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "getTokenUsage",
				data: { usage },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to get token usage: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"getTokenUsage",
			)
		}
	}

	/**
	 * Handle isReady command
	 */
	private handleIsReady(socket: WebSocket, requestId: string): void {
		try {
			const ready = this.api.isReady()

			this.sendToClient(socket, {
				type: "response",
				status: "success",
				requestId,
				commandName: "isReady",
				data: { ready },
			})
		} catch (error) {
			this.sendErrorToClient(
				socket,
				"EXECUTION_ERROR",
				`Failed to check if API is ready: ${error instanceof Error ? error.message : String(error)}`,
				requestId,
				"isReady",
			)
		}
	}

	/**
	 * Setup event listeners for a task
	 */
	private setupEventListeners(taskId: string): void {
		// API events to listen for
		const eventNames = [
			"message",
			"taskStarted",
			"taskPaused",
			"taskUnpaused",
			"taskAskResponded",
			"taskAborted",
			"taskSpawned",
			"taskCompleted",
			"taskTokenUsageUpdated",
		] as const

		// Add listeners for all events
		for (const eventName of eventNames) {
			const handler = (...args: any[]) => {
				// Check if this event is for the specific task we're interested in
				if (args[0] === taskId) {
					this.handleApiEvent(eventName, taskId, ...args.slice(1))
				}
			}

			// @ts-ignore: Type safety is hard to enforce here due to the complexity of event types
			this.api.on(eventName, handler)

			// Store disposable to properly remove event listener later
			this.disposables.push({
				dispose: () => {
					// @ts-ignore: Same as above
					this.api.off(eventName, handler)
				},
			})
		}
	}

	/**
	 * Handle API events and broadcast to connected WebSocket clients
	 */
	private handleApiEvent(eventName: string, taskId: string, ...args: any[]): void {
		try {
			let payload: any = {}

			// Format the payload based on the event type
			switch (eventName) {
				case "message":
					const [action, message] = args
					payload = { action, message }
					break

				case "taskStarted":
				case "taskPaused":
				case "taskUnpaused":
				case "taskAskResponded":
				case "taskAborted":
					// These events don't have additional data
					break

				case "taskSpawned":
					const [childTaskId] = args
					payload = { childTaskId }
					break

				case "taskCompleted":
				case "taskTokenUsageUpdated":
					const [usage] = args
					payload = { usage }
					break
			}

			// Broadcast to all clients
			this.broadcastEvent(eventName, taskId, payload)
		} catch (error) {
			this.log(
				`Error handling API event '${eventName}': ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	/**
	 * Broadcast an event to all connected WebSocket clients
	 */
	private broadcastEvent(eventName: string, taskId: string, payload: any): void {
		const eventMessage = {
			type: "event",
			eventName,
			taskId,
			payload,
		}

		// Broadcast to all connected clients
		for (const client of this.clients) {
			if (client.readyState === WebSocket.OPEN) {
				this.sendToClient(client, eventMessage)
			}
		}
	}

	/**
	 * Send a message to a WebSocket client
	 */
	private sendToClient(socket: WebSocket, message: any): void {
		try {
			socket.send(JSON.stringify(message))
		} catch (error) {
			this.log(`Error sending message to client: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Send an error response to a WebSocket client
	 */
	private sendErrorToClient(
		socket: WebSocket,
		code: string,
		message: string,
		requestId?: string,
		commandName?: string,
	): void {
		this.sendToClient(socket, {
			type: "response",
			status: "error",
			requestId: requestId || "unknown",
			commandName: commandName || "unknown",
			error: { code, message },
		})
	}

	/**
	 * Update the status bar item with the current server status
	 */
	private updateStatusBarItem(enabled: boolean, port: number, hasError: boolean = false): void {
		if (!this.statusBarItem) {
			return
		}

		if (enabled && this.isRunning) {
			this.statusBarItem.text = `$(radio-tower) WS:${port}`
			this.statusBarItem.tooltip = `Roo Code WebSocket Server running on port ${port}`
		} else if (enabled && hasError) {
			this.statusBarItem.text = `$(warning) WS:${port}`
			this.statusBarItem.tooltip = `Roo Code WebSocket Server failed to start on port ${port}`
		} else {
			this.statusBarItem.text = `$(circle-slash) WS:Off`
			this.statusBarItem.tooltip = `Roo Code WebSocket Server is disabled`
		}

		this.statusBarItem.show()
	}

	/**
	 * Log a message to the output channel
	 */
	private log(message: string): void {
		this.outputChannel.appendLine(`[WebSocketServer] ${message}`)
	}

	/**
	 * Dispose of the WebSocketServerManager
	 */
	public dispose(): void {
		this.stopServer()

		// Dispose all disposables
		while (this.disposables.length) {
			const disposable = this.disposables.pop()
			disposable?.dispose()
		}

		if (this.statusBarItem) {
			this.statusBarItem.dispose()
		}

		WebSocketServerManager.instance = undefined
	}
}
