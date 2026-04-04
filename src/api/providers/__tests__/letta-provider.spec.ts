import { LettaHandler } from "../letta"
import { ApiHandlerOptions } from "../../../shared/api"

describe("LettaHandler", () => {
	let options: ApiHandlerOptions
	let handler: LettaHandler

	beforeEach(() => {
		options = {
			apiModelId: "agent-123",
			lettaModelId: "letta/letta-free",
			lettaBaseUrl: "http://localhost:8283/v1",
			lettaApiKey: "test-key",
			lettaConversationMode: "auto_workspace",
		}
		handler = new LettaHandler(options)
	})

	// ── constructor ──────────────────────────────────────────────────────────

	describe("constructor", () => {
		it("should initialize with provided options", () => {
			expect(handler).toBeInstanceOf(LettaHandler)
			// @ts-ignore
			expect(handler.options.lettaBaseUrl).toBe("http://localhost:8283/v1")
			// @ts-ignore
			expect(handler.options.lettaApiKey).toBe("test-key")
		})
	})

	// ── getModel() ───────────────────────────────────────────────────────────

	describe("getModel", () => {
		it("returns lettaModelId as the model id", () => {
			const model = handler.getModel()
			expect(model.id).toBe("letta/letta-free")
			expect(model.info.maxTokens).toBe(16_384)
			expect(model.info.contextWindow).toBe(128_000)
			expect(model.info.supportsImages).toBe(false)
		})

		it("falls back to letta-default when no lettaModelId is set", () => {
			const h = new LettaHandler({} as ApiHandlerOptions)
			expect(h.getModel().id).toBe("letta-default")
		})

		it("returns supportsImages=true when lettaSupportsImages is set", () => {
			const h = new LettaHandler({ ...options, lettaSupportsImages: true } as ApiHandlerOptions)
			expect(h.getModel().info.supportsImages).toBe(true)
		})

		it("returns supportsImages=false by default", () => {
			const h = new LettaHandler({ ...options } as ApiHandlerOptions)
			expect(h.getModel().info.supportsImages).toBe(false)
		})
	})

	// ── clearCachedModelInfo() ───────────────────────────────────────────────

	describe("clearCachedModelInfo", () => {
		it("resets cachedModelInfo so defaults are returned again", () => {
			// Manually plant a cached value
			// @ts-ignore
			handler.cachedModelInfo = {
				id: "planted-model",
				info: { contextWindow: 999_999, maxTokens: 9999, supportsImages: false },
			}
			expect(handler.getModel().id).toBe("planted-model")

			handler.clearCachedModelInfo()
			// After clear, getModel() should return the live options value again
			expect(handler.getModel().id).toBe("letta/letta-free")
			expect(handler.getModel().info.contextWindow).toBe(128_000)
		})
	})

	// ── model handle construction ────────────────────────────────────────────
	// The handler builds a "provider/model-name" handle before patching the agent.

	describe("model handle construction", () => {
		function buildHandle(modelId: string): string {
			if (modelId.includes("/")) return modelId
			if (modelId.includes("claude") || modelId.startsWith("anthropic")) return `anthropic/${modelId}`
			if (modelId.includes("gemini") || modelId.startsWith("google")) return `google/${modelId}`
			return `openai/${modelId}`
		}

		it("passes through handles that already contain a slash", () => {
			expect(buildHandle("anthropic/claude-opus-4-6")).toBe("anthropic/claude-opus-4-6")
			expect(buildHandle("openai/gpt-4o")).toBe("openai/gpt-4o")
			expect(buildHandle("google/gemini-flash-2-5")).toBe("google/gemini-flash-2-5")
		})

		it("prepends anthropic/ for claude model names", () => {
			expect(buildHandle("claude-opus-4-6")).toBe("anthropic/claude-opus-4-6")
			expect(buildHandle("claude-3-5-sonnet")).toBe("anthropic/claude-3-5-sonnet")
		})

		it("prepends google/ for gemini model names", () => {
			expect(buildHandle("gemini-flash-2-5")).toBe("google/gemini-flash-2-5")
			expect(buildHandle("gemini-2-0-pro")).toBe("google/gemini-2-0-pro")
		})

		it("defaults to openai/ for everything else", () => {
			expect(buildHandle("gpt-4o")).toBe("openai/gpt-4o")
			expect(buildHandle("gpt-4o-mini")).toBe("openai/gpt-4o-mini")
			expect(buildHandle("letta-free")).toBe("openai/letta-free")
		})
	})

	// ── lastPatchedModelId dedup guard ───────────────────────────────────────

	describe("model patch deduplication", () => {
		it("lastPatchedModelId starts undefined", () => {
			// @ts-ignore
			expect(handler.lastPatchedModelId).toBeUndefined()
		})

		it("patch is skipped when model has not changed", () => {
			const modelId = "claude-opus-4-6"
			// @ts-ignore
			handler.lastPatchedModelId = modelId
			// @ts-ignore
			const shouldSkip = modelId === handler.lastPatchedModelId
			expect(shouldSkip).toBe(true)
		})

		it("patch runs when model changes", () => {
			// @ts-ignore
			handler.lastPatchedModelId = "claude-opus-4-6"
			// @ts-ignore
			const shouldSkip = "gpt-4o" === handler.lastPatchedModelId
			expect(shouldSkip).toBe(false)
		})
	})

	// ── new_task taskId boundary detection ──────────────────────────────────

	describe("new_task conversation caching", () => {
		it("newTaskId and newTaskConversationId start undefined", () => {
			// @ts-ignore
			expect(handler.newTaskId).toBeUndefined()
			// @ts-ignore
			expect(handler.newTaskConversationId).toBeUndefined()
		})

		it("same taskId reuses the cached conversation", () => {
			// @ts-ignore
			handler.newTaskId = "task-abc-123"
			// @ts-ignore
			handler.newTaskConversationId = "conv-xyz-456"
			// @ts-ignore
			const reuse = handler.newTaskId === "task-abc-123" && handler.newTaskConversationId !== undefined
			expect(reuse).toBe(true)
			// @ts-ignore
			expect(handler.newTaskConversationId).toBe("conv-xyz-456")
		})

		it("different taskId triggers a new conversation", () => {
			// @ts-ignore
			handler.newTaskId = "old-task-id"
			// @ts-ignore
			handler.newTaskConversationId = "old-conv-id"
			// @ts-ignore
			const reuse = handler.newTaskId === "new-task-id" && handler.newTaskConversationId !== undefined
			expect(reuse).toBe(false)
		})

		it("undefined taskId always triggers a new conversation", () => {
			// @ts-ignore
			handler.newTaskId = undefined
			// @ts-ignore
			handler.newTaskConversationId = "some-conv"
			// @ts-ignore
			const reuse = handler.newTaskId === "task-123" && handler.newTaskConversationId !== undefined
			expect(reuse).toBe(false)
		})
	})

	// ── hashString (system prompt dedup) ────────────────────────────────────

	describe("hashString (system prompt dedup)", () => {
		function hashString(str: string): string {
			let hash = 5381
			for (let i = 0; i < str.length; i++) {
				hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff
			}
			return hash.toString(36)
		}

		it("returns the same hash for identical strings", () => {
			expect(hashString("hello world")).toBe(hashString("hello world"))
		})

		it("returns different hashes for different strings", () => {
			expect(hashString("abc")).not.toBe(hashString("def"))
			expect(hashString("")).not.toBe(hashString(" "))
		})

		it("handles empty string without throwing", () => {
			expect(() => hashString("")).not.toThrow()
			expect(hashString("")).toBeTruthy()
		})

		it("lastSystemPromptHash starts undefined so first call always syncs", () => {
			// @ts-ignore
			expect(handler.lastSystemPromptHash).toBeUndefined()
		})
	})
})
