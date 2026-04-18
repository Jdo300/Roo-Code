import { Anthropic } from "@anthropic-ai/sdk"
import { Letta, LettaError, NotFoundError } from "@letta-ai/letta-client"
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
		// Kick off model info fetch immediately so contextWindow/maxTokens are ready
		// by the time Roo Code first calls getModel() for the context bar.
		if (options.apiModelId && options.lettaApiKey) {
			this.modelInfoFetchInProgress = this.fetchAndCacheModelInfo().catch(() => {})
		}
	}

	// Cache workspace conversation ID across calls to avoid re-listing every time
	private workspaceConversationId: string | undefined
	// new_task mode: track the current task ID and its conversation to avoid creating one per createMessage call
	private newTaskConversationId: string | undefined
	private newTaskId: string | undefined
	// Track last-patched model to avoid redundant agents.update calls
	private lastPatchedModelId: string | undefined
	// Guard against concurrent fetchAndCacheModelInfo calls (e.g. multiple getModel() calls before cache warms)
	private modelInfoFetchInProgress: Promise<void> | undefined

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
			} catch (retrieveErr) {
				// Only treat a 404 as "block not found" — other errors (network, 500) should bail out
				if (!(retrieveErr instanceof NotFoundError)) {
					console.warn("[LettaHandler] Unexpected error retrieving roo_system block:", retrieveErr)
					return
				}
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

	/**
	 * Pre-stream drain: check for and clear any stale pending approvals.
	 * This runs BEFORE every normal message send (not tool results) to ensure
	 * the conversation is clean. Mirrors the proxy's drain_stale_approvals().
	 *
	 * Strategy:
	 * 1. Fast path: check agent.pending_approval field (single API call)
	 * 2. Fallback: REST scan of recent messages for approval_request_message
	 */
	private async clearPendingApprovals(agentId: string): Promise<boolean> {
		let toolCallIds: string[] = []

		// Fast path: agent state
		try {
			const agent = await this.client.agents.retrieve(agentId)
			const pending = (agent as any).pending_approval
			if (pending) {
				const toolCalls = pending.tool_calls || (pending.tool_call ? [pending.tool_call] : [])
				for (const tc of toolCalls) {
					if (tc.tool_call_id) toolCallIds.push(tc.tool_call_id)
				}
			}
		} catch (e) {
			console.warn("[LettaHandler] Pre-drain: could not check agent state:", e)
		}

		// Fallback: REST scan if fast path found nothing
		if (toolCallIds.length === 0) {
			try {
				const restBase = (this.options.lettaBaseUrl || "https://api.letta.com/v1").replace(/\/v1$/, "")
				const resp = await fetch(`${restBase}/v1/agents/${agentId}/messages?limit=10`, {
					headers: { Authorization: `Bearer ${this.options.lettaApiKey || ""}` },
				})
				if (resp.ok) {
					const msgs: any[] = await resp.json()
					const approvalMsg = msgs.find((m: any) => m.message_type === "approval_request_message")
					if (approvalMsg) {
						const tcId = approvalMsg.tool_call?.tool_call_id ?? approvalMsg.tool_calls?.[0]?.tool_call_id
						if (tcId) toolCallIds.push(tcId)
					}
				}
			} catch (e) {
				console.warn("[LettaHandler] Pre-drain: REST scan failed:", e)
			}
		}

		if (toolCallIds.length === 0) return false

		// Deny each stale approval
		let cleared = false
		for (const toolCallId of toolCallIds) {
			console.debug(`[LettaHandler] Pre-drain: denying stale approval ${toolCallId}`)
			try {
				await (this.client.agents.messages as any).create(agentId, {
					messages: [
						{
							type: "approval",
							approvals: [
								{
									type: "approval",
									approve: false,
									tool_call_id: toolCallId,
									reason: "Auto-denied: stale approval from interrupted session",
								},
							],
						},
					],
				})
				cleared = true
				console.debug(`[LettaHandler] Pre-drain: denied ${toolCallId}`)
			} catch (denyErr: any) {
				const errStr = String(denyErr).toLowerCase()
				if (errStr.includes("no tool call is currently awaiting approval")) {
					cleared = true // Already resolved
				} else {
					console.warn("[LettaHandler] Pre-drain: deny failed:", denyErr)
				}
			}
		}

		if (cleared) {
			// Wait for server to settle after denial
			await new Promise((resolve) => setTimeout(resolve, 1500))
		}
		return cleared
	}

	/**
	 * Build Letta tool_return messages from tool execution results.
	 * This is the correct SDK format for delivering tool results back to an agent
	 * that's waiting for client-side tool approval.
	 * Mirrors the proxy's _build_tool_return_messages().
	 */
	private buildToolReturnMessages(toolResults: Array<{ toolCallId: string; content: string }>): any[] {
		return [
			{
				type: "tool_return",
				tool_returns: toolResults.map((tr) => ({
					type: "tool",
					status: "success",
					tool_call_id: tr.toolCallId,
					tool_return: tr.content,
				})),
			},
		]
	}

	/**
	 * Extract error details from a LettaError for classification.
	 */
	private extractErrorDetail(e: any): { statusCode: number | undefined; detail: string; isConflict: boolean } {
		const statusCode = (e as any).status || (e as any).statusCode
		const detail = String(
			(e as any).body?.detail ??
				(e as any).body ??
				(e as any).error?.detail ??
				(e as any).error?.message ??
				e.message ??
				"",
		)
		const lower = detail.toLowerCase()
		const isConflict =
			statusCode === 409 ||
			lower.includes("pending_approval") ||
			lower.includes("waiting for approval") ||
			lower.includes("conflict")
		return { statusCode, detail, isConflict }
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
			// Reuse the same conversation for all createMessage calls within one Roo Code task.
			// Only create a fresh conversation when the task ID changes (i.e. a new task starts).
			const taskId = metadata?.taskId
			if (taskId && taskId === this.newTaskId && this.newTaskConversationId) {
				return this.newTaskConversationId
			}
			try {
				const conv = await this.client.conversations.create({ agent_id: agentId })
				this.newTaskId = taskId
				this.newTaskConversationId = conv.id
				// Label immediately so it shows a meaningful name in the manual-select dropdown
				const taskDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
				this.client.conversations.update(conv.id, { summary: `Roo Code Task – ${taskDate}` }).catch(() => {})
				console.debug(`[LettaHandler] Created new task conversation: ${conv.id} (taskId=${taskId})`)
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
				const convArray = Array.isArray(conversations) ? conversations : []
				const active = convArray.filter((c: any) => !c.archived)
				if (active.length > 0) {
					// Prefer conversations we previously labeled as workspace conversations,
					// so new_task conversations don't get picked up accidentally.
					const labeled = active.filter((c: any) => c.summary?.startsWith("Roo Code Workspace"))
					const candidates = labeled.length > 0 ? labeled : active
					candidates.sort((a: any, b: any) => {
						const aTime = a.last_message_at || a.updated_at || ""
						const bTime = b.last_message_at || b.updated_at || ""
						return bTime.localeCompare(aTime)
					})
					this.workspaceConversationId = candidates[0].id
					console.debug(`[LettaHandler] Reusing conversation: ${this.workspaceConversationId}`)
					return this.workspaceConversationId
				}
				const conv = await this.client.conversations.create({ agent_id: agentId })
				this.workspaceConversationId = conv.id
				// Label immediately so it can be found again next session
				this.client.conversations.update(conv.id, { summary: "Roo Code Workspace" }).catch(() => {})
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

		// Start conversation lookup immediately — we'll await it later alongside other setup.
		const conversationPromise = this.getOrCreateConversation(agentId, metadata).catch((e) => {
			console.warn("Could not get or create Letta conversation, falling back to agent default memory", e)
			return undefined
		})

		// Map Anthropic message format to Letta's expected format.
		// We use role/content strings natively; tool calls and tool results are also mapped.
		const lettaMessages: {
			role: "user" | "assistant"
			content: string | any[]
			tool_calls?: unknown[]
			name?: string
		}[] = messages.flatMap((msg: Anthropic.Messages.MessageParam) => {
			if (msg.role === "user") {
				if (Array.isArray(msg.content)) {
					// Build content: text as string, image parts as Letta ImageContent objects.
					const textContent = msg.content
						.filter((part) => part.type === "text")
						.map((part: Anthropic.Messages.TextBlockParam) => part.text)
						.join("\n")
					const imageContent = msg.content
						.filter((part) => part.type === "image")
						.map((part: Anthropic.Messages.ImageBlockParam) => {
							if (part.source.type === "base64") {
								return {
									type: "image" as const,
									source: {
										type: "base64" as const,
										data: part.source.data,
										media_type: part.source.media_type,
									},
								}
							} else if (part.source.type === "url") {
								return {
									type: "image" as const,
									source: { type: "url" as const, url: (part.source as any).url },
								}
							}
							return null
						})
						.filter(Boolean)
					// Use content array when images present, plain string otherwise
					const content: string | any[] =
						imageContent.length > 0
							? [...(textContent ? [{ type: "text", text: textContent }] : []), ...imageContent]
							: textContent

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

		// Run block sync and model patch concurrently — they're independent and both idempotent.
		// Parallelising cuts first-message latency roughly in half vs serial awaits.
		const modelId = this.options.lettaModelId || ""
		const isAgentUUID = modelId.startsWith("agent-") || /^[0-9a-f-]{36}$/.test(modelId)
		const needsPatch = modelId && !isAgentUUID && modelId !== "letta-default" && modelId !== this.lastPatchedModelId

		const patchModel = needsPatch
			? (async () => {
					// Build handle: "provider/model-name" format required by the Letta PATCH API.
					const handle = modelId.includes("/")
						? modelId // already a full handle (e.g. "anthropic/claude-sonnet-4-5")
						: (() => {
								if (modelId.includes("claude") || modelId.startsWith("anthropic"))
									return `anthropic/${modelId}`
								if (modelId.includes("gemini") || modelId.startsWith("google"))
									return `google/${modelId}`
								// "auto", "letta-free" etc. use the letta/ prefix
								if (modelId === "auto" || modelId.startsWith("letta")) return `letta/${modelId}`
								return `openai/${modelId}`
							})()
					try {
						await this.client.agents.update(agentId, { model: handle })
						this.cachedModelInfo = undefined
						console.debug(`[LettaHandler] Patched agent ${agentId} model to: ${handle}`)
					} catch (e) {
						console.warn("[LettaHandler] Could not patch agent model settings:", e)
					} finally {
						// Always mark as attempted — prevents retry loop when patch fails
						this.lastPatchedModelId = modelId
					}
				})()
			: Promise.resolve()

		// Run all pre-stream setup in parallel to minimize first-message latency.
		// Conversation lookup, block sync, model patch, and model info fetch are all independent.
		const [resolvedConversationId] = await Promise.all([
			conversationPromise,
			systemPrompt ? this.syncSystemPromptBlock(agentId, systemPrompt) : Promise.resolve(),
			patchModel,
			this.modelInfoFetchInProgress || Promise.resolve(),
		])
		const conversationId = resolvedConversationId

		// Build client_tools array in the flat schema Letta expects.
		// metadata.tools is OpenAI.Chat.ChatCompletionTool[] (a union that includes
		// ChatCompletionCustomTool which has no .function). Filter to function tools only.
		// For attempt_completion, prepend a Letta-specific note: Letta agents sometimes
		// use internal tools (conversation_search, archival_memory_search, etc.) and then
		// reply with plain text without calling attempt_completion. This augmentation makes
		// it explicit that attempt_completion MUST be the final action for every task.
		const clientTools = metadata?.tools
			?.filter((t) => t.type === "function")
			.map((tool) => {
				const fn = (tool as any).function as {
					name: string
					description?: string
					parameters?: Record<string, unknown>
				}
				const baseDescription = fn.description ?? ""
				const description =
					fn.name === "attempt_completion"
						? `[REQUIRED FINAL ACTION] You MUST call this tool as the last step of every task — even if you used internal tools (memory search, archival search, conversation search, etc.) just before. Never end a task with plain text alone. ${baseDescription}`
						: baseDescription
				return {
					name: fn.name,
					description,
					parameters: fn.parameters,
				}
			})

		// ─── Separate tool results from regular messages ───
		// Tool results arrive as { role: 'user', name: tool_use_id, content: result }
		// (mapped from Anthropic's tool_result format in the message mapper above).
		const toolResultItems: Array<{ toolCallId: string; content: string }> = []
		const regularMessages: typeof messagesToSend = []

		for (const msg of messagesToSend) {
			if (msg.role === "user" && msg.name) {
				// Skip tool results for auto-injected attempt_completion calls.
				// These were synthesized by the provider (not real Letta tool calls),
				// so Letta has no pending approval to match them against.
				if (msg.name.startsWith("auto_completion_")) {
					// Treat any user feedback text as a regular message instead
					if (msg.content && String(msg.content).trim()) {
						regularMessages.push({ role: "user", content: String(msg.content) })
					}
					continue
				}
				toolResultItems.push({
					toolCallId: msg.name,
					content: String(msg.content || ""),
				})
			} else {
				regularMessages.push(msg)
			}
		}

		const hasToolResults = toolResultItems.length > 0

		if (hasToolResults) {
			// ─── Tool result flow ───
			// Send results using the SDK's tool_return format (same as the proxy).
			// Skip pre-drain — the pending approval IS the one we're responding to.
			console.debug(`[LettaHandler] Sending ${toolResultItems.length} tool result(s) via tool_return format`)
			const toolReturnMsgs = this.buildToolReturnMessages(toolResultItems)
			// Include any remaining user text messages after tool returns
			const userTextMsgs = regularMessages
				.filter((m) => m.role === "user" && m.content)
				.map((m) => ({ role: "user" as const, content: m.content }))
			const outbound = [...toolReturnMsgs, ...userTextMsgs]

			try {
				const stream = await this.client.agents.messages.stream(agentId, {
					messages: outbound as any,
					// @ts-expect-error — conversation_id and client_tools are valid
					conversation_id: conversationId,
					client_tools: clientTools as any,
				})
				yield* this.processLettaStream(stream, clientTools)
				return
			} catch (toolReturnErr: any) {
				// If tool_return fails, it might be because the server doesn't recognize
				// the format (older version) or the approval was already resolved.
				// Fall through to the legacy approval-based approach.
				console.warn("[LettaHandler] tool_return stream failed, trying legacy approval flow:", toolReturnErr)

				if (toolReturnErr instanceof LettaError) {
					const { isConflict } = this.extractErrorDetail(toolReturnErr)
					if (isConflict) {
						// Try legacy approach: approve with result via approval message
						try {
							const restBase = (this.options.lettaBaseUrl || "https://api.letta.com/v1").replace(
								/\/v1$/,
								"",
							)
							const resp = await fetch(`${restBase}/v1/agents/${agentId}/messages?limit=10`, {
								headers: { Authorization: `Bearer ${this.options.lettaApiKey || ""}` },
							})
							let pendingToolCallId: string | undefined
							if (resp.ok) {
								const msgs: any[] = await resp.json()
								const approval = msgs.find((m: any) => m.message_type === "approval_request_message")
								pendingToolCallId =
									approval?.tool_call?.tool_call_id ?? approval?.tool_calls?.[0]?.tool_call_id
							}

							if (pendingToolCallId) {
								// Find matching result
								const match = toolResultItems.find((tr) => tr.toolCallId === pendingToolCallId)
								const approvalResp = await (this.client.agents.messages as any).create(agentId, {
									messages: [
										{
											type: "approval",
											approvals: [
												{
													type: "approval",
													approve: Boolean(match),
													tool_call_id: pendingToolCallId,
													...(match ? { reason: match.content } : {}),
												},
											],
										},
									],
								})

								if (match) {
									for (const msg of approvalResp?.messages ?? []) {
										if (msg.message_type === "assistant_message" && msg.content) {
											yield { type: "text", text: msg.content }
										}
									}
									if (approvalResp?.usage) {
										const u = approvalResp.usage
										yield {
											type: "usage",
											inputTokens: (u.prompt_tokens ?? 0) - (u.cached_input_tokens ?? 0),
											outputTokens: u.completion_tokens ?? 0,
											cacheReadTokens: u.cached_input_tokens,
										}
									}
									console.debug("[LettaHandler] Legacy approval with result succeeded")
									return
								}
							}
						} catch (legacyErr) {
							console.warn("[LettaHandler] Legacy approval flow failed:", legacyErr)
						}
					}
				}
				// If we get here, we couldn't deliver the tool result at all
				throw new Error("Letta: Failed to deliver tool result to agent. The tool call may have timed out.")
			}
		}

		// ─── Normal message flow ───
		// Pre-drain stale approvals before streaming to prevent 409s.
		await this.clearPendingApprovals(agentId)

		try {
			const stream = await this.client.agents.messages.stream(agentId, {
				messages: messagesToSend as any,
				// @ts-expect-error — conversation_id and client_tools are valid but some types may be incomplete
				conversation_id: conversationId,
				client_tools: clientTools as any,
			})
			yield* this.processLettaStream(stream, clientTools)
		} catch (e: any) {
			if (e instanceof LettaError) {
				const { statusCode, isConflict } = this.extractErrorDetail(e)

				if (isConflict) {
					// 409 after pre-drain — edge case. Try one more drain + retry.
					console.debug("[LettaHandler] 409 after pre-drain, attempting recovery retry...")
					try {
						await this.clearPendingApprovals(agentId)
						await new Promise((resolve) => setTimeout(resolve, 1000))
						const retryStream = await this.client.agents.messages.stream(agentId, {
							messages: messagesToSend as any,
							// @ts-expect-error
							conversation_id: conversationId,
							client_tools: clientTools as any,
						})
						yield* this.processLettaStream(retryStream, clientTools)
						return
					} catch (retryErr) {
						console.warn("[LettaHandler] Recovery retry failed:", retryErr)
					}
					throw new Error(
						"Letta: The agent has a stuck tool-call approval that could not be auto-cleared. Please try sending your message again.",
					)
				}
				throw new Error(`Letta API Error: ${statusCode || "Unknown"} - ${e.message}`)
			}
			throw e
		}
	}

	/** Process a Letta streaming response, yielding ApiStream events. */
	private async *processLettaStream(stream: AsyncIterable<any>, clientTools: any[] | undefined): ApiStream {
		// Track whether any client_tool was forwarded to Roo Code during this stream.
		// If the agent only used internal tools (send_message, conversation_search, etc.)
		// and produced text, we auto-synthesize an attempt_completion so Roo Code doesn't
		// loop with "you must use a tool".
		let clientToolYielded = false
		let hasText = false

		for await (const chunk of stream) {
			const msgType = chunk.message_type
			if (!msgType) continue

			// Surface agent thinking/reasoning in the thinking panel
			if (msgType === "reasoning_message") {
				const reasoning = chunk.reasoning
				if (reasoning && typeof reasoning === "string" && reasoning.length > 0) {
					yield { type: "reasoning", text: reasoning }
				}
				continue
			}

			// Main response content — yield immediately for real-time streaming
			if (msgType === "assistant_message") {
				const content = chunk.content
				if (content && typeof content === "string" && content.length > 0) {
					yield { type: "text", text: content }
					hasText = true
				}
				continue
			}

			// Tool calls — both regular and approval-gated ones.
			// When approval_request_message arrives, the run stays pending in Letta.
			// On the NEXT createMessage call, the 409 handler detects the pending run,
			// matches the tool result in messagesToSend, and approves it automatically.
			if (msgType === "tool_call_message" || msgType === "approval_request_message") {
				const toolCall = chunk.tool_call ?? {}
				const toolCalls: any[] = chunk.tool_calls ?? (toolCall.name ? [toolCall] : [])

				for (const tool of toolCalls) {
					// Skip Letta's internal memory/archival tools — they appear as
					// tool_call_message too, but Letta handles them internally.
					// Only forward tool calls that Roo Code itself declared as client_tools,
					// plus anything arriving via approval_request_message (always a client tool).
					if (msgType === "tool_call_message") {
						const isClientTool = clientTools?.some((ct) => ct.name === tool.name)
						if (!isClientTool) continue
					}
					const args = tool.arguments
					yield {
						type: "tool_call",
						id: tool.tool_call_id || "tool_" + Date.now(),
						name: tool.name || "",
						arguments: typeof args === "object" && args !== null ? JSON.stringify(args) : (args ?? ""),
					}
					clientToolYielded = true
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

		// ─── Auto-inject attempt_completion for text-only responses ───
		// Letta agents respond via send_message (internal tool) which produces text
		// but no client_tool call. Roo Code requires a tool call per turn.
		// Fix: synthesize a lightweight attempt_completion so Roo Code closes the turn.
		// The text was already streamed above — the completion result is kept minimal.
		if (!clientToolYielded && hasText) {
			const hasAttemptCompletion = clientTools?.some((ct) => ct.name === "attempt_completion")
			if (hasAttemptCompletion) {
				console.debug(
					`[LettaHandler] Auto-injecting attempt_completion (agent responded with text but no client_tool)`,
				)
				yield {
					type: "tool_call",
					id: "auto_completion_" + Date.now(),
					name: "attempt_completion",
					arguments: JSON.stringify({ result: "Task completed." }),
				}
			}
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
				supportsImages: this.options.lettaSupportsImages === true,
				supportsComputerUse: false,
				supportsPromptCache: false,
				inputPrice: 0,
				outputPrice: 0,
				description: "Letta Agent (model configured per-agent in Letta Cloud)",
			},
		}
		// Async fetch to populate cache for subsequent calls (dedup via in-flight guard)
		if (!this.modelInfoFetchInProgress) {
			this.modelInfoFetchInProgress = this.fetchAndCacheModelInfo()
				.catch(() => {})
				.finally(() => {
					this.modelInfoFetchInProgress = undefined
				})
		}
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
