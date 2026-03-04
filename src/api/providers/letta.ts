import { Anthropic } from "@anthropic-ai/sdk"
import { ModelInfo } from "@roo-code/types"
import { ApiHandlerOptions } from "../../shared/api"
import { ApiHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { ApiStream } from "../transform/stream"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { BaseProvider } from "./base-provider"

export class LettaHandler extends BaseProvider implements ApiHandler {
	private options: ApiHandlerOptions
	private baseUrl: string
	private apiKey: string

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		this.baseUrl = this.options.lettaBaseUrl || "https://api.letta.com/v1"
		this.apiKey = this.options.lettaApiKey || "not-provided"
	}

	private async getHeaders() {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.apiKey}`,
		}
	}

	private async getLettaConversations(agentId: string) {
		const response = await fetch(`${this.baseUrl}/agents/${agentId}/conversations`, {
			method: "GET",
			headers: await this.getHeaders(),
		})
		if (!response.ok) return []
		const data = (await response.json()) as any
		return data.conversations || data || []
	}

	private async createLettaConversation(agentId: string, name: string) {
		try {
			const response = await fetch(`${this.baseUrl}/agents/${agentId}/conversations`, {
				method: "POST",
				headers: await this.getHeaders(),
				body: JSON.stringify({ name }),
			})
			if (!response.ok) return undefined
			const data = (await response.json()) as any
			return data.id || data.conversation_id
		} catch (e) {
			return undefined
		}
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
			// Create a new conversation using the taskId as the name
			const name = `Roo Task - ${metadata?.taskId || Date.now()}`
			return await this.createLettaConversation(agentId, name)
		}

		if (mode === "auto_workspace") {
			// Find a conversation named "Roo Code Workspace" or create it
			const name = "Roo Code Workspace"
			const conversations = await this.getLettaConversations(agentId)
			const existing = conversations.find((c: any) => c.name === name)
			if (existing) {
				return existing.id || existing.conversation_id
			}
			return await this.createLettaConversation(agentId, name)
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
			// Ignore error, Letta Cloud does not support conversations endpoint
			console.warn("Could not get or create Letta conversation, falling back to agent default memory", e)
		}

		// For Letta, we map our messages to Letta's expected format.
		// We'll use the /v1/agents/{agent_id}/messages API which accepts role/content strings natively.
		// However, we need to handle the streaming SSE response correctly.

		const lettaMessages: any[] = messages.flatMap((msg: Anthropic.Messages.MessageParam) => {
			if (msg.role === "user") {
				if (Array.isArray(msg.content)) {
					// Split user messages and tool returns
					const content = msg.content
						.filter((part) => part.type === "text" || part.type === "image")
						.map((part) => (part.type === "text" ? part.text : ""))
						.join("\n")

					const toolReturns = msg.content
						.filter((part) => part.type === "tool_result")
						.map((part: any) => ({
							role: "user", // Letta uses user role for tool_return_message equivalents sent into creating a turn
							name: part.tool_use_id, // Important: pass the call ID
							content: typeof part.content === "string" ? part.content : JSON.stringify(part.content),
						}))

					const result: any[] = []
					if (content) {
						result.push({ role: "user", content })
					}
					if (toolReturns.length > 0) {
						result.push(...toolReturns)
					}
					return result
				}
				return [{ role: "user", content: msg.content }]
			} else if (msg.role === "assistant") {
				if (Array.isArray(msg.content)) {
					const content = msg.content
						.filter((part) => part.type === "text")
						.map((part: any) => part.text)
						.join("\n")

					const toolCalls = msg.content
						.filter((part) => part.type === "tool_use")
						.map((part: any) => ({
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
				return [{ role: "assistant", content: msg.content }]
			}
			return [msg]
		})

		const mappedMessages = [{ role: "system", content: systemPrompt }, ...lettaMessages]

		// Using native fetch for the Letta REST API instead of the OpenAI client
		// so we can explicitly pass conversation_id and handle Letta's unique stream format if needed.
		const response = await fetch(`${this.baseUrl}/agents/${agentId}/messages/stream`, {
			method: "POST",
			headers: await this.getHeaders(),
			body: JSON.stringify({
				messages: mappedMessages,
				conversation_id: conversationId,
				client_tools: this.convertToolsForOpenAI(metadata?.tools)?.map((tool: any) => {
					return {
						name: tool.function.name,
						description: tool.function.description,
						parameters: tool.function.parameters,
					}
				}),
				// stream: true, // Letta's /stream endpoint implies streaming
			}),
		})

		if (!response.ok) {
			const text = await response.text()
			throw new Error(`Letta API Error: ${response.status} - ${text}`)
		}

		if (!response.body) {
			throw new Error("No response body from Letta")
		}

		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""

		try {
			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					const trimmed = line.trim()
					require("fs").appendFileSync("/tmp/letta_raw.log", "LINE: " + trimmed + "\n")
					if (!trimmed.startsWith("data: ")) continue

					const dataStr = trimmed.slice(6).trim()
					if (dataStr === "[DONE]") return
					if (!dataStr) continue

					try {
						const parsed = JSON.parse(dataStr)
						require("fs").appendFileSync("/tmp/letta_debug.log", dataStr + "\n")

						// Handle standard OpenAI-compatible delta format Letta might emit
						if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
							const delta = parsed.choices[0].delta
							if (delta.content) {
								yield { type: "text", text: delta.content }
							}

							// Letta tool calls mapped to Roo
							if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
								for (const tool of delta.tool_calls) {
									yield {
										type: "tool_call_partial",
										index: tool.index || 0,
										id: tool.id,
										name: tool.function?.name,
										arguments: tool.function?.arguments,
									}
								}
							}
						}
						// Handle native LettaMessage format
						const msg = parsed.message || parsed
						if (msg) {
							// Letta native messages can be internal monologues or function calls
							if (
								(msg.role === "assistant" || msg.message_type === "assistant_message") &&
								typeof msg.content === "string"
							) {
								yield { type: "text", text: msg.content }
							}
							if (msg.tool_calls) {
								for (const tool of msg.tool_calls) {
									yield {
										type: "tool_call",
										id: tool.id || "tool_" + Date.now(),
										name: tool.function?.name,
										arguments:
											typeof tool.function?.arguments === "object"
												? JSON.stringify(tool.function.arguments)
												: tool.function?.arguments,
									}
								}
							} else if (msg.tool_call) {
								yield {
									type: "tool_call",
									id: msg.tool_call.id || msg.id || "tool_" + Date.now(),
									name:
										typeof msg.tool_call.name === "string"
											? msg.tool_call.name
											: msg.tool_call.function?.name,
									arguments:
										typeof msg.tool_call.arguments === "object"
											? JSON.stringify(msg.tool_call.arguments)
											: msg.tool_call.arguments || msg.tool_call.function?.arguments,
								}
							} else if (msg.function_call) {
								yield {
									type: "tool_call",
									id: msg.id || "tool_" + Date.now(),
									name: msg.function_call.name,
									arguments:
										typeof msg.function_call.arguments === "object"
											? JSON.stringify(msg.function_call.arguments)
											: msg.function_call.arguments,
								}
							}
						}
					} catch (e) {
						// Ignore parse errors on incomplete chunks
						console.warn("Letta SSE parse error", e, dataStr)
					}
				}
			}
		} finally {
			reader.releaseLock()
		}
	}

	override getModel(): { id: string; info: ModelInfo } {
		// lettaModelId = the LLM model string (e.g. "letta/letta-free")
		// apiModelId   = the Letta Agent UUID — NOT a model, must NOT be returned here
		// If lettaModelId is not set yet, use a safe placeholder so we never send
		// the agent UUID as the model to Letta Cloud.
		const modelId = this.options.lettaModelId || "letta-default"
		return {
			id: modelId,
			info: {
				maxTokens: 8192,
				contextWindow: 128000,
				supportsImages: false,
				supportsComputerUse: false,
				supportsPromptCache: false,
			} as ModelInfo,
		}
	}

	override async countTokens(content: Anthropic.Messages.ContentBlockParam[]): Promise<number> {
		return 0 // TODO: Implement token counting via Letta if supported
	}
}
