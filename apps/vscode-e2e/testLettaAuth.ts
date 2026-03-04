import * as dotenv from "dotenv"
async function run() {
	const apiKey =
		"sk-let-YmRlZTI2YzUtMDdhMy00YjM3LTk1ZGYtYWIyY2QxMWRmMGQxOmQ2OGU1YjdjLTYyYmYtNGU0NC1iMzU4LWIzOTU1MTA2MWQ3Yg=="
	const agentId = "agent-4b13e86e-4ab3-4ab8-aab9-2aa9ae680bf3"
	const baseUrl = "https://api.letta.com/v1"

	console.log("--- 1. Models (/providers/models) ---")
	try {
		const res = await fetch(`${baseUrl}/providers/models`, { headers: { Authorization: `Bearer ${apiKey}` } })
		console.log("Status:", res.status)
		if (res.ok) console.log(JSON.stringify(await res.json()).substring(0, 200))
		else console.log(await res.text())
	} catch (e) {}

	console.log("\n--- 2. Models (/models) ---")
	try {
		const res = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })
		console.log("Status:", res.status)
		if (res.ok) {
			const data = await res.json()
			console.log(JSON.stringify(data).substring(0, 300))
		} else console.log(await res.text())
	} catch (e) {}

	console.log("\n--- 3. Agent Info (/agents/id) ---")
	try {
		const res = await fetch(`${baseUrl}/agents/${agentId}`, { headers: { Authorization: `Bearer ${apiKey}` } })
		console.log("Status:", res.status)
		if (res.ok) {
			const data = await res.json()
			console.log("Model:", data.llm_config?.model || data.model)
		} else console.log(await res.text())
	} catch (e) {}

	console.log("\n--- 4. Conversations (/conversations?agent_id=...) ---")
	try {
		const res = await fetch(`${baseUrl}/conversations?agent_id=${agentId}&limit=1`, {
			headers: { Authorization: `Bearer ${apiKey}` },
		})
		console.log("Status:", res.status)
		if (res.ok) {
			const data = await res.json()
			console.log("Response array length:", data?.length)
			if (data?.length > 0)
				console.log("First item keys:", Object.keys(data[0]), "Agent ID field:", data[0].agent_id || "none")
		}
	} catch (e) {}
}
run()
