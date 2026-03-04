import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useLettaModels } from "./useLettaModels"

// Mock the vscode API
const mockPostMessage = vi.fn()
Object.defineProperty(window, "vscode", {
	value: {
		postMessage: mockPostMessage,
	},
	writable: true,
})

vi.mock("@src/utils/vscode", () => ({
	vscode: {
		postMessage: (...args: any[]) => mockPostMessage(...args),
	},
}))

describe("useLettaModels", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should fetch models when initialized with an API key", async () => {
		const req = { lettaBaseUrl: "http://test", lettaApiKey: "test-key" }
		const { result } = renderHook(() => useLettaModels(req))

		expect(result.current.modelsLoading).toBe(true)
		expect(mockPostMessage).toHaveBeenCalledWith({
			type: "requestLettaModels",
			values: { lettaBaseUrl: "http://test", lettaApiKey: "test-key" },
		})

		// Simulate the extension host responding with models
		await act(async () => {
			const event = new MessageEvent("message", {
				data: {
					type: "lettaModels",
					lettaModels: [
						{ id: "1", model: "openai/gpt-4o", model_endpoint_type: "openai", context_window: 128000 },
					],
				},
			})
			window.dispatchEvent(event)
		})

		expect(result.current.modelsLoading).toBe(false)
		expect(result.current.models.length).toBe(1)
		expect(result.current.models[0].model).toBe("openai/gpt-4o")
		expect(result.current.modelsError).toBeNull()
	})

	it("should handle timeout errors", async () => {
		vi.useFakeTimers()
		const req = { lettaBaseUrl: "http://test", lettaApiKey: "test-key" }
		const { result } = renderHook(() => useLettaModels(req))

		expect(result.current.modelsLoading).toBe(true)

		await act(async () => {
			vi.advanceTimersByTime(11000) // Trigger 10s timeout
		})

		expect(result.current.modelsLoading).toBe(false)
		expect(result.current.modelsError).toBe("Letta models request timed out")
		expect(result.current.models.length).toBe(0)

		vi.useRealTimers()
	})
})
