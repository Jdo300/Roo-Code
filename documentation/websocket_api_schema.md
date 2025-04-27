## Roo Code RPC/TCP API Schema Documentation

### Introduction

This document defines the JSON schema for the Roo Code RPC/TCP API, which enables external applications to communicate directly with the Roo Code VS Code extension using node-ipc. This API allows for programmatic control of Roo Code's functionalities and real-time interaction, including sending commands and receiving streamed responses and events.

The RPC/TCP API is designed with a focus on:

- **Clear message types:** Using a unified `type` field for easy routing and handling
- **Direct mapping to RooCodeAPI:** Commands and events map directly to RooCodeAPI methods and events
- **Comprehensive streaming support:** Handling partial updates for real-time message delivery
- **Robust error handling:** Structured error responses with codes and messages
- **Client identification:** Using clientId for message routing and acknowledgment

### Message Types Overview

All IPC messages use a unified `type` field to categorize the message:

1. **`TaskCommand`:** Client-to-server messages to invoke Roo Code API methods
2. **`TaskEvent`:** Server-to-client messages for real-time updates from Roo Code
3. **`Ack`:** Server acknowledgment of client connection

### Client-to-Server Command Schema

All client commands follow this structure:

```json
{
	"type": "TaskCommand",
	"origin": "client",
	"clientId": "unique-client-id",
	"data": {
		"commandName": "StartNewTask",
		"data": {
			"configuration": {},
			"text": "Write a Python function...",
			"images": []
		}
	}
}
```

**Fields:**

- **`type`** (string, required): Always `"TaskCommand"` for client-initiated commands
- **`origin`** (string, required): Always `"client"` for client messages
- **`clientId`** (string, required): Unique identifier for the client
- **`data`** (object, required): Contains the command details
    - **`commandName`** (string, required): The name of the command to execute
    - **`data`** (any, required): Command-specific parameters

#### Supported Commands

| commandName            | Description                             | Data Structure                                                                           |
| ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `StartNewTask`         | Starts a new task                       | `{ configuration: RooCodeSettings, text?: string, images?: string[], newTab?: boolean }` |
| `CancelTask`           | Cancels a specific task                 | `string` (taskId)                                                                        |
| `CloseTask`            | Closes a specific task                  | `string` (taskId)                                                                        |
| `GetCurrentTaskStack`  | Returns the current task stack          | `undefined`                                                                              |
| `ClearCurrentTask`     | Clears the current task                 | `string?` (lastMessage)                                                                  |
| `CancelCurrentTask`    | Cancels the current task                | `undefined`                                                                              |
| `SendMessage`          | Sends a message to the task             | `{ message?: string, images?: string[] }`                                                |
| `PressPrimaryButton`   | Simulates pressing the primary button   | `undefined`                                                                              |
| `PressSecondaryButton` | Simulates pressing the secondary button | `undefined`                                                                              |
| `SetConfiguration`     | Sets configuration values               | `any` (configuration values)                                                             |
| `IsReady`              | Checks if the API is ready              | `undefined`                                                                              |
| `GetMessages`          | Gets messages for a task                | `string` (taskId)                                                                        |
| `GetTokenUsage`        | Gets token usage for a task             | `string` (taskId)                                                                        |
| `Log`                  | Logs a message                          | `string` (message)                                                                       |
| `ResumeTask`           | Resumes a paused task                   | `string` (taskId)                                                                        |
| `IsTaskInHistory`      | Checks if a task is in history          | `string` (taskId)                                                                        |
| `CreateProfile`        | Creates a new profile                   | `string` (name)                                                                          |
| `GetProfiles`          | Gets available profiles                 | `undefined`                                                                              |
| `SetActiveProfile`     | Sets the active profile                 | `string` (name)                                                                          |
| `getActiveProfile`     | Gets the active profile                 | `undefined`                                                                              |
| `DeleteProfile`        | Deletes a profile                       | `string` (name)                                                                          |

### Server-to-Client Event Schema

Server events follow this structure:

```json
{
	"type": "TaskEvent",
	"origin": "server",
	"relayClientId": "optional-client-id",
	"data": {
		"eventName": "Message",
		"payload": {
			"action": "created",
			"message": {
				"type": "say",
				"say": "text",
				"text": "Response text...",
				"partial": false
			}
		},
		"taskId": 123
	}
}
```

**Fields:**

- **`type`** (string, required): Always `"TaskEvent"` for server events
- **`origin`** (string, required): Always `"server"` for server messages
- **`relayClientId`** (string, optional): Client ID if event is specific to a client
- **`data`** (object, required): Contains the event details
    - **`eventName`** (string, required): Name of the event
    - **`payload`** (object, required): Event-specific data
    - **`taskId`** (number, optional): ID of the related task

#### Supported Events

| eventName               | Description              | Payload Structure                                           |
| ----------------------- | ------------------------ | ----------------------------------------------------------- |
| `Message`               | A new message or update  | `{ action: "created" \| "updated", message: ClineMessage }` |
| `TaskCreated`           | A new task was created   | `{}`                                                        |
| `TaskStarted`           | Task has started         | `{}`                                                        |
| `TaskModeSwitched`      | Task mode was switched   | `{ modeSlug: string }`                                      |
| `TaskPaused`            | Task has been paused     | `{}`                                                        |
| `TaskUnpaused`          | Task has been unpaused   | `{}`                                                        |
| `TaskAskResponded`      | User responded to an ask | `{}`                                                        |
| `TaskAborted`           | Task has been aborted    | `{}`                                                        |
| `TaskSpawned`           | A sub-task was spawned   | `{ childTaskId: string }`                                   |
| `TaskCompleted`         | Task has completed       | `{ usage: TokenUsage, toolUsage: any }`                     |
| `TaskTokenUsageUpdated` | Token usage updated      | `{ usage: TokenUsage }`                                     |
| `TaskToolFailed`        | A tool failed            | `{ toolName: string, error: any }`                          |

### Connection Handshake

When a client connects, the server responds with an acknowledgment:

```json
{
	"type": "Ack",
	"origin": "server",
	"data": {
		"clientId": "assigned-client-id",
		"pid": 1234,
		"ppid": 5678
	}
}
```

### Error Handling

Errors are communicated through TaskEvents with appropriate error payloads. Common error scenarios include:

- Invalid command format
- Unknown command name
- Missing required parameters
- Task not found
- Permission denied
- Internal server errors

### Implementation Notes

- The API uses node-ipc for communication
- Supports both Unix domain sockets and TCP connections
- Implements proper error handling and validation using Zod schemas
- Maintains client identification for proper message routing
- Handles connection lifecycle (connect, disconnect, acknowledgment)
