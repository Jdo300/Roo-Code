import * as ws from "ws"
import * as vscode from "vscode"
import { getServerConfig } from "./config"
import { WebSocketMessage } from "./types"
import { CommandHandler } from "./command-handler"
import { ClineProvider } from "../core/webview/ClineProvider"

export class WebSocketServer {
	private wss?: ws.WebSocketServer
	private commandHandler?: CommandHandler
	private readonly mainOutputChannel: vscode.OutputChannel
	private readonly wsOutputChannel: vscode.OutputChannel
	private provider?: ClineProvider
	private clients: Set<ws.WebSocket> = new Set()

	constructor(
		port: number,
		provider: ClineProvider | undefined,
		outputChannel: vscode.OutputChannel,
		websocketOutputChannel: vscode.OutputChannel,
	) {
		this.mainOutputChannel = outputChannel
		this.wsOutputChannel = websocketOutputChannel
		this.provider = provider
		if (provider) {
			this.commandHandler = new CommandHandler(provider, this.mainOutputChannel)
		}
	}

	public setProvider(provider: ClineProvider): void {
		this.provider = provider
		this.commandHandler = new CommandHandler(provider, this.mainOutputChannel)
	}

	public async start(): Promise<void> {
		this.wsOutputChannel.appendLine("[WebSocket] Attempting to start server...")

		if (this.wss) {
			this.wsOutputChannel.appendLine("[WebSocket] Server is already running")
			return
		}

		const config = getServerConfig()
		this.wsOutputChannel.appendLine(`[WebSocket] Config: ${JSON.stringify(config)}`)

		if (!config.enabled) {
			this.wsOutputChannel.appendLine("[WebSocket] Server is disabled in settings")
			return
		}

		try {
			this.wss = new ws.WebSocketServer({ port: config.port })
			this.wsOutputChannel.appendLine(`[WebSocket] Created server on port ${config.port}`)

			this.wss.on("connection", (ws) => {
				this.handleNewClient(ws)
			})

			this.wss.on("listening", () => {
				this.wsOutputChannel.appendLine(`[WebSocket] Server listening on port ${config.port}`)
				vscode.window.showInformationMessage(`WebSocket server started on port ${config.port}`)
			})

			this.wss.on("error", (error) => {
				this.wsOutputChannel.appendLine(`[WebSocket] Error: ${error.message}`)
				vscode.window.showErrorMessage(`WebSocket server error: ${error.message}`)
			})

			this.wsOutputChannel.show()
		} catch (error) {
			this.wsOutputChannel.appendLine(
				`[WebSocket] Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
			)
			vscode.window.showErrorMessage(
				`Failed to start WebSocket server: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	private handleNewClient(ws: ws.WebSocket): void {
		this.clients.add(ws)
		this.wsOutputChannel.appendLine(`[WebSocket] Client connected (${this.clients.size} total)`)
		vscode.window.showInformationMessage("WebSocket client connected")

		ws.on("message", async (message) => {
			await this.handleMessage(message, ws)
		})

		ws.on("close", () => {
			this.clients.delete(ws)
			this.wsOutputChannel.appendLine(`[WebSocket] Client disconnected (${this.clients.size} remaining)`)
		})

		ws.on("error", (error) => {
			this.wsOutputChannel.appendLine(`[WebSocket] Client error: ${error.message}`)
			this.clients.delete(ws)
		})
	}

	public stop(): void {
		this.wsOutputChannel.appendLine("[WebSocket] Attempting to stop server...")

		if (!this.wss) {
			this.wsOutputChannel.appendLine("[WebSocket] Server is not running")
			return
		}

		// Close all client connections first
		this.clients.forEach((client) => {
			try {
				client.close()
			} catch (error) {
				this.wsOutputChannel.appendLine(`[WebSocket] Error closing client: ${error}`)
			}
		})
		this.clients.clear()

		// Then close the server
		this.wss.close(() => {
			this.wsOutputChannel.appendLine("[WebSocket] Server stopped")
			vscode.window.showInformationMessage("WebSocket server stopped")
		})
		this.wss = undefined
	}

	public broadcastMessage(message: WebSocketMessage): void {
		this.wsOutputChannel.appendLine("[WebSocket] Broadcasting message:")
		this.wsOutputChannel.appendLine(JSON.stringify(message, null, 2))

		if (!this.wss || this.clients.size === 0) {
			this.wsOutputChannel.appendLine("[WebSocket] No clients connected")
			return
		}

		const messageJSON = JSON.stringify(message)
		let sentCount = 0

		this.clients.forEach((client) => {
			try {
				if (client.readyState === ws.WebSocket.OPEN) {
					client.send(messageJSON)
					sentCount++
				}
			} catch (error) {
				this.wsOutputChannel.appendLine(`[WebSocket] Error sending to client: ${error}`)
				this.clients.delete(client)
			}
		})

		this.wsOutputChannel.appendLine(`[WebSocket] Message sent to ${sentCount} clients`)
	}

	private async handleMessage(message: ws.RawData, client: ws.WebSocket): Promise<void> {
		try {
			const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage
			this.wsOutputChannel.appendLine(`[WebSocket] Received: ${JSON.stringify(parsedMessage)}`)
			this.wsOutputChannel.show()
			await this.processMessage(parsedMessage, client)
		} catch (error) {
			this.wsOutputChannel.appendLine(
				`[WebSocket] Message parsing error: ${error instanceof Error ? error.message : String(error)}`,
			)
			try {
				client.send(JSON.stringify({ response: "error", error: "Invalid message format" }))
			} catch (sendError) {
				this.wsOutputChannel.appendLine(`[WebSocket] Error sending error response: ${sendError}`)
			}
		}
	}

	private async processMessage(message: WebSocketMessage, client: ws.WebSocket): Promise<void> {
		try {
			if (!this.commandHandler || !this.provider) {
				throw new Error("WebSocket server not properly initialized")
			}
			await this.commandHandler.processCommand(message, client)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.wsOutputChannel.appendLine(`[WebSocket] Processing error: ${errorMessage}`)
			try {
				client.send(JSON.stringify({ response: "error", error: errorMessage }))
			} catch (sendError) {
				this.wsOutputChannel.appendLine(`[WebSocket] Error sending error response: ${sendError}`)
			}
		}
	}

	public updateConfig(): void {
		const newConfig = getServerConfig()
		this.wsOutputChannel.appendLine(`[WebSocket] Updating config: ${JSON.stringify(newConfig)}`)
		if (this.wss) {
			this.restart()
		}
	}

	private async restart(): Promise<void> {
		this.wsOutputChannel.appendLine("[WebSocket] Restarting server...")
		if (this.wss) {
			this.stop()
			await this.start()
		} else {
			await this.start()
		}
	}
}
