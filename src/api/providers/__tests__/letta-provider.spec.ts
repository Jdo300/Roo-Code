import { LettaHandler } from "../letta"
import { ApiHandlerOptions } from "../../../shared/api"

describe("LettaHandler", () => {
	let options: ApiHandlerOptions
	let handler: LettaHandler

	beforeEach(() => {
		options = {
			apiModelId: "agent-123",
			lettaBaseUrl: "http://localhost:8283/v1",
			lettaApiKey: "test-key",
			lettaConversationMode: "auto_workspace",
		}
		handler = new LettaHandler(options)
	})

	describe("constructor", () => {
		it("should initialize with provided options", () => {
			expect(handler).toBeInstanceOf(LettaHandler)
			// @ts-ignore - access private property
			expect(handler.baseUrl).toBe("http://localhost:8283/v1")
			// @ts-ignore
			expect(handler.apiKey).toBe("test-key")
		})
	})

	describe("getModel", () => {
		it("should return the correct model info", () => {
			const model = handler.getModel()
			expect(model.id).toBe("agent-123")
			expect(model.info.maxTokens).toBe(8192)
			expect(model.info.contextWindow).toBe(128000)
			expect(model.info.supportsImages).toBe(false)
		})

		it("should fallback to 'letta-agent' if no apiModelId is provided", () => {
			const emptyOptions = {}
			const emptyHandler = new LettaHandler(emptyOptions)
			const model = emptyHandler.getModel()
			expect(model.id).toBe("letta-agent")
		})
	})
})
