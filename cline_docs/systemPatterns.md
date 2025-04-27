# System Patterns: Roo Code RPC Socket

## How the System is Built

The RPC socket for Roo Code follows these architectural patterns:

1.  **Singleton Pattern for Server Management:**
    - An `IpcServer` class using the singleton pattern ensures only one server instance per VSCode window.
    - The singleton is initialized during extension activation and stored in the extension context.
    - The manager handles server lifecycle (start, stop) and connections using `node-ipc`.

2.  **Event-Based Communication:**
    - The RPC socket uses an event-based architecture for communication via `node-ipc`.
    - It listens for events from the Roo Code API and forwards them to connected clients.
    - It receives commands from clients, processes them, and emits responses/events.

3.  **JSON Message Format:**
    - All communication uses structured JSON messages with a consistent format, defined in `evals/packages/types/src/ipc.ts`.
    - Each message has a `type` field that identifies the message category (`command`, `response`, `event`).
    - Commands, responses, and events follow specific schemas.

4.  **Settings Integration:**
    - Server configuration is currently managed via environment variables (`ROO_CODE_IPC_SOCKET_PATH`, `ROO_CODE_IPC_TCP_PORT`, `ROO_CODE_IPC_TCP_HOST`).
    - Future settings UI integration will follow Roo Code's established patterns for settings management.

## Key Technical Decisions

1.  **RPC Library Choice:**
    - Using the `node-ipc` npm package for RPC implementation, supporting both socket paths and TCP connections.
    - This provides a flexible inter-process communication mechanism.

2.  **API Integration Approach:**
    - The RPC socket server interacts with Roo Code through the `API` class (`src/exports/api.ts`).
    - It subscribes to events from the API to receive real-time updates.
    - It calls API methods in response to client commands.

3.  **Configuration Management Approach:**
    - Initial configuration via environment variables for simplicity and immediate functionality.
    - Planned future integration with VSCode settings UI for user-friendly configuration.

4.  **Error Handling Strategy:**
    - Comprehensive error handling for connection issues, invalid commands, and API errors.
    - Clear error reporting through structured error response messages via the RPC channel.
    - Logging to a dedicated output channel for debugging.

5.  **Connection Status:**
    - Status display in the VSCode status bar is a potential future enhancement.

## Architecture Patterns

1.  **Command Pattern:**
    - Client requests are structured as commands with parameters.
    - Commands map directly to Roo Code API methods.
    - Each command is processed by a dedicated handler within the `API` class.

2.  **Observer Pattern:**
    - The `API` class observes Roo Code core events.
    - The RPC socket server observes events from the `API` class.
    - Connected clients observe events from the RPC socket server.
    - State changes are propagated through this observer chain.

3.  **Factory Pattern:**
    - Response and event messages are created by factory-like mechanisms (implicitly via schema definitions and object creation).
    - This ensures consistent message structure and validation.

4.  **Adapter Pattern:**
    - The `API` class and `IpcServer` adapt the Roo Code core functionality and events to the `node-ipc` RPC protocol.
    - Translates between API methods/events and RPC messages.

5.  **Strategy Pattern:**
    - Different message types (`command`, `response`, `event`) are handled by different strategies within the `IpcServer` and `API` class.
    - Command, response, and event messages each have their own processing logic.
