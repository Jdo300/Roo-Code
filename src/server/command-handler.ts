import * as ws from "ws"
import { ClineProvider } from "../core/webview/ClineProvider"
import { ExtensionMessage, ExtensionState } from "../shared/ExtensionMessage"
import { WebSocketMessage } from "./types"

export class CommandHandler {
	private provider: ClineProvider

	constructor(provider: ClineProvider) {
		this.provider = provider
	}

	public processCommand(message: WebSocketMessage, client: ws.WebSocket): void {
		try {
			// Handle all parts of the message without early returns
			if (message.message) {
				this.handleChatMessage(message.message, client)
			}

			if (message.command) {
				this.handlePluginCommand(message.command, message.value, client)
			}

			// Only error if no recognized parameters
			if (!message.message && !message.command) {
				this.sendResponse(client, "error")
			}
		} catch (error) {
			this.sendResponse(client, "error")
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
			this.sendResponse(client, "success")
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private async handlePluginCommand(command: string, value: any, client: ws.WebSocket): Promise<void> {
		try {
			switch (command) {
				case "requestState":
					return this.handleStateCommand(client)
				case "alwaysAllowFiles":
				case "alwaysAllowTerminal":
				case "alwaysAllowBrowser":
					await this.handleSettingCommand(command, value, client)
					break
				case "primaryButtonClick":
				case "secondaryButtonClick":
					await this.handleButtonCommand(command as "primaryButtonClick" | "secondaryButtonClick", client)
					break
				default:
					this.sendResponse(client, "error")
			}
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private async handleSettingCommand(command: string, value: boolean, client: ws.WebSocket): Promise<void> {
		try {
			// Get initial state for comparison
			const initialState = await this.provider.getStateToPostToWebview()
			const initialValue = this.getSettingValue(initialState, command)

			// Send command via chat since that's how settings are changed
			const extensionMessage: ExtensionMessage = {
				type: "invoke",
				invoke: "sendMessage",
				text: `/${command} ${value}`,
			}
			await this.provider.postMessageToWebview(extensionMessage)

			// Wait briefly for state to update
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify the setting was updated
			const newState = await this.provider.getStateToPostToWebview()
			const newValue = this.getSettingValue(newState, command)

			// Setting should now match requested value and be different from initial value if a change was requested
			const success = value === newValue && (value === initialValue || initialValue !== newValue)
			this.sendResponse(client, success ? "success" : "error")
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private async handleButtonCommand(
		command: "primaryButtonClick" | "secondaryButtonClick",
		client: ws.WebSocket,
	): Promise<void> {
		try {
			// Button clicks are always passed through to the extension
			const extensionMessage: ExtensionMessage = {
				type: "invoke",
				invoke: command,
			}
			await this.provider.postMessageToWebview(extensionMessage)
			this.sendResponse(client, "success")
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private getSettingValue(state: ExtensionState, command: string): boolean | undefined {
		const settingMap: { [key: string]: keyof ExtensionState } = {
			alwaysAllowFiles: "alwaysAllowReadOnly",
			alwaysAllowTerminal: "alwaysAllowExecute",
			alwaysAllowBrowser: "alwaysAllowBrowser",
		}
		const stateKey = settingMap[command]
		return stateKey ? (state[stateKey] as boolean) : undefined
	}

	private async handleStateCommand(client: ws.WebSocket): Promise<void> {
		try {
			const state = await this.provider.getStateToPostToWebview()
			const settings = {
				alwaysAllowFiles: state.alwaysAllowReadOnly,
				alwaysAllowWrite: state.alwaysAllowWrite,
				alwaysAllowTerminal: state.alwaysAllowExecute,
				alwaysAllowBrowser: state.alwaysAllowBrowser,
				alwaysAllowMcp: state.alwaysAllowMcp,
				mode: state.mode,
			}
			this.sendResponse(client, "success", settings)
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private sendResponse(client: ws.WebSocket, status: "success" | "error", data?: any): void {
		const response = data ? { response: status, data } : { response: status }
		client.send(JSON.stringify(response))
	}
}
