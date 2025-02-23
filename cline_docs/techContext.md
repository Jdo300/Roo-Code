# Technical Context

## Current Development Focus

### WebSocket Server Implementation

- ✅ Basic WebSocket server implementation in `websocket-server.ts`
- ✅ Command handling structure in `command-handler.ts`
- ✅ Settings UI components in `SettingsView.tsx`
- ✅ Dedicated output channel for WebSocket logs
- ✅ Client tracking and connection management
- 🔄 Message output format refinement
- 🔄 Settings persistence (postponed)

### Known Technical Issues

1. **Settings Persistence**

    - Issue: WebSocket settings (enabled state and port) not persisting
    - Location: `webview-ui/src/components/settings/SettingsView.tsx`
    - Status: Identified but postponed
    - Note: Does not affect core WebSocket functionality

2. **Message Output**
    - Issue: Message format needs refinement
    - Status: Currently addressing
    - Note: Basic functionality working, improving display and format

## WebSocket API Entry Points

### Server Configuration

- **Default Port:** 7800 (configurable via VSCode settings)
- **Settings Path:** `webview-ui/src/components/settings/SettingsView.tsx`
- **State Management:** `webview-ui/src/context/ExtensionStateContext.tsx`
- **Output Channels:**
    - "Roo-Code WebSocket" - WebSocket server logs
    - "Roo-Code" - Command handling logs

### Message Types

The WebSocket server uses a simplified JSON format for streaming messages to clients:

#### 1. Chat Messages

```json
{
  "type": "message",
  "output": "The text of the chat message",
  "partial": true/false
}
```

#### 2. Reasoning Messages

```json
{
  "type": "reasoning",
  "output": "The text of Cline's reasoning",
  "partial": true/false
}
```

#### 3. Status Updates

```json
{
  "type": "status",
  "statusType": "command_output",
  "text": "Optional status text",
  "partial": true/false
}
```

### Client Commands

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

- Dedicated "Roo-Code WebSocket" output channel for server logs
- Main "Roo-Code" channel for command handling
- WebSocket server events and client tracking
- Command execution tracking
- Connection statistics

### Error Handling

- Connection errors with automatic cleanup
- Message parsing errors with client feedback
- Command execution errors
- Client tracking and cleanup
- Clean server shutdown

### Diagnostics

- Connection status tracking
- Client connection events and statistics
- Command/response flow monitoring
- Separate log channels for better debugging

## Future Technical Enhancements

1. **Message Output Format**

    - Refine message format for better readability
    - Improve client message display
    - Enhance error messages
    - Fine-tune output details

2. **Settings Persistence**

    - Implement proper state persistence
    - Add validation for port number input
    - Add error handling for invalid settings

3. **UI Improvements**
    - Add connection status indicator
    - Improve error feedback
    - Add port validation

## Notes

- Settings persistence is a known issue but not blocking
- Core WebSocket functionality working well
- Logging separation improves debugging
- Client tracking and cleanup working effectively
- Message output format being refined
