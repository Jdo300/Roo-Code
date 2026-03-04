import * as dotenv from "dotenv"
dotenv.config()

async function run() {
	const apiKey = process.env.LETTA_API_KEY
	const baseUrl = process.env.LETTA_BASE_URL || "https://api.letta.com/v1"
	const agentId = process.env.LETTA_AGENT_ID

	// 1. Try to fetch models
	console.log("--- Fetching /providers/models ---")
	try {
		const modelsRes = await fetch(`${baseUrl}/providers/models`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		console.log("Status:", modelsRes.status)
		if (modelsRes.ok) {
			const models = await modelsRes.json()
			console.log(JSON.stringify(models).slice(0, 300) + "...")
		} else {
			console.log(await modelsRes.text())
		}
	} catch (e) {
		console.error("Models fetch failed", e)
	}

	// 2. What about GET /models ? Let's try v1/models
	console.log("\n--- Fetching /models ---")
	try {
		const modelsRes = await fetch(`${baseUrl}/models`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		console.log("Status:", modelsRes.status)
	} catch (e) {
		console.error("Models fetch failed", e)
	}

	// 3. Let's see if an agent has a model
	console.log("\n--- Fetching Agent info ---")
	try {
		const agentRes = await fetch(`${baseUrl}/agents/${agentId}`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		if (agentRes.ok) {
			const agent = await agentRes.json()
			console.log("Agent model:", agent.llm_config?.model || agent.model)
		}
	} catch (e) {
		console.error("agent fetch failed", e)
	}

	// 4. Try explicitly /conversations?model_id or agent_id
	console.log("\n--- Fetching Conversations for Agent ---")
	try {
		const convRes = await fetch(`${baseUrl}/conversations?limit=5&agent_id=${agentId}`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		console.log("Status:", convRes.status)
		if (convRes.ok) {
			const convs = await convRes.json()
			console.log("Convs:", convs?.length)
			if (convs && convs.length > 0) {
				console.log("First:", convs[0].id || convs[0].conversation_id)
			}
		} else {
			console.log(await convRes.text().catch(() => "no text"))
		}
	} catch (e) {
		console.error("Conversations fetch failed", e)
	}
}

run()
