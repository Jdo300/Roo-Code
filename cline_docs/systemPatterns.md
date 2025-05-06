# System Patterns

## RPC Communication Pattern

1. Server Setup

    - Initialize node-ipc server
    - Configure port and host
    - Set up event handlers
    - Enable detailed logging

2. Client Connection Pattern

    ```typescript
    client.connect() -> server.onConnect() -> server.send(Ack) -> client.emit("connect")
    ```

3. Command Pattern

    ```typescript
    client._sendCommand() -> server.onMessage() -> server.handleCommand() -> server.send(TaskResponse) -> client._handleMessage()
    ```

4. Event Pattern
    ```typescript
    server.emit(event) -> server.send(TaskEvent) -> client._handleMessage() -> client.emit(event)
    ```

## Logging Pattern

1. Server-side Logging

    - Log to VSCode output window (Roo Code section)
    - Include timestamps
    - Log all server events and state changes
    - Log message details for debugging

2. Client-side Logging
    - Console logging for development
    - Event-based error reporting
    - Connection status updates
    - Message tracking

## Configuration Pattern

1. Schema Validation

    - Use Zod for runtime validation
    - Enforce required fields
    - Type checking
    - Default values

2. Environment Variables
    - API keys
    - Server configuration
    - Development settings

## Error Handling Pattern

1. Server-side

    - Log errors to output window
    - Send error events to client
    - Maintain server stability

2. Client-side
    - Timeout handling
    - Connection retry logic
    - Error event emission
    - Request tracking

## Testing Pattern

1. Test Client

    - Simulate real client behavior
    - Test all message types
    - Validate responses
    - Error case testing

2. Configuration Testing
    - Schema validation
    - Required fields
    - Provider-specific settings
    - Environment variable handling
