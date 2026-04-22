import * as assert from "assert"

import { RooCodeEventName, type ClineMessage } from "@roo-code/types"

import { sleep, waitUntilCompleted } from "./utils"
import { setDefaultSuiteTimeout } from "./test-utils"

/**
 * Clears any pending tool-call approvals on a Letta agent before running tests.
 * The Letta server allows only one active approval at a time; any stale approval
 * from a previous test run will cause all new messages to receive a 409 CONFLICT.
 */
async function clearLettaPendingApprovals(baseUrl: string, agentId: string): Promise<void> {
	const url = `${baseUrl}/v1/agents/${agentId}/messages?limit=20`
	let messages: Array<Record<string, unknown>>
	try {
		const res = await fetch(url)
		messages = await res.json()
	} catch (_err) {
		// If the agent is unreachable just let the test fail naturally
		return
	}

	// The Letta server only allows denying the *current* awaiting approval —
	// it returns 400 for older ones. Find the latest and deny it; the server
	// will release the lock.
	const lastApproval = [...messages].reverse().find((m) => m.message_type === "approval_request_message")

	if (!lastApproval) return

	const tool = (lastApproval.tool_call ?? (lastApproval.tool_calls as unknown[])?.[0]) as
		| Record<string, unknown>
		| undefined
	const toolCallId = tool?.tool_call_id as string | undefined
	if (!toolCallId) return

	try {
		await fetch(`${baseUrl}/v1/agents/${agentId}/messages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [
					{
						type: "approval",
						approvals: [
							{
								type: "approval",
								approve: false,
								tool_call_id: toolCallId,
								reason: "stale approval cleared by e2e pre-test hook",
							},
						],
					},
				],
			}),
		})
	} catch (_err) {
		// best-effort
	}
}

suite("Roo Code Letta delegation E2E", function () {
	setDefaultSuiteTimeout(this)

	test("should delegate with new_task and resume the parent without getting stuck", async () => {
		const api = globalThis.api
		const baseUrl = process.env.LETTA_BASE_URL || "http://rgaiserver.local:8283"
		const apiKey = process.env.LETTA_API_KEY || "dummy_api_key"
		const agentId = process.env.LETTA_AGENT_ID || "agent-4dba8ddb-c956-43fc-be00-389152971018"
		const modelId = process.env.LETTA_MODEL_ID || "openai-proxy/Qwen3.6-35B-A3B-AWQ"

		// Clear any stale pending approval left by a previous run so we don't get
		// a 409 CONFLICT on the very first message we send.
		await clearLettaPendingApprovals(baseUrl, agentId)

		const runId = Date.now()
		const childToken = `CHILD_DONE_${runId}`
		const parentToken = `PARENT_RESUMED_${runId}`
		const messagesByTask: Record<string, ClineMessage[]> = {}

		api.on(RooCodeEventName.Message, ({ taskId, message }) => {
			if (message.type === "say" && message.partial === false) {
				messagesByTask[taskId] = messagesByTask[taskId] || []
				messagesByTask[taskId].push(message)
			}
		})

		const lettaConfiguration = {
			mode: "ask",
			alwaysAllowModeSwitch: true,
			alwaysAllowSubtasks: true,
			autoApprovalEnabled: true,
			enableCheckpoints: false,
			apiProvider: "letta",
			lettaApiKey: apiKey,
			lettaBaseUrl: baseUrl,
			apiModelId: agentId,
			lettaModelId: modelId,
			lettaConversationMode: "new_task",
		} as Record<string, unknown>

		// Child tasks spawned by the Letta agent use an OpenAI-compatible endpoint
		// so they don't share the same approval lock as the parent Letta task.
		const childConfiguration = {
			apiProvider: "openai",
			openAiBaseUrl: process.env.CHILD_OPENAI_BASE_URL || "http://rgaiserver.local:8000/v1",
			openAiApiKey: process.env.CHILD_OPENAI_API_KEY || "dummy_api_key",
			openAiModelId: process.env.CHILD_OPENAI_MODEL_ID || "Qwen3.6-35B-A3B-AWQ",
		} as Record<string, unknown>

		// Set child config as the active default so spawned subtasks inherit it.
		await api.setConfiguration(childConfiguration)

		const parentTaskId = await api.startNewTask({
			configuration: lettaConfiguration,
			text:
				"You are validating Roo Code delegation resume behavior. " +
				"Your first action must be to call the new_task tool exactly once. " +
				`Create the subtask with this exact message: Reply with exactly ${childToken} and nothing else. ` +
				`After the subtask completes, respond with exactly ${parentToken} ${childToken} and nothing else. ` +
				"Do not solve the child task yourself and do not skip the new_task tool.",
		})

		try {
			await waitUntilCompleted({ api, taskId: parentTaskId, timeout: 90_000, interval: 500 })
			await sleep(1_000)

			const parentMessages = messagesByTask[parentTaskId] || []
			const parentFinal = parentMessages.find(
				({ say, text }) =>
					(say === "completion_result" || say === "text") && text?.includes(`${parentToken} ${childToken}`),
			)

			assert.ok(
				parentFinal,
				`Parent task did not resume cleanly after delegation. Messages:\n${JSON.stringify(parentMessages, null, 2)}`,
			)
		} finally {
			try {
				await api.clearCurrentTask()
			} catch (_err) {
				// ignore cleanup errors
			}
		}
	})
})
