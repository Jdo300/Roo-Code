# System Patterns: Roo Code WebSocket Server

## Architecture Overview

### Component Structure

1. **WebSocket Server (`src/server/websocket-server.ts`)**

    - ✅ Core WebSocket server implementation
    - ✅ Message handling and validation
    - ✅ Client connection management
    - ✅ Enhanced logging via dedicated output channel

2. **Command Handler (`src/server/command-handler.ts`)**

    - ✅ Basic command handling structure
    - ✅ Integration with ClineProvider
    - ⏳ Command validation and verification (in progress)

3. **Settings UI (`webview-ui/src/components/settings/SettingsView.tsx`)**

    - ✅ WebSocket enable/disable toggle
    - ✅ Port configuration input
    - ❌ Settings persistence (known issue, to be addressed later)

4. **State Management (`webview-ui/src/context/ExtensionStateContext.tsx`)**
    - ✅ WebSocket state interface
    - ✅ State setter functions
    - ❌ State persistence (known issue, to be addressed later)

### Message Flow Pattern

```text
Client → WebSocket Server → Command Handler → ClineProvider
   ↑                                              ↓
   └──────────────── Response ──────────────────←┘
```

### Key Technical Decisions

1. **WebSocket Library: `ws`**

    - ✅ Successfully implemented and tested
    - ✅ Reliable client connections
    - ✅ Good TypeScript support

2. **JSON Message Format**

    ```typescript
    interface WebSocketMessage {
    	message?: string // Chat message
    	command?: string // Command name
    	value?: unknown // Command value
    }
    ```

3. **Settings Management**
    - Default port: 7800
    - Enable/disable toggle in UI
    - State managed through ExtensionStateContext
    - Known issue: Settings not persisting (to be fixed)

### Design Patterns

1. **Singleton Pattern**

    - Single WebSocket server instance per VSCode window
    - Managed through extension context

2. **Observer Pattern**

    - WebSocket clients subscribe to server events
    - Server broadcasts updates to clients

3. **State Management Pattern**
    - React context for UI state
    - Extension state for server configuration
    - Known limitation: State persistence needs work

### Error Handling

1. **Connection Errors**

    - ✅ Automatic reconnection (3 retries)
    - ✅ Error reporting to VSCode output channel
    - ✅ Enhanced logging for debugging

2. **Message Validation**

    - ✅ Basic JSON validation
    - ⏳ Enhanced parameter validation (in progress)

3. **UI Error Handling**
    - ✅ Basic input validation
    - ⏳ Enhanced error feedback (planned)
    - ⏳ Connection status indication (planned)

### Testing Strategy

1. **Integration Tests**

    - ✅ WebSocket server startup/shutdown
    - ✅ Client connection handling
    - ⏳ Command execution tests (in progress)

2. **UI Testing**
    - ✅ Basic component rendering
    - ⏳ Settings interaction tests (planned)
    - ⏳ State management tests (planned)

### Security Considerations

1. **Input Validation**

    - ✅ Basic JSON validation
    - ⏳ Enhanced parameter validation (in progress)
    - ⏳ Input sanitization (planned)

2. **Connection Management**
    - ✅ Local-only connections
    - ✅ Connection validation
    - ⏳ Rate limiting (planned)

### Current Status

1. **Server Implementation**

    - ✅ WebSocket server operational
    - ✅ Basic command handling working
    - ✅ Client connections stable

2. **UI Implementation**

    - ✅ Settings components added
    - ✅ State management structure in place
    - ❌ Settings persistence not working

3. **Known Issues**
    - Settings UI persistence not working
    - No connection status indicator
    - Limited error feedback in UI

### Next Steps

1. **Primary Focus (Current)**

    - Test and verify WebSocket communication
    - Implement proper command handling
    - Ensure correct message flow
    - Add verification for command responses

2. **Future Improvements**
    - Fix settings persistence
    - Add connection status indicator
    - Enhance error handling and feedback
    - Implement input validation
    - Add rate limiting

### Notes

- Settings persistence is a known issue but not blocking
- Focus is on core WebSocket functionality
- UI improvements will be addressed later
