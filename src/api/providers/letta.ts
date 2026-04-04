import { Anthropic } from "@anthropic-ai/sdk"
import { Letta, LettaError } from "@letta-ai/letta-client"
import { ModelInfo } from "@roo-code/types"
import { ApiHandlerOptions } from "../../shared/api"
import { ApiHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"

export class LettaHandler extends BaseProvider implements ApiHandler {
	private options: ApiHandlerOptions
	private client: Letta

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		const baseUrl = options.lettaBaseUrl || "https://api.letta.com/v1"
		// The SDK accepts a base URL without the /v1 suffix for some environments,
		// but Letta Cloud uses /v1 as the base. We strip /v1 if needed.
		const sdkBase = baseUrl.endsWith("/v1") ? baseUrl.slice(0, -3) : baseUrl
		this.client = new Letta({
			apiKey: options.lettaApiKey || "not-provided",
			baseURL: sdkBase,
		})
	}

	// Cache workspace conversation ID across calls to avoid re-listing every time
	private workspaceConversationId: string | undefined

	// Cache the hash of the last system prompt synced to the agent block
	private lastSystemPromptHash: string | undefined

	private async syncSystemPromptBlock(agentId: string, systemPrompt: string): Promise<void> {
		const BLOCK_LABEL = "roo_system"
		const hash = this.hashString(systemPrompt)
		if (hash === this.lastSystemPromptHash) {
			return
		}

		try {
			let existingValue: string | undefined
			try {
				const block = await this.client.agents.blocks.retrieve(BLOCK_LABEL, { agent_id: agentId })
				existingValue = block.value
			} catch {
				// Block doesn't exist — create and attach it
				try {
					const newBlock = await this.client.blocks.create({
						label: BLOCK_LABEL,
						value: systemPrompt,
						description: "Roo Code system prompt (auto-synced)",
						read_only: true,
					})
					await this.client.agents.blocks.attach(newBlock.id!, { agent_id: agentId })
					this.lastSystemPromptHash = hash
					console.debug("[LettaHandler] Created and attached roo_system block")
					return
				} catch (createErr) {
					console.warn("[LettaHandler] Could not create roo_system block:", createErr)
					return
				}
			}

			if (existingValue !== systemPrompt) {
				await this.client.agents.blocks.update(BLOCK_LABEL, {
					agent_id: agentId,
					value: systemPrompt,
				})
				console.debug("[LettaHandler] Updated roo_system block (content changed)")
			}
			this.lastSystemPromptHash = hash
		} catch (e) {
			console.warn("[LettaHandler] Could not sync system prompt block:", e)
		}
	}

	private hashString(str: string): string {
		let hash = 5381
		for (let i = 0; i < str.length; i++) {
			hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff
		}
		return hash.toString(36)
	}

	private async getOrCreateConversation(
		agentId: string,
		metadata?: ApiHandlerCreateMessageMetadata,
	): Promise<string | undefined> {
		const mode = this.options.lettaConversationMode || "auto_workspace"

		if (mode === "manual") {
			return this.options.lettaConversationId
		}

		if (mode === "new_task") {
			try {
				const conv = await this.client.conversations.create({ agent_id: agentId })
				console.debug(`[LettaHandler] Created new conversation: ${conv.id}`)
				return conv.id
			} catch (e) {
				console.warn("[LettaHandler] Could not create conversation:", e)
				return undefined
			}
		}

		if (mode === "auto_workspace") {
			// Return cached conversation if we already resolved it this session
			if (this.workspaceConversationId) {
				return this.workspaceConversationId
			}
			try {
				const conversations = await this.client.conversations.list({ agent_id: agentId })
				// Reuse the most recent non-archived conversation, or create a new one
				const convArray = Array.isArray(conversations) ? conversations : []
				const active = convArray.filter((c: any) => !c.archived)
				if (active.length > 0) {
					// Use most recently updated conversation
					active.sort((a: any, b: any) => {
						const aTime = a.last_message_at || a.updated_at || ""
						const bTime = b.last_message_at || b.updated_at || ""
						return bTime.localeCompare(aTime)
					})
					this.workspaceConversationId = active[0].id
					console.debug(`[LettaHandler] Reusing conversation: ${this.workspaceConversationId}`)
					return this.workspaceConversationId
				}
				const conv = await this.client.conversations.create({ agent_id: agentId })
				this.workspaceConversationId = conv.id
				console.debug(`[LettaHandler] Created workspace conversation: ${conv.id}`)
				return this.workspaceConversationId
			} catch (e) {
				console.warn("[LettaHandler] Could not get/create workspace conversation:", e)
				return undefined
			}
		}

		return undefined
	}

	async *createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		// The Agent ID is required to communicate with Letta
		const agentId = this.options.apiModelId
		if (!agentId || agentId.trim() === "") {
			throw new Error("Letta Agent ID (Model ID) is required.")
		}

		let conversationId: string | undefined = undefined
		try {
			conversationId = await this.getOrCreateConversation(agentId, metadata)
		} catch (e) {
			console.warn("Could not get or create Letta conversation, falling back to agent default memory", e)
		}

		// Map Anthropic message format to Letta's expected format.
		// We use role/content strings natively; tool calls and tool results are also mapped.
		const lettaMessages: { role: "user" | "assistant"; content: string; tool_calls?: unknown[]; name?: string }[] =
			messages.flatMap((msg: Anthropic.Messages.MessageParam) => {
				if (msg.role === "user") {
					if (Array.isArray(msg.content)) {
						const content = msg.content
							.filter((part) => part.type === "text" || part.type === "image")
							.map((part) => (part.type === "text" ? part.text : ""))
							.join("\n")

						const toolReturns = msg.content
							.filter((part) => part.type === "tool_result")
							.map((part: Anthropic.Messages.ToolResultBlockParam) => ({
								role: "user" as const,
								name: part.tool_use_id,
								content: typeof part.content === "string" ? part.content : JSON.stringify(part.content),
							}))

						const result: typeof lettaMessages = []
						if (content) result.push({ role: "user", content })
						if (toolReturns.length > 0) result.push(...toolReturns)
						return result
					}
					return [{ role: "user", content: String(msg.content) }]
				} else if (msg.role === "assistant") {
					if (Array.isArray(msg.content)) {
						const content = msg.content
							.filter((part) => part.type === "text")
							.map((part: Anthropic.Messages.TextBlockParam) => part.text)
							.join("\n")

						const toolCalls = msg.content
							.filter((part) => part.type === "tool_use")
							.map((part: Anthropic.Messages.ToolUseBlockParam) => ({
								id: part.id,
								type: "function",
								function: {
									name: part.name,
									arguments: typeof part.input === "string" ? part.input : JSON.stringify(part.input),
								},
							}))

						if (toolCalls.length > 0) {
							return [{ role: "assistant", content: content || "", tool_calls: toolCalls }]
						}
						return [{ role: "assistant", content }]
					}
					return [{ role: "assistant", content: String(msg.content) }]
				}
				return [{ role: "user", content: String((msg as { content: unknown }).content) }]
			})

		// When a conversation_id is set, Letta maintains full history internally.
		// Only send messages from the last user turn onward to avoid duplicating history.
		const messagesToSend = conversationId
			? lettaMessages.slice(lettaMessages.map((m) => m.role).lastIndexOf("user"))
			: lettaMessages

		// Sync system prompt to a dedicated core memory block on the agent.
		// This avoids sending the full system prompt as a user message every turn,
		// which would clutter the context window. Only updates when content changes.
		if (systemPrompt) {
			await this.syncSystemPromptBlock(agentId, systemPrompt)
		}

		// Patch agent model settings before sending messages to prevent "model-unknown" 429 errors.
		// Patch model settings if lettaModelId looks like a real model name (not an agent UUID).
		// When lettaModelId is unset or is an agent UUID, skip patching — the agent already
		// has its model configured in Letta Cloud.
		const modelId = this.options.lettaModelId || ""
		const isAgentUUID = modelId.startsWith("agent-") || /^[0-9a-f-]{36}$/.test(modelId)
		if (modelId && !isAgentUUID && modelId !== "letta-default") {
			let providerType = "openai"
			if (modelId.includes("claude") || modelId.startsWith("anthropic/")) {
				providerType = "anthropic"
			} else if (modelId.includes("gemini") || modelId.startsWith("google/")) {
				providerType = "gemini"
			}

			try {
				await this.client.agents.update(agentId, {
					// @ts-expect-error — model_settings is valid but not yet typed in the SDK wrapper
					model_settings: { name: modelId, provider_type: providerType },
				})
				// Invalidate model cache so next getModel() reflects new llm_config
				this.cachedModelInfo = undefined
				console.debug(`[LettaHandler] Patched agent ${agentId} model to: ${modelId} (${providerType})`)
			} catch (e) {
				console.warn("[LettaHandler] Could not patch agent model settings:", e)
			}
		} else {
			console.debug(`[LettaHandler] Skipping model patch — using agents existing model config`)
		}

		// Build client_tools array in the flat schema Letta expects.
		// metadata.tools is OpenAI.Chat.ChatCompletionTool[] (a union that includes
		// ChatCompletionCustomTool which has no .function). Filter to function tools only.
		const clientTools = metadata?.tools
			?.filter((t) => t.type === "function")
			.map((tool) => {
				const fn = (tool as any).function as {
					name: string
					description?: string
					parameters?: Record<string, unknown>
				}
				return {
					name: fn.name,
					description: fn.description ?? "",
					parameters: fn.parameters,
				}
			})
		let needsCancelAfterStream = false

		try {
			const stream = await this.client.agents.messages.stream(agentId, {
				messages: messagesToSend as any,
				// @ts-expect-error — conversation_id and client_tools are valid but some types may be incomplete
				conversation_id: conversationId,
				client_tools: clientTools as any,
			})

			for await (const chunk of stream as AsyncIterable<any>) {
				const msgType = chunk.message_type

				if (!msgType) continue

				// Surface agent thinking as text — useful for debugging
				if (msgType === "reasoning_message") {
					const reasoning = chunk.reasoning
					if (reasoning && typeof reasoning === "string" && reasoning.length > 0) {
						yield { type: "text", text: reasoning }
					}
					continue
				}

				// Main response content
				if (msgType === "assistant_message") {
					const content = chunk.content
					if (content && typeof content === "string" && content.length > 0) {
						yield { type: "text", text: content }
					}
					continue
				}

				// Tool calls — both regular and approval-gated ones
				if (msgType === "tool_call_message" || msgType === "approval_request_message") {
					// approval_request_message = Letta's approval gate for client_tools.
					// Cancel the pending run after the stream so the next turn doesn't 409.
					if (msgType === "approval_request_message") {
						needsCancelAfterStream = true
					}
					const toolCall = chunk.tool_call ?? {}
					const toolCalls: any[] = chunk.tool_calls ?? (toolCall.name ? [toolCall] : [])

					for (const tool of toolCalls) {
						const args = tool.arguments
						yield {
							type: "tool_call",
							id: tool.tool_call_id || "tool_" + Date.now(),
							name: tool.name || "",
							arguments: typeof args === "object" && args !== null ? JSON.stringify(args) : (args ?? ""),
						}
					}
					continue
				}

				// Usage statistics
				if (msgType === "usage_statistics") {
					const usage = chunk
					yield {
						type: "usage",
						inputTokens: (usage.prompt_tokens ?? 0) - (usage.cached_input_tokens ?? 0),
						outputTokens: usage.completion_tokens ?? 0,
						cacheReadTokens: usage.cached_input_tokens,
					}
					continue
				}
			}

			// If agent paused on approval_request, cancel the run so the
			// tool result can be sent without a 409 conflict on the next turn.
			if (needsCancelAfterStream) {
				try {
					await this.client.agents.messages.cancel(agentId)
					console.debug("[LettaHandler] Cancelled pending approval.")
				} catch (cancelErr) {
					console.warn("[LettaHandler] Could not cancel approval:", cancelErr)
				}
			}
		} catch (e: any) {
			if (e instanceof LettaError) {
				// Check for the 409 conflict that occurs in the response body when agent requires approval
				const body = JSON.stringify((e as any).body ?? "")
				const statusCode = (e as any).status || (e as any).statusCode
				if (statusCode === 409 || body.includes("CONFLICT") || body.includes("waiting for approval")) {
					throw new Error(
						`Letta API Error: 409 (Conflict). The agent is waiting for tool approval from a previous attempt. ` +
							`Please go to Letta Cloud, click "Reset Agent" or "Clear All Messages", or create a new agent to continue.`,
					)
				}
				throw new Error(`Letta API Error: ${statusCode || "Unknown"} - ${e.message}`)
			}
			throw e
		}
	}

	// Cached model info fetched from the agent on first call
	private cachedModelInfo: { id: string; info: ModelInfo } | undefined

	/** Clear the model info cache — call this when the user refreshes agents or models */
	public clearCachedModelInfo(): void {
		this.cachedModelInfo = undefined
		console.debug("[LettaHandler] Model info cache cleared")
	}

	override getModel(): { id: string; info: ModelInfo } {
		if (this.cachedModelInfo) {
			return this.cachedModelInfo
		}
		const modelId = this.options.lettaModelId || "letta-default"
		const defaults = {
			id: modelId,
			info: {
				maxTokens: 16_384,
				contextWindow: 128_000,
				supportsImages: false,
				supportsComputerUse: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "Letta Agent (model configured per-agent in Letta Cloud)",
			},
		}
		// Async fetch to populate cache for subsequent calls
		this.fetchAndCacheModelInfo().catch(() => {})
		return defaults
	}

	private async fetchAndCacheModelInfo(): Promise<void> {
		const agentId = this.options.apiModelId
		if (!agentId) return
		try {
			// Fetch agent to get llm_config (current model name, defaults)
			const agent = await this.client.agents.retrieve(agentId)
			const llm = (agent as any).llm_config || {}
			const modelId = this.options.lettaModelId || llm.model || "letta-default"

			// Look up the model in Letta's model catalog to get accurate capacity values.
			// The catalog has real context_window and max_tokens for every available model.
			let catalogContextWindow: number | undefined
			let catalogMaxTokens: number | undefined
			try {
				const allModels = await this.client.models.list()
				// Match by model field (short name like "gpt-4o") — this is what lettaModelId stores
				const catalogEntry = (allModels as any[]).find(
					(m: any) => m.model === modelId || m.model === llm.model || m.handle === modelId,
				)
				if (catalogEntry) {
					catalogContextWindow = catalogEntry.context_window || catalogEntry.max_context_window
					catalogMaxTokens = catalogEntry.max_tokens
					console.debug(
						`[LettaHandler] Matched model in catalog: ${catalogEntry.handle}, ctx=${catalogContextWindow}, max=${catalogMaxTokens}`,
					)
				}
			} catch (modelErr) {
				console.warn("[LettaHandler] Could not fetch models catalog:", modelErr)
			}

			// supportsImages: user-controlled in provider settings.
			// Letta does not expose image capability in its model catalog.
			const supportsImages = this.options.lettaSupportsImages === true

			this.cachedModelInfo = {
				id: modelId,
				info: {
					maxTokens: catalogMaxTokens || llm.max_tokens || 16_384,
					contextWindow: catalogContextWindow || llm.context_window || 128_000,
					supportsImages,
					supportsComputerUse: false,
					supportsPromptCache: false,
					inputPrice: 0,
					outputPrice: 0,
					description: `Letta Agent (${llm.model || "unknown model"})`,
				},
			}
			console.debug(
				`[LettaHandler] Model info cached: ${modelId}, ctx=${this.cachedModelInfo.info.contextWindow}, max=${this.cachedModelInfo.info.maxTokens}, vision=${supportsImages}`,
			)
		} catch (e) {
			console.warn("[LettaHandler] Could not fetch agent model info:", e)
		}
	}
}
