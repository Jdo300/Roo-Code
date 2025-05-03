# RooCode API Documentation

Roo Code is a VS Code extension that provides AI-assisted coding features, allowing developers to interact with a language model directly within their IDE. The Roo Code API enables external applications to communicate with the extension through node-ipc, leveraging its capabilities for both Unix domain sockets and TCP connections.

To get the `RooCodeAPI` instance, you can use the following code after the Roo extension has been activated and is ready:

```typescript
const extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-code")
if (extension) {
	const rooCodeAPI = await extension.activate()
	if (rooCodeAPI?.isReady()) {
		// RooCodeAPI is ready to use.
		rooCodeAPI.on("message", (message) => {
			// Handle messages...
		})
	}
}
```

### `RooCodeAPI` Interface

Here is the documentation for each method in the `RooCodeAPI` interface, as defined in `src/exports/roo-code.d.ts`:

#### `startNewTask(params: { configuration: RooCodeSettings, text?: string, images?: string[], newTab?: boolean }): Promise<string>`

**Description:**
Starts a new task with optional initial message, images, configuration, and tab behavior.

**Parameters:**

- `params`: `{ configuration: RooCodeSettings, text?: string, images?: string[], newTab?: boolean }` - An object containing the task parameters.
    - `configuration`: `RooCodeSettings` - The configuration settings to use for this task.
    - `text?`: `string` (optional) - Initial task message.
    - `images?`: `string[]` (optional) - Array of image data URIs (e.g., "data:image/webp;base64,...").
    - `newTab?`: `boolean` (optional) - If true, opens the task in a new tab.

**Return Type:**
`Promise<string>` - The unique ID of the new task. This ID is used to interact with the task in subsequent API calls (e.g., `getMessages`, `getTokenUsage`).

---

#### `getCurrentTaskStack(): string[]`

**Description:**
Returns the current task stack.

**Return Type:**
`string[]` - An array of task IDs, representing the hierarchy of nested tasks. The last element in the array is the currently active task.

---

#### `clearCurrentTask(lastMessage?: string): Promise<void>`

**Description:**
Clears the current task.

**Parameters:**

- `lastMessage?`: `string` (optional) - Optional last message to send before clearing the task.

**Return Type:**
`Promise<void>` - Resolves when the current task is cleared.

---

#### `cancelCurrentTask(): Promise<void>`

**Description:**
Cancels the current task.

**Return Type:**
`Promise<void>` - Resolves when the current task is cancelled.

---

#### `sendMessage(message?: string, images?: string[]): Promise<void>`

**Description:**
Sends a message to the current task.

**Parameters:**

- `message?`: `string` (optional) - Message to send.
- `images?`: `string[]` (optional) - Array of image data URIs (e.g., "data:image/webp;base64,...").

**Return Type:**
`Promise<void>` - Resolves when the message is sent.

---

### `pressPrimaryButton(): Promise<void>`

**Description:**
Simulates pressing the primary button in the chat interface.

**Return Type:**
`Promise<void>` - Resolves when the primary button press is simulated.

---

### `pressSecondaryButton(): Promise<void>`

**Description:**
Simulates pressing the secondary button in the chat interface.

**Return Type:**
`Promise<void>` - Resolves when the secondary button press is simulated.

---

### `setConfiguration(values: Partial<ConfigurationValues>): Promise<void>`

**Description:**
Sets the configuration for the current task.

**Parameters:**

- `values`: `Partial<ConfigurationValues>` - An object containing key-value pairs to set. See the `ConfigurationValues` type definition for available options.

**Return Type:**
`Promise<void>` - Resolves when the configuration is set.

---

### `isReady(): boolean`

**Description:**
Returns true if the API is ready to use (the webview has been launched).

**Return Type:**
`boolean` - `true` if the API is ready, `false` otherwise.

---

### `getMessages(taskId: string): ClineMessage[]`

**Description:**
Returns the messages for a given task.

**Parameters:**

- `taskId`: `string` - The ID of the task.

**Return Type:**
`ClineMessage[]` - An array of `ClineMessage` objects. See the `ClineMessage` interface definition for details.

---

### `getTokenUsage(taskId: string): TokenUsage`

**Description:**
Returns the token usage for a given task.

**Parameters:**

- `taskId`: `string` - The ID of the task.

**Return Type:**
`TokenUsage` - A `TokenUsage` object. See the `TokenUsage` interface definition for details.

