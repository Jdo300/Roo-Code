## Roo Code WebSocket API Schema Documentation

### Introduction

This document defines the JSON schema for the Roo Code WebSocket API, which enables external applications to communicate directly with the Roo Code VS Code extension. This API allows for programmatic control of Roo Code's functionalities and real-time interaction, including sending commands and receiving streamed responses and events.

The WebSocket API is designed with a focus on:

- **Clear message types:** Using a unified `type` field for easy routing and handling
- **Direct mapping to RooCodeAPI:** Commands and events map directly to RooCodeAPI methods and events
- **Comprehensive streaming support:** Handling partial updates for real-time message delivery
- **Robust error handling:** Structured error responses with codes and messages
- **Asynchronous request tracking:** Using request IDs to correlate requests and responses

### Message Types Overview

All WebSocket messages (in both directions) use a unified `type` field to categorize the message:

1. **`command`:** Client-to-server messages to invoke Roo Code API methods
2. **`response`:** Server-to-client messages in response to commands
3. **`event`:** Server-to-client messages for real-time updates from Roo Code

### Client-to-Server Command Schema

All client commands follow this structure:

```json
{
  "type": "command",
  "commandName": "startNewTask",
  "taskId": "optional-task-id",
  "arguments": {
    "text": "Write a Python function...",
    "images": [...]
  },
  "requestId": "unique-request-id"
}
```

**Fields:**

