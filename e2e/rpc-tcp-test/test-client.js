const ipc = require("node-ipc").default

// Configuration
// Get configuration from environment variables
const config = {
	appspace: "roo.",
	id: "rpc-test-client",
	networkPort: process.env.ROO_CODE_IPC_TCP_PORT || "3000",
	retry: 1500,
	silent: true,
	networkHost: process.env.ROO_CODE_IPC_TCP_HOST || "localhost",
	tcp: true,
}

console.log("Connecting with config:", config)

// Initialize IPC
ipc.config.id = config.id
ipc.config.retry = config.retry
ipc.config.silent = config.silent
ipc.config.networkPort = config.networkPort
ipc.config.networkHost = config.networkHost
ipc.config.tcp = config.tcp

async function runTests() {
	return new Promise((resolve, reject) => {
		try {
			// Connect to server
			ipc.connectTo("roo-server", () => {
				const server = ipc.of["roo-server"]

				server.on("connect", () => {
					console.log("Connected to RPC server")

					// Test message
					server.emit("message", {
						type: "test",
						payload: "Hello from test client!",
					})
				})

				server.on("message", (data) => {
					console.log("Received message:", data)
				})

				server.on("error", (err) => {
					console.error("Connection error:", err)
					reject(err)
				})

				// Disconnect after 5 seconds
				setTimeout(() => {
					console.log("Test completed, disconnecting...")
					server.disconnect()
					resolve()
				}, 5000)
			})
		} catch (error) {
			console.error("Test failed:", error)
			reject(error)
		}
	})
}

// Run tests
runTests()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Fatal error:", error)
		process.exit(1)
	})
