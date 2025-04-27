import { requestyDefaultModelId, requestyDefaultModelInfo } from "../../shared/api"
import { calculateApiCostOpenAI } from "../../utils/cost"
import { OpenAiHandler } from "./openai"
import { getModels } from "./fetchers/cache"
export class RequestyHandler extends OpenAiHandler {
	models = {}
	constructor(options) {
		if (!options.requestyApiKey) {
			throw new Error("Requesty API key is required. Please provide it in the settings.")
		}
		super({
			...options,
			openAiApiKey: options.requestyApiKey,
			openAiModelId: options.requestyModelId ?? requestyDefaultModelId,
			openAiBaseUrl: "https://router.requesty.ai/v1",
		})
	}
	async *createMessage(systemPrompt, messages) {
		this.models = await getModels("requesty")
		yield* super.createMessage(systemPrompt, messages)
	}
	getModel() {
		const id = this.options.requestyModelId ?? requestyDefaultModelId
		const info = this.models[id] ?? requestyDefaultModelInfo
		return { id, info }
	}
	processUsageMetrics(usage, modelInfo) {
		const requestyUsage = usage
		const inputTokens = requestyUsage?.prompt_tokens || 0
		const outputTokens = requestyUsage?.completion_tokens || 0
		const cacheWriteTokens = requestyUsage?.prompt_tokens_details?.caching_tokens || 0
		const cacheReadTokens = requestyUsage?.prompt_tokens_details?.cached_tokens || 0
		const totalCost = modelInfo
			? calculateApiCostOpenAI(modelInfo, inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens)
			: 0
		return {
			type: "usage",
			inputTokens: inputTokens,
			outputTokens: outputTokens,
			cacheWriteTokens: cacheWriteTokens,
			cacheReadTokens: cacheReadTokens,
			totalCost: totalCost,
		}
	}
	async completePrompt(prompt) {
		this.models = await getModels("requesty")
		return super.completePrompt(prompt)
	}
}
//# sourceMappingURL=requesty.js.map
