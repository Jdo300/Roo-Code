# Technical Context

## Current Development Focus

### Interactive Testing Script
- ⚪️ Setting up versatile interactive testing script (`examples/nodejs-client/test-commands.cjs`) for both user and developer testing. (Restarted)
- ⚪️ Implementing two modes of operation: interactive (user-friendly) and non-interactive (developer-friendly). (Restarted)
- ⚪️ Implementing round-trip verification for settings updates in the testing script. (Restarted)

### Command Handler Enhancements
- ⚪️ Simplifying `CommandHandler.ts` to act as a thin proxy for command forwarding. (Restarted)
- ⚪️ Re-implementing verification logic in `src/server/command-handler.ts` to handle setting update verification server-side. (Restarted)
- ⚪️ Preparing `CommandHandler.ts` for decoupled command handling layer implementation. (Restarted)

### Recent Changes
- Reverted to main branch - starting fresh implementation of WebSocket interactive testing script feature.

### Test Infrastructure
- Basic Node.js client implementation (`examples/nodejs-client/index.cjs`) - to be updated.
- Basic command testing script (`examples/nodejs-client/test-commands.cjs`) - to be re-implemented with verification support.


### Current Status
⚪️ Starting fresh implementation - no significant changes yet.

### Next Steps
1. Re-implement simplified `CommandHandler.ts` in the newly forked project.
2. Re-implement interactive testing script (`examples/nodejs-client/test-commands.cjs`).
3. Resolve TypeScript build errors in webview-ui markdown components.


### Next Steps
   - Document findings on `vscode.postMessage()` validation (or lack thereof): `vscode.postMessage()` itself likely does not perform validation, so we need to implement explicit validation.
   - UI Interaction Mechanisms:
     - Chat messages: Sent programmatically using `vscode.postMessage({ type: "invoke", invoke: "sendMessage", ... })`.
     - Auto-approve settings: Controlled programmatically using `vscode.postMessage({ type: "[settingName]", bool: true | false })`.
   - Round-trip verification for settings: Feasible by setting a setting value using `vscode.postMessage()` and then reading back the state to confirm the update.
   - Decoupled command handling layer: Design a decoupled command handling layer in `src/server/` to handle WebSocket commands, validation, UI interaction, and response formatting.


# Technical Context

## WebSocket API Entry Points

### Server Port
- **Port:** 7800 (configurable via VSCode settings: `roo-code.websocket.port`)

### Commands

#### Chat Message
- **Endpoint:** WebSocket server
- **Message Format (JSON):**
  ```json
  {
    "type": "invoke",
    "invoke": "sendMessage",
    "text": "your chat message here"
  }
  ```
- **Usage:** Send a text message to Cline chat interface.

#### Plugin Commands
- **Endpoint:** WebSocket server
- **Message Format (JSON):**
  ```json
  {
    "command": "commandName",
    "value": commandValue // Optional, command-specific value
  }
  ```
- **Examples:**
    - Enable auto-approve for files:
      ```json
      { "command": "alwaysAllowFiles", "value": true }
      ```
    - Request current state:
      ```json
      { "command": "requestState" }
      ```
    - Run action:
      ```json
      { "command": "run", "value": "action identifier" }
      ```

#### Settings Verification (for Settings Update Commands)
- **Mechanism:** Round-trip verification
- **Response:** Server response for settings update commands will include a `verification` object:
  ```json
  {
    "type": "commandName_response",
    "message": "Command executed and verified",
    "verification": {
      "success": true,
      "settingName": "alwaysAllowFiles",
      "expectedValue": true,
      "actualValue": true
    }
  }
  ```
- **Purpose:** Confirms that settings updates were successfully applied by the plugin.

## Technologies Used

### Core Technologies
- TypeScript
- Node.js
- WebSocket (`ws` library)
- VSCode Extension API

## Development Tools
- ESLint for code quality
- Prettier for code formatting
- TypeScript compiler
- esbuild Problem Matchers extension

## Development Setup

### Prerequisites
1. Node.js (version specified in `.nvmrc`)
2. VSCode
3. TypeScript
4. Git
5. esbuild Problem Matchers extension

### Project Structure
```
src/
  server/
    websocket-server.ts     # Main WebSocket server implementation
    command-handler.ts      # Command processing logic
    config.ts              # Server configuration
    types.ts              # TypeScript type definitions

examples/
  nodejs-client/
    index.cjs            # Node.js WebSocket client
    test-commands.cjs    # Command testing script
    test-chat.cjs       # Chat testing script
```

### Development Workflow
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Debug in VSCode:
   - Press F5 to launch extension in debug mode
   - Use Node.js client to test server


## Configuration

### Extension Settings
```json
{
  "roo-code.websocket.port": 7800,
  "roo-code.websocket.enabled": true
}
```

### Environment Requirements
- Windows/Mac/Linux compatibility
- Node.js runtime
- Network port availability
- esbuild Problem Matchers extension


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
