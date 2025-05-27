# Active Context: Testing `roo-ipc-bridge` MCP Server Tools

## Current Task

Systematically test and debug the tools provided by the `roo-ipc-bridge` MCP server. This involves:

- Referencing the MCP Server Design Guide: [`documentation/roo-ipc-mcp-server-design.md`](documentation/roo-ipc-mcp-server-design.md)
- Adapting scenarios from the original IPC Test Scenarios: [`rpc-tcp-test/commands/README.md`](rpc-tcp-test/commands/README.md)
- Investigating and fixing issues in the MCP server wrapper code: `C:\Users\Jason\AppData\Roaming\Roo-Code\MCP\roo-ipc-mcp-server\src\`
- Logging test results and noting if failures relate to known underlying IPC bugs.

## Recent Changes & Findings

- **All Initial MCP Tool Functional Testing Completed:**
    - **Command-Response Tools (Phases 1-5 Equivalents):** All direct command-response tools have been tested and necessary MCP server-side fixes applied.
    - **Event Polling Tools (`roo_ipc_poll_ai_messages`, `roo_ipc_poll_other_events`):** Successfully tested. A critical bug in `C:/Users/Jason/AppData/Roaming/Roo-Code/MCP/roo-ipc-mcp-server/src/index.ts` was fixed (case-sensitivity mismatch for `event.eventName === 'message'`), ensuring correct routing of AI messages vs. other task events to their respective polling queues.
- **Key MCP Server Fixes Summary:**
    - `ipc-client.ts`: Corrected promise handling for payloads containing promises; made `Log` command fire-and-forget.
    - `tool-handlers.ts`: Fixed output validation for several tools; corrected boolean interpretation for `IsTaskInHistory`.
    - `index.ts` (MCP Server): Fixed event routing logic for `message` events.
- **Notable Behaviors:**
    - `roo_ipc_get_token_usage` returns full payload for historical tasks (better than expected).

**Test Log Summary (All Initial MCP tools tested):**

| Tool Tested (MCP Equivalent)     | Status            | Notes                                               |
| -------------------------------- | ----------------- | --------------------------------------------------- |
| `roo_ipc_is_ready`               | Pass              |                                                     |
| `roo_ipc_get_configuration`      | Pass              | Schema flexible.                                    |
| `roo_ipc_start_task`             | Pass              | Output validation fix. Input arg `text`.            |
| `roo_ipc_get_current_task_stack` | Pass              | Output validation fix.                              |
| `roo_ipc_get_messages`           | Pass              | Schema `z.array(z.any())` flexible.                 |
| `roo_ipc_get_token_usage`        | Pass (Contextual) | Works for active & historical tasks.                |
| `roo_ipc_press_primary_button`   | Pass              | Returns `{"success":true}`.                         |
| `roo_ipc_press_secondary_button` | Pass              | Returns `{"success":true}`.                         |
| `roo_ipc_log`                    | Pass (Post-Fix)   | Returns `{"success":true}`.                         |
| `roo_ipc_is_task_in_history`     | Pass (Post-Fix)   | Returns `{"inHistory":true}`. MCP handles IPC `{}`. |
| `roo_ipc_cancel_current_task`    | Pass              |                                                     |
| `roo_ipc_poll_ai_messages`       | Pass (Post-Fix)   | Correctly receives AI message events.               |
| `roo_ipc_poll_other_events`      | Pass (Post-Fix)   | Correctly receives non-AI message task events.      |

_(For a detailed, argument-by-argument test log, a separate `cline_docs/roo_ipc_bridge_test_log.md` might be created or this section expanded)._

## Next Steps

With the initial functional testing of the `roo-ipc-bridge` MCP server complete, the focus shifts to addressing known limitations and improving overall robustness of the underlying system.

1. **Address Remaining Underlying IPC Bugs:**
    - Prioritize fixing the underlying IPC functional failures:
        - `ResumeTask` (IPC command needs fixing)
        - `cancelTask <taskId>` (timeout - investigate if MCP can handle this gracefully or if IPC fix is needed)
        - `closeTask <taskId>` (timeout - investigate if MCP can handle this gracefully or if IPC fix is needed)
    - Address the `CancelCurrentTask` server-side state update timing (IPC bug).
    - Confirm consistency of `GetTokenUsage` for historical tasks (IPC).
    - Ideally, fix `IsTaskInHistory` at the IPC level to return a boolean.
2. **Investigate `ClineProvider.resolveWebviewView()` Behavior:**
    - Understand its impact on task state and potential for premature task removal from `taskMap`. This is crucial for robust task lifecycle management.
3. **Improve Original Test Scripts & Address UI Sync (Lower Priority).**
4. **Verify Delta Streaming (Lowest Priority).**

## Known Underlying IPC Issues to Keep in Mind

- **Functional Failures:** `ResumeTask`, `cancelTask <taskId>` (timeout), `closeTask <taskId>` (timeout).
- **Server-Side Bug:** `CancelCurrentTask` state update timing.
- **Inconsistent/Incorrect IPC Return Values:**
    - `IsTaskInHistory` (returns `{}`, MCP wrapper now handles this).
    - `GetTokenUsage` (behavior for non-active tasks needs consistent verification at IPC level, though MCP seems to get data).

## Current Status

- Initial functional testing of all `roo-ipc-bridge` MCP server tools (command-response and event polling) is complete.
- Several critical fixes applied to the MCP server (`ipc-client.ts`, `tool-handlers.ts`, `index.ts`).
- **Primary Focus:** Address critical underlying IPC bugs and investigate `resolveWebviewView` behavior.
