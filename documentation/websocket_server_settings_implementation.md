## Roo Code IPC Server Settings Implementation Guide

This guide explains how to implement settings for the node-ipc based server in the Roo Code VSCode extension following the project's established patterns for settings implementation.

### Requirements Overview

Based on the IPC server specifications, we need settings for:

1. **Connection Mode**: Unix domain sockets or TCP
2. **TCP Settings**:
    - Port Configuration
    - Host Configuration
3. **Unix Socket Settings**:
    - Socket Path Configuration
4. **Connection Status Indicator**
5. **Enhanced Error Feedback**

### Implementation Steps (Based on Roo Code Patterns)

#### 1. Add Settings to ExtensionMessage.ts

Add the IPC settings to the `ExtensionState` interface in `src/shared/ExtensionMessage.ts`:

```typescript
export interface ExtensionState {
	// Existing properties...

	ipcConnectionMode: "unix" | "tcp"
	ipcTcpPort: number
	ipcTcpHost: string
	ipcUnixSocketPath: string | null
}
```

#### 2. Add Message Types to WebviewMessage.ts

Add message types for the IPC settings to `src/shared/WebviewMessage.ts`:

```typescript
export interface WebviewMessage {
	type: "ipcConnectionMode" | "ipcTcpPort" | "ipcTcpHost" | "ipcUnixSocketPath"
	// Existing types...

	// Existing properties...
	value?: number | string // For port/host/path
	mode?: "unix" | "tcp" // For connection mode
}
```

#### 3. Update ClineProvider.ts

Make changes to `src/core/webview/ClineProvider.ts`:

a. Add the setting names to the `GlobalStateKey` type union:

```typescript
type GlobalStateKey = "ipcConnectionMode" | "ipcTcpPort" | "ipcTcpHost" | "ipcUnixSocketPath"
// Other existing keys...
```

b. Add the settings to the `Promise.all` array in the `getState` method:

```typescript
async getState(): Promise<ExtensionState> {
  const [
    // Existing entries...
    ipcConnectionMode,
    ipcTcpPort,
    ipcTcpHost,
    ipcUnixSocketPath,
  ] = await Promise.all([
    // Existing promises...
    this.globalState.get<"unix" | "tcp">("ipcConnectionMode", "unix"),
    this.globalState.get<number>("ipcTcpPort", 7800),
    this.globalState.get<string>("ipcTcpHost", "127.0.0.1"),
    this.globalState.get<string | null>("ipcUnixSocketPath", null),
  ])

  return {
    // Existing properties...
    ipcConnectionMode,
    ipcTcpPort,
    ipcTcpHost,
    ipcUnixSocketPath,
  }
}
```

c. Add cases in `setWebviewMessageListener` to handle the setting's message types:

```typescript
case "ipcConnectionMode":
  await this.updateGlobalState("ipcConnectionMode", message.mode)
  await this.postStateToWebview()
  this.restartIpcServer()
  break

case "ipcTcpPort":
  const port = message.value as number
  if (port < 1024 || port > 65535) {
    this.view?.webview.postMessage({
      type: "action",
      action: "error",
      text: "TCP port must be between 1024 and 65535"
    })
    return
  }
  await this.updateGlobalState("ipcTcpPort", port)
  await this.postStateToWebview()
  if (await this.globalState.get<"unix" | "tcp">("ipcConnectionMode") === "tcp") {
    this.restartIpcServer()
  }
  break

// Add similar cases for ipcTcpHost and ipcUnixSocketPath
```

#### 4. Add UI Components to SettingsView.tsx

Add UI components for the IPC settings in `webview-ui/src/components/SettingsView.tsx`:

