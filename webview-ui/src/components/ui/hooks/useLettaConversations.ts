import { useQuery } from "@tanstack/react-query"

import { type ExtensionMessage } from "@roo-code/types"

import { vscode } from "@src/utils/vscode"

export interface LettaConversation {
	id: string
	name: string
}

export interface LettaConversationsRequest {
	agentId: string
	lettaBaseUrl?: string
	lettaApiKey?: string
}

export const getLettaConversations = (req: LettaConversationsRequest) =>
	new Promise<LettaConversation[]>((resolve, reject) => {
		const cleanup = () => {
			window.removeEventListener("message", handler)
		}

		const timeout = setTimeout(() => {
			cleanup()
			reject(new Error("Letta conversations request timed out"))
		}, 10_000)

		const handler = (event: MessageEvent) => {
			const message: ExtensionMessage = event.data

			if (message.type === "lettaConversations") {
				clearTimeout(timeout)
				cleanup()

				if (message.lettaConversations) {
					// Check for API error passed back from extension host
					if ("error" in message.lettaConversations && message.lettaConversations.error) {
						reject(new Error(message.lettaConversations.error))
					} else {
						// Process successful array (handles both the new structure and legacy arrays)
						const convs =
							"conversations" in message.lettaConversations
								? message.lettaConversations.conversations
								: message.lettaConversations
						resolve((convs as LettaConversation[]) || [])
					}
				} else {
					reject(new Error("No Letta conversations in response"))
				}
			}
		}

		window.addEventListener("message", handler)
		// Pass credentials and agentId so extension host uses live (unsaved) values
		vscode.postMessage({
			type: "requestLettaConversations",
			lettaAgentId: req.agentId,
			values: { lettaBaseUrl: req.lettaBaseUrl, lettaApiKey: req.lettaApiKey },
		})
	})

export const useLettaConversations = (req?: LettaConversationsRequest) =>
	useQuery({
		queryKey: ["lettaConversations", req?.agentId, req?.lettaBaseUrl, req?.lettaApiKey],
		queryFn: () => getLettaConversations(req!),
		enabled: !!req?.agentId,
		retry: 1,
		staleTime: 30_000,
	})
