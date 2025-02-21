import { RooCodeClient } from "./index.js"

async function testBasicFunctionality() {
	const client = new RooCodeClient()

	try {
		console.log("Testing basic functionality...")
		await client.connect()

		// Test auto-approve settings
		console.log("\nTesting auto-approve settings...")
		const autoApproveResponse = await client.setAutoApproveFiles(true)
		console.log("Auto-approve files:", autoApproveResponse)

		// Test run command
		console.log("\nTesting run command...")
		const runResponse = await client.run("Create a hello world program")
		console.log("Run response:", runResponse)

		// Test allow action
		console.log("\nTesting allow action...")
		const allowResponse = await client.allowAction("test action")
		console.log("Allow response:", allowResponse)

		// Test deny action
		console.log("\nTesting deny action...")
		const denyResponse = await client.denyAction("test denial")
		console.log("Deny response:", denyResponse)

		// Test stop command
		console.log("\nTesting stop command...")
		const stopResponse = await client.stop()
		console.log("Stop response:", stopResponse)

		// Clean up auto-approve setting
		await client.setAutoApproveFiles(false)

		console.log("\nBasic functionality tests completed successfully!")
	} finally {
		await client.close()
	}
}

async function testErrorHandling() {
	console.log("\nTesting error handling...")

	// Test invalid port connection
	try {
		const invalidClient = new RooCodeClient(1234)
		await invalidClient.connect()
		console.error("Expected connection error for invalid port")
	} catch (error) {
		console.log("Successfully caught invalid port error:", error.message)
	}

	// Test sending command without connection
	try {
		const disconnectedClient = new RooCodeClient()
		await disconnectedClient.run("test")
		console.error("Expected error for sending without connection")
	} catch (error) {
		console.log("Successfully caught disconnected error:", error.message)
	}

	// Test invalid command format
	const client = new RooCodeClient()
	try {
		await client.connect()
		await client.send("invalid_command", {})
		console.error("Expected error for invalid command")
	} catch (error) {
		console.log("Successfully caught invalid command error:", error.message)
	} finally {
		await client.close()
	}

	console.log("Error handling tests completed successfully!")
}

async function testConnectionTimeout() {
	console.log("\nTesting connection timeout...")

	// Test connection timeout
	const timeoutClient = new RooCodeClient(9999) // Use non-existent port
	try {
		await Promise.race([
			timeoutClient.connect(),
			new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
		])
		console.error("Expected timeout error")
	} catch (error) {
		console.log("Successfully caught timeout error:", error.message)
	}

	console.log("Timeout tests completed successfully!")
}

async function runAllTests() {
	try {
		await testBasicFunctionality()
		await testErrorHandling()
		await testConnectionTimeout()
		console.log("\nAll tests completed successfully!")
	} catch (error) {
		console.error("\nTest suite failed:", error)
		process.exit(1)
	}
}

// Run all tests
runAllTests().catch((error) => {
	console.error("Fatal error:", error)
	process.exit(1)
})