---

### `log(message: string): void`

**Description:**
Logs a message to the extension's output channel.

**Parameters:**

- `message`: `string` - The message to log.

**Return Type:**
`void` - This method does not return a value

---

#### `resumeTask(taskId: string): Promise<void>`

**Description:**
Resumes a paused task.

**Parameters:**

- `taskId`: `string` - The ID of the task to resume.

**Return Type:**
`Promise<void>` - Resolves when the task is resumed.

---

#### `isTaskInHistory(taskId: string): boolean`

**Description:**
Checks if a task with the given ID exists in the task history.

**Parameters:**

- `taskId`: `string` - The ID of the task to check.

**Return Type:**
`boolean` - `true` if the task is in history, `false` otherwise.

---

#### `getConfiguration(): RooCodeSettings`

**Description:**
Retrieves the current configuration settings for Roo Code.

**Return Type:**
`RooCodeSettings` - An object containing the current configuration settings.

---

#### `createProfile(name: string): Promise<void>`

**Description:**
Creates a new configuration profile with the specified name based on the current settings.

**Parameters:**

- `name`: `string` - The name for the new profile.

**Return Type:**
`Promise<void>` - Resolves when the profile is created.

---

#### `getProfiles(): Promise<string[]>`

**Description:**
Retrieves a list of available configuration profile names.

**Return Type:**
`Promise<string[]>` - A promise that resolves with an array of profile names.

---

#### `setActiveProfile(name: string): Promise<void>`

**Description:**
Sets the active configuration profile by name. This loads the settings from the specified profile.

**Parameters:**

- `name`: `string` - The name of the profile to activate.

**Return Type:**
`Promise<void>` - Resolves when the profile is activated.

---

#### `getActiveProfile(): Promise<string | undefined>`

**Description:**
Retrieves the name of the currently active configuration profile.

**Return Type:**
`Promise<string | undefined>` - A promise that resolves with the name of the active profile, or `undefined` if no profile is explicitly active.

---

#### `deleteProfile(name: string): Promise<void>`

**Description:**
Deletes a configuration profile by name.

**Parameters:**

- `name`: `string` - The name of the profile to delete.

**Return Type:**
`Promise<void>` - Resolves when the profile is deleted.

---

#### `resumeTask(taskId: string): Promise<void>`

**Description:**
Resumes a paused task.

**Parameters:**

- `taskId`: `string` - The ID of the task to resume.

**Return Type:**
`Promise<void>` - Resolves when the task is resumed.

---

#### `isTaskInHistory(taskId: string): boolean`

**Description:**
Checks if a task with the given ID exists in the task history.

**Parameters:**

- `taskId`: `string` - The ID of the task to check.

**Return Type:**
`boolean` - `true` if the task is in history, `false` otherwise.

---

#### `cancelTask(taskId: string): Promise<void>`

**Description:**
Cancels a specific task.

**Parameters:**

- `taskId`: `string` - The ID of the task to cancel.

**Return Type:**
`Promise<void>` - Resolves when the task is cancelled.

---

#### `getConfiguration(): RooCodeSettings`

**Description:**
Retrieves the current configuration settings for Roo Code.

**Return Type:**
`RooCodeSettings` - An object containing the current configuration settings.

---

#### `createProfile(name: string): Promise<void>`

**Description:**
Creates a new configuration profile with the specified name based on the current settings.

**Parameters:**

- `name`: `string` - The name for the new profile.

**Return Type:**
`Promise<void>` - Resolves when the profile is created.

---

#### `getProfiles(): Promise<string[]>`

**Description:**
Retrieves a list of available configuration profile names.

**Return Type:**
`Promise<string[]>` - A promise that resolves with an array of profile names.

---

#### `setActiveProfile(name: string): Promise<void>`

**Description:**
Sets the active configuration profile by name. This loads the settings from the specified profile.

**Parameters:**

- `name`: `string` - The name of the profile to activate.

**Return Type:**
`Promise<void>` - Resolves when the profile is activated.

---

#### `getActiveProfile(): Promise<string | undefined>`

**Description:**
Retrieves the name of the currently active configuration profile.

**Return Type:**
`Promise<string | undefined>` - A promise that resolves with the name of the active profile, or `undefined` if no profile is explicitly active.

---

#### `deleteProfile(name: string): Promise<void>`

**Description:**
Deletes a configuration profile by name.

