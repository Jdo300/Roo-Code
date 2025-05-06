import RooCodeClient from "./test-node-client.js"

async function testStartTask() {
	console.log("Starting RPC test client...")
	const client = new RooCodeClient()

	try {
		// Set up event handlers according to API schema
		console.log("Setting up event handlers...")

		client.on("connect", (data) => {
			console.log("Event: Connected with data:", JSON.stringify(data, null, 2))
		})

		client.on("disconnect", () => {
			console.log("Event: Disconnected from server")
		})

		client.on("error", (error) => {
			console.error("Event: Error occurred:", error)
		})

		console.log("Attempting to connect to server...")

		// Wait for successful connection and Ack
		await new Promise((resolve, reject) => {
			const connectionTimeout = setTimeout(() => {
				reject(new Error("Connection timeout waiting for Ack"))
			}, 5000)

			client.once("connect", (data) => {
				console.log("Successfully connected and received Ack:", data)
				clearTimeout(connectionTimeout)
				resolve()
			})

			client.connect().catch(reject)
		})

		// Get the default profile
		console.log("\nStep 1: Getting profiles...")
		try {
			console.log("Sending GetProfiles command...")
			try {
				const profiles = await client.getProfiles()
				console.log("Available profiles:", JSON.stringify(profiles, null, 2))
			} catch (error) {
				console.error("Error getting profiles:", error)
			}

			console.log("Sending GetActiveProfile command...")
			try {
				const activeProfile = await client.getActiveProfile()
				console.log("Active profile:", JSON.stringify(activeProfile, null, 2))
			} catch (error) {
				console.error("Error getting active profile:", error)
			}
		} catch (error) {
			console.error("Failed to get profiles:", error.message)
			throw error
		}

		// Get current configuration from the profile
		console.log("\nStep 2: Getting configuration...")
		let config
		try {
			config = await client.getConfiguration()
			console.log("Current configuration:", JSON.stringify(config, null, 2))
		} catch (error) {
			console.error("Failed to get configuration:", error.message)
			throw error
		}

		console.log("\nTesting StartNewTask command...")
		console.log("Text:", "Test task from Node.js client")

		try {
			const taskId = await client.startNewTask("Test task from Node.js client", config)
			console.log("Success! Task created with ID:", taskId)

			// Wait for task completion or timeout
			await new Promise((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error("Task timeout after 60s"))
				}, 60000)

				client.on("TaskCompleted", () => {
					clearTimeout(timeout)
					resolve()
				})

				client.on("TaskAborted", (error) => {
					clearTimeout(timeout)
					reject(new Error(`Task aborted: ${error}`))
				})
			})
		} catch (error) {
			console.error("Error starting/running task:", error)
			throw error
		}
	} catch (error) {
		console.error("Error during test:", error)
	} finally {
		if (client) {
			client.disconnect()
			console.log("Disconnected from server")
		}
	}
}

// Run the test
testStartTask().catch((error) => {
	console.error("Unexpected error:", error)
	process.exit(1)
})
