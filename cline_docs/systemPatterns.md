# System Patterns: Roo Code WebSocket Server

## How the System is Built

The WebSocket server for Roo Code follows these architectural patterns:

1. **Singleton Pattern for Server Management:**

    - A `WebSocketServerManager` class using the singleton pattern ensures only one server instance per VSCode window
    - The singleton is initialized during extension activation and stored in the extension context
    - The manager handles server lifecycle (start, stop, restart) and connections

2. **Event-Based Communication:**

    - The WebSocket server uses an event-based architecture for communication
    - It listens for events from the Roo Code API and forwards them to connected clients
    - It receives commands from clients, processes them, and emits responses

3. **JSON Message Format:**

    - All communication uses structured JSON messages with a consistent format
    - Each message has a `type` field that identifies the message category
    - Commands, responses, and events follow specific schemas as defined in documentation

4. **Settings Integration:**
    - Server settings follow Roo Code's established patterns for settings management
    - Settings are stored in VSCode's extension storage using the global state
    - Settings UI is integrated into the existing Roo Code settings panel

## Key Technical Decisions

1. **WebSocket Library Choice:**

    - Using the `ws` npm package for WebSocket implementation as specified in requirements
    - This provides a mature, stable WebSocket implementation with good performance

2. **API Integration Approach:**

    - The WebSocket server interacts with Roo Code through the `API` class
    - It subscribes to events from the API to receive real-time updates
    - It calls API methods in response to client commands

3. **Settings Implementation Approach:**

    - Following the pattern in `cline_docs/settings.md` for consistent user experience
    - Using ExtensionState, WebviewMessage, and ClineProvider for settings persistence
    - Settings UI integrated into existing Roo Code settings panel

4. **Error Handling Strategy:**

    - Comprehensive error handling for connection issues, invalid commands, and API errors
    - Clear error reporting through structured error response messages
    - Logging to a dedicated output channel for debugging

5. **Connection Status Display:**
    - Using VSCode status bar to display connection status
    - Visual indicators for server state (running, stopped, error)
    - Command registration for quick toggling of server state

## Architecture Patterns

1. **Command Pattern:**

    - Client requests are structured as commands with parameters
    - Commands map directly to Roo Code API methods
    - Each command is processed by a dedicated handler

2. **Observer Pattern:**

    - WebSocket server observes Roo Code API events
    - Connected clients observe server events
    - State changes are propagated through the observer chain

3. **Factory Pattern:**

    - Response and event messages are created by factory methods
    - This ensures consistent message structure and validation

4. **Adapter Pattern:**

    - WebSocket server adapts Roo Code API to WebSocket protocol
    - Translates between API methods/events and WebSocket messages

5. **Strategy Pattern:**
    - Different message types are handled by different strategies
    - Command, response, and event messages each have their own processing logic
