import { Anthropic } from "@anthropic-ai/sdk"
import { LettaHandler } from "./src/api/providers/letta"
import * as dotenv from "dotenv"

dotenv.config()

async function run() {
	const handler = new LettaHandler({
		lettaBaseUrl: "https://api.letta.com/v1",
		lettaApiKey: process.env.LETTA_API_KEY,
		apiModelId: "agent-id-here", // replace it after check
	})

	const apiStream = handler.createMessage("You are an AI.", [{ role: "user", content: "Hello!" }], {
		taskId: "123",
		tools: [],
	})

	try {
		for await (const chunk of apiStream) {
			console.log(chunk)
		}
	} catch (e) {
		console.error("Error", e)
	}
}
run()
