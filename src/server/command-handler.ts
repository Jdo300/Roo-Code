import * as vscode from 'vscode';
import * as ws from 'ws';
import { WebSocketMessage } from './types';
import { ClineProvider } from '../core/webview/ClineProvider';
import { ExtensionMessage, ExtensionState } from '../shared/ExtensionMessage';

export class CommandHandler {
    private provider: ClineProvider;

    constructor(provider: ClineProvider) {
        this.provider = provider;
    }

    public processCommand(message: WebSocketMessage, client: ws.WebSocket): void {
        const command = message.command;
        const value = message.value;
        const text = message.message;

        console.log(`Processing command: ${command}, message: ${text}, value: ${value}`);

        if (text) {
            // Handle chat message
            this.handleChatMessage(text, client);
        } else if (command) {
            // Handle command
            this.handlePluginCommand(command, value, client);
        } else {
            this.handleUnknownCommand('unknown', client);
        }
    }

    private async handleChatMessage(text: string, client: ws.WebSocket): Promise<void> {
        try {
            const message: ExtensionMessage = {
                type: "invoke",
                invoke: "sendMessage",
                text: text
            };
            await this.provider.postMessageToWebview(message);
            this.sendCommandResponse(client, 'chat_message_response', 'Chat message sent to Cline');
        } catch (error) {
            console.error('Error handling chat message:', error);
            this.sendCommandResponse(client, 'error', `Error handling chat message: ${error.message}`);
        }
    }

    private async handlePluginCommand(command: string, value: any, client: ws.WebSocket): Promise<void> {
        try {
            // Special handling for settings commands that need verification
            const isSettingCommand = command.startsWith('set_auto_approve_') || command.startsWith('alwaysAllow');
            const requiresVerification = isSettingCommand;

            // Forward command to plugin
            const extensionMessage: ExtensionMessage = {
                type: "invoke",
                invoke: command as any,
                text: typeof value === 'string' ? value : JSON.stringify(value)  // Use text property instead of value
            };
            await this.provider.postMessageToWebview(extensionMessage);

            if (requiresVerification) {
                // For settings commands, verify the update worked
                const state = await this.provider.getStateToPostToWebview();
                const actualValue = this.getSettingValue(state, command);
                const success = actualValue === value;

                this.sendCommandResponse(client, `${command}_response`, 'Command executed and verified', {
                    success,
                    actualValue,
                    expectedValue: value
                });
            } else {
                // For non-setting commands, just send success response
                this.sendCommandResponse(client, `${command}_response`, 'Command forwarded to plugin');
            }
        } catch (error) {
            console.error('Error processing command:', error);
            this.sendCommandResponse(client, 'error', `Error processing command: ${error.message}`);
        }
    }

    private getSettingValue(state: ExtensionState, command: string): boolean | undefined {
        // Map commands to their corresponding state properties
        const settingMap: { [key: string]: keyof ExtensionState } = {
            'set_auto_approve_files': 'alwaysAllowReadOnly',
            'set_auto_approve_terminal': 'alwaysAllowExecute',
            'set_auto_approve_browser': 'alwaysAllowBrowser',
            'alwaysAllowFiles': 'alwaysAllowReadOnly',
            'alwaysAllowTerminal': 'alwaysAllowExecute',
            'alwaysAllowBrowser': 'alwaysAllowBrowser'
        };

        const stateKey = settingMap[command];
        return stateKey ? state[stateKey] as boolean : undefined;
    }

    private async handleRequestStateCommand(client: ws.WebSocket): Promise<void> {
        try {
            const state = await this.provider.getStateToPostToWebview();
            this.sendCommandResponse(client, 'state_response', JSON.stringify(state));
        } catch (error) {
            console.error('Error handling requestState command:', error);
            this.sendCommandResponse(client, 'error', `Error handling requestState command: ${error.message}`);
        }
    }

    private handleUnknownCommand(command: string, client: ws.WebSocket): void {
        console.warn(`Unknown command received: ${command}`);
        this.sendCommandResponse(client, 'unknown_command_response', `Unknown command: ${command}`);
    }

    private sendCommandResponse(client: ws.WebSocket, responseType: string, message: string, verification?: { success: boolean; actualValue?: any, expectedValue?: any }): void {
        const response = {
            type: responseType,
            message: message,
            verification: verification,
        };
        client.send(JSON.stringify(response));
    }
}