- **`type`** (string, required): Always `"command"` for client-initiated commands.
- **`commandName`** (string, required): The name of the command to execute, directly mapping to RooCodeAPI methods. See [Supported Commands](#supported-commands) below.
- **`taskId`** (string, optional): The ID of the task this command relates to. Required for task-specific commands (e.g., `sendMessage`, `getMessages`), omitted for global commands (e.g., `startNewTask`).
- **`arguments`** (object, optional): Parameters for the command, structured according to the corresponding RooCodeAPI method's parameters.
- **`requestId`** (string, required): A client-generated unique identifier for tracking asynchronous requests and matching responses.

#### Supported Commands

| commandName            | Description                             | Arguments                                     | taskId Required? |
| ---------------------- | --------------------------------------- | --------------------------------------------- | ---------------- |
| `startNewTask`         | Starts a new task                       | `{ "configuration": RooCodeSettings, "text": string?, "images": string[]?, "newTab": boolean? }`    | No               |
| `getCurrentTaskStack`  | Returns the current task stack          | `{}`                                          | No               |
| `clearCurrentTask`     | Clears the current task                 | `{ "lastMessage": string? }`                  | No               |
| `cancelCurrentTask`    | Cancels the current task                | `{}`                                          | No               |
| `resumeTask`           | Resumes a paused task                   | `{}`                                          | Yes              |
| `isTaskInHistory`      | Checks if a task is in history          | `{}`                                          | Yes              |
| `cancelTask`           | Cancels a specific task                 | `{}`                                          | Yes              |
| `getConfiguration`     | Gets current configuration              | `{}`                                          | No               |
| `createProfile`        | Creates a new profile                   | `{ "name": string }`                          | No               |
| `getProfiles`          | Gets available profiles                 | `{}`                                          | No               |
| `setActiveProfile`     | Sets the active profile                 | `{ "name": string }`                          | No               |
| `getActiveProfile`     | Gets the active profile                 | `{}`                                          | No               |
| `deleteProfile`        | Deletes a profile                       | `{ "name": string }`                          | No               |
| `sendMessage`          | Sends a message to the task             | `{ "message": string?, "images": string[]? }` | Yes              |
| `pressPrimaryButton`   | Simulates pressing the primary button   | `{}`                                          | Yes              |
| `pressSecondaryButton` | Simulates pressing the secondary button | `{}`                                          | Yes              |
| `setConfiguration`     | Sets configuration values               | `{ "values": { [key: string]: any } }`        | No               |
| `getMessages`          | Gets messages for a task                | `{}`                                          | Yes              |
| `getTokenUsage`        | Gets token usage for a task             | `{}`                                          | Yes              |
| `isReady`              | Checks if the API is ready              | `{}`                                          | No               |

### Server-to-Client Response Schema

All server responses follow this structure:

```json
{
	"type": "response",
	"status": "success",
	"requestId": "matching-request-id",
	"commandName": "startNewTask",
	"data": {
		"taskId": "new-task-123"
	},
	"error": {
		"code": "INVALID_PARAMETER",
		"message": "Invalid task text provided."
	}
}
```

**Fields:**

- **`type`** (string, required): Always `"response"` for server-generated responses to commands.
- **`status`** (string, required): Either `"success"` or `"error"` indicating if the command was executed successfully.
- **`requestId`** (string, required): The same `requestId` from the original command, used for correlation.
- **`commandName`** (string, required): The same `commandName` from the original command, for context.
- **`data`** (object, conditional): Present if `status` is `"success"`. Contains command-specific response data. Structure varies based on the command.
- **`error`** (object, conditional): Present if `status` is `"error"`. Contains error details.
    - **`code`** (string, required): Error code identifying the error type.
    - **`message`** (string, required): Human-readable error message.

#### Response Data by Command

| commandName            | Response Data Structure           | Example                                      |
| ---------------------- | --------------------------------- | -------------------------------------------- |
| `startNewTask`         | `{ "taskId": string }`            | `{ "taskId": "task-123" }`                   |
| `getCurrentTaskStack`  | `{ "taskStack": string[] }`       | `{ "taskStack": ["task-123", "task-456"] }`  |
| `clearCurrentTask`     | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `cancelCurrentTask`    | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `sendMessage`          | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `pressPrimaryButton`   | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `pressSecondaryButton` | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `setConfiguration`     | `{}` or `{ "result": "success" }` | `{ "result": "success" }`                    |
| `getMessages`          | `{ "messages": ClineMessage[] }`  | `{ "messages": [...] }`                      |
| `getTokenUsage`        | `{ "usage": TokenUsage }`         | `{ "usage": { "totalTokensIn": 100, ... } }` |
| `isReady`              | `{ "ready": boolean }`            | `{ "ready": true }`                          |

#### Error Codes

| Error Code          | Description                         |
| ------------------- | ----------------------------------- |
| `SERVER_ERROR`      | Internal server error               |
| `INVALID_COMMAND`   | The command does not exist          |
| `INVALID_PARAMETER` | Invalid or missing parameter        |
| `TASK_NOT_FOUND`    | Specified task ID does not exist    |
| `API_NOT_READY`     | Roo Code API is not ready           |
| `EXECUTION_ERROR`   | Error executing the command         |
| `PERMISSION_DENIED` | Permission denied for the operation |

### Server-to-Client Event Schema

Real-time updates from Roo Code API are sent as events with this structure:

```json
{
	"type": "event",
	"eventName": "message",
	"taskId": "task-123",
	"payload": {
		"action": "updated",
		"message": {
			"type": "say",
			"say": "text",
			"text": "Streaming chunk of text...",
			"partial": true
		}
	}
}
```

**Fields:**

- **`type`** (string, required): Always `"event"` for server-push events.
- **`eventName`** (string, required): Name of the event, directly mapping to RooCodeEvents names.
- **`taskId`** (string, optional): The ID of the task this event relates to (if applicable).
- **`payload`** (object, required): Event-specific data. Structure varies based on the `eventName` and mirrors the corresponding RooCodeEvents payload.

#### Supported Events

| eventName               | Description              | Payload Structure                                               |
| ----------------------- | ------------------------ | --------------------------------------------------------------- |
| `message`               | A new message or update  | `{ "action": "created" \| "updated", "message": ClineMessage }` |
| `taskStarted`           | Task has started         | `{}`                                                            |
| `taskPaused`            | Task has been paused     | `{}`                                                            |
| `taskUnpaused`          | Task has been unpaused   | `{}`                                                            |
| `taskAskResponded`      | User responded to an ask | `{}`                                                            |
| `taskAborted`           | Task has been aborted    | `{}`                                                            |
| `taskSpawned`           | A sub-task was spawned   | `{ "childTaskId": string }`                                     |
| `taskCompleted`         | Task has completed       | `{ "usage": TokenUsage, "toolUsage": any }`                     |
| `taskTokenUsageUpdated` | Token usage updated      | `{ "usage": TokenUsage }`                                       |
| `taskCreated`           | A new task was created   | `{}`                                                            |
| `taskModeSwitched`      | Task mode was switched   | `{ "modeSlug": string }`                                        |
| `taskToolFailed`        | A tool failed            | `{ "toolName": string, "error": any }`                          |

### Streaming Message Flow

For streaming responses (particularly with the `message` event), the flow works as follows:

1. Server sends an initial event with:

    ```json
    {
      "type": "event",
      "eventName": "message",
      "taskId": "task-123",
      "payload": {
        "action": "created",
        "message": { ... }
      }
    }
    ```

2. For streaming, server sends updates with:

    ```json
    {
      "type": "event",
      "eventName": "message",
      "taskId": "task-123",
      "payload": {
        "action": "updated",
        "message": {
          "text": "Partial chunk...",
          "partial": true,
          ...
        }
      }
    }
    ```

3. Final update with `message.partial` set to `false`:

    ```json
    {
      "type": "event",
      "eventName": "message",
      "taskId": "task-123",
      "payload": {
        "action": "updated",
        "message": {
          "text": "Final chunk",
          "partial": false,
          ...
        }
      }
    }
    ```

### Usage Examples

#### Example 1: Starting a New Task

**Client sends:**

```json
{
	"type": "command",
	"commandName": "startNewTask",
	"arguments": {
		"text": "Create a Python function to calculate Fibonacci numbers"
	},
	"requestId": "req1"
}
```

**Server responds:**

```json
{
	"type": "response",
	"status": "success",
	"requestId": "req1",
	"commandName": "startNewTask",
	"data": {
		"taskId": "task-123"
	}
}
```

**Server then sends events (simplified):**

```json
{
	"type": "event",
	"eventName": "taskStarted",
	"taskId": "task-123",
	"payload": {}
}
```

```json
{
	"type": "event",
	"eventName": "message",
	"taskId": "task-123",
	"payload": {
		"action": "created",
		"message": {
			"type": "say",
			"say": "text",
			"text": "I'll create a Python function to calculate Fibonacci numbers.",
			"partial": false
		}
	}
}
```

#### Example 2: Streaming Response

**Client sends:**

```json
{
	"type": "command",
	"commandName": "sendMessage",
	"taskId": "task-123",
	"arguments": {
		"message": "Can you explain how the function works?"
	},
	"requestId": "req2"
}
```

**Server responds:**

```json
{
	"type": "response",
	"status": "success",
	"requestId": "req2",
	"commandName": "sendMessage",
	"data": {
		"result": "success"
	}
}
```

**Server then streams a response (multiple events):**

```json
{
	"type": "event",
	"eventName": "message",
	"taskId": "task-123",
	"payload": {
		"action": "created",
		"message": {
			"type": "say",
			"say": "text",
			"text": "",
			"partial": true
		}
	}
}
```

```json
{
	"type": "event",
	"eventName": "message",
	"taskId": "task-123",
	"payload": {
		"action": "updated",
		"message": {
			"type": "say",
			"say": "text",
			"text": "The Fibonacci function works by",
			"partial": true
		}
	}
}
```

```json
{
	"type": "event",
	"eventName": "message",
	"taskId": "task-123",
	"payload": {
		"action": "updated",
		"message": {
			"type": "say",
			"say": "text",
			"text": "The Fibonacci function works by recursively calculating the sum of the two previous numbers in the sequence.",
			"partial": false
		}
	}
}
```

### Error Handling Examples

#### Example: Invalid Task ID

**Client sends:**

```json
{
	"type": "command",
	"commandName": "sendMessage",
	"taskId": "non-existent-task",
	"arguments": {
		"message": "Hello"
	},
	"requestId": "req3"
}
```

**Server responds:**

```json
{
	"type": "response",
	"status": "error",
	"requestId": "req3",
	"commandName": "sendMessage",
	"error": {
		"code": "TASK_NOT_FOUND",
		"message": "Task with ID 'non-existent-task' not found"
	}
}
```

### Security Considerations

The WebSocket server should implement:

1. **Origin validation**: Validate the origin of WebSocket connection requests
2. **API key authentication**: Consider implementing an API key system for production usage
3. **Rate limiting**: Limit the number of commands per client to prevent abuse
4. **Connection limits**: Limit the number of simultaneous connections

### Implementation Notes

- The WebSocket server should use the `ws` npm package
- Use proper error handling for all API calls
- Implement logging for all WebSocket interactions
- Consider implementing a connection heartbeat mechanism
- All JSON responses should be properly serialized and validated
