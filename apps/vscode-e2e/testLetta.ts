import { LettaHandler } from "../../src/api/providers/letta"

async function runLettaTest() {
	const apiKey = process.env.LETTA_API_KEY
	const baseUrl = process.env.LETTA_BASE_URL
	const agentId = process.env.LETTA_AGENT_ID

	if (!apiKey || !baseUrl || !agentId) {
		console.error("Missing required environment variables.")
		process.exit(1)
	}

	console.log(`\n🤖 Connecting to Letta Agent: ${agentId}`)
	console.log(`🌐 Base URL: ${baseUrl}`)

	const handler = new LettaHandler({
		apiModelId: agentId,
		lettaApiKey: apiKey,
		lettaBaseUrl: baseUrl,
		lettaConversationMode: "new_task",
	})

	console.log("\n💬 Sending message: 'Hello! Please use the \"calculate_sum\" tool to add 42 and 58.'\n")
	console.log("---- RESPONSE STREAM ----")

	try {
		const stream = handler.createMessage(
			"You are a helpful assistant.",
			[
				{
					role: "user",
					content:
						"Hello! Please use the 'calculate_sum' tool to add 42 and 58, and then tell me the result.",
				},
			],
			{
				history: [],
				tools: [
					{
						name: "calculate_sum",
						description: "Calculates the sum of two numbers",
						input_schema: {
							type: "object",
							properties: {
								a: { type: "number", description: "First number" },
								b: { type: "number", description: "Second number" },
							},
							required: ["a", "b"],
						},
					} as any,
				],
				model: {
					id: agentId,
					info: {
						maxTokens: 8192,
						contextWindow: 128000,
						supportsImages: false,
						supportsComputerUse: false,
						supportsPromptCache: false,
					},
				},
				stream: true,
			},
		)

		let fullResponse = ""

		for await (const chunk of stream) {
			if (chunk.type === "text") {
				process.stdout.write(chunk.text)
				fullResponse += chunk.text
			} else if (chunk.type === "tool_call_partial") {
				console.log(`\n\n[TOOL CALL DETECTED]: ${chunk.name || ""} - ${chunk.arguments || ""}`)
			} else if (chunk.type === ("tool_call" as any)) {
				console.log(
					`\n\n[TOOL CALL COMPLETED]: ${(chunk as any).name} - ${JSON.stringify((chunk as any).arguments)}`,
				)
			}
		}

		console.log("\n\n---- END OF STREAM ----\n")
		console.log("✅ Tool stream completed successfully!")
	} catch (error) {
		console.error("\n❌ Error communicating with Letta:", error)
	}
}

runLettaTest()
