# Roo Code IPC Command Test Scripts

This directory contains individual Node.js scripts designed to test each command supported by the Roo Code IPC server via TCP.

## Prerequisites

1. **Running Server:** Ensure the Roo Code extension is running in VS Code, as it hosts the TCP IPC server.
2. **Node.js:** You need Node.js installed to execute these scripts.
3. **Dependencies:** Run `npm install` or `pnpm install` in the `rpc-tcp-test` directory if you haven't already (to install `node-ipc`).

## Client Library

These scripts utilize the `ipc-client.mjs` library located in the parent directory (`../ipc-client.mjs`). This library handles the connection, message formatting, request/response matching, and event handling.

## Running Scripts

Each script tests a single command. Run them from the root `rpc-tcp-test` directory or ensure your Node path resolves correctly.

**General Format:** `node commands/<script_name.mjs> [arguments...]`

---

## Suggested Test Scenario / Order

The following provides a logical sequence for testing the commands, considering dependencies like needing a `taskId`. You will need to manually copy the `taskId` output from `startNewTask.mjs` and use it as a command-line argument for subsequent scripts that require it.

**Phase 1: Initial Checks & Setup**

1.  `node commands/isReady.mjs` - Verify basic connection.
2.  `node commands/getConfiguration.mjs` - Check initial configuration.
3.  `node commands/getProfiles.mjs` - Check initial profiles.
4.  `node commands/getActiveProfile.mjs` - Check initial active profile (likely 'default').
5.  `node commands/getCurrentTaskStack.mjs` - Verify task stack is empty.
6.  `node commands/setConfiguration.mjs` - Test setting a sample configuration (modify script for different values).
7.  `node commands/getConfiguration.mjs` - Verify configuration was updated.
8.  `node commands/createProfile.mjs` - Creates a profile like `test-profile-xxxx`.
9.  `node commands/getProfiles.mjs` - Verify the new profile appears in the list.
10. `node commands/setActiveProfile.mjs test-profile-xxxx` - Activate the created profile (replace `xxxx` with actual hex value from step 8 output if needed, or use the name logged by the script).
11. `node commands/getActiveProfile.mjs` - Verify the new profile is active.

**Phase 2: Task Lifecycle**

1.  `node commands/startNewTask.mjs "Test prompt for scenario"` - Start a task. **Copy the output `<taskId>`**.
2.  `node commands/getCurrentTaskStack.mjs` - Verify the new task appears.
3.  `node commands/getMessages.mjs <taskId>` - Check initial messages.
4.  `node commands/getTokenUsage.mjs <taskId>` - Check initial token usage.
5.  `node commands/sendMessage.mjs "Follow-up message"` - Send a message to the task.
6.  _(Interact with Roo Code UI if needed - e.g., if it pauses or asks for input)_
7.  `node commands/pressPrimaryButton.mjs` - Test primary button press (if applicable).
8.  `node commands/pressSecondaryButton.mjs` - Test secondary button press (if applicable).
9.  `node commands/resumeTask.mjs <taskId>` - Test resuming (if task was paused).
10. `node commands/log.mjs "Logging during task"` - Test logging.
11. `node commands/getMessages.mjs <taskId>` - Check messages again.
12. `node commands/getTokenUsage.mjs <taskId>` - Check token usage again.
13. `node commands/cancelTask.mjs <taskId>` - Cancel the specific task.
14. `node commands/isTaskInHistory.mjs <taskId>` - Verify task is considered historical/inactive.
15. `node commands/getCurrentTaskStack.mjs` - Verify task is removed from active stack.

**Phase 3: Alternative Endings & Cleanup**

