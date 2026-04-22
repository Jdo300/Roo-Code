import { describe, expect, it, vi, beforeEach } from "vitest"
import { Anthropic } from "@anthropic-ai/sdk"
import { RooCodeEventName } from "@roo-code/types"

vi.mock("../Task", async () => {
	const actual = await vi.importActual<typeof import("../Task")>("../Task")
	return actual
})

vi.mock("../../environment/getEnvironmentDetails", () => ({
	getEnvironmentDetails: vi.fn().mockResolvedValue("<environment_details>fresh env</environment_details>"),
}))

import { Task } from "../Task"
import { getEnvironmentDetails } from "../../environment/getEnvironmentDetails"

/** Cast a stub to Task so tests can assign private/readonly fields via any. */
type TaskStub = Record<string, any>

function makeTaskStub(): TaskStub {
	return Object.create(Task.prototype) as TaskStub
}

describe("Task.resumeAfterDelegation", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("does not append environment details to a tool_result-only resume payload", async () => {
		const task = makeTaskStub()
		task.taskId = "parent-task"
		task.emit = vi.fn()
		task.saveApiConversationHistory = vi.fn().mockResolvedValue(undefined)
		task.initiateTaskLoop = vi.fn().mockResolvedValue(undefined)
		task.apiConversationHistory = [
			{
				role: "assistant",
				content: [{ type: "text", text: "Delegating now" }],
			},
			{
				role: "user",
				content: [
					{
						type: "tool_result",
						tool_use_id: "toolu_new_task_1",
						content: "child task completed",
					} satisfies Anthropic.Messages.ToolResultBlockParam,
				],
			},
		]

		await Task.prototype.resumeAfterDelegation.call(task)

		expect(getEnvironmentDetails).toHaveBeenCalledWith(task, true)
		expect(task.emit).toHaveBeenCalledWith(RooCodeEventName.TaskActive, "parent-task")
		expect(task.apiConversationHistory[1].content).toEqual([
			{
				type: "tool_result",
				tool_use_id: "toolu_new_task_1",
				content: "child task completed",
			},
		])
		expect(task.saveApiConversationHistory).toHaveBeenCalledOnce()
		expect(task.initiateTaskLoop).toHaveBeenCalledWith([])
	})

	it("refreshes environment details when the last user message already contains text", async () => {
		const task = makeTaskStub()
		task.taskId = "parent-task"
		task.emit = vi.fn()
		task.saveApiConversationHistory = vi.fn().mockResolvedValue(undefined)
		task.initiateTaskLoop = vi.fn().mockResolvedValue(undefined)
		task.apiConversationHistory = [
			{
				role: "user",
				content: [
					{ type: "text", text: "Continue with the parent task." },
					{ type: "text", text: "<environment_details>stale env</environment_details>" },
				],
			},
		]

		await Task.prototype.resumeAfterDelegation.call(task)

		expect(task.apiConversationHistory[0].content).toEqual([
			{ type: "text", text: "Continue with the parent task." },
			{ type: "text", text: "<environment_details>fresh env</environment_details>" },
		])
		expect(task.saveApiConversationHistory).toHaveBeenCalledOnce()
		expect(task.initiateTaskLoop).toHaveBeenCalledWith([])
	})
})
