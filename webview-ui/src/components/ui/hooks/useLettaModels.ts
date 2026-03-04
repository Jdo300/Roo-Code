import { useState, useCallback, useEffect, useRef } from "react"
import { ExtensionMessage } from "../../../../../packages/types/src/index"
import { vscode } from "@src/utils/vscode"

// These types match exactly what Letta returns
export interface LettaModel {
	handle: string
	name: string
	display_name: string
	provider_type: string
	provider_name: string
	model_type: string
	model: string
	model_endpoint_type: string
	model_endpoint: string
	provider_category?: string
	model_wrapper?: string | null
	context_window: number
}

interface UseLettaModelsRequest {
	lettaBaseUrl?: string
	lettaApiKey?: string
}

export const getLettaModels = (req: UseLettaModelsRequest) =>
	new Promise<LettaModel[]>((resolve, reject) => {
		const cleanup = () => {
			window.removeEventListener("message", handler)
		}

		const timeout = setTimeout(() => {
			cleanup()
			reject(new Error("Letta models request timed out"))
		}, 10_000)

		const handler = (event: MessageEvent) => {
			const message: ExtensionMessage = event.data

			if (message.type === "lettaModels") {
				clearTimeout(timeout)
				cleanup()

				if (message.lettaModels) {
					resolve(message.lettaModels)
				} else {
					reject(new Error("No Letta models in response"))
				}
			}
		}

		window.addEventListener("message", handler)
		// Pass credentials so extension host uses live (unsaved) values
		vscode.postMessage({
			type: "requestLettaModels",
			values: { lettaBaseUrl: req.lettaBaseUrl, lettaApiKey: req.lettaApiKey },
		})
	})

export function useLettaModels(req: UseLettaModelsRequest) {
	const [models, setModels] = useState<LettaModel[]>([])
	const [modelsLoading, setModelsLoading] = useState(false)
	const [modelsError, setModelsError] = useState<string | null>(null)

	// Ref for stale-closure-safe callback
	const reqRef = useRef(req)
	reqRef.current = req

	const fetchModels = useCallback(async () => {
		const r = reqRef.current
		if (!r.lettaApiKey) return

		setModelsLoading(true)
		setModelsError(null)

		try {
			const result = await getLettaModels(r)
			if (result && result.length > 0) {
				setModels(result)
			} else {
				setModelsError("No models found")
			}
		} catch (error) {
			setModelsError(error instanceof Error ? error.message : "Failed to fetch Letta models")
		} finally {
			setModelsLoading(false)
		}
	}, []) // reqRef is stable

	useEffect(() => {
		// Only fetch automatically if we actually have a key
		if (req.lettaApiKey && req.lettaApiKey !== "not-provided") {
			fetchModels()
		}
	}, [req.lettaBaseUrl, req.lettaApiKey, fetchModels])

	return {
		models,
		modelsLoading,
		modelsError,
		refetchModels: fetchModels,
	}
}
