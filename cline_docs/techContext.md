# Technical Context: Roo Code WebSocket Server

## Technologies Used

1. **Core Technologies:**

    - **TypeScript**: The entire codebase uses TypeScript for type safety and developer experience
    - **Node.js**: The runtime environment for the server-side code
    - **VS Code Extension API**: Used for integration with VS Code
    - **WebSocket Protocol**: For real-time bidirectional communication

2. **Libraries and Dependencies:**

    - **ws**: The WebSocket library specified in the requirements for implementing the server
    - **zod**: Used for schema validation in the Roo Code codebase

3. **Extension-specific Technologies:**
    - **VS Code Extension Context**: For lifecycle management and state persistence
    - **VS Code WebView API**: For UI components and user interaction
    - **VS Code Output Channel**: For logging and debugging

## Development Setup

1. **Project Structure:**

    - WebSocket server code should be placed in the `/src/server/` directory
    - Settings integration spans multiple files in the codebase:
        - `src/shared/ExtensionMessage.ts`
        - `src/shared/WebviewMessage.ts`
        - `src/core/webview/ClineProvider.ts`
        - `webview-ui/src/components/SettingsView.tsx`

2. **Building and Testing:**

    - Standard build process: `npm run build`
    - Testing with Jest: `npm run test:extension` (requires test coverage)
    - Extension debugging using VS Code's extension debugging features

3. **Configuration Management:**
    - Extension settings stored in VS Code's extension storage
    - GlobalState is used for persisting settings between sessions

## Technical Constraints

1. **WebSocket Server Constraints:**

    - Must use the `ws` npm package as specified in the requirements
    - Must follow the singleton pattern to ensure only one server instance
    - Port must be configurable but default to 7800
    - Must listen on 0.0.0.0 to allow connections from any interface

2. **Settings Implementation Constraints:**

    - Must follow the Roo Code pattern in `cline_docs/settings.md`
    - Must integrate with existing settings UI
    - Must handle valid port range (1024-65535)
    - Must provide proper error feedback

3. **Extension Integration Constraints:**

    - Must interact with the API through the established `API` class
    - Must handle extension lifecycle events (activation/deactivation)
    - Must log to a dedicated "Roo-Code WebSocket" output channel

4. **Communication Protocol Constraints:**

    - Must follow the JSON message format defined in `websocket_api_schema.md`
    - Must support real-time streaming of messages
    - Must properly handle all `RooCodeAPI` methods and events

5. **Testing and Quality Constraints:**
    - Must have adequate test coverage as per Roo Code guidelines
    - Must maintain code quality standards (linting, typing)
    - Should handle edge cases like port conflicts and connection failures
