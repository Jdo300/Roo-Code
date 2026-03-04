import { useQuery } from "@tanstack/react-query"

import { type ExtensionMessage } from "@roo-code/types"

import { vscode } from "@src/utils/vscode"

export interface LettaAgent {
	id: string
	name: string
	model?: string
}

export interface LettaAgentsRequest {
	lettaBaseUrl?: string
	lettaApiKey?: string
}

export const requestLettaAgents = (credentials: LettaAgentsRequest) => {
	vscode.postMessage({
		type: "requestLettaAgents",
		values: credentials,
	})
}

export const getLettaAgents = (credentials: LettaAgentsRequest) =>
	new Promise<LettaAgent[]>((resolve, reject) => {
		const cleanup = () => {
			window.removeEventListener("message", handler)
		}

		const timeout = setTimeout(() => {
			cleanup()
			reject(new Error("Letta agents request timed out"))
		}, 10_000)

		const handler = (event: MessageEvent) => {
			const message: ExtensionMessage = event.data

			if (message.type === "lettaAgents") {
				clearTimeout(timeout)
				cleanup()

				if (message.lettaAgents) {
					resolve(message.lettaAgents)
				} else {
					reject(new Error("No Letta agents in response"))
				}
			}
		}

		window.addEventListener("message", handler)
		// Send credentials along with the request so extension host uses
		// the live (unsaved) values rather than stale persisted state
		vscode.postMessage({ type: "requestLettaAgents", values: credentials })
	})

export const useLettaAgents = (credentials: LettaAgentsRequest, enabled = false) =>
	useQuery({
		queryKey: ["lettaAgents", credentials.lettaBaseUrl, credentials.lettaApiKey],
		queryFn: () => getLettaAgents(credentials),
		enabled,
		retry: 1,
		staleTime: 30_000,
	})