1.  `node commands/startNewTask.mjs "Another test task"` - Start a second task. **Copy `<taskId2>`**.
2.  `node commands/clearCurrentTask.mjs "Clearing this second task"` - Test clearing the current task (should be `<taskId2>`).
3.  `node commands/getCurrentTaskStack.mjs` - Verify stack is empty.
4.  `node commands/startNewTask.mjs "Task to close"` - Start a third task. **Copy `<taskId3>`**.
5.  `node commands/closeTask.mjs <taskId3>` - Test closing the task.
6.  `node commands/getCurrentTaskStack.mjs` - Verify stack is empty.
7.  `node commands/deleteProfile.mjs` - Deletes the temporary profile created by its own script run.
8.  `node commands/setActiveProfile.mjs default` - Switch back to the default profile.
9.  `node commands/getProfiles.mjs` - Verify temporary test profile is gone.

---

## Command Scripts

### Simple Getters (No Arguments Required)

- **`isReady.mjs`**

    - **Command:** `IsReady`
    - **Purpose:** Checks if the server is ready to accept commands.
    - **Usage:** `node commands/isReady.mjs`

- **`getConfiguration.mjs`**

    - **Command:** `GetConfiguration`
    - **Purpose:** Retrieves the current Roo Code configuration.
    - **Usage:** `node commands/getConfiguration.mjs`

- **`getProfiles.mjs`**

    - **Command:** `GetProfiles`
    - **Purpose:** Gets the list of available user profiles.
    - **Usage:** `node commands/getProfiles.mjs`

- **`getActiveProfile.mjs`**

    - **Command:** `GetActiveProfile`
    - **Purpose:** Gets the name of the currently active profile.
    - **Usage:** `node commands/getActiveProfile.mjs`

- **`getCurrentTaskStack.mjs`**
    - **Command:** `GetCurrentTaskStack`
    - **Purpose:** Retrieves information about the current task stack.
    - **Usage:** `node commands/getCurrentTaskStack.mjs`

### Simple Actions (No Arguments Required)

- **`cancelCurrentTask.mjs`**

    - **Command:** `CancelCurrentTask`
    - **Purpose:** Attempts to cancel the currently active task (if any).
    - **Usage:** `node commands/cancelCurrentTask.mjs`
    - **Note:** More meaningful if a task is active.

- **`pressPrimaryButton.mjs`**

    - **Command:** `PressPrimaryButton`
    - **Purpose:** Simulates pressing the primary button in the UI (if applicable to the current task state).
    - **Usage:** `node commands/pressPrimaryButton.mjs`
    - **Note:** Effect depends on server/task state.

- **`pressSecondaryButton.mjs`**
    - **Command:** `PressSecondaryButton`
    - **Purpose:** Simulates pressing the secondary button in the UI (if applicable).
    - **Usage:** `node commands/pressSecondaryButton.mjs`
    - **Note:** Effect depends on server/task state.

### Configuration / Profile Management (Arguments Required)

- **`setConfiguration.mjs`**

    - **Command:** `SetConfiguration`
    - **Purpose:** Sets configuration values. The script sends a predefined sample configuration.
    - **Usage:** `node commands/setConfiguration.mjs`
    - **Note:** Modify the `sampleConfiguration` object within the script to test different settings.

- **`createProfile.mjs`**

    - **Command:** `CreateProfile`
    - **Purpose:** Creates a new profile. Generates a unique name automatically for testing.
    - **Usage:** `node commands/createProfile.mjs`

- **`setActiveProfile.mjs`**

    - **Command:** `SetActiveProfile`
    - **Purpose:** Sets the active profile. Uses "default" by default.
    - **Usage:** `node commands/setActiveProfile.mjs [profileName]`
    - **Argument:** `[profileName]` (Optional) - Profile name to activate (defaults to 'default'). Profile must exist.

- **`deleteProfile.mjs`**
    - **Command:** `DeleteProfile`
    - **Purpose:** Deletes a profile. Creates and then attempts to delete a temporary profile.
    - **Usage:** `node commands/deleteProfile.mjs`

### Task Interaction (Arguments Required)

**Note:** Most of these commands require a `taskId`. You typically get a `taskId` by running `startNewTask.mjs` first.

