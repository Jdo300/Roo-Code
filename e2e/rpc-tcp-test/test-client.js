const { RooCodeClient } = require("../../evals/packages/rpc-client")

// Configuration from env vars or defaults
const config = {
	host: process.env.ROO_CODE_IPC_TCP_HOST || "localhost",
	port: parseInt(process.env.ROO_CODE_IPC_TCP_PORT || "3000", 10),
	type: "tcp",
}

console.log("Connecting with config:", config)

// Helper to format log messages
const log = (type, message, data = "") => {
	const timestamp = new Date().toISOString()
	console.log(`[${timestamp}] [${type}] ${message}`, data ? JSON.stringify(data, null, 2) : "")
}

async function runTests() {
	const client = new RooCodeClient(config)

	// Set up event listeners
	client.on("connect", (data) => log("EVENT", "Connected to server", data))
	client.on("disconnect", () => log("EVENT", "Disconnected from server"))
	client.on("error", (error) => log("ERROR", error.message))
	client.on("message", (message) => log("MESSAGE", "Received message", message))

	try {
		// Connect to server
		log("INFO", "Connecting to server...", config)
		await client.connect()

		// Test isReady
		log("TEST", "Testing isReady()")
		const ready = await client.isReady()
		log("RESULT", "isReady() returned", ready)

		// Test starting a new task
		log("TEST", "Testing startNewTask()")
		const taskId = await client.startNewTask({
			text: "Hello from test client!",
			configuration: {
				model: "gpt-4",
			},
		})
		log("RESULT", "startNewTask() returned taskId", taskId)

		// Test getting task stack
		log("TEST", "Testing getCurrentTaskStack()")
		const stack = await client.getCurrentTaskStack()
		log("RESULT", "getCurrentTaskStack() returned", stack)

		// Test sending a message
		log("TEST", "Testing sendMessage()")
		await client.sendMessage("Test message from RPC client")
		log("RESULT", "sendMessage() completed")

		// Test getting messages
		log("TEST", "Testing getMessages()")
		await client.getMessages(taskId)
		log("RESULT", "getMessages() completed")

		// Test getting token usage
		log("TEST", "Testing getTokenUsage()")
		await client.getTokenUsage(taskId)
		log("RESULT", "getTokenUsage() completed")

		// Test clearing current task
		log("TEST", "Testing clearCurrentTask()")
		await client.clearCurrentTask("Test completed")
		log("RESULT", "clearCurrentTask() completed")

		// Graceful shutdown
		log("INFO", "Tests completed, disconnecting...")
		client.disconnect()
	} catch (error) {
		log("ERROR", "Test failed", error)
		client.disconnect()
		process.exit(1)
	}
}

// Run the tests
runTests().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
