# Technical Context: Roo Code RPC Socket

## Technologies Used

1.  **Core Technologies:**
    - **TypeScript**: The entire codebase uses TypeScript for type safety and developer experience.
    - **Node.js**: The runtime environment for the server-side code.
    - **VS Code Extension API**: Used for integration with VS Code.
    - **RPC (Remote Procedure Call)**: The communication paradigm used.

2.  **Libraries and Dependencies:**
    - **node-ipc**: The library used for implementing the RPC socket, supporting both socket paths and TCP connections.
    - **zod**: Used for schema validation in the Roo Code codebase, including IPC messages.

3.  **Extension-specific Technologies:**
    - **VS Code Extension Context**: For lifecycle management and state persistence.
    - **VS Code WebView API**: For UI components and user interaction (relevant for future settings integration).
    - **VS Code Output Channel**: For logging and debugging.

## Development Setup

1.  **Project Structure:**
    - The `node-ipc` RPC socket implementation is located in `evals/packages/ipc/`.
    - The `API` class (`src/exports/api.ts`) integrates the RPC socket with the core extension functionality.
    - IPC message types and schemas are defined in `evals/packages/types/src/ipc.ts`.
    - Configuration is currently handled in `src/extension.ts` using environment variables.
    - Future settings UI integration will involve files like `src/shared/ExtensionMessage.ts`, `src/shared/WebviewMessage.ts`, `src/core/webview/ClineProvider.ts`, and components in `webview-ui/src/components/settings/`.

2.  **Building and Testing:**
    - Standard build process: `npm run build`.
    - Extension testing with Jest: `npm run test:extension` (requires test coverage).
    - RPC socket specific tests should be added in `evals/packages/ipc/src/server.test.ts` or similar.
    - Extension debugging using VS Code's extension debugging features.

3.  **Configuration Management:**
    - Initial configuration is managed via environment variables:
        - `ROO_CODE_IPC_SOCKET_PATH`: Specifies the socket file path for IPC connections.
        - `ROO_CODE_IPC_TCP_PORT`: Specifies the TCP port for TCP connections.
        - `ROO_CODE_IPC_TCP_HOST`: Specifies the TCP host for TCP connections (defaults to 'localhost').
    - Future settings will be stored in VS Code's extension storage using GlobalState.

## Technical Constraints

1.  **RPC Socket Constraints:**
    - Must use the `node-ipc` npm package.
    - Must follow the singleton pattern for the server instance.
    - Must support configuration via `ROO_CODE_IPC_SOCKET_PATH` for IPC and `ROO_CODE_IPC_TCP_PORT`/`ROO_CODE_IPC_TCP_HOST` for TCP.
    - Must handle connections and disconnections gracefully.

2.  **API Integration Constraints:**
    - Must interact with the core functionality through the established `API` class.
    - Must handle extension lifecycle events (activation/deactivation).
    - Must log to a dedicated output channel (e.g., "Roo-Code IPC").

3.  **Communication Protocol Constraints:**
    - Must follow the JSON message format defined in `evals/packages/types/src/ipc.ts`.
    - Must support real-time streaming of messages (events).
    - Must properly handle all `RooCodeAPI` methods as incoming commands.

4.  **Testing and Quality Constraints:**
    - Must have adequate test coverage for the RPC socket implementation.
    - Must maintain code quality standards (linting, typing).
    - Should handle edge cases like port/socket path conflicts and connection failures.
    - Unit tests for RPC command handling are required.

5.  **Settings Implementation Constraints (Future):**
    - Must follow the Roo Code pattern in `cline_docs/settings.md`.
    - Must integrate with the existing settings UI.
    - Must handle valid port range for TCP connections.
    - Must provide proper error feedback in the UI.
