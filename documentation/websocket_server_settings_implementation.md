## Roo Code WebSocket Server Settings Implementation Guide

This guide explains how to implement settings for the WebSocket server in the Roo Code VSCode extension following the project's established patterns for settings implementation.

### Requirements Overview

Based on `websocket_server_specs.md`, the WebSocket server requires the following settings:

1. **Port Configuration**: Default: 7800
2. **Server Enable/Disable**: Default: disabled (false)
3. **Connection Status Indicator**
4. **Enhanced Error Feedback**
5. **Port Validation**

### Implementation Steps (Based on Roo Code Patterns)

#### 1. Add Settings to ExtensionMessage.ts

Add the websocket settings to the `ExtensionState` interface in `src/shared/ExtensionMessage.ts`:

```typescript
export interface ExtensionState {
	// Existing properties...

	websocketServerEnabled: boolean // Whether the WebSocket server is enabled
	websocketServerPort: number // Port for the WebSocket server
}
```

#### 2. Add Message Types to WebviewMessage.ts

Add message types for the websocket settings to `src/shared/WebviewMessage.ts`:

```typescript
export interface WebviewMessage {
	type:
		| "websocketServerEnabled" // Add this
		| "websocketServerPort" // Add this
	// Existing types...

	// Existing properties...
	value?: number // For port number
	bool?: boolean // For enabled/disabled
}
```

#### 3. Update ClineProvider.ts

Make changes to `src/core/webview/ClineProvider.ts`:

a. Add the setting names to the `GlobalStateKey` type union:

```typescript
type GlobalStateKey = "websocketServerEnabled" | "websocketServerPort"
// Other existing keys...
```

b. Add the settings to the `Promise.all` array in the `getState` method:

```typescript
async getState(): Promise<ExtensionState> {
  const [
    // Existing entries...
    websocketServerEnabled,
    websocketServerPort,
  ] = await Promise.all([
    // Existing promises...
    this.globalState.get<boolean>("websocketServerEnabled", false),  // Default: disabled
    this.globalState.get<number>("websocketServerPort", 7800),       // Default: 7800
  ])

  return {
    // Existing properties...
    websocketServerEnabled,
    websocketServerPort,
  }
}
```

c. Add the settings to the destructured variables in `getStateToPostToWebview`:

```typescript
async getStateToPostToWebview(): Promise<Partial<ExtensionState>> {
  const {
    // Existing properties...
    websocketServerEnabled,
    websocketServerPort,
  } = await this.getState()

  return {
    // Existing properties...
    websocketServerEnabled,
    websocketServerPort,
  }
}
```

d. Add cases in `setWebviewMessageListener` to handle the setting's message types:

```typescript
case "websocketServerEnabled":
  await this.updateGlobalState("websocketServerEnabled", message.bool)
  await this.postStateToWebview()

  // Update WebSocket server state based on new setting
  if (message.bool) {
    this.startWebSocketServer()
  } else {
    this.stopWebSocketServer()
  }
  break

case "websocketServerPort":
  // Validate port number
  const port = message.value as number
  if (port < 1024 || port > 65535) {
    this.view?.webview.postMessage({
      type: "action",
      action: "error",
      text: "WebSocket port must be between 1024 and 65535"
    })
    return
  }

  await this.updateGlobalState("websocketServerPort", port)
  await this.postStateToWebview()

  // Restart server if it's running
  if (await this.globalState.get<boolean>("websocketServerEnabled", false)) {
    this.restartWebSocketServer()
  }
  break
```

#### 4. Add UI Components to SettingsView.tsx

Add UI components for the WebSocket settings in `webview-ui/src/components/SettingsView.tsx`:

a. Update the `ExtensionStateContextType` interface:

```typescript
interface ExtensionStateContextType {
	// Existing properties...
	websocketServerEnabled: boolean
	setWebsocketServerEnabled: (value: boolean) => void
	websocketServerPort: number
	setWebsocketServerPort: (value: number) => void
}
```

b. Add the settings to the initial state in `useState`:

```typescript
const [websocketServerEnabled, setWebsocketServerEnabled] = useState<boolean>(
	extensionState?.websocketServerEnabled ?? false,
)

const [websocketServerPort, setWebsocketServerPort] = useState<number>(extensionState?.websocketServerPort ?? 7800)
```

c. Add the settings to the `contextValue` object:

```typescript
const contextValue: ExtensionStateContextType = {
	// Existing properties...
	websocketServerEnabled,
	setWebsocketServerEnabled,
	websocketServerPort,
	setWebsocketServerPort,
}
```

d. Add UI components for the settings:

```typescript
// For the enabled/disabled setting
<VSCodeCheckbox
  checked={websocketServerEnabled}
  onChange={(e: any) => setWebsocketServerEnabled(e.target.checked)}
>
  <span style={{ fontWeight: "500" }}>Enable WebSocket Server</span>
</VSCodeCheckbox>

// For the port setting
<div>
  <label htmlFor="websocketServerPort">WebSocket Server Port (1024-65535)</label>
  <input
    id="websocketServerPort"
    type="number"
    value={websocketServerPort}
    min={1024}
    max={65535}
    onChange={(e) => {
      const value = parseInt(e.target.value, 10)
      if (!isNaN(value) && value >= 1024 && value <= 65535) {
        setWebsocketServerPort(value)
      }
    }}
    style={{
      width: "100%",
      padding: "4px 8px",
      backgroundColor: "var(--vscode-input-background)",
      color: "var(--vscode-input-foreground)",
      border: "1px solid var(--vscode-input-border)",
      borderRadius: "2px"
    }}
  />
</div>
```

