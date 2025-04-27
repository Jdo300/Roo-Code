# Active Context: Roo Code RPC Socket Enhancement

## What We're Working On Now

We are currently focused on enhancing the existing `node-ipc` based RPC socket implementation for the Roo Code VSCode extension. The goal is to expose the full Roo Code API functionality through this socket, add support for TCP connections via environment variables, and integrate settings into the UI at a later stage.

## Recent Changes

The previous WebSocket server implementation branch was recreated. The project now utilizes an existing `node-ipc` based RPC socket implementation found in `evals/packages/ipc/`. This existing implementation currently only supports a limited set of commands (`StartNewTask`, `CancelTask`, `CloseTask`) but includes basic event broadcasting.

## Current Focus

Our immediate focus is on the following steps:

1.  **Confirm Current API State:** Verify that the `RooCodeAPI` documentation (`documentation/roocode-api.md`) is up-to-date by comparing it against the actual code implementation.
2.  **Verify Project Build and Run:** Ensure the current project state can be built and run successfully.
3.  **Extend RPC Socket Commands:** Modify the RPC socket server to handle all available `RooCodeAPI` methods.
4.  **Implement Unit Tests:** Write unit tests for the newly exposed RPC socket commands.
5.  **Add TCP Configuration:** Implement the ability to configure the `node-ipc` server to use TCP connections via environment variables (`ROO_CODE_IPC_TCP_PORT`, `ROO_CODE_IPC_TCP_HOST`).

## Next Steps

Following the current focus, the next steps will involve:

1.  **Update Documentation:** Revise `documentation/websocket_api_schema.md` to accurately reflect the `node-ipc` RPC/TCP implementation and update other relevant documentation files.
2.  **Implement Settings UI:** Add a section to the Roo Code settings panel to allow configuration of the RPC socket (socket path, TCP host/port) and related settings through the UI.
3.  **Explore Future Enhancements:** Consider adding example client implementations, enhanced security features, performance optimizations, and other potential improvements as outlined in previous contexts.