**Parameters:**

- `name`: `string` - The name of the profile to delete.

**Return Type:**
`Promise<void>` - Resolves when the profile is deleted.

---

### Usage Example

Here's a comprehensive example demonstrating a typical interaction with the Roo Code API:

```typescript
async function exampleUsage() {
	const extension = vscode.extensions.getExtension("RooVeterinaryInc.roo-code")

	if (!extension) {
		console.error("Roo Code extension not found!")
		return
	}

	const rooCodeAPI: RooCodeAPI = await extension.activate()

	if (!rooCodeAPI.isReady()) {
		console.warn("RooCodeAPI is not ready yet. Make sure the Roo Code side panel is open.")
		return
	}

	// Set a configuration (optional)
	await rooCodeAPI.setConfiguration({ modelMaxTokens: 2048 })

	// Start a new task
	const taskId = await rooCodeAPI.startNewTask(
		"Write a Python function to find the greatest common divisor (GCD) of two numbers.",
	)

	// Listen for messages
	rooCodeAPI.on("message", ({ taskId: messageTaskId, action, message }) => {
		if (taskId !== messageTaskId) {
			return // Ignore messages for other tasks
		}

		if (action === "created") {
			console.log(`New message for task ${taskId}:`, message)

			if (message.type === "say" && message.text) {
				console.log("Roo says:", message.text)
			} else if (message.type === "ask" && message.text) {
				console.log("Roo asks:", message.text)
				// You would typically prompt the user for a response here
				// and send it back using rooCodeAPI.sendMessage(). For example:
				// if (message.ask === 'tool') {
				//    const userResponse = confirm("Roo wants to use a tool. Approve?");
				//    rooCodeAPI.sendMessage(userResponse ? "yes" : "no");
				//}
			}
		} else if (action === "updated") {
			console.log(`Updated message for task ${taskId}:`, message)

			if (message.partial) {
				console.log("Partial content:", message.text)
			} else {
				console.log("Full message content:", message.text)
			}
		}
	})

	// Send a follow-up message
	await rooCodeAPI.sendMessage("Can you add a docstring to the function?")

	// Simulate user pressing the primary button (e.g., to accept code)
	await rooCodeAPI.pressPrimaryButton()

	// Get all messages for the task (after it's finished)
	const allMessages = rooCodeAPI.getMessages(taskId)
	console.log("All messages for task:", allMessages) // Process messages here

	// Get token usage for the task (after it's finished)
	const tokenUsage = rooCodeAPI.getTokenUsage(taskId)
	console.log("Token usage:", tokenUsage) // Log or analyze token usage
}

// Call the example function (you might want to trigger this from a command)
exampleUsage()
```

---

## RooCodeEvents Interface

The `RooCodeAPI` extends `EventEmitter<RooCodeEvents>`. This means you can listen for events emitted by the API using the `.on()` method. The following events are available:

```typescript
interface RooCodeEvents {
	message: [{ taskId: string; action: "created" | "updated"; message: ClineMessage }]
	taskStarted: [taskId: string]
	taskPaused: [taskId: string]
	taskUnpaused: [taskId: string]
	taskAskResponded: [taskId: string]
	taskAborted: [taskId: string]
	taskSpawned: [taskId: string, childTaskId: string]
	taskCompleted: [taskId: string, usage: TokenUsage, toolUsage: any]
	taskTokenUsageUpdated: [taskId: string, usage: TokenUsage]
	taskCreated: [taskId: string]
	taskModeSwitched: [taskId: string, modeSlug: string]
	taskToolFailed: [taskId: string, toolName: string, error: any]
}
```

- **`message`**: The primary event for real-time communication. See detailed documentation below.
- **`taskStarted`**: Emitted when a new task is started. Payload: `[taskId: string]`.
- **`taskPaused`**: Emitted when a task is paused (e.g., waiting for a sub-task). Payload: `[taskId: string]`.
- **`taskUnpaused`**: Emitted when a paused task is resumed. Payload: `[taskId: string]`.
- **`taskAskResponded`**: Emitted when the user responds to an 'ask' prompt. Payload: `[taskId: string]`.
- **`taskAborted`**: Emitted when a task is aborted. Payload: `[taskId: string]`.
- **`taskSpawned`**: Emitted when a new sub-task is spawned. Payload: `[taskId: string, childTaskId: string]`.
- **`taskCompleted`**: Emitted when a task is completed. Payload: `[taskId: string, usage: TokenUsage, toolUsage: any]`.
- **`taskTokenUsageUpdated`**: Emitted when the token usage for a task is updated. Payload: `[taskId: string, usage: TokenUsage]`.
- **`taskCreated`**: Emitted when a new task is created. Payload: `[taskId: string]`.
- **`taskModeSwitched`**: Emitted when the mode of a task is switched. Payload: `[taskId: string, modeSlug: string]`.
- **`taskToolFailed`**: Emitted when a tool execution fails within a task. Payload: `[taskId: string, toolName: string, error: any]`.

