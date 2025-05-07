// Mock node-ipc to avoid actual TCP connections
const mockSocket = {
	on: jest.fn((event, callback) => {
		if (event === "connect") {
			callback()
		}
	}),
	emit: jest.fn(),
}

const mockIpc = {
	config: {
		id: "",
		retry: 0,
		maxRetries: 0,
		silent: true,
		unlink: false,
		appspace: "",
		socketRoot: "",
		stopRetrying: false,
		logger: () => {},
	},
	connectToNet: jest.fn((_, __, ___, cb) => {
		// Simulate successful connection
		cb()
		// Add socket to mockIpc.of
		mockIpc.of = {
			"roo-tcp-server": mockSocket,
		}
	}),
	of: {},
	disconnect: jest.fn(),
	server: {
		start: jest.fn(),
		on: jest.fn((event, callback) => {
			if (event === "connect") {
				callback(mockSocket)
			}
		}),
		emit: jest.fn(),
		broadcast: jest.fn(),
	},
	serve: jest.fn(),
	serveNet: jest.fn((host, port, cb) => {
		cb()
	}),
}

jest.mock("node-ipc", () => mockIpc)

// Mock tiktoken to avoid WASM issues
jest.mock("tiktoken", () => ({}))

// Mock openai to avoid fetch issues
jest.mock("openai", () => ({}))

// Mock formdata-node to avoid ESM issues
jest.mock("formdata-node", () => ({}))

// Set up global fetch for openai
global.fetch = jest.fn()
global.Request = jest.fn() as unknown as typeof Request
global.Headers = jest.fn() as unknown as typeof Headers

// Mock Response with required static methods
const MockResponse = jest.fn() as unknown as typeof Response
MockResponse.error = jest.fn(() => new Response())
MockResponse.json = jest.fn((data) => new Response(JSON.stringify(data)))
MockResponse.redirect = jest.fn(
	(url, status) => new Response(null, { status: status || 302, headers: { Location: url.toString() } }),
)
global.Response = MockResponse

// Export the mocks for tests to use
export { mockSocket, mockIpc }
