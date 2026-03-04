import * as dotenv from "dotenv"
async function run() {
	const apiKey =
		"sk-let-YmRlZTI2YzUtMDdhMy00YjM3LTk1ZGYtYWIyY2QxMWRmMGQxOmQ2OGU1YjdjLTYyYmYtNGU0NC1iMzU4LWIzOTU1MTA2MWQ3Yg=="
	const agentId = "agent-4b13e86e-4ab3-4ab8-aab9-2aa9ae680bf3"
	const baseUrl = "https://api.letta.com/v1"

	// 1. Get models list
	const modelsRes = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })
	if (!modelsRes.ok) return console.log("Models fail")
	const models = await modelsRes.json()
	const gpt4 = models.find((m: any) => m.model.includes("gpt-4"))
	if (!gpt4) return console.log("gpt4 not found")

	const patchConfig = {
		model: gpt4.model,
		model_endpoint_type: gpt4.model_endpoint_type,
		model_endpoint: gpt4.model_endpoint,
		model_wrapper: gpt4.model_wrapper,
		context_window: gpt4.context_window,
	}
	console.log("Patching with:", patchConfig)

	const res = await fetch(`${baseUrl}/agents/${agentId}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ llm_config: patchConfig }),
	})
	console.log("Status:", res.status)
	if (res.ok) {
		const data = await res.json()
		console.log("New Model:", data.llm_config?.model || data.model)
	} else {
		console.log(await res.text())
	}
}
run()