```typescript
// Connection mode radio buttons
<div>
  <label>IPC Connection Mode</label>
  <div style={{ display: "flex", gap: "1rem" }}>
    <VSCodeRadio
      checked={ipcConnectionMode === "unix"}
      onChange={() => setIpcConnectionMode("unix")}
    >
      Unix Domain Socket
    </VSCodeRadio>
    <VSCodeRadio
      checked={ipcConnectionMode === "tcp"}
      onChange={() => setIpcConnectionMode("tcp")}
    >
      TCP
    </VSCodeRadio>
  </div>
</div>

{/* TCP Settings */}
{ipcConnectionMode === "tcp" && (
  <>
    <div>
      <label>TCP Port (1024-65535)</label>
      <input
        type="number"
        value={ipcTcpPort}
        min={1024}
        max={65535}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10)
          if (!isNaN(value) && value >= 1024 && value <= 65535) {
            setIpcTcpPort(value)
          }
        }}
      />
    </div>
    <div>
      <label>TCP Host</label>
      <input
        type="text"
        value={ipcTcpHost}
        onChange={(e) => setIpcTcpHost(e.target.value)}
      />
    </div>
  </>
)}

{/* Unix Socket Path */}
{ipcConnectionMode === "unix" && (
  <div>
    <label>Unix Socket Path (optional)</label>
    <input
      type="text"
      value={ipcUnixSocketPath || ""}
      onChange={(e) => setIpcUnixSocketPath(e.target.value)}
      placeholder="System temp directory"
    />
  </div>
)}
```

#### 5. Create IPC Server Manager Class

Create an IPC server manager class in `evals/packages/ipc/src/server.ts` that follows the singleton pattern:

```typescript
export class IpcServerManager {
	private static instance: IpcServerManager
	private ipc: any // node-ipc instance
	private outputChannel: vscode.OutputChannel
	private statusBarItem: vscode.StatusBarItem | undefined

	// Implementation details in the IPC package...
}
```

#### 6. Connection Status Display

Implement a connection status indicator:

```typescript
private updateStatusIndicator(): void {
  if (!this.statusBarItem) {
    return
  }

  const config = vscode.workspace.getConfiguration("roo-code.ipc")
  const mode = config.get<"unix" | "tcp">("connectionMode", "unix")

  if (this.ipc.server) {
    if (mode === "tcp") {
      const port = config.get<number>("tcp.port", 7800)
      const host = config.get<string>("tcp.host", "127.0.0.1")
      this.statusBarItem.text = `$(radio-tower) IPC:${host}:${port}`
      this.statusBarItem.tooltip = `Roo Code IPC Server (TCP) running on ${host}:${port}`
    } else {
      const socketPath = config.get<string>("unix.socketPath") || "default"
      this.statusBarItem.text = `$(plug) IPC:Unix`
      this.statusBarItem.tooltip = `Roo Code IPC Server (Unix) running at ${socketPath}`
    }
  } else {
    this.statusBarItem.text = `$(circle-slash) IPC:Off`
    this.statusBarItem.tooltip = `Roo Code IPC Server is not running`
  }

  this.statusBarItem.show()
}
```

### Integration with Extension.ts

Initialize the IPC server manager in `src/extension.ts`:

```typescript
// In the activate function
const outputChannel = vscode.window.createOutputChannel("Roo-Code IPC")
context.subscriptions.push(outputChannel)

// Initialize IpcServerManager after the ClineProvider is created
const ipcManager = IpcServerManager.getInstance(context, outputChannel)
```

### Testing

Add test coverage for:

1. Settings persistence and validation
2. Connection mode switching
3. TCP and Unix socket configuration
4. Error handling and recovery
5. Status indicator updates

### Common Pitfalls

1. **Platform Differences**: Handle Unix socket paths appropriately on different platforms
2. **Socket File Cleanup**: Ensure proper cleanup of socket files on server shutdown
3. **Permission Issues**: Handle file permission errors for Unix domain sockets
4. **Connection Mode Switching**: Properly handle switching between TCP and Unix socket modes
5. **Settings Updates**: Handle asynchronous settings updates correctly

This implementation ensures that the IPC server follows the same patterns as other features in the Roo Code extension while providing the necessary flexibility for both Unix domain socket and TCP connections.