- **`startNewTask.mjs`**

    - **Command:** `StartNewTask`
    - **Purpose:** Starts a new task with an initial prompt. Returns the `taskId`.
    - **Usage:** `node commands/startNewTask.mjs ["Initial prompt text"]`
    - **Argument:** `["Initial prompt text"]` (Optional) - The initial message for the task (defaults to "What is the capital of France?"). Remember to use quotes if the prompt contains spaces.
    - **Output:** Logs the `taskId` needed for other commands.

- **`cancelTask.mjs`**

    - **Command:** `CancelTask`
    - **Purpose:** Cancels a specific task by its ID.
    - **Usage:** `node commands/cancelTask.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the task to cancel.

- **`closeTask.mjs`**

    - **Command:** `CloseTask`
    - **Purpose:** Closes a specific task by its ID.
    - **Usage:** `node commands/closeTask.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the task to close.

- **`getMessages.mjs`**

    - **Command:** `GetMessages`
    - **Purpose:** Retrieves the message history for a specific task.
    - **Usage:** `node commands/getMessages.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the task to query.

- **`getTokenUsage.mjs`**

    - **Command:** `GetTokenUsage`
    - **Purpose:** Retrieves token usage information for a specific task.
    - **Usage:** `node commands/getTokenUsage.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the task to query.

- **`resumeTask.mjs`**

    - **Command:** `ResumeTask`
    - **Purpose:** Resumes a previously paused task.
    - **Usage:** `node commands/resumeTask.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the paused task to resume.

- **`isTaskInHistory.mjs`**

    - **Command:** `IsTaskInHistory`
    - **Purpose:** Checks if a task with the given ID exists in the history.
    - **Usage:** `node commands/isTaskInHistory.mjs <taskId>`
    - **Argument:** `<taskId>` (Required) - The ID of the task to check.

- **`log.mjs`**

    - **Command:** `Log`
    - **Purpose:** Sends a message to be logged by the server.
    - **Usage:** `node commands/log.mjs ["Log message text"]`
    - **Argument:** `["Log message text"]` (Optional) - The message to log (defaults to a timestamped message). Use quotes for spaces.

- **`clearCurrentTask.mjs`**

    - **Command:** `ClearCurrentTask`
    - **Purpose:** Clears the currently active task, optionally sending a final message.
    - **Usage:** `node commands/clearCurrentTask.mjs ["Optional last message"]`
    - **Argument:** `["Optional last message"]` (Optional) - A message to associate with the clearing action. Use quotes for spaces.

- **`sendMessage.mjs`**
    - **Command:** `SendMessage`
    - **Purpose:** Sends a message (and optionally images) to the currently active task.
    - **Usage:** `node commands/sendMessage.mjs ["Message text"]`
    - **Argument:** `["Message text"]` (Optional) - The text message to send (defaults to a test message). Use quotes for spaces.
    - **Note:** To send images, you would need to modify the script to include base64 strings in the `messagePayload`.

### Event Monitoring

- **`monitorTaskEvents.mjs`**
- **Purpose:** Connects to the server and listens for various asynchronous `TaskEvent` messages (e.g., `message`, `taskStarted`, `taskPaused`, `taskCompleted`, `commandResponseUnmatched`). It logs these events to the console.
- **Special Handling:** It specifically avoids logging the full payload of `GetConfiguration` responses to prevent terminal flooding, logging a summary instead.
- **Usage (Passive Listening):** `node commands/monitorTaskEvents.mjs`
    - In this mode, it will listen for events from any ongoing or new task activity (e.g., tasks initiated via the Roo Code UI).
- **Usage (Active Task Monitoring):** `node commands/monitorTaskEvents.mjs ["Initial prompt for new task"]`
    - **Argument:** `["Initial prompt for new task"]` (Optional) - If provided, the script will attempt to start a new task with this prompt and then monitor its events. Remember to use quotes if the prompt contains spaces.
- **Note:** This script will stay running until manually stopped (Ctrl+C). It's useful for observing the flow of events during a task's lifecycle.

---
