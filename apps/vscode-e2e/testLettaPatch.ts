import * as dotenv from "dotenv"
async function run() {
	const apiKey =
		"sk-let-YmRlZTI2YzUtMDdhMy00YjM3LTk1ZGYtYWIyY2QxMWRmMGQxOmQ2OGU1YjdjLTYyYmYtNGU0NC1iMzU4LWIzOTU1MTA2MWQ3Yg=="
	const agentId = "agent-4b13e86e-4ab3-4ab8-aab9-2aa9ae680bf3"
	const baseUrl = "https://api.letta.com/v1"

	console.log("--- Patching Agent Model ---")
	try {
		const res = await fetch(`${baseUrl}/agents/${agentId}`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				llm_config: { model: "claude-3-5-sonnet-20241022" },
			}),
		})
		console.log("Status:", res.status)
		if (res.ok) {
			const data = await res.json()
			console.log("New Model:", data.llm_config?.model || data.model)
		} else {
			console.log(await res.text())
		}
	} catch (e) {
		console.error(e)
	}
}
run()
