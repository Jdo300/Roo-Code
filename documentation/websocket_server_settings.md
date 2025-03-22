## Roo Code WebSocket Server Settings Implementation Guide

This guide explains how to implement settings for the WebSocket server in the Roo Code VSCode extension, focusing specifically on settings persistence, updating, and UI integration.

### Required Settings

Based on `websocket_server_specs.md`, the WebSocket server needs the following settings:

1. **Port Configuration**: `roo-code.websocket.port` (default: 7800)
2. **Server Enable/Disable**: `roo-code.websocket.enabled` (default: disabled/false)

### Step 1: Adding Settings to Package.json

Add the WebSocket settings to the `contributes.configuration` section in `package.json`:

```json
"configuration": {
  "title": "Roo Code",
  "properties": {
    // Existing properties...

    "roo-code.websocket.enabled": {
      "type": "boolean",
      "default": false,
      "description": "Enable or disable the Roo Code WebSocket server"
    },
    "roo-code.websocket.port": {
      "type": "number",
      "default": 7800,
      "minimum": 1024,
      "maximum": 65535,
      "description": "Port for the Roo Code WebSocket server (1024-65535)"
    }
  }
}
```

### Step 2: Accessing Settings from Code

Use the VS Code Configuration API to read settings:

```typescript
// Get settings from VSCode configuration
const config = vscode.workspace.getConfiguration("roo-code.websocket")
const isEnabled = config.get<boolean>("enabled", false)
const port = config.get<number>("port", 7800)
```

### Step 3: Updating Settings Programmatically

If needed, update settings programmatically:

```typescript
await vscode.workspace.getConfiguration("roo-code.websocket").update("enabled", true, vscode.ConfigurationTarget.Global)
await vscode.workspace.getConfiguration("roo-code.websocket").update("port", 8000, vscode.ConfigurationTarget.Global)
```

The `ConfigurationTarget` can be:

- `Global`: For all workspaces
- `Workspace`: For the current workspace only
- `WorkspaceFolder`: For the current workspace folder only

### Step 4: Handling Settings Change Events

Listen for configuration changes to automatically apply them:

```typescript
// In your WebSocketServerManager class constructor or setup method
vscode.workspace.onDidChangeConfiguration(event => {
  const isWebsocketSettingsChange = event.affectsConfiguration("roo-code.websocket");

  if (isWebsocketSettingsChange) {
    this.updateServerFromSettings();
  }
});

private updateServerFromSettings(): void {
  const config = vscode.workspace.getConfiguration("roo-code.websocket");
  const isEnabled = config.get<boolean>("enabled", false);
  const port = config.get<number>("port", 7800);

  if (isEnabled) {
    if (this.server) {
      // Check if port changed
      if (this.currentPort !== port) {
        this.stopServer();
        this.startServer(port);
      }
    } else {
      // Server was off, now turn it on
      this.startServer(port);
    }
  } else if (this.server) {
    // Server was on, now turn it off
    this.stopServer();
  }

  // Update status UI
  this.updateStatusIndicator(isEnabled);
}
```

### Step 5: WebSocket Server Singleton Design

Implement the WebSocket server as a singleton that is managed with your extension's lifecycle:

```typescript
export class WebSocketServerManager {
	private static instance: WebSocketServerManager
	private server: WebSocket.Server | undefined
	private currentPort: number = 7800
	private outputChannel: vscode.OutputChannel

	private constructor(context: vscode.ExtensionContext) {
		this.outputChannel = vscode.window.createOutputChannel("Roo-Code WebSocket")
		context.subscriptions.push(this.outputChannel)

		// Initialize from settings
		this.updateServerFromSettings()

		// Listen for setting changes
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration((event) => {
				if (event.affectsConfiguration("roo-code.websocket")) {
					this.updateServerFromSettings()
				}
			}),
		)

		// Register extension deactivation handler
		context.subscriptions.push({
			dispose: () => this.stopServer(),
		})
	}

	public static getInstance(context: vscode.ExtensionContext): WebSocketServerManager {
		if (!WebSocketServerManager.instance) {
			WebSocketServerManager.instance = new WebSocketServerManager(context)
		}
		return WebSocketServerManager.instance
	}

	// Rest of the implementation...
}
```

### Step 6: Port Validation and Error Handling

Implement validation for port settings:

