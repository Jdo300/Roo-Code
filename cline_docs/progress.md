# Progress: Roo Code RPC Socket Enhancement

## What Works

-   An initial `node-ipc` based RPC socket implementation exists in `evals/packages/ipc/`.
-   The existing RPC socket server (`evals/packages/ipc/src/server.ts`) handles the following commands:
    -   `StartNewTask`
    -   `CancelTask`
    -   `CloseTask`
-   The RPC socket server broadcasts various `RooCodeEvents` as `TaskEvent` messages to connected clients.
-   The `API` class (`src/exports/api.ts`) integrates the RPC socket with the core extension functionality and provides the full `RooCodeAPI` interface internally.
-   Documentation for the full `RooCodeAPI` exists in `documentation/roocode-api.md`.
-   A proposed API schema for socket communication exists in `documentation/websocket_api_schema.md` (Note: This document is based on WebSockets and needs updating to reflect the `node-ipc` RPC/TCP implementation).

## Previously Fixed Issues

### E2E Test Issues (Still Open)

-   [ ] **ERROR**: Test dependency errors in e2e tests
    -   Cannot find module 'gluegun' or its corresponding type declarations
    -   Cannot find module '@vscode/test-electron' or its corresponding type declarations
    -   Several implicit 'any' type errors in parameters
    -   Note: Not a blocker as these are separate from the RPC socket functionality.

## What's Left to Build

### Current Focus

-   [ ] **Confirm Current API State:** Verify that the `RooCodeAPI` documentation (`documentation/roocode-api.md`) is up-to-date by comparing it against the actual code implementation.
-   [ ] **Verify Project Build and Run:** Ensure the current project state can be built and run successfully.
-   [ ] **Extend RPC Socket Commands:** Modify the RPC socket server to handle all available `RooCodeAPI` methods.
-   [ ] **Implement Unit Tests:** Write unit tests for the newly exposed RPC socket commands.
-   [ ] **Add TCP Configuration:** Implement the ability to configure the `node-ipc` server to use TCP connections via environment variables (`ROO_CODE_IPC_TCP_PORT`, `ROO_CODE_IPC_TCP_HOST`).

### Future Enhancements

-   [ ] **Update Documentation:** Revise `documentation/websocket_api_schema.md` to accurately reflect the `node-ipc` RPC/TCP implementation and update other relevant documentation files.
-   [ ] **Implement Settings UI:** Add a section to the Roo Code settings panel to allow configuration of the RPC socket (socket path, TCP host/port) and related settings through the UI.
-   [ ] **Explore Future Enhancements:** Consider adding example client implementations, enhanced security features, performance optimizations, and other potential improvements as outlined in previous contexts.

## Progress Status

| Component                      | Status      | Notes                                                                 |
| ------------------------------ | ----------- | --------------------------------------------------------------------- |
| RPC Socket Implementation      | 🚧 In Progress | Basic implementation exists, needs extension for full API coverage    |
| TCP Configuration              | ⬜ Not Started | Needs implementation via environment variables                        |
| Unit Tests                     | ⬜ Not Started | Required for new RPC command implementations                          |
| Documentation                  | ⚠️ Needs Update | Existing docs need revision to reflect `node-ipc` RPC/TCP             |
| Settings UI Integration        | ⬜ Not Started | Planned for a later stage                                             |
| **Overall Status**             | 🚧 In Progress | Initial RPC socket exists, significant work remains to expose full API |
