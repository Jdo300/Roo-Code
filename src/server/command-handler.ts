import * as ws from "ws"
import { ClineProvider } from "../core/webview/ClineProvider"
import { ExtensionMessage } from "../shared/ExtensionMessage"
import { WebSocketMessage } from "./types"

export class CommandHandler {
	private provider: ClineProvider

	constructor(provider: ClineProvider) {
		this.provider = provider
	}

	public processCommand(message: WebSocketMessage, client: ws.WebSocket): void {
		const { command, value, message: text } = message

		console.log(`Processing command: ${command}, message: ${text}, value: ${value}`)

		if (text) {
			this.handleChatMessage(text, client)
		} else if (command) {
			this.handlePluginCommand(command, value, client)
		} else {
			this.handleUnknownCommand("unknown", client)
		}
	}

	private async handleChatMessage(text: string, client: ws.WebSocket): Promise<void> {
		try {
			const extensionMessage: ExtensionMessage = {
				type: "invoke",
				invoke: "sendMessage",
				text: text,
			}
			await this.provider.postMessageToWebview(extensionMessage)
			this.sendCommandResponse(client, "chat_message_response", "Chat message sent to Cline", {})
		} catch (error) {
			console.error("Error handling chat message:", error)
			this.sendCommandResponse(client, "error", `Error handling chat message: ${error.message}`, {})
		}
	}

	private async handlePluginCommand(command: string, value: any, client: ws.WebSocket): Promise<void> {
		try {
			const extensionMessage: ExtensionMessage = {
				type: "invoke",
				invoke: command as any,
				text: typeof value === "string" ? value : JSON.stringify(value),
			}
			await this.provider.postMessageToWebview(extensionMessage)
			this.sendCommandResponse(client, `${command}_response`, "Command forwarded to plugin", {})
		} catch (error) {
			console.error("Error processing command:", error)
			this.sendCommandResponse(client, "error", `Error processing command: ${error.message}`, {})
		}
	}

	private handleUnknownCommand(command: string, client: ws.WebSocket): void {
		console.warn(`Unknown command received: ${command}`)
		this.sendCommandResponse(client, "unknown_command_response", `Unknown command: ${command}`, {})
	}

	private sendCommandResponse(client: ws.WebSocket, responseType: string, message: string, verification: {}): void {
		const response = {
			type: responseType,
			message: message,
			verification: verification,
		}
		client.send(JSON.stringify(response))
	}
}
