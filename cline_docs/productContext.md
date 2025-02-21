# Product Context: Roo Code WebSocket Server

## Why this project exists
To add remote control capabilities to the Roo Code VSCode plugin, enabling external applications to interact with and control the plugin's features.

## What problems it solves
- Lack of remote control for Roo Code, limiting its use to direct VSCode interaction
- Inability to integrate Roo Code with external systems or voice interfaces
- Limited automation possibilities for plugin functionalities from external applications

## Current Status
- WebSocket server implementation complete but experiencing startup issues
- Server not listening on port 7800
- Node.js client experiencing connection timeouts
- Enhanced logging added for debugging
- Core functionality working but connection issues blocking usage

## How it should work
The Roo Code plugin will host a WebSocket server that:
- Listens on port 7800 (configurable via settings)
- Accepts WebSocket connections from external clients
- Processes JSON messages in the format:
  ```json
  {
    "message": "Input text to cline",
    "command": "command_name",
    "value": "command_value"  // Optional, type depends on command
  }
  ```

### Command Set Implementation
1. Chat Interface Actions:
   - `run`: Execute proposed action
   - `stop`: Halt ongoing process
   - `reject`: Dismiss suggestion/action
   - `allow_action`: Allow specific action
   - `deny_action`: Deny specific action

2. Auto-Approve Settings:
   - `set_auto_approve_files`: Enable/disable auto-approve for file operations
   - `set_auto_approve_terminal`: Enable/disable auto-approve for terminal commands
   - `set_auto_approve_browser`: Enable/disable auto-approve for browser actions

### Client Implementations
- Node.js client with:
  - Connection URLs support (25.57.68.54:7800, 10.0.0.182:7800)
  - 30-second operation timeout
  - Automatic reconnection
  - Command helper methods
- Python client available
- Example tests and documentation provided

### Current Debug Focus
1. Server Initialization:
   - Added dedicated output channel
   - Enhanced error logging
   - Configuration state tracking
   - Startup sequence verification

2. Connection Issues:
   - Client timeout investigation
   - Port availability checking
   - Network configuration verification
   - Error logging improvements

### Future Considerations
- This implementation will serve as a foundation for more advanced remote control features
- The command set can be expanded based on community needs
- The WebSocket server could be enhanced to support bidirectional communication for richer integrations

## PR Goals
This feature will be submitted as a Pull Request to the main Roo Code repository to benefit the wider community. Focus areas include:
- Clean, well-documented code
- Comprehensive test coverage
- Clear documentation for setup and usage
- Consideration of security implications
- Robust error handling and logging