**Example of handling other events:**

```typescript
rooCodeAPI.on("taskStarted", (taskId) => {
	console.log(`Task started: ${taskId}`)
})

rooCodeAPI.on("taskCompleted", (taskId, usage) => {
	console.log(`Task completed: ${taskId}, Total Tokens: ${usage.totalTokensIn + usage.totalTokensOut}`)
})
```

---

### `message` event

**Description:**

This is the core event for real-time communication with the Roo Code API. It is emitted by the `RooCodeAPI` instance whenever a new message is created or an existing message is updated within a Cline task. This event serves as the primary mechanism for receiving various types of real-time updates from Roo, including streamed responses, tool outputs, and task status changes.

The event is emitted in the following scenarios:

- **New message creation (`action: "created"`):** When a new message is added to the chat history. This typically occurs for:
    - The initial task message.
    - User feedback messages.
    - Tool execution requests.
    - Discrete, non-streaming messages.
- **Message update (`action: "updated"`):** When an existing message is updated, primarily during streaming responses.

**Payload Structure:**

The event payload is a JSON object with the following properties:

- `taskId`: `string` - The unique identifier of the task.
- `action`: `\"created\" | \"updated\"` - Indicates new message or update.
- `message`: `ClineMessage` - The message object (detailed below).

---

**`ClineMessage` Interface:**

```typescript
interface ClineMessage {
	ts?: number
	type: "say" | "ask" | "error"
	say?:
		| "user_feedback"
		| "api_request"
		| "api_response"
		| "tool_code"
		| "tool_code_block"
		| "tool_error"
		| "tool_result"
		| "text"
		| "error"
		| "reasoning"
		| "command_output"
		| "shell_integration_warning"
		| "api_req_started"
		| "api_req_finished"
		| "api_req_failed"
		| "api_req_retried"
		| "api_req_retry_delayed"
		| "checkpoint_saved"
		| "user_feedback_diff"
		| "browser_action_result"
		| "browser_action"
		| "mcp_server_request_started"
		| "mcp_server_response"
		| "completion_result"
		| "rooignore_error"
		| "api_req_deleted"
		| "api_req_truncated"
	ask?:
		| "tool_code_review_confirm"
		| "tool_code_review_apply"
		| "tool_code_review_reject"
		| "tool"
		| "command"
		| "followup"
		| "use_mcp_server"
		| "resume_task"
		| "resume_completed_task"
		| "api_req_failed"
		| "completion_result"
		| "browser_action_launch"
	text?: string
	images?: string[]
	partial?: boolean
	error?: boolean
	checkpoint?: Record<string, unknown>
	progressStatus?: ToolProgressStatus
}
```

**Properties of `ClineMessage`:** (See `ClineMessage` interface above for details)

**`message.type` and Subtype Values:**

