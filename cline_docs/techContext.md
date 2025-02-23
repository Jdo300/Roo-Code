# Technical Context

## Current Development Focus

### WebSocket Server Implementation

- ✅ Basic WebSocket server implementation in `websocket-server.ts`
- ✅ Command handling structure in `command-handler.ts`
- ✅ Settings UI components in `SettingsView.tsx`
- ✅ Testing WebSocket communication and command handling
- 🔄 Settings persistence (postponed)

### Known Technical Issues

1. **Settings Persistence**
    - Issue: WebSocket settings (enabled state and port) not persisting
    - Location: `webview-ui/src/components/settings/SettingsView.tsx`
    - Status: Identified but postponed
    - Note: Does not affect core WebSocket functionality

## WebSocket API Entry Points

### Server Configuration

- **Default Port:** 7800 (configurable via VSCode settings)
- **Settings Path:** `webview-ui/src/components/settings/SettingsView.tsx`
- **State Management:** `webview-ui/src/context/ExtensionStateContext.tsx`

### Commands

#### Chat Message

```json
{
	"message": "your chat message here"
}
```

#### Plugin Commands

```json
{
	"command": "commandName",
	"value": "commandValue"
}
```

#### State Request

```json
{
	"command": "requestState"
}
```

## Technologies Used

### Core Technologies

- TypeScript
- Node.js
- WebSocket (`ws` library)
- VSCode Extension API
- React (for settings UI)

### Development Tools

- ESLint for code quality
- Prettier for code formatting
- TypeScript compiler
- VSCode Extension Development Tools

## Project Structure

```text
src/
  server/
    websocket-server.ts     # WebSocket server implementation
    command-handler.ts      # Command processing logic
    config.ts              # Server configuration
    types.ts              # TypeScript definitions

webview-ui/
  src/
    components/
      settings/
        SettingsView.tsx   # Settings UI implementation
    context/
      ExtensionStateContext.tsx  # State management
```

## Development Setup

### Prerequisites

1. Node.js (version specified in `.nvmrc`)
2. VSCode
3. TypeScript
4. Git

### Build & Run

1. Install dependencies:

    ```bash
    npm install
    cd webview-ui && npm install
    ```

2. Build the extension:

    ```bash
    npm run build
    ```

3. Debug:
    - Press F5 to launch extension in debug mode
    - Use WebSocket client to test server

## Configuration

### Extension Settings

```json
{
	"roo-code.websocket.port": 7800,
	"roo-code.websocket.enabled": true
}
```

## Monitoring & Debugging

### Logging

- VSCode output channel ("Roo-Code WebSocket")
- WebSocket server events
- Command execution tracking

### Error Handling

- Connection errors with automatic retries
- Message parsing errors
- Command execution errors

### Diagnostics

- Connection status tracking
- Client connection events
- Command/response flow monitoring

## Future Technical Enhancements

1. **Settings Persistence**

    - Implement proper state persistence for WebSocket settings
    - Add validation for port number input
    - Add error handling for invalid settings

2. **UI Improvements**

    - Add connection status indicator
    - Improve error feedback
    - Add port validation

3. **Command Handling**
    - Enhance verification for command responses
    - Improve error handling
    - Add command validation

## Notes

- Settings persistence is a known issue but not blocking for core functionality
- Focus remains on WebSocket communication and command handling
- UI improvements will be addressed in future updates
