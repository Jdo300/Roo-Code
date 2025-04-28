# Plan for RooCodeClient Library and RPC TCP Test Script

## Objective

Create a reusable Node.js (JavaScript) library (`RooCodeClient`) for interacting with the Roo Code RPC socket via TCP, and a client-side test script that uses this library to verify the RPC functionality. This library will serve as a foundation for a future MCP server.

## Project Structure

- **RooCodeClient Library:** `evals/packages/rpc-client/`
- **Client-Side Test Script:** `e2e/rpc-tcp-test/`

## RooCodeClient Library (`evals/packages/rpc-client/`) Plan

1.  **Initialization:** Create a Node.js package in `evals/packages/rpc-client/`.
2.  **TCP Connection:** Implement a class or module to handle the TCP socket connection using Node.js's built-in `net` module. This will include connecting to a specified host and port, handling connection events (connect, data, close, error), and implementing reconnection logic.
3.  **Message Framing:** Implement logic to handle the message framing over the TCP socket. Messages are likely delimited by a specific character or length prefix, based on the `node-ipc` usage mentioned in the documentation. This will need confirmation during implementation or by reading the server-side code.
4.  **Message Serialization/Deserialization:** Implement functions to serialize outgoing command objects into JSON strings and deserialize incoming JSON strings into JavaScript objects, adhering to the schemas defined in `evals/packages/types/src/ipc.ts`.
5.  **Command Request/Response Matching:** Implement a mechanism to generate unique request IDs for each `TaskCommand` sent. Store pending requests (e.g., in a Map) and use the request ID in incoming responses to match them to the original request and resolve/reject associated Promises.
6.  **Event Handling:** Implement an EventEmitter pattern. When a `TaskEvent` is received, parse its `eventName` and `payload` and emit a corresponding event from the `RooCodeClient` instance. This will allow consumers (like the test script or the future MCP server) to subscribe to specific events.
7.  **API Method Implementation:** Create methods on the `RooCodeClient` class that mirror the `RooCodeAPI` interface defined in `src/exports/interface.ts`. Each method will construct the appropriate `TaskCommand` message, send it via the TCP connection, and return a Promise that resolves with the response data or rejects on error or timeout.
8.  **Error Handling:** Implement comprehensive error handling for network issues, invalid message formats, RPC errors returned by the server (as described in `documentation/websocket_api_schema.md`), and timeouts.
9.  **Configuration:** The client should accept host and port as parameters during instantiation.

## Client-Side Test Script (`e2e/rpc-tcp-test/`) Plan

1.  **Initialization:** Create a Node.js script in `e2e/rpc-tcp-test/`.
2.  **Configuration:** Implement logic to read the target host and port from command-line arguments or environment variables.
3.  **Library Usage:** Import and instantiate the `RooCodeClient` library.
4.  **Connection:** Connect to the Roo Code RPC socket using the `RooCodeClient` instance.
5.  **Event Subscription:** Subscribe to relevant events emitted by the `RooCodeClient`, particularly the `message` event for streaming chat messages, and log their content.
6.  **API Method Testing:** Call various methods on the `RooCodeClient` instance to test the `RooCodeAPI` functionality. This should include a variety of commands to ensure they are correctly sent and responses are handled.
7.  **Output:** Log the results of command invocations (success/failure, response data) and received events in a clear, structured format suitable for AI interpretation.
8.  **Disconnection:** Implement graceful disconnection from the RPC socket.

## Verification and Refinement

- Manually run the test script to verify its functionality.
- Integrate the script into an automated execution flow (e.g., via a simple shell script) that an AI agent can trigger using `execute_command`.
- Refine the output format for AI readability.
- Expand test cases to cover all API methods and scenarios.
- Document the library and test script.

## Dependencies

- Node.js
- Built-in `net` module (for TCP)
- Potentially an event emitter library if not using the built-in `events`.

## Mermaid Diagram

```mermaid
graph TD
    A[AI Agent] --> B{Execute Test Script};
    B --> C[Test Script (Node.js)];
    C --> D[RooCodeClient Library];
    D --> E[Configuration (Host, Port)];
    D --> F[Connection Management];
    F --> G[TCP Socket];
    G --> H[Roo Code RPC Server];
    D --> I[Message Serialization/Deserialization];
    I --> G;
    H --> G;
    G --> I;
    D --> J[Command Request/Response Matching];
    J --> I;
    D --> K[Event Emitter];
    K --> I;
    C --> D; %% Test script uses the library
    C --> L[Output];
    J --> L; %% Test script logs results from command responses
    K --> C; %% Test script subscribes to events from the library
    C --> L; %% Test script logs received events
```