| `message.type` | `say` values                   | `ask` values                 | Description                                    |
| -------------- | ------------------------------ | ---------------------------- | ---------------------------------------------- |
| **`'say'`**    | `'user_feedback'`              |                              | User feedback or responses                     |
|                | `'api_request'`                |                              | (Internal) Details of API requests             |
|                | `'api_response'`               |                              | (Internal) API responses                       |
|                | `'tool_code'`                  |                              | Code generated by Roo for tool execution       |
|                | `'tool_code_block'`            |                              | Code blocks for display (e.g., in code review) |
|                | `'tool_error'`                 |                              | Errors from tool execution                     |
|                | `'tool_result'`                |                              | Successful tool execution results              |
|                | `'text'`                       |                              | General text messages from Roo                 |
|                | `'error'`                      |                              | Error messages displayed in the UI             |
|                | `'reasoning'`                  |                              | (Internal) Roo's step-by-step reasoning        |
|                | `'command_output'`             |                              | Output from executed CLI commands              |
|                | `'shell_integration_warning'`  |                              | Warnings related to terminal shell integration |
|                | `'api_req_started'`            |                              | (Internal) Start of API requests               |
|                | `'api_req_finished'`           |                              | (Internal) Completion of API requests          |
|                | `'api_req_failed'`             |                              | API request failures                           |
|                | `'api_req_retried'`            |                              | (Internal) API request retries                 |
|                | `'api_req_retry_delayed'`      |                              | (Internal) Delays before retrying API requests |
|                | `'checkpoint_saved'`           |                              | Task state checkpoint saved                    |
|                | `'user_feedback_diff'`         |                              | (Internal) User feedback diffs on code changes |
|                | `'browser_action_result'`      |                              | Results from browser actions                   |
|                | `'browser_action'`             |                              | (Internal) Browser action execution            |
|                | `'mcp_server_request_started'` |                              | (Internal) MCP server request start            |
|                | `'mcp_server_response'`        |                              | MCP server responses                           |
|                | `'completion_result'`          |                              | Task or sub-task completion results            |
|                | `'rooignore_error'`            |                              | `.rooignore` file access errors                |
|                | `'api_req_deleted'`            |                              | (Internal) API request deletion                |
|                | `'api_req_truncated'`          |                              | (Internal) API request truncation              |
| **`'ask'`**    |                                | `'tool_code_review_confirm'` | User confirmation for code review changes      |
|                |                                | `'tool_code_review_apply'`   | User prompt to apply code review changes       |
|                |                                | `'tool_code_review_reject'`  | User prompt to reject code review changes      |
|                |                                | `'tool'`                     | Generic tool execution approval prompt         |
|                |                                | `'command'`                  | CLI command execution confirmation             |
|                |                                | `'followup'`                 | Follow-up question to the user                 |
|                |                                | `'use_mcp_server'`           | MCP server tool or resource usage confirmation |
|                |                                | `'resume_task'`              | Task resumption prompt                         |
|                |                                | `'resume_completed_task'`    | Prompt to resume a completed task              |
|                |                                | `'api_req_failed'`           | API request retry prompt                       |
|                |                                | `'completion_result'`        | User feedback prompt on task completion        |
|                |                                | `'browser_action_launch'`    | Browser launch confirmation prompt             |

**Streaming Behavior:**

Roo Code API utilizes a streaming mechanism for delivering long responses. This is handled through the `message` event, using `action: "updated"` and `message.partial`.

1. **Initial Message:** A streaming task starts with `message` event with `action: "created"`.
2. **Partial Updates (`action: "updated"`, `message.partial: true`):** Roo sends chunks of data via `message` events with `action: "updated"` and `message.partial` set to `true`. Accumulate these chunks.
3. **Final Update (`action: "updated"`, `message.partial: false`):** A final `message` event with `action: "updated"` and `message.partial` set to `false` indicates the stream is complete. Combine all partial chunks for the full response.

**Important Considerations:**

- **Order:** `message` events with `action: "updated"` are guaranteed to arrive in the correct order.
- **`taskId`:** Use `taskId` to associate messages with the correct task.
- **Buffering:** Implement a temporary buffer to store incoming partial chunks.
- **Cleanup:** After the final chunk, process the complete message and clear the buffer.
- **Error Handling:** Be prepared for errors. You might receive a `message` event with `message.type` set to `'error'`.
- **Not all messages are streamed:** Only long messages are streamed. Discrete messages are sent as single `message` events with `action: "created"`.

---

## Configuration and Profiles

The Roo Code API allows external applications to manage the extension's configuration settings and utilize configuration profiles.

### `RooCodeSettings`

The configuration settings are represented by the `RooCodeSettings` type. This type encompasses various options that control Roo's behavior, such as API provider, model settings, and other preferences. You can find the complete definition of `RooCodeSettings` in the codebase (e.g., related to `ConfigurationValues` and settings management).

The `setConfiguration(values: Partial<ConfigurationValues>): Promise<void>` method allows you to update a subset of these settings for the current task or globally, depending on the context of the API call.

The new `getConfiguration(): RooCodeSettings` method allows you to retrieve the current active configuration.

### Configuration Profiles

Roo Code supports saving and loading configuration profiles, allowing users to quickly switch between different sets of settings. The API provides methods to manage these profiles:

