# Active Context: IPC Command Testing

## Current Task

Complete the final remaining scenarios from the `rpc-tcp-test/commands/README.md` test plan to get a full overview of IPC command status.

## Recent Changes & Findings

- The IPC test suite in `rpc-tcp-test/` is fully converted to `.cjs` (CommonJS).
- **Phases 1-5 Testing (Most Commands):** Completed. Identified several functional failures and test script issues.
    - **Functional Failures Noted:** `ResumeTask`, `Log` (timeout), `IsTaskInHistory`, `GetTokenUsage`.
    - **Test Script Issues Noted:** `SendMessage` (arg parsing), `PressPrimaryButton`/`PressSecondaryButton` (assertion mismatch), general script reliance on hardcoded values.
    - **Server-Side Bug (Deferred Fix):** `CancelCurrentTask` state update timing.
    - **UI Sync Issue (Deferred Fix):** `setActiveProfile`.
- **Remaining Tests from README:** `cancelTask.cjs <taskId>`, `closeTask.cjs <taskId>`, and a specific sequence for `clearCurrentTask.cjs`.

## Next Steps (Revised Priority)

1.  **Execute Remaining IPC Command Tests:**
    - Run `cancelTask.cjs <taskId>` (requires starting a task first).
    - Run `closeTask.cjs <taskId>` (requires starting a task first).
    - Run the sequence: `startNewTask.cjs "Task for clear"`, then `clearCurrentTask.cjs "Clearing this task"`, then `getCurrentTaskStack.cjs`.
    - Log results.
2.  **Address Critical Bugs (After Full Test Suite Run):**
    - Prioritize fixing: `ResumeTask`, `Log` (timeout), `IsTaskInHistory`, `GetTokenUsage`.
    - Then address `CancelCurrentTask` server-side logic.
    - Re-run relevant test sequences to verify fixes.
3.  **Improve Test Scripts (Address Phase 2 Findings - Lower Priority):**
    - Modify test scripts to accept and use command-line arguments.
    - Fix assertion issues (`PressButton` scripts) and argument parsing (`SendMessage`).
4.  **Investigate UI Synchronization Issue (`setActiveProfile` - Lower Priority):**
    - Debug the disconnect between server state and UI updates.
5.  **Verify Delta Streaming (Lowest Priority):**
    - Once basic command functionality is robust and critical bugs are fixed, verify delta streaming.

## Current Status

- IPC testing framework is `.cjs`. Most commands have been tested, revealing several issues.
- **Primary Focus:** Execute the final few command scenarios from the `README.md`.
- Fixing identified bugs and improving test scripts will follow the full test run.
- Delta streaming verification is paused.
