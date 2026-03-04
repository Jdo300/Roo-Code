import * as assert from "assert"

import { RooCodeEventName, type ClineMessage } from "@roo-code/types"

import { waitUntilCompleted } from "./utils"
import { setDefaultSuiteTimeout } from "./test-utils"

suite("Roo Code Letta E2E", function () {
	// Give it a long timeout because we are making a real network request
	setDefaultSuiteTimeout(this)

	test("Should handle Letta provider chat and stream correctly", async () => {
		const api = globalThis.api

		const apiKey = process.env.LETTA_API_KEY
		const baseUrl = process.env.LETTA_BASE_URL
		const agentId = process.env.LETTA_AGENT_ID

		if (!apiKey || !baseUrl || !agentId) {
			console.log(
				"Skipping Letta E2E test: Missing environment variables (LETTA_API_KEY, LETTA_BASE_URL, LETTA_AGENT_ID)",
			)
			return
		}

		console.log(`Running Letta E2E test against Agent: ${agentId} at ${baseUrl}`)

		const messages: ClineMessage[] = []

		api.on(RooCodeEventName.Message, ({ message }) => {
			if (message.type === "say" && message.partial === false) {
				messages.push(message)
			}
		})

		const taskId = await api.startNewTask({
			configuration: {
				mode: "ask",
				alwaysAllowModeSwitch: true,
				autoApprovalEnabled: true,
				apiProvider: "letta",
				lettaApiKey: apiKey,
				lettaBaseUrl: baseUrl,
				lettaModelId: agentId,
				lettaConversationMode: "new_task",
			} as any,
			text: "Hello! Please reply to me by saying exactly the phrase: 'Roo Code Letta Integration is successfully working!'",
		})

		await waitUntilCompleted({ api, taskId, timeout: 50_000 })

		const letteResponse = messages.find(({ say }) => say === "completion_result" || say === "text")

		assert.ok(
			letteResponse?.text?.includes("Roo Code Letta Integration is successfully working!"),
			`Completion should include our validation phrase. Received: ${letteResponse?.text}`,
		)
	})
})
