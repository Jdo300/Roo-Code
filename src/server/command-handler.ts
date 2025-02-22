import * as ws from "ws"
import { ClineProvider } from "../core/webview/ClineProvider"
import { ExtensionMessage, ExtensionState } from "../shared/ExtensionMessage"
import { WebSocketMessage, WebSocketCommand } from "./types"

// Types for auto-approve settings
type AutoApproveSettings = "alwaysAllowReadOnly" | "alwaysAllowExecute" | "alwaysAllowBrowser"

import * as vscode from "vscode"

export class CommandHandler {
	private provider: ClineProvider
	private readonly outputChannel: vscode.OutputChannel

	constructor(provider: ClineProvider, outputChannel: vscode.OutputChannel) {
		this.provider = provider
		this.outputChannel = outputChannel
	}

	public async processCommand(message: WebSocketMessage, client: ws.WebSocket): Promise<void> {
		try {
			// Handle all parts of the message without early returns
			if (message.message) {
				await this.handleChatMessage(message.message, client)
			}

			if (message.command) {
				await this.handlePluginCommand(message.command, message.value, client)
			}

			// Only error if no recognized parameters
			if (!message.message && !message.command) {
				this.sendResponse(client, "error")
			}
		} catch (error) {
			this.outputChannel.appendLine(`[processCommand] Error: ${error}`)
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
			this.outputChannel.appendLine(`[handlePluginCommand] Processing command: ${command}`)
			switch (command) {
				case "requestState":
					return this.handleStateCommand(client)
				case "alwaysAllowReadOnly":
				case "alwaysAllowExecute":
				case "alwaysAllowBrowser":
					this.outputChannel.appendLine(
						`[handlePluginCommand] Handling setting command: ${command}, value: ${value}`,
					)
					try {
						return this.handleSettingCommand(command as AutoApproveSettings, value, client)
					} catch (error) {
						this.outputChannel.appendLine(`[handlePluginCommand] Error in handleSettingCommand: ${error}`)
						throw error // Re-throw to be caught by outer try/catch
					}
				case "primaryButtonClick":
				case "secondaryButtonClick":
					return this.handleButtonCommand(command as "primaryButtonClick" | "secondaryButtonClick", client)
				default:
					this.outputChannel.appendLine(`[handlePluginCommand] Unknown command: ${command}`)
					this.sendResponse(client, "error")
			}
		} catch (error) {
			this.sendResponse(client, "error")
		}
	}

	private async handleSettingCommand(
		setting: AutoApproveSettings,
		value: boolean,
		client: ws.WebSocket,
	): Promise<void> {
		try {
			// Get initial state for comparison
			const initialState = await this.provider.getStateToPostToWebview()
			const initialValue = initialState[setting]

			// Update the state directly
			await this.provider.updateGlobalState(setting, value)

			// Get the new state to verify the update
			const newState = await this.provider.getStateToPostToWebview()
			const newValue = newState[setting]

			// Post state update to webview
			await this.provider.postStateToWebview()

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

	private async handleStateCommand(client: ws.WebSocket): Promise<void> {
		try {
			const state = await this.provider.getStateToPostToWebview()
			const settings = {
				alwaysAllowReadOnly: state.alwaysAllowReadOnly,
				alwaysAllowWrite: state.alwaysAllowWrite,
				alwaysAllowExecute: state.alwaysAllowExecute,
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
