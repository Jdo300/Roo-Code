# Active Context: Architecting Roo Code MCP Server

## Current Task

Design and plan the implementation of a new, standalone MCP (Model Context Protocol) server that will expose the Roo Code extension's IPC API commands as MCP tools. This server will be an independent Node.js module.

## Recent Changes & Findings

- **IPC Test Suite Execution Completed:** All command scenarios outlined in `rpc-tcp-test/commands/README.md` have been executed.
- **Comprehensive List of IPC Issues Compiled:**
    - **Functional Failures (Server-Side Bugs):** `ResumeTask`, `Log` (timeout), `IsTaskInHistory`, `GetTokenUsage`, `cancelTask <taskId>` (timeout), `closeTask <taskId>` (timeout).
    - **Server-Side Bug (Deferred Fix):** `CancelCurrentTask` state update timing.
    - **Test Script Issues:** `SendMessage` (arg parsing), `PressPrimaryButton`/`PressSecondaryButton` (assertion mismatch), general script reliance on hardcoded values.
    - **UI Synchronization Issue (Deferred Fix):** `setActiveProfile`.
- **Strategic Shift:** Focus has shifted from immediate IPC bug fixing to architecting an MCP server that wraps this IPC API. Debugging the existing IPC commands will now inform the MCP server's design and implementation.

## Next Steps

1.  **Fetch MCP Server Creation Instructions:** Obtain detailed official instructions/documentation for creating an MCP server.
2.  **Architect MCP Server (Primary Focus):**
    - An Architect agent will be dispatched to:
        - Review fetched MCP server creation guidelines.
        - Research MCP best practices, including Server-Sent Events (SSE) for callbacks/eventing.
        - Analyze the existing Roo Code IPC command structure (from `src/schemas/ipc.ts` and test suite findings).
        - Design the MCP server, including:
            - Defining MCP tools (mapping to Roo Code IPC commands).
            - Specifying input/output schemas for these tools.
            - Planning handling of asynchronous events/callbacks from Roo Code (e.g., task progress, new messages) via SSE.
            - Proposing a project structure for the new standalone Node.js module (in its own root-level subfolder).
        - Deliver a comprehensive design document and implementation plan.
3.  **Debug/Refine IPC Commands (Informing MCP Server):**
    - Address the identified functional IPC bugs (`ResumeTask`, `Log`, `IsTaskInHistory`, `GetTokenUsage`, `cancelTask`, `closeTask`, `CancelCurrentTask` timing) as part of ensuring the MCP tools have reliable underlying functionality. This will be done in parallel or after the initial MCP architecture is defined.
4.  **Improve Test Scripts & Address UI Sync (Lower Priority):** These will be addressed after the MCP server architecture and critical IPC bugs are tackled.
5.  **Verify Delta Streaming (Lowest Priority):** Postponed.

## Current Status

- IPC test suite execution is complete, providing a list of commands and their current state.
- **Primary Focus:** Architecting a new standalone MCP server to expose Roo Code IPC functionality.
- Debugging existing IPC issues will now support the development of reliable MCP tools.
