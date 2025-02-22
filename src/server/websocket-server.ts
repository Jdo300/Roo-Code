import * as ws from "ws"
import * as vscode from "vscode"
import { getServerConfig } from "./config"
import { WebSocketMessage } from "./types"
import { CommandHandler } from "./command-handler"
import { ClineProvider } from "../core/webview/ClineProvider"

export class WebSocketServer {
	private wss: ws.WebSocketServer | null = null
	private config = getServerConfig()
	private provider: ClineProvider | null = null
	private commandHandler: CommandHandler
	private outputChannel: vscode.OutputChannel

	constructor(provider: ClineProvider | null) {
		this.config = getServerConfig()
		this.provider = provider
		this.outputChannel = vscode.window.createOutputChannel("Roo-Code WebSocket")
		this.outputChannel.show() // Show output channel immediately
		this.commandHandler = new CommandHandler(provider as ClineProvider, this.outputChannel) // provider can be null initially but commandHandler needs ClineProvider
	}

	public setProvider(provider: ClineProvider): void {
		this.provider = provider
		this.commandHandler = new CommandHandler(provider, this.outputChannel)
	}

	public async start(): Promise<void> {
		this.outputChannel.appendLine("Attempting to start WebSocket server...")

		if (this.wss) {
			this.outputChannel.appendLine("WebSocket server is already running.")
			vscode.window.showWarningMessage("WebSocket server is already running.")
			return
		}

		const config = getServerConfig()
		this.outputChannel.appendLine(`Current config: ${JSON.stringify(config)}`)

		if (!config.enabled) {
			this.outputChannel.appendLine("WebSocket server is disabled in settings.")
			vscode.window.showInformationMessage("WebSocket server is disabled in settings.")
			return
		}

		try {
			this.wss = new ws.WebSocketServer({ port: config.port }, () => {
				this.outputChannel.appendLine(`WebSocket server initialization callback executed`)
			})
			this.outputChannel.appendLine(`Created WebSocket server instance on port ${config.port}`)

			this.wss.on("connection", (ws) => {
				this.outputChannel.appendLine("Client connected to WebSocket server")
				vscode.window.showInformationMessage("WebSocket client connected")

				ws.on("message", async (message) => {
					await this.handleMessage(message, ws)
				})

				ws.on("close", () => {
					this.outputChannel.appendLine("Client disconnected from WebSocket server")
					vscode.window.showInformationMessage("WebSocket client disconnected")
				})
			})

			this.wss.on("listening", () => {
				this.outputChannel.appendLine(`WebSocket server started and listening on port ${config.port}`)
				vscode.window.showInformationMessage(`WebSocket server started on port ${config.port}`)
			})

			this.wss.on("error", (error) => {
				this.outputChannel.appendLine(`WebSocket server error: ${error.message}`)
				vscode.window.showErrorMessage(`WebSocket server error: ${error.message}`)
			})

			this.outputChannel.show()
		} catch (error) {
			this.outputChannel.appendLine(
				`Failed to start WebSocket server: ${error instanceof Error ? error.message : String(error)}`,
			)
			vscode.window.showErrorMessage(
				`Failed to start WebSocket server: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	public stop(): void {
		this.outputChannel.appendLine("Attempting to stop WebSocket server...")

		if (!this.wss) {
			this.outputChannel.appendLine("WebSocket server is not running.")
			vscode.window.showWarningMessage("WebSocket server is not running.")
			return
		}

		this.wss.close(() => {
			this.outputChannel.appendLine("WebSocket server stopped")
			vscode.window.showInformationMessage("WebSocket server stopped")
		})
		this.wss = null
	}

	private async handleMessage(message: ws.RawData, client: ws.WebSocket): Promise<void> {
		try {
			const parsedMessage: WebSocketMessage = JSON.parse(message.toString())
			this.outputChannel.appendLine(`Received message: ${JSON.stringify(parsedMessage)}`)
			this.outputChannel.show() // Show output channel when receiving messages
			await this.processMessage(parsedMessage, client)
		} catch (error) {
			this.outputChannel.appendLine(
				`WebSocket message parsing error: ${error instanceof Error ? error.message : String(error)}`,
			)
			vscode.window.showErrorMessage(
				`WebSocket message parsing error: ${error instanceof Error ? error.message : String(error)}`,
			)
		}
	}

	private async processMessage(message: WebSocketMessage, client: ws.WebSocket): Promise<void> {
		try {
			if (!this.commandHandler) {
				throw new Error("CommandHandler not initialized")
			}
			await this.commandHandler.processCommand(message, client)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			this.outputChannel.appendLine(`Error processing message: ${errorMessage}`)
			vscode.window.showErrorMessage(`Error processing message: ${errorMessage}`)
		}
	}

	public updateConfig(): void {
		const newConfig = getServerConfig()
		this.outputChannel.appendLine(`Updating config to: ${JSON.stringify(newConfig)}`)
		this.config = newConfig
		if (this.wss) {
			this.restart()
		}
	}

	private async restart(): Promise<void> {
		this.outputChannel.appendLine("Restarting WebSocket server...")
		if (this.wss) {
			this.stop()
			await this.start()
		} else {
			await this.start()
		}
	}
}
