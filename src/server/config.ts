import * as vscode from "vscode"
import type { ConfigurationChangeEvent } from "vscode"
import { WebSocketServerConfig } from "./types"

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: WebSocketServerConfig = {
	port: 7800,
	enabled: true, // Default enabled
}

/**
 * Configuration keys for VS Code settings
 */
export const CONFIG_KEYS = {
	PORT: "roo-code.websocket.port",
	ENABLED: "roo-code.websocket.enabled",
} as const

/**
 * Get the current WebSocket server configuration from VS Code settings
 */
export function getServerConfig(): WebSocketServerConfig {
	const config = vscode.workspace.getConfiguration()

	return {
		port: config.get<number>(CONFIG_KEYS.PORT) ?? DEFAULT_CONFIG.port,
		enabled: config.get<boolean>(CONFIG_KEYS.ENABLED) ?? DEFAULT_CONFIG.enabled,
	}
}

/**
 * Update the WebSocket server configuration in VS Code settings
 */
export async function updateServerConfig(updates: Partial<WebSocketServerConfig>): Promise<void> {
	const config = vscode.workspace.getConfiguration()

	if (updates.port !== undefined) {
		await config.update(CONFIG_KEYS.PORT, updates.port, true)
	}

	if (updates.enabled !== undefined) {
		await config.update(CONFIG_KEYS.ENABLED, updates.enabled, true)
	}
}

/**
 * Register configuration change handlers
 * @param onChange Callback to handle configuration changes
 */
export function registerConfigurationWatcher(onChange: (newConfig: WebSocketServerConfig) => void): vscode.Disposable {
	return vscode.workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
		const isRelevantChange = Object.values(CONFIG_KEYS).some((key) => event.affectsConfiguration(key))

		if (isRelevantChange) {
			onChange(getServerConfig())
		}
	})
}

/**
 * Validate server configuration
 * @returns Array of validation error messages, empty if valid
 */
export function validateConfig(config: WebSocketServerConfig): string[] {
	const errors: string[] = []

	if (config.port < 1024 || config.port > 65535) {
		errors.push("Port must be between 1024 and 65535")
	}

	return errors
}
