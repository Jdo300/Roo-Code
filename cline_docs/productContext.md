# Product Context: Roo Code RPC Socket

## Why This Project Exists

The RPC socket feature for Roo Code exists to enable external applications to interact with the Roo Code VSCode extension programmatically using `node-ipc`. This provides a way for developers to build custom interfaces, automation tools, or integrations that can leverage Roo Code's AI capabilities without needing to use the VSCode extension directly.

## What Problems It Solves

1. **External Access**: Allows external applications to access Roo Code functionality outside of VSCode
2. **Real-time Updates**: Provides streaming updates for AI responses and events
3. **Programmatic Control**: Enables automation and script-based control of Roo Code
4. **Custom UI Integration**: Allows building custom interfaces that leverage Roo Code's capabilities
5. **Cross-platform Integration**: Facilitates integrating Roo Code with applications on different platforms

## How It Should Work

1. The RPC socket server runs within the Roo Code VSCode extension when enabled.
2. It listens on a configurable socket path or TCP host/port using `node-ipc`.
3. Connected clients can send commands in a defined JSON format to invoke Roo Code API methods.
4. The server streams responses and real-time events back to clients.
5. Configuration is currently managed via environment variables (`ROO_CODE_IPC_SOCKET_PATH`, `ROO_CODE_IPC_TCP_PORT`, `ROO_CODE_IPC_TCP_HOST`).
6. Settings UI integration is planned for a later stage.
