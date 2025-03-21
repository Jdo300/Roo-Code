### WebSocket Command Format Inspiration: Roo Code WebSocket Server

#### Purpose

This document outlines JSON command and response formats from prior implementation attempts for the Roo Code WebSocket Server. These are provided as inspiration for designing a comprehensive WebSocket communication schema. The next agent should use this as a starting point, leveraging the full `RooCodeAPI` (documented separately) to propose a complete, potentially enhanced structure that supports all API features and real-time interaction.

#### Background

The WebSocket server aims to enable external control of Roo Code, initially focusing on chat interactions and basic commands, with later intent for streaming responses (e.g., chat updates, status). The formats below come from early server docs and a test client, reflecting a mix of sending commands and receiving real-time updates. They should inspire, not limit, the design—ensure the schema supports all `RooCodeAPI` methods (e.g., `startNewTask`, `sendMessage`, `pressPrimaryButton`, `getMessages`) and events (e.g., `message`, `taskStarted`).

#### Previously Defined Command Formats (Client-to-Server)

These JSON structures were used for client-to-server communication:

1. **Chat Message (Simple)**

    - **Purpose:** Send a chat message to Roo Code (maps to `sendMessage`).
    - **Format:**

        ```json
        {
        	"message": "your chat message here"
        }
        ```

    - **Fields:**
        - `message` (string): The chat content.

2. **Command Message**

    - **Purpose:** Execute a specific command with an optional value.
    - **Format:**

        ```json
        {
        	"command": "commandName",
        	"value": "commandValue"
        }
        ```

    - **Fields:**
        - `command` (string): The command name (e.g., `requestState`, `set_auto_approve_files`).
        - `value` (string | boolean | object, optional): Command parameter (e.g., `true`, `{ "message": "reason" }`).

3. **Combined Message**

    - **Purpose:** Send a chat message and command together.
    - **Format:**

        ```json
        {
        	"message": "the message",
        	"command": "commandName",
        	"value": "commandValue"
        }
        ```

    - **Fields:**
        - `message` (string): Chat content.
        - `command` (string): Command name.
        - `value` (string | boolean | object, optional): Command parameter.

4. **State Request**

    - **Purpose:** Request Roo Code’s current state (e.g., task stack, settings).
    - **Format:**

        ```json
        {
        	"command": "requestState"
        }
        ```

    - **Fields:**
        - `command` (string): Fixed value `"requestState"`.

5. **Specific Commands (Examples)**

    - **Purpose:** Control settings or actions (simplified list from test client).
    - **Formats:**

        ```json
        {"command": "set_auto_approve_files", "value": true}
        {"command": "set_auto_approve_terminal", "value": true}
        {"command": "set_auto_approve_browser", "value": true}
        ```

#### Previously Defined Response Formats (Server-to-Client)

These JSON structures were used or implied for server-to-client streaming responses:

1. **Chat Message Response**

    - **Purpose:** Stream chat messages from Roo Code (maps to `message` event).
    - **Format:**

        ```json
        {
          "type": "message",
          "output": "The text of the chat message",
          "partial": true/false
        }
        ```

    - **Fields:**
        - `type` (string): Fixed value `"message"`.
        - `output` (string): Chat content.
        - `partial` (boolean): Indicates streaming chunk (true) or final message (false).

2. **Reasoning Response**

    - **Purpose:** Stream Roo’s reasoning steps.
    - **Format:**

        ```json
        {
          "type": "reasoning",
          "output": "The text of Cline's reasoning",
          "partial": true/false
        }
        ```

    - **Fields:**
        - `type` (string): Fixed value `"reasoning"`.
        - `output` (string): Reasoning content.
        - `partial` (boolean): Streaming status.

3. **Status Update Response**

    - **Purpose:** Stream status updates (e.g., command results, errors).
    - **Format:**

        ```json
        {
          "type": "status",
          "statusType": "command_output",
          "text": "Optional status text",
          "partial": true/false
        }
        ```

    - **Fields:**
        - `type` (string): Fixed value `"status"`.
        - `statusType` (string): Status category (e.g., `"command_output"`, `"error"`).
        - `text` (string, optional): Status details.
        - `partial` (boolean, optional): Streaming status.

4. **Command Response (Implied)**

    - **Purpose:** Respond to client commands with results.
    - **Format:**

        ```json
        {
        	"type": "commandName_response",
        	"data": "response content"
        }
        ```

    - **Fields:**
        - `type` (string): Command-specific (e.g., `"run_response"`, `"requestState_response"`).
        - `data` (any): Response data (flexible based on command).

#### Observations from Previous Design

- **Sending Commands:** Focuses on a simple `message`/`command`/`value` structure, with `value` supporting varied types (string, boolean, object). Older `invoke`/`type` formats have been removed per preference for simplicity.
- **Receiving Responses:** Streaming support via `partial` aligns with `RooCodeAPI`’s `message` event, with distinct `type`s for chat, reasoning, and status.

#### Guidance for Next Agent

- **Use as Inspiration:** These formats worked for chat and basic control but should be expanded to cover all `RooCodeAPI` methods (e.g., task management, button actions, configuration) and events (e.g., `taskStarted`, `taskCompleted`).
- **Enhance Schema:** Consider:
    - A unified `type` field for both commands and responses (e.g., `"chat"`, `"command"`, `"status"`).
    - Parameters matching API needs (e.g., `taskId`, `images`, `values` for `setConfiguration`).
    - Streaming support with `partial` for all relevant responses.
    - A response structure that mirrors API events (e.g., `taskId`, `action`).
- **Don’t Limit Features:** Ensure the design supports the full API, not just chat/settings, and allows for future extensibility (e.g., voice UI, automation).

#### Notes

- These formats predate full `RooCodeAPI` awareness, so they’re incomplete but practical for initial goals (chat, settings, streaming).
- Pair this with the `RooCodeAPI` documentation to ensure the next agent designs a schema that fully leverages the API’s power while improving on this simplified foundation.