e. Add the settings to `handleSubmit`:

```typescript
const handleSubmit = () => {
	// Existing message posts...

	vscode.postMessage({ type: "websocketServerEnabled", bool: websocketServerEnabled })
	vscode.postMessage({ type: "websocketServerPort", value: websocketServerPort })
}
```

#### 5. Add Test Coverage

Update `src/core/webview/__tests__/ClineProvider.test.ts` to include tests for the new settings:

a. Add the settings to `mockState`:

```typescript
const mockState: ExtensionState = {
	// Existing properties...
	websocketServerEnabled: false,
	websocketServerPort: 7800,
}
```

b. Add test cases for the settings:

```typescript
describe("websocket server settings", () => {
	it("should handle websocketServerEnabled updates", async () => {
		// Setup
		const provider = await setupProvider()

		// Test
		await provider.handleWebviewMessage({ type: "websocketServerEnabled", bool: true })

		// Verify
		expect(mockContext.globalState.update).toHaveBeenCalledWith("websocketServerEnabled", true)
		expect(mockWebview.postMessage).toHaveBeenCalled()
	})

	it("should handle websocketServerPort updates with valid port", async () => {
		// Setup
		const provider = await setupProvider()

		// Test
		await provider.handleWebviewMessage({ type: "websocketServerPort", value: 8080 })

		// Verify
		expect(mockContext.globalState.update).toHaveBeenCalledWith("websocketServerPort", 8080)
		expect(mockWebview.postMessage).toHaveBeenCalled()
	})

	it("should reject invalid websocketServerPort values", async () => {
		// Setup
		const provider = await setupProvider()

		// Test
		await provider.handleWebviewMessage({ type: "websocketServerPort", value: 80 }) // Invalid port (< 1024)

		// Verify
		expect(mockContext.globalState.update).not.toHaveBeenCalled()
		expect(mockWebview.postMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "action",
				action: "error",
			}),
		)
	})
})
```

#### 6. Create WebSocket Server Manager Class

Create a WebSocket server manager class in `src/server/WebSocketServerManager.ts` that follows the singleton pattern and interacts with the extension's settings:

```typescript
import * as WebSocket from "ws"
import * as vscode from "vscode"
import { API } from "../exports/api"
import { ClineProvider } from "../core/webview/ClineProvider"

export class WebSocketServerManager {
	private static instance: WebSocketServerManager
	private server: WebSocket.Server | undefined
	private currentPort: number = 7800
	private outputChannel: vscode.OutputChannel
	private statusBarItem: vscode.StatusBarItem | undefined
	private api: API
	private provider: ClineProvider

	private constructor(
		context: vscode.ExtensionContext,
		outputChannel: vscode.OutputChannel,
		api: API,
		provider: ClineProvider,
	) {
		this.outputChannel = outputChannel
		this.api = api
		this.provider = provider

		// Create status bar item
		this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
		this.statusBarItem.command = "roo-cline.toggleWebSocketServer"
		context.subscriptions.push(this.statusBarItem)

		// Initialize from settings
		this.initialize()

		// Register commands
		context.subscriptions.push(
			vscode.commands.registerCommand("roo-cline.toggleWebSocketServer", this.toggleServer.bind(this)),
		)

		// Listen for provider state changes
		provider.on("stateUpdated", async () => {
			const state = await provider.getState()
			this.updateFromSettings(state.websocketServerEnabled, state.websocketServerPort)
		})

		// Register extension deactivation handler
		context.subscriptions.push({
			dispose: () => this.stopServer(),
		})
	}

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

	private async initialize(): Promise<void> {
		const state = await this.provider.getState()
		this.updateFromSettings(state.websocketServerEnabled, state.websocketServerPort)
	}

	private async updateFromSettings(enabled: boolean, port: number): Promise<void> {
		if (enabled) {
			if (this.server) {
				// Check if port changed
				if (this.currentPort !== port) {
					this.stopServer()
					this.startServer(port)
				}
			} else {
				// Server was off, now turn it on
				this.startServer(port)
			}
		} else if (this.server) {
			// Server was on, now turn it off
			this.stopServer()
		}

		// Update status UI
		this.updateStatusIndicator(enabled)
	}

	// Rest of implementation...
}
```

#### 7. Connection Status Indicator

Implement the status bar item to show connection status:

```typescript
private updateStatusIndicator(isEnabled: boolean): void {
  if (!this.statusBarItem) {
    return;
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

### Integration with Extension.ts

Finally, initialize the WebSocket server manager in `src/extension.ts`:

```typescript
// In the activate function
const outputChannel = vscode.window.createOutputChannel("Roo-Code WebSocket")
context.subscriptions.push(outputChannel)

// Initialize WebSocketServerManager after the ClineProvider is created
const api = new API(clineOutputChannel, provider)
const webSocketManager = WebSocketServerManager.getInstance(context, outputChannel, api, provider)
```

### Conclusion

By following these steps, the WebSocket server settings will be properly integrated into the Roo Code extension, following the project's established patterns for settings implementation:

1. The settings will persist between VS Code sessions
2. The UI will allow users to enable/disable the server and set the port
3. The settings will be properly validated
4. The server status will be visible in the VS Code status bar
5. The WebSocket server will be properly managed based on the settings

This implementation ensures that the WebSocket server follows the same patterns as other features in the Roo Code extension, making it consistent with the rest of the codebase.
