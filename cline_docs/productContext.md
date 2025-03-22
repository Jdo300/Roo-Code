# Product Context: Roo Code WebSocket Server

## Why This Project Exists

The WebSocket server feature for Roo Code exists to enable external applications to interact with the Roo Code VSCode extension programmatically. This provides a way for developers to build custom interfaces, automation tools, or integrations that can leverage Roo Code's AI capabilities without needing to use the VSCode extension directly.

## What Problems It Solves

1. **External Access**: Allows external applications to access Roo Code functionality outside of VSCode
2. **Real-time Updates**: Provides streaming updates for AI responses rather than waiting for complete responses
3. **Programmatic Control**: Enables automation and script-based control of Roo Code
4. **Custom UI Integration**: Allows building custom interfaces that leverage Roo Code's capabilities
5. **Cross-platform Integration**: Facilitates integrating Roo Code with applications on different platforms

## How It Should Work

1. The WebSocket server runs within the Roo Code VSCode extension when enabled
2. It listens on a configurable port (default: 7800) and accepts WebSocket connections
3. Connected clients can send commands in a defined JSON format to invoke Roo Code API methods
4. The server streams responses and real-time events back to clients
5. Settings persistence follows the Roo Code extension's established patterns
6. The server status is visible in the VSCode status bar
7. The server can be enabled/disabled and configured through the Roo Code settings UI
