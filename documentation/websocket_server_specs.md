### Roo Code WebSocket Server Setup Requirements

#### Purpose

This document outlines the non-communication requirements for the Roo Code WebSocket Server, focusing on its integration, configuration, and operational needs within the Roo Code VSCode plugin. It excludes JSON messaging details (covered in "Roo Code WebSocket Command Inspiration") and serves as a guide for the next agent building this feature from scratch.

#### Requirements by Category

##### File Structure

- All WebSocket server-related files must reside in the `/src/server/` directory within the Roo Code project.

##### Configuration

- Default port must be 7800, configurable via VSCode settings under `roo-code.websocket.port`.
- Server must be disabled by default, toggleable via VSCode settings under `roo-code.websocket.enabled`.
- Settings must include a connection status indicator (e.g., enabled/disabled state visibility).
- Settings must provide enhanced error feedback for configuration issues.
- Settings must include port number validation to ensure valid input.

##### Operational

- Use a singleton pattern to ensure one WebSocket server instance per VSCode window, managed via the extension context.
- Use the `ws` library for WebSocket functionality.
- Log WebSocket-specific events to a dedicated "Roo-Code WebSocket" output channel, separate from the "Roo-Code" channel for command logs.
- Support clean server shutdown when the extension deactivates.

#### Notes

- Configuration settings should appear in the VSCode settings panel in a category for the WebSocket server.
- The server should listen on `0.0.0.0` to allow connections from any interface.
- If the specified port is in use, display a message asking the user to change to another port. Consider how to handle multiple Roo Code instances running in different VSCode windows (e.g., port conflicts across instances).
