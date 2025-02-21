# Active Context

## Current Task: WebSocket Server Implementation

### Status

- ✅ Basic WebSocket server implementation in `src/server/websocket-server.ts`
- ✅ Command handling structure in `src/server/command-handler.ts`
- ✅ WebSocket settings UI components added to `SettingsView.tsx`
- ❌ Settings persistence not working (marked for future enhancement)

### Current Focus

- Implementing WebSocket communication functionality
- Testing command handling and responses
- Ensuring proper message flow between client and server

### Known Issues

1. **Settings UI Persistence (To Be Addressed Later)**
    - WebSocket enabled/disabled state not persisting
    - Port number changes not persisting
    - Note: This is a UI-only issue; the WebSocket server still functions with default settings

### Next Actions

1. **Primary Focus (Current Sprint)**

    - Test and verify WebSocket communication
    - Implement proper command handling
    - Ensure correct message flow
    - Add verification for command responses

2. **Future Enhancements**
    - Fix settings persistence in UI
    - Add validation for port number input
    - Improve error handling and user feedback
    - Add connection status indicator

## Implementation Details

### WebSocket Server Configuration

- Default Port: 7800
- Settings Location: `webview-ui/src/components/settings/SettingsView.tsx`
- State Management: `webview-ui/src/context/ExtensionStateContext.tsx`

### Key Entry Points (for WebSocket Client)

- **Commands Format:**

    ```json
    {
    	"type": "invoke",
    	"invoke": "sendMessage",
    	"text": "your message here"
    }
    ```

    ```json
    {
      "command": "commandName",
      "value": commandValue
    }
    ```

    ```json
    {
    	"command": "requestState"
    }
    ```

### Recent Changes

- Added WebSocket settings UI components
- Implemented TypeScript interfaces for WebSocket state
- Added setter functions for WebSocket settings
- Note: Settings persistence needs future work

## Timeline

- ✅ WebSocket server implementation
- ✅ Command handler structure
- ✅ Settings UI components
- ⏳ Communication testing - IN PROGRESS
- ⏳ Command handling verification - IN PROGRESS
- 🔄 Settings persistence - POSTPONED

## Notes

- Settings persistence is a known issue but not blocking for core WebSocket functionality
- Focus should remain on getting the communication working correctly
- UI improvements and settings persistence will be addressed in a future update
