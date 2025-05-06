import RooCodeClient from "./test-node-client.js"

async function testStartTask() {
	const client = new RooCodeClient()

	try {
		// Set up event handlers according to API schema
		client.on("connect", (data) => {
			console.log("Event: Connected:", data)
		})

		client.on("disconnect", () => {
			console.log("Event: Disconnected")
		})

		client.on("error", (error) => {
			console.error("Event: Error:", error)
		})

		await client.connect()
		console.log("Connected to server")

		// Use complete configuration for Gemini provider
		const testConfig = {
			apiProvider: "gemini",
			currentApiConfigName: "gemini",
			autoApprovalEnabled: true,
			alwaysAllowReadOnly: true,
			alwaysAllowWrite: true,
			alwaysAllowBrowser: true,
			alwaysAllowExecute: true,
			__type__: "RooCodeSettings",
			geminiApiKey: process.env.GEMINI_API_KEY,
			telemetrySetting: "disabled",
			promptCachingEnabled: true,
			diffEnabled: true,
			fuzzyMatchThreshold: 0.8,
			modelTemperature: 0.7,
			rateLimitSeconds: 0,
			includeMaxTokens: true,
			reasoningEffort: "high",
		}

		console.log("\nTesting StartNewTask command...")
		console.log("Configuration:", testConfig)
		console.log("Text:", "Test task from Node.js client")

		try {
			const taskId = await client.startNewTask("Test task from Node.js client", testConfig)
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