- `createProfile(name: string)`: Saves the current configuration as a new profile with the given name.
- `getProfiles()`: Retrieves a list of all saved profile names.
- `setActiveProfile(name: string)`: Loads and applies the settings from a saved profile, making it the active configuration.
- `getActiveProfile()`: Returns the name of the currently active profile.
- `deleteProfile(name: string)`: Removes a saved profile.

These profile management features enable external applications to integrate with Roo's configuration system and provide profile switching capabilities.

---

### Type Definitions

Here are brief descriptions of some important types used by the Roo Code API:

- **`ConfigurationValues`**: This type represents the configuration settings for the Roo Code extension. It's a mapped type where keys are configuration options (like `apiProvider`, `modelMaxTokens`, etc.) and values are the corresponding settings. You can find the complete list of configuration keys in `src/shared/globalState.ts`. You typically interact with this type using the `setConfiguration` method.

- **`TokenUsage`**: This interface represents the token usage statistics for an API request.

    ```typescript
    interface TokenUsage {
    	totalTokensIn: number
    	totalTokensOut: number
    	totalCacheWrites?: number
    	totalCacheReads?: number
    	totalCost: number
    	contextTokens: number
    }
    ```

- **`ToolProgressStatus`**: This type is used to provide visual feedback on the progress of long-running tools.

    ```typescript
    export type ToolProgressStatus = {
    	icon?: string
    	text?: string
    }
    ```

    - `icon?`: (Optional) The name of a codicon to display. See available codicons [here](https://microsoft.github.io/vscode-codicons/dist/codicon.html).
    - `text?`: (Optional) A text description of the progress status.

- **`ClineMessage`**: This interface represents a message in the chat history. See the detailed definition above, in the `message` event section.

---

## Implementation Details

This section provides brief insights into some internal aspects of the Roo Code API implementation.

### Logging

The `log(message: string): void` method provides a way to send messages to the Roo Code extension's output channel. This is useful for debugging and monitoring the interaction between your external application and the extension. Messages sent via this method will appear in the "Roo Code" output channel in VS Code.

### IPC Server Integration

The `RooCodeAPI` class integrates with a node-ipc based Inter-Process Communication (IPC) server. This server facilitates communication between the main VS Code extension process and other processes, such as the webview or external applications connecting via the API. The IPC server supports both Unix domain sockets and TCP connections, providing flexibility in how external applications can connect.

Key features of the IPC integration:

- **Connection Types:** Supports both Unix domain sockets (for local processes) and TCP connections (for remote processes)
- **Message Types:** Uses structured message types (TaskCommand, TaskEvent, Ack) for reliable communication
- **Client Identification:** Maintains unique client IDs for proper message routing
- **Connection Lifecycle:** Handles connect, disconnect, and acknowledgment messages
- **Error Handling:** Provides robust error handling and reporting through the message event system

The IPC server implementation uses the `node-ipc` package, which provides a reliable and efficient communication layer. The API methods and event emissions are mediated through this IPC layer, ensuring consistent communication across different parts of the Roo Code architecture.

---

### Error Handling

The Roo Code API communicates errors primarily through the `message` event. When an error occurs, you might receive a `message` event with:

- `message.type`: set to `'error'`
- `message.text`: containing an error message.
- `message.say`: set to a specific error subtype, such as `'tool_error'` or `'api_req_failed'`.

You should always check the `message.type` and `message.say` properties to handle errors appropriately. For example:

```typescript
rooCodeAPI.on("message", ({ message }) => {
	if (message.type === "error") {
		console.error("Roo encountered an error:", message.text)
		// Display the error to the user, retry, or take other actions.
	}
})
```

Common error scenarios include:

- **API Request Failures:** If an API request fails (e.g., due to network issues, invalid API keys, or rate limiting), you'll receive a message with `message.say === 'api_req_failed'`. The `message.text` will contain details about the error.
- **Tool Execution Errors:** If an error occurs during the execution of a tool (e.g., a file cannot be written), you'll receive a message with `message.say === 'tool_error'`. The `message.text` will contain details about the error.
- **Invalid Input:** If Roo provides invalid input to a tool (e.g., missing required parameters), you'll receive an error message.
- **RooIgnore Errors:** If Roo attempts to access a file that is blocked by a `.rooignore` file, you'll receive a message with `message.say === 'rooignore_error'`.

It's important to handle these errors gracefully in your application, providing informative feedback to the user and potentially implementing retry mechanisms where appropriate.
