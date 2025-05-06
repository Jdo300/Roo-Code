# Technical Context

## RPC Server Implementation

- Using node-ipc for TCP communication
- Server listens on port 7800
- Implements IPC message types: Connect, Disconnect, Ack, TaskCommand, TaskEvent, TaskResponse, EvalEvent
- Logging to VSCode output window (Roo Code section)

## Message Protocol

1. Client Connection:

    - Client connects to server
    - Server sends Ack message with clientId
    - Client stores clientId for future messages

2. Command Flow:

    - Client sends TaskCommand messages
    - Server processes commands
    - Server responds with TaskResponse messages
    - Client matches responses to pending requests using clientId

3. Event Flow:
    - Server sends TaskEvent messages for async updates
    - Client handles events through event emitter pattern

## Configuration

- RooCodeSettings schema enforces required fields
- Provider-specific settings (e.g., Gemini API key)
- Generic settings (telemetry, caching, etc.)
- Environment variables for sensitive data

## Test Client

- Implements full message protocol
- Handles all message types
- Includes timeout handling
- Validates configuration against schema
- Provides event-based API

## Development Environment

- VSCode extension
- TypeScript/JavaScript
- Node.js IPC for communication
- Zod for schema validation
