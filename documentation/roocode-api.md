# RooCode API Documentation

Roo Code is a VS Code extension that provides AI-assisted coding features, allowing developers to interact with a language model directly within their IDE. The Roo Code API enables external applications to communicate with the extension through node-ipc, leveraging its capabilities for both Unix domain sockets and TCP connections.

## Response Patterns

The API follows two consistent patterns for command responses:

1. Value-returning commands:

    - Return the actual data value directly
    - Used when the command produces specific data
    - Examples: getConfiguration returns RooCodeSettings, isReady returns boolean

2. Action commands:
    - Return { success: true } to confirm completion
    - Used for operations that just perform actions
    - Examples: clearCurrentTask, sendMessage

Long-running operations may emit progress events through the event system while the command is processing.

## Commands

### Value-Returning Commands

#### `startNewTask(params: { configuration: RooCodeSettings, text?: string, images?: string[], newTab?: boolean }): Promise<string>`

Starts a new task with optional initial message, images, configuration, and tab behavior.
Returns the unique ID of the new task.

#### `getCurrentTaskStack(): string[]`

Returns the current task stack as an array of task IDs. The last element is the currently active task.

#### `getConfiguration(): RooCodeSettings`

Retrieves the current configuration settings for Roo Code.

#### `getMessages(taskId: string): ClineMessage[]`

Returns the messages for a given task.

#### `getTokenUsage(taskId: string): TokenUsage`

Returns the token usage for a given task.

#### `isReady(): boolean`

Returns true if the API is ready to use (the webview has been launched).

#### `isTaskInHistory(taskId: string): boolean`

Checks if a task with the given ID exists in the task history.

#### `getProfiles(): string[]`

Retrieves a list of available configuration profile names.

#### `getActiveProfile(): string | undefined`

Retrieves the name of the currently active configuration profile.

### Action Commands

#### `clearCurrentTask(lastMessage?: string): Promise<{ success: true }>`

Clears the current task. Optionally sends a final message before clearing.

#### `cancelCurrentTask(): Promise<{ success: true }>`

Cancels the current task.

#### `cancelTask(taskId: string): Promise<{ success: true }>`

Cancels a specific task.

#### `closeTask(taskId: string): Promise<{ success: true }>`

Closes a specific task.

#### `sendMessage(message?: string, images?: string[]): Promise<{ success: true }>`

Sends a message to the current task.

#### `pressPrimaryButton(): Promise<{ success: true }>`

Simulates pressing the primary button in the chat interface.

#### `pressSecondaryButton(): Promise<{ success: true }>`

Simulates pressing the secondary button in the chat interface.

#### `setConfiguration(values: Partial<ConfigurationValues>): Promise<{ success: true }>`

Sets the configuration for the current task.

#### `resumeTask(taskId: string): Promise<{ success: true }>`

Resumes a paused task.

#### `createProfile(name: string): Promise<{ success: true }>`

Creates a new configuration profile with the specified name.

#### `setActiveProfile(name: string): Promise<{ success: true }>`

Sets the active configuration profile by name.

#### `deleteProfile(name: string): Promise<{ success: true }>`

Deletes a configuration profile by name.

### Special Commands

#### `log(message: string): void`

Logs a message to the extension's output channel. Does not return a response.

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

## Type Definitions

### RooCodeSettings

```typescript
interface RooCodeSettings {
	apiProvider: string
	currentApiConfigName: string
	autoApprovalEnabled: boolean
	alwaysAllowReadOnly: boolean
	alwaysAllowWrite: boolean
	alwaysAllowBrowser: boolean
	alwaysAllowExecute: boolean
}
```

### TokenUsage

```typescript
interface TokenUsage {
	prompt: number
	completion: number
	total: number
}
```

### ClineMessage

```typescript
interface ClineMessage {
	type: "say" | "ask" | "tool"
	text?: string
	ask?: string
	tool?: string
	partial?: boolean
}
```

## Error Handling

Commands may return an error response in the following format:

```typescript
{
	error: string // Error message describing what went wrong
}
```

## Usage Example

```typescript
const client = new RooCodeClient()
await client.connect()

// Value-returning command
const config = await client.getConfiguration()
console.log("Current configuration:", config)

// Action command
await client.sendMessage("Hello!") // Returns { success: true }

// Listen for events
client.on("message", ({ taskId, action, message }) => {
	console.log(`New message for task ${taskId}:`, message)
})
```
