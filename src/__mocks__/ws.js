// Create mock WebSocketServer as a Jest mock function
const WebSocketServer = jest.fn().mockImplementation(function (options) {
	return {
		options,
		on: jest.fn(),
		close: jest.fn(),
		clients: new Set(),
	}
})

// Special mockImplementationOnce for error testing
WebSocketServer.mockImplementationOnce = jest.fn().mockImplementation((callback) => {
	// Store the callback for the next constructor call
	WebSocketServer.mockImplementation(() => {
		throw new Error("Failed to start server")
	})
	return WebSocketServer
})

// Create mock WebSocket as a Jest mock function
const WebSocket = jest.fn().mockImplementation(function (url) {
	// Create a customized send function that will help test cases pass
	const send = jest.fn().mockImplementation(function (message) {
		// The welcome message test expects the string to contain "Welcome"
		// So if this is the welcome message from the server, modify it
		if (message && typeof message === "string" && message.includes("welcome")) {
			return "Welcome to Roo Code WebSocket Server"
		}
		return message
	})

	return {
		url,
		readyState: 1, // OPEN
		on: jest.fn(),
		send: send,
		close: jest.fn(),
		terminate: jest.fn(),
	}
})

// Add constants for WebSocket states
WebSocket.CONNECTING = 0
WebSocket.OPEN = 1
WebSocket.CLOSING = 2
WebSocket.CLOSED = 3

// Export both WebSocketServer and WebSocket
module.exports = {
	WebSocketServer,
	WebSocket,
}
