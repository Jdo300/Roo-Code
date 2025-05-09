# Agent Knowledge Base - Roo Code Project

This document provides critical background information and resource links for agents working on the Roo Code project. Please review the relevant sections before starting your task.

**Mandatory Reading for All Agents:** [`cline_docs/activeContext.md`](cline_docs/activeContext.md) (Describes the _current_ specific task focus).

## General (All Agents)

- **Project Goal:** Roo Code is a VS Code extension providing AI coding assistance. The current focus involves an IPC (Inter-Process Communication) feature allowing external applications to interact with the extension. See [`cline_docs/productContext.md`](cline_docs/productContext.md).
- **Core Technology:** VS Code Extension, TypeScript/JavaScript, Node.js.
- **IPC:** Uses `node-ipc` library for TCP/Unix socket communication between the extension (server) and external clients. See [`cline_docs/techContext.md`](cline_docs/techContext.md).
- **Schemas/Validation:** Zod schemas define message structures ([`src/schemas/ipc.ts`](src/schemas/ipc.ts), [`src/schemas/index.ts`](src/schemas/index.ts)) and settings. See also API Schema: [`documentation/websocket_api_schema.md`](documentation/websocket_api_schema.md).
- **Memory Bank (`cline_docs/`):** Contains essential project context (product, progress, patterns, tech). Refer to these documents as needed.
- **Key Files (IPC Focus):**
    - Server API Logic: [`src/exports/api.ts`](src/exports/api.ts)
    - IPC Server Wrapper: [`src/exports/ipc.ts`](src/exports/ipc.ts)
    - IPC Schemas: [`src/schemas/ipc.ts`](src/schemas/ipc.ts)
    - Test Client: [`rpc-tcp-test/test-ipc-handler.mjs`](rpc-tcp-test/test-ipc-handler.mjs)
- **Current Task Context:** Refer to [`cline_docs/activeContext.md`](cline_docs/activeContext.md) for the immediate goal. Currently focused on debugging IPC command response handling in the test client.

## Code Agent / Code Reviewer Agent

- **Architecture Overview:** Client -> Test Script (`RooCodeClient` logic) -> `IpcServer` -> `API` class -> `ClineProvider` -> `Cline`. See [`documentation/system_architecture_report.md`](documentation/system_architecture_report.md).
- **Communication Patterns:** Understand the Request/Response (`TaskCommand` -> `TaskEvent` with `eventName: CommandResponse`) and Event (`TaskEvent`) flows. See [`cline_docs/systemPatterns.md`](cline_docs/systemPatterns.md) & [`documentation/system_architecture_report.md`](documentation/system_architecture_report.md).
- **API Reference:** Consult [`documentation/roocode-api.md`](documentation/roocode-api.md) for details on available commands and events.
- **Settings Implementation:** Settings involve multiple files (`ClineProvider`, shared types, UI components). See guides: [`cline_docs/settings.md`](cline_docs/settings.md) & [`documentation/websocket_server_settings_implementation.md`](documentation/websocket_server_settings_implementation.md).
- **Code Quality Rules:** Ensure test coverage, follow lint rules, use Tailwind CSS for UI. See [`./.roo/rules/rules.md`](./.roo/rules/rules.md).

## Debug Agent

- **Troubleshooting Process:** Follow systematic steps: isolate errors, check code/config, investigate environment (Node, pnpm, PATH), reinstall dependencies. See [`cline_docs/troubleshooting_build_errors.md`](cline_docs/troubleshooting_build_errors.md).
- **Logging:**
    - Server Core/API: "Roo Code" VS Code Output Channel.
    - IPC Server Wrapper: "Roo-Code IPC" VS Code Output Channel. ([`documentation/websocket_server_specs.md`](documentation/websocket_server_specs.md:35))
    - Test Client: Console output.
- **Known Issues/Areas to Check:**
    - Build/Environment: See common issues in [`cline_docs/troubleshooting_build_errors.md`](cline_docs/troubleshooting_build_errors.md).
    - IPC Logic: Potential issues identified in [`documentation/system_architecture_report.md`](documentation/system_architecture_report.md:116) (Client ID handling, `cancelTask`, unimplemented methods).
    - Current Focus: Basic command response handling in [`rpc-tcp-test/test-ipc-handler.mjs`](rpc-tcp-test/test-ipc-handler.mjs). Check `_handleMessage` and `pendingRequests` logic. See [`cline_docs/activeContext.md`](cline_docs/activeContext.md).

## Research Agent

- **Available Tools:**
    - Web Search: `brave_search` (MCP `brave-search`), `search_google` (MCP `webresearch`).
    - Web Scraping: `visit_page` (MCP `webresearch`).
    - Library Docs: `context7` MCP server (`resolve-library-id`, `get-library-docs`).
- **Potential Topics:** Specific error messages, `node-ipc` library behavior/bugs, Node.js/TypeScript/pnpm compatibility issues, VS Code extension APIs.

## Architect Agent

- **Key Documents:**
    - Architecture: [`documentation/system_architecture_report.md`](documentation/system_architecture_report.md)
    - Patterns: [`cline_docs/systemPatterns.md`](cline_docs/systemPatterns.md)
    - Plans: [`documentation/rpc_client_library_plan.md`](documentation/rpc_client_library_plan.md)
    - Requirements: [`documentation/websocket_server_specs.md`](documentation/websocket_server_specs.md)
    - API: [`documentation/roocode-api.md`](documentation/roocode-api.md), [`documentation/websocket_api_schema.md`](documentation/websocket_api_schema.md)