```typescript
private validatePort(port: number): boolean {
  if (port < 1024 || port > 65535) {
    vscode.window.showErrorMessage(`Invalid WebSocket port: ${port}. Must be between 1024 and 65535.`);
    return false;
  }
  return true;
}

private async startServer(port: number): Promise<void> {
  if (!this.validatePort(port)) {
    return;
  }

  try {
    this.server = new WebSocket.Server({ port, host: '0.0.0.0' });
    this.currentPort = port;
    this.outputChannel.appendLine(`WebSocket server started on port ${port}`);

    // Server event setup...

  } catch (error) {
    if ((error as any).code === 'EADDRINUSE') {
      const newPort = await this.handlePortInUse(port);
      if (newPort) {
        this.startServer(newPort);
      }
    } else {
      this.outputChannel.appendLine(`Error starting WebSocket server: ${error}`);
      vscode.window.showErrorMessage(`Failed to start WebSocket server: ${error}`);
    }
  }
}

private async handlePortInUse(port: number): Promise<number | undefined> {
  const action = await vscode.window.showErrorMessage(
    `Port ${port} is already in use. Would you like to try another port?`,
    'Yes', 'No'
  );

  if (action === 'Yes') {
    const portInput = await vscode.window.showInputBox({
      prompt: 'Enter a new port number (1024-65535)',
      value: String(port + 1),
      validateInput: (input) => {
        const newPort = Number(input);
        if (isNaN(newPort) || newPort < 1024 || newPort > 65535) {
          return 'Please enter a valid port number between 1024 and 65535';
        }
        return null;
      }
    });

    if (portInput) {
      const newPort = Number(portInput);
      // Update the setting
      await vscode.workspace.getConfiguration("roo-code.websocket")
        .update("port", newPort, vscode.ConfigurationTarget.Global);
      return newPort;
    }
  }

  return undefined;
}
```

### Step 7: Settings UI Integration

The WebSocket server settings will appear in the VS Code settings UI automatically after adding them to `package.json`.

However, you can also implement a dedicated settings view in the Roo Code webview:

```typescript
// In your webview message handling code
if (message.type === "action" && message.action === "settingsButtonClicked") {
	// Get current settings
	const config = vscode.workspace.getConfiguration("roo-code.websocket")
	const isEnabled = config.get<boolean>("enabled", false)
	const port = config.get<number>("port", 7800)

	// Send settings to webview
	this.postMessageToWebview({
		type: "settingsUpdate",
		settings: {
			websocket: {
				enabled: isEnabled,
				port: port,
			},
			// Add other settings here
		},
	})
}

// Handle settings changes from webview
if (message.type === "updateSettings" && message.settings) {
	if (message.settings.websocket) {
		const { enabled, port } = message.settings.websocket

		// Validate port
		if (typeof port === "number" && (port < 1024 || port > 65535)) {
			this.postMessageToWebview({
				type: "error",
				message: "Invalid port. Must be between 1024 and 65535.",
			})
			return
		}

		// Update settings
		if (typeof enabled === "boolean") {
			await vscode.workspace
				.getConfiguration("roo-code.websocket")
				.update("enabled", enabled, vscode.ConfigurationTarget.Global)
		}

		if (typeof port === "number") {
			await vscode.workspace
				.getConfiguration("roo-code.websocket")
				.update("port", port, vscode.ConfigurationTarget.Global)
		}

		this.postMessageToWebview({
			type: "settingsUpdated",
			success: true,
		})
	}
}
```

### Step 8: Connection Status Display

Implement a connection status indicator as specified in the requirements:

```typescript
private updateStatusIndicator(isEnabled: boolean): void {
  // Update status bar item
  if (!this.statusBarItem) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    this.statusBarItem.command = "roo-cline.toggleWebSocketServer"; // Command to toggle the server
  }

  if (isEnabled && this.server) {
    this.statusBarItem.text = `$(radio-tower) WS:${this.currentPort}`;
    this.statusBarItem.tooltip = `Roo Code WebSocket Server running on port ${this.currentPort}`;
    this.statusBarItem.show();
  } else if (isEnabled) {
    this.statusBarItem.text = `$(warning) WS:${this.currentPort}`;
    this.statusBarItem.tooltip = `Roo Code WebSocket Server failed to start on port ${this.currentPort}`;
    this.statusBarItem.show();
  } else {
    this.statusBarItem.text = `$(circle-slash) WS:Off`;
    this.statusBarItem.tooltip = `Roo Code WebSocket Server is disabled`;
    this.statusBarItem.show();
  }
}
```

### Testing Settings

For testing the settings implementation:

1. Add suitable configuration properties to `package.json`
2. Check that the settings appear in VS Code's settings UI
3. Test reading the settings with `vscode.workspace.getConfiguration()`
4. Test updating settings with the `.update()` method
5. Verify that configuration change events are triggered and handled
6. Test port validation and error cases

### Common Pitfalls

1. **Settings Scope**: Ensure you're using the correct `ConfigurationTarget` (Global, Workspace, or WorkspaceFolder)
2. **Settings Update Delay**: Settings updates are asynchronous; await the promise before performing actions that depend on the update
3. **Partial Section Paths**: When using `affectsConfiguration()`, use the full section path (e.g., "roo-code.websocket.port")
4. **Test Environment**: In tests, mock `vscode.workspace.getConfiguration` to return test values

By following these steps, you'll be able to implement robust settings management for the WebSocket server that persists between VS Code sessions and provides a good user experience.
