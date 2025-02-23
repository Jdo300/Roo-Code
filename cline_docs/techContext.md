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

#### WebSocket Message Format

The WebSocket server now uses a simplified JSON format for streaming messages to clients. There are three main message types: `"message"`, `"reasoning"`, and `"status"`.

##### 1. `"message"` Type (Chat Messages)

For general chat messages sent by Cline:

```json
{
  "type": "message",
  "output": "The text of the chat message",
  "partial": true/false
}
```

- `"type"`: Always `"message"` for chat messages.
- `"output"`: The actual text content of the chat message.
- `"partial"`: Boolean indicating if this is a partial chunk of a streaming message (`true`) or a complete message (`false`).

##### 2. `"reasoning"` Type (Cline's Thoughts)

For messages representing Cline's reasoning or internal thoughts:

```json
{
  "type": "reasoning",
  "output": "The text of Cline's reasoning",
  "partial": true/false
}
```

- `"type"`: Always `"reasoning"` for Cline's thought process messages.
- `"output"`: The text content of Cline's reasoning.
- `"partial"`: Boolean indicating if this is a partial chunk of streaming reasoning (`true`) or complete reasoning (`false`).

##### 3. `"status"` Type (Status Updates)

For status updates related to various operations (command output, API requests, tool execution, errors, etc.):

```json
{
  "type": "status",
  "statusType": "command_output", // Example: "command_output", "api_req_started", "tool_result", "error", etc.
  "text": "Optional text associated with the status (e.g., command output)", // Optional
  "partial": true/false // Optional, only if the status message itself can be streamed
}
```

- `"type"`: Always `"status"` for status update messages.
- `"statusType"`: A string indicating the specific type of status (e.g., `"command_output"`, `"api_req_started"`, `"tool_result"`, `"error"`, etc.). Refer to the `ClineSay` type in `src/shared/ExtensionMessage.ts` for a comprehensive list of possible status types.
- `"text"`: Optional text content associated with the status update (e.g., the output of a command, error details).
- `"partial"`: Optional boolean, used only if the status message itself is streamed in chunks.

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
