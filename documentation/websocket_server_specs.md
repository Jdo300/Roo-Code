### Roo Code IPC Server Setup Requirements

#### Purpose

This document outlines the non-communication requirements for the Roo Code IPC Server, focusing on its integration, configuration, and operational needs within the Roo Code VSCode plugin. It excludes JSON messaging details (covered in "Roo Code RPC/TCP API Schema Documentation") and serves as a guide for implementing the IPC server functionality.

#### Requirements by Category

##### File Structure

- All IPC server-related files must reside in the `/evals/packages/ipc/` directory within the Roo Code project.
- Type definitions should be maintained in `/evals/packages/types/src/ipc.ts`.

##### Configuration

- Server must support both Unix domain sockets and TCP connections
- For TCP connections:
    - Default port must be configurable via VSCode settings
    - Server must validate port number input
    - Server must handle port conflicts gracefully
- For Unix domain sockets:
    - Socket path must be configurable
    - Server must handle socket file cleanup on shutdown
- Server connection mode (TCP/Unix socket) must be configurable
- Settings must include a connection status indicator
- Settings must provide enhanced error feedback for configuration issues

##### Operational

- Use a singleton pattern to ensure one IPC server instance per VSCode window, managed via the extension context
- Use the `node-ipc` library for IPC functionality
- Support both local (Unix domain sockets) and network (TCP) communication
- Implement proper client identification and tracking
- Handle connection lifecycle (connect, disconnect, acknowledgment)
- Log IPC-specific events to a dedicated "Roo-Code IPC" output channel
- Support clean server shutdown when the extension deactivates
- Implement proper error handling and reporting

#### Message Types

- TaskCommand: Client-to-server messages to invoke Roo Code API methods
- TaskEvent: Server-to-client messages for real-time updates
- Ack: Server acknowledgment of client connections

#### Security Considerations

- Implement proper access control for both Unix domain sockets and TCP connections
- For TCP connections:
    - Consider implementing authentication mechanisms
    - Support connection whitelisting
    - Consider TLS encryption for secure communication
- For Unix domain sockets:
    - Implement proper file permissions
    - Handle socket file cleanup securely

#### Notes

- Configuration settings should appear in the VSCode settings panel in a category for the IPC server
- The server should handle multiple client connections efficiently
- Consider how to handle multiple Roo Code instances running in different VSCode windows
- Implement proper error handling and recovery mechanisms
- Provide clear feedback for connection issues and configuration problems
- Consider implementing connection retry mechanisms for clients
- Document proper cleanup procedures for both connection types
