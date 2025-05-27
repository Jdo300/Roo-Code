# Refactoring `roo-ipc-bridge` MCP Server to SSE Transport

**Date:** 2025-05-15

**Goal:** Transition the `roo-ipc-bridge` MCP server (currently located at `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/`) from STDIO to Server-Sent Events (SSE) transport. This change aims to enable real-time event streaming to the Roo Code UI, support chunked message delivery, and allow for event filtering.

**Key Files to Modify (primarily within `roo-ipc-bridge` server):**

- `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/src/index.ts`: Main server logic, transport setup, event handling.
- Potentially new files for HTTP server setup if not integrated directly into `index.ts`.
- `package.json` (in `roo-ipc-bridge` server directory): To add dependencies like `express`.

## Core Architectural Changes

The refactored server will use an HTTP server (e.g., Express.js) to host the `SSEServerTransport` provided by the MCP SDK. This transport will manage `/events` (for server-to-client event streaming) and `/message` (for client-to-server requests) endpoints. The server will continue to use its internal `IpcClient` to communicate with the Roo Code core extension's IPC, bridging these interactions to the MCP via SSE.

```mermaid
graph TD
    subgraph Roo Code Extension (Client)
        RC_McpHub[McpHub.ts] -- configures & connects to --> SSE_Client_Transport[SSEClientTransport (SDK)]
        SSE_Client_Transport -- HTTP GET --> RooIpcBridge_Events[/mcp/events @ port 3000]
        SSE_Client_Transport -- HTTP POST --> RooIpcBridge_Message[/mcp/message @ port 3000]
    end

    subgraph RooIpcBridge MCP Server (Refactored)
        direction LR
        RooIpcBridge_HttpServer[Express.js HTTP Server :3000]
        RooIpcBridge_HttpServer -- hosts --> MCP_SSE_Transport[SSEServerTransport (SDK)]
        MCP_SSE_Transport -- uses --> RooIpcBridge_McpServer[MCP Server Instance (SDK)]
        RooIpcBridge_McpServer -- uses --> RooIpcBridge_ToolHandlers[Tool Handlers]
        RooIpcBridge_ToolHandlers -- uses --> RooIpcBridge_IpcClient[IpcClient to Roo Code Core]
        RooIpcBridge_IpcClient -- receives events --> RooIpcBridge_EventLogic[Event Handling Logic]
        RooIpcBridge_EventLogic -- sends MCP events via --> RooIpcBridge_McpServer
        RooIpcBridge_McpServer -- pushes events over SSE --> MCP_SSE_Transport
    end

    RooIpcBridge_IpcClient -. IPC .-> RooCodeCore[Roo Code Core Extension IPC]

    style RooIpcBridge_HttpServer fill:#f9f,stroke:#333,stroke-width:2px
    style MCP_SSE_Transport fill:#f9f,stroke:#333,stroke-width:2px
    style RooIpcBridge_EventLogic fill:#f9f,stroke:#333,stroke-width:2px
```

## Detailed Plan

### Phase 1: Setup HTTP Server and Basic SSE Transport

1. **Add Dependencies:**
    - Modify `package.json` in `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/` to add `express`.
    - Run `npm install` (or equivalent) in that directory.
2. **Modify `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/src/index.ts`:**
    - **Imports:** Add `express` and `SSEServerTransport` from `@modelcontextprotocol/sdk/server/sse.js`. Remove `StdioServerTransport`.
    - **HTTP Server Instantiation:** Create an `express` app instance. Define a port (default to 3000, consider configurability).
    - **`SSEServerTransport` Instantiation:** Create an instance, passing the existing MCP `Server` object (`this.server`).
    - **Integrate Transport:** Use `transport.requestHandler()` as `express` middleware for a base path like `/mcp`.
    - **Modify `run()` Method:**
        - Remove `StdioServerTransport` logic.
        - The MCP `Server` instance does not need a separate `connect()` call with `SSEServerTransport` as it's managed by the HTTP server integration.
        - Start the `express` app (`app.listen(...)`).
        - Keep the `IpcClient` connection logic.
    - **Logging:** Update logs for SSE transport and HTTP port.

### Phase 2: Refactor Event Handling for SSE Push

1. **Modify `setupIpcEventHandlers()` in `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/src/index.ts`:**
    - When an event is received from `this.ipcClient.on('taskEvent', ...)`:
        - Use the MCP `Server` instance (`this.server`) to send an event notification (e.g., `this.server.sendEventNotification(eventName, data)`).
        - The `eventName` could be structured (e.g., `roo.task.event`, `roo.message.delta`).
        - The `data` will be the `event.payload` from `IpcClient`.
    - **Decision:** Remove the existing event queues (`aiMessageQueue`, `otherEventQueue`) and polling tools (`roo_ipc_poll_ai_messages`, `roo_ipc_poll_other_events`) in favor of direct SSE push for a cleaner model.

### Phase 3: Implement Chunked Streaming and Event Filtering (Conceptual - for future enhancement)

1. **Chunked Message Streaming:**
    - For partial/delta `message` events from `IpcClient`, send distinct SSE events (e.g., `roo.message.delta`) with chunk data.
    - Send a final event (e.g., `roo.message.finalized`) to indicate stream end.
2. **Event Filtering:**
    - **Server-Side (Preferred):** Investigate if the MCP SDK's `SSEServerTransport` or `Server` class supports mechanisms for clients to specify event filters on connection (e.g., via query parameters on the `/events` endpoint). If so, implement logic to only send matching events.
    - **Client-Side (Fallback):** If server-side filtering is complex or unsupported by the SDK directly, the server sends all events, and Roo Code (`McpHub`) filters them. (Initial implementation can start without filtering).

### Phase 4: Configuration and Testing

1. **Roo Code Configuration Update:**
    - Modify `mcp_settings.json` (or `.roo/mcp.json`) for the `roo-ipc-bridge` server:
        - Remove `command`, `args`, `env`.
        - Add `type: "sse"`.
        - Add `url`: e.g., `http://localhost:3000/mcp`.
2. **Testing:**
    - Start the refactored `roo-ipc-bridge` server.
    - Configure Roo Code to connect via the new SSE URL.
    - Verify:
        - Tool calls work correctly.
        - Events (task creation, state changes, messages) are pushed to Roo Code in real-time.
        - (If implemented) Chunked streaming and event filtering.

### Considerations

- **Error Handling:** Implement robust error handling for the HTTP server and SSE connections.
- **Security:** For a `localhost` SSE server, default security is generally acceptable. No external exposure is planned.
- **Resource Management:** Ensure SSE connections are managed correctly.
- **`IpcClient` Integrity:** The core functionality of `IpcClient` bridging to Roo Code's internal IPC must be preserved.

This plan outlines the major steps for the refactoring. Implementation details will be handled by the Code agent.
