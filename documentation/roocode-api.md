## RooCodeAPI Interface Documentation

Here is the documentation for each method in the `RooCodeAPI` interface, as defined in `src/exports/roo-code.d.ts`:

### `startNewTask(task?: string, images?: string[]): Promise<string>`

**Description:**
Starts a new task with an optional initial message and images.

**Parameters:**

- `task?`: `string` (optional) - Initial task message.
- `images?`: `string[]` (optional) - Array of image data URIs (e.g., "data:image/webp;base64,...").

**Return Type:**
`Promise<string>` - The ID of the new task.

**Example Usage:**

```typescript
const taskId = await rooCodeAPI.startNewTask("Write a function to calculate the factorial of a number.")
```

---

### `getCurrentTaskStack(): string[]`

**Description:**
Returns the current task stack.

**Return Type:**
`string[]` - An array of task IDs.

**Example Usage:**

```typescript
const taskStack = rooCodeAPI.getCurrentTaskStack()
console.log(taskStack) // Example: ["task-1", "task-2"]
```

---

### `clearCurrentTask(lastMessage?: string): Promise<void>`

**Description:**
Clears the current task.

**Parameters:**

- `lastMessage?`: `string` (optional) - Optional last message to send before clearing the task.

**Return Type:**
`Promise<void>` - Resolves when the current task is cleared.

**Example Usage:**

```typescript
await rooCodeAPI.clearCurrentTask("Okay, let's start fresh.")
```

---

### `cancelCurrentTask(): Promise<void>`

**Description:**
Cancels the current task.

**Return Type:**
`Promise<void>` - Resolves when the current task is cancelled.

**Example Usage:**

```typescript
await rooCodeAPI.cancelCurrentTask()
```

---

### `sendMessage(message?: string, images?: string[]): Promise<void>`

**Description:**
Sends a message to the current task.

**Parameters:**

- `message?`: `string` (optional) - Message to send.
- `images?`: `string[]` (optional) - Array of image data URIs (e.g., "data:image/webp;base64,...").

**Return Type:**
`Promise<void>` - Resolves when the message is sent.

**Example Usage:**

```typescript
await rooCodeAPI.sendMessage("Now, could you implement it in Python?")
```

---

### `pressPrimaryButton(): Promise<void>`

**Description:**
Simulates pressing the primary button in the chat interface.

**Return Type:**
`Promise<void>` - Resolves when the primary button press is simulated.

**Example Usage:**

```typescript
await rooCodeAPI.pressPrimaryButton() // Simulates pressing the "Run" button, for example.
```

---

### `pressSecondaryButton(): Promise<void>`

**Description:**
Simulates pressing the secondary button in the chat interface.

**Return Type:**
`Promise<void>` - Resolves when the secondary button press is simulated.

**Example Usage:**

```typescript
await rooCodeAPI.pressSecondaryButton() // Simulates pressing the "Stop" button, for example.
```

---

### `setConfiguration(values: Partial<ConfigurationValues>): Promise<void>`

**Description:**
Sets the configuration for the current task.

**Parameters:**

- `values`: `Partial<ConfigurationValues>` - An object containing key-value pairs to set. `ConfigurationValues` type is defined in the same file and includes various settings like `apiProvider`, `modelMaxTokens`, etc.

**Return Type:**
`Promise<void>` - Resolves when the configuration is set.

**Example Usage:**

```typescript
await rooCodeAPI.setConfiguration({ modelMaxTokens: 2000 })
```

---

### `isReady(): boolean`

**Description:**
Returns true if the API is ready to use.

**Return Type:**
`boolean` - `true` if the API is ready, `false` otherwise.

**Example Usage:**

```typescript
if (rooCodeAPI.isReady()) {
	console.log("RooCodeAPI is ready to use.")
} else {
	console.log("RooCodeAPI is not ready yet.")
}
```

---

### `getMessages(taskId: string): ClineMessage[]`

**Description:**
Returns the messages for a given task.

**Parameters:**

- `taskId`: `string` - The ID of the task.

**Return Type:**
`ClineMessage[]` - An array of `ClineMessage` objects. `ClineMessage` interface is defined in the same file and represents a message in the chat history.

**Example Usage:**

```typescript
const messages = rooCodeAPI.getMessages("task-123")
messages.forEach((message) => {
	console.log(message.text)
})
```

---

### `getTokenUsage(taskId: string): TokenUsage`

**Description:**
Returns the token usage for a given task.

**Parameters:**

- `taskId`: `string` - The ID of the task.

**Return Type:**
`TokenUsage` - A `TokenUsage` object. `TokenUsage` interface is defined in the same file and contains token usage statistics.

**Example Usage:**

```typescript
const usage = rooCodeAPI.getTokenUsage("task-123");
console.log(\`Total tokens: \${usage.totalTokensIn + usage.totalTokensOut}\`);
console.log(\`Total cost: $$\${usage.totalCost}\`);
```

---

### `log(message: string): void`

**Description:**
Logs a message to the output channel.

**Parameters:**

- `message`: `string` - The message to log.

**Return Type:**
`void` - This method does not return a value.

**Example Usage:**

```typescript
rooCodeAPI.log("Starting a new operation...")
```

---

## RooCodeEvents Interface Documentation

---

### `message` event

**Description:**

This event is emitted whenever a new message is created or an existing message is updated within a Cline task. It is the primary mechanism for receiving real-time updates from Roo, including streamed responses, tool outputs, and task status changes.

**Payload Structure:**

The event payload is an object with the following properties:

- `taskId`: `string` - The ID of the task that the message belongs to.
- `action`: `\"created\" | \"updated\"` - Indicates whether the message is newly created or updated.
- `message`: `ClineMessage` - The message object. The `ClineMessage` interface is defined in `src/exports/roo-code.d.ts` and has the following structure:
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

**Streaming Behavior:**

The `message` event is used to deliver streamed messages in real-time. For long-running tasks, such as code generation or web research, Roo sends messages in chunks. Each chunk is delivered as a `message` event with `action: \"updated\"` and `message.partial: true`. The final chunk is delivered with `action: \"updated\"` and `message.partial: false`, indicating the end of the stream.

**Code Example:**

```typescript
rooCodeAPI.on("message", (event) => {
    const { taskId, action, message } = event;
    console.log(\`Received message for task \${taskId}, action: \${action}\`);
    if (message.text) {
        console.log(\`Message text: \${message.text}\`);
    }
    if (message.partial) {
        console.log("Message is partial");
    }
});

// Start a new task to trigger message events
rooCodeAPI.startNewTask("Summarize the main points of the article at https://www.example.com");
```

---

This documentation should provide a clear understanding of each method in the `RooCodeAPI` interface.
