const RooCodeClient = require("./test-node-client")

async function testStartTask() {
	const client = new RooCodeClient()

	try {
		// Set up event handlers like Python client
		client.addEventListener("connect", (data) => {
			console.log("Event: Connected:", data)
		})

		client.addEventListener("disconnect", () => {
			console.log("Event: Disconnected")
		})

		client.addEventListener("error", (error) => {
			console.error("Event: Error:", error)
		})

		client.addEventListener("taskUpdate", (data) => {
			console.log("Event: Task update:", data)
		})

		client.addEventListener("taskStarted", (data) => {
			console.log("Event: Task Started:", data)
		})

		client.addEventListener("taskCompleted", (data) => {
			console.log("Event: Task Completed:", data)
		})

		client.addEventListener("messageReceived", (data) => {
			console.log("Event: Message Received (chunk):", data)
		})

		client.addEventListener("toolUse", (data) => {
			console.log("Event: Tool Use:", data)
		})

		client.addEventListener("toolResult", (data) => {
			console.log("Event: Tool Result:", data)
		})

		client.addEventListener("toolError", (data) => {
			console.error("Event: Tool Error:", data)
		})

		await client.connect()
		console.log("Connected to server")

		// Create test configuration matching schema
		const testConfig = {
			apiProvider: "fake-ai",
			currentApiConfigName: "test-config",
			autoApprovalEnabled: true,
			alwaysAllowReadOnly: true,
			alwaysAllowWrite: true,
			alwaysAllowBrowser: true,
			alwaysAllowExecute: true,
			__type__: "RooCodeSettings",
		}

		console.log("\nTesting StartNewTask command...")
		console.log("Configuration:", testConfig)
		console.log("Text:", "Test task from Node.js client")

		const taskId = await client.startNewTask("Test task from Node.js client", testConfig)

		console.log("Success! Task created with ID:", taskId)
	} catch (error) {
		console.error("Error during test:", error)
	} finally {
		client.disconnect()
		console.log("Disconnected from server")
	}
}

// Run the test
testStartTask().catch((error) => {
	console.error("Unexpected error:", error)
	process.exit(1)
})
