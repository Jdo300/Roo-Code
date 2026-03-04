import { useState, useEffect, useCallback, useRef } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { type ExtensionMessage } from "@roo-code/types"
import { vscode } from "@src/utils/vscode"
import { getLettaAgents } from "../../ui/hooks/useLettaAgents"
import { getLettaConversations } from "../../ui/hooks/useLettaConversations"
import { useLettaModels } from "../../ui/hooks/useLettaModels"

interface LettaProps {
	apiConfiguration: Record<string, any>
	setApiConfigurationField: (field: any, value: any, isUserAction?: boolean) => void
}

type ConnectionStatus =
	| { state: "idle" }
	| { state: "testing" }
	| { state: "ok"; agentCount: number }
	| { state: "error"; error: string }

/** Native styled dropdown — properly handles controlled value unlike VSCodeDropdown */
const StyledSelect = ({
	value,
	onChange,
	options,
	placeholder,
	disabled,
}: {
	value: string
	onChange: (val: string) => void
	options: { id: string; label: string }[]
	placeholder?: string
	disabled?: boolean
}) => (
	<select
		value={value}
		onChange={(e) => onChange(e.target.value)}
		disabled={disabled}
		style={{
			width: "100%",
			background: "var(--vscode-dropdown-background)",
			color: "var(--vscode-dropdown-foreground)",
			border: "1px solid var(--vscode-dropdown-border)",
			borderRadius: "2px",
			padding: "4px 6px",
			fontSize: "var(--vscode-font-size)",
			fontFamily: "var(--vscode-font-family)",
			outline: "none",
			cursor: disabled ? "default" : "pointer",
		}}>
		{placeholder && <option value="">{placeholder}</option>}
		{options.map((opt) => (
			<option key={opt.id} value={opt.id}>
				{opt.label}
			</option>
		))}
	</select>
)

export const Letta = ({ apiConfiguration, setApiConfigurationField }: LettaProps) => {
	// Live credential values from props (used for API calls)
	const lettaBaseUrl: string = apiConfiguration.lettaBaseUrl || ""
	const lettaApiKey: string = apiConfiguration.lettaApiKey || ""

	// LOCAL state for all dropdown values so they update instantly on selection.
	// Without this, setApiConfigurationField triggers an async round-trip and the
	// select snaps back to the old value before props update.
	const [localAgentId, setLocalAgentId] = useState<string>(apiConfiguration.apiModelId || "")
	const [localConvMode, setLocalConvMode] = useState<string>(
		apiConfiguration.lettaConversationMode || "auto_workspace",
	)
	const [localConvId, setLocalConvId] = useState<string>(apiConfiguration.lettaConversationId || "")
	const [localModelId, setLocalModelId] = useState<string>(apiConfiguration.lettaModelId || "")

	// Sync local state when props change externally (e.g. loading saved config)
	useEffect(() => {
		setLocalAgentId(apiConfiguration.apiModelId || "")
	}, [apiConfiguration.apiModelId])
	useEffect(() => {
		setLocalConvMode(apiConfiguration.lettaConversationMode || "auto_workspace")
	}, [apiConfiguration.lettaConversationMode])
	useEffect(() => {
		setLocalConvId(apiConfiguration.lettaConversationId || "")
	}, [apiConfiguration.lettaConversationId])
	useEffect(() => {
		setLocalModelId(apiConfiguration.lettaModelId || "")
	}, [apiConfiguration.lettaModelId])

	// Auto-load agents on mount if credentials already configured (fixes cold-start blank model bug)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => { if (lettaApiKey) refreshAgents() }, []) // mount only

	// Refs for stale-closure-safe callbacks
	const credentialsRef = useRef({ lettaBaseUrl, lettaApiKey })
	credentialsRef.current = { lettaBaseUrl, lettaApiKey }
	const localAgentIdRef = useRef(localAgentId)
	localAgentIdRef.current = localAgentId
	const localModelIdRef = useRef(localModelId)
	localModelIdRef.current = localModelId
	const localConvModeRef = useRef(localConvMode)
	localConvModeRef.current = localConvMode
	const localConvIdRef = useRef(localConvId)
	localConvIdRef.current = localConvId
	const setApiConfigurationFieldRef = useRef(setApiConfigurationField)
	setApiConfigurationFieldRef.current = setApiConfigurationField

	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ state: "idle" })
	const [agentsList, setAgentsList] = useState<{ id: string; name: string; model?: string }[]>([])
	const [agentsLoading, setAgentsLoading] = useState(false)
	const [agentsError, setAgentsError] = useState<string | null>(null)
	const [conversationsList, setConversationsList] = useState<{ id: string; name: string }[]>([])
	const [conversationsLoading, setConversationsLoading] = useState(false)
	const [conversationsError, setConversationsError] = useState<string | null>(null)

	/**
	 * After agents load, auto-apply the model from the currently-selected agent
	 * IF no lettaModelId is saved yet. This fixes "stale config" scenarios where
	 * the user had a profile from before the lettaModelId field existed.
	 *
	 * NOTE: This is deliberately non-destructive — if the user has already
	 * manually picked a model it is left untouched.
	 */
	const applyAgentModelIfMissing = useCallback((agents: { id: string; name: string; model?: string }[]) => {
		const currentAgentId = localAgentIdRef.current
		const currentModelId = localModelIdRef.current

		if (!currentAgentId || currentModelId) {
			// Either no agent selected, or model already set — nothing to do
			return
		}

		const matchedAgent = agents.find((a) => a.id === currentAgentId)
		if (matchedAgent?.model) {
			setLocalModelId(matchedAgent.model)
			setApiConfigurationFieldRef.current("lettaModelId", matchedAgent.model)
		}
	}, [])

	const refreshAgents = useCallback(async () => {
		setAgentsLoading(true)
		setAgentsError(null)
		try {
			const agents = await getLettaAgents(credentialsRef.current)
			setAgentsList(agents)
			// Auto-recover model for the currently-saved agent if it is missing
			applyAgentModelIfMissing(agents)
		} catch (e: any) {
			setAgentsError(e?.message || "Failed to load agents")
			setAgentsList([])
		} finally {
			setAgentsLoading(false)
		}
	}, [applyAgentModelIfMissing])

	// Letta Models Hook
	const { models, modelsLoading, modelsError, refetchModels } = useLettaModels({ lettaBaseUrl, lettaApiKey })

	const refreshConversations = useCallback(
		async (forAgentId?: string) => {
			const id = forAgentId ?? localAgentIdRef.current
			if (!id) return
			setConversationsLoading(true)
			setConversationsError(null)
			try {
				const convs = await getLettaConversations({ agentId: id, ...credentialsRef.current })
				setConversationsList(convs)

				// Use refs to avoid stale closures and prevent effect loops
				if (localConvModeRef.current === "manual" && convs.length > 0 && !localConvIdRef.current) {
					const firstConv = convs[0].id
					setLocalConvId(firstConv)
					setApiConfigurationFieldRef.current("lettaConversationId", firstConv)
				}
			} catch (e: any) {
				setConversationsError(e?.message || "Failed to load conversations")
				setConversationsList([])
			} finally {
				setConversationsLoading(false)
			}
		},
		// Stable deps only — localConvMode/Id accessed via refs to prevent effect loops
		[],
	)

	// Listen for testLettaConnection response from extension host
	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			if (message.type === "lettaConnectionStatus" && message.lettaConnectionStatus) {
				const s = message.lettaConnectionStatus
				if (s.success) {
					setConnectionStatus({ state: "ok", agentCount: s.agentCount ?? 0 })
					refreshAgents() // Auto-fetch agents on successful connection
				} else {
					setConnectionStatus({ state: "error", error: s.error ?? "Unknown error" })
				}
			}
		}
		window.addEventListener("message", handler)
		return () => window.removeEventListener("message", handler)
	}, [refreshAgents])

	// Auto-refresh conversations when agent or mode changes (only in manual mode)
	useEffect(() => {
		if (localConvMode === "manual" && localAgentId) {
			refreshConversations(localAgentId)
		}
	}, [localAgentId, localConvMode, refreshConversations])

	/**
	 * When the agent list arrives AND we have a saved agent but no model,
	 * auto-recover the model. This handles the case where the component
	 * re-mounts with a previously-saved agent ID but stale/empty lettaModelId.
	 *
	 * We also do this when `localAgentId` changes (in case the list was already
	 * loaded but the agent ID changed via the props sync effect).
	 */
	useEffect(() => {
		if (agentsList.length > 0) {
			applyAgentModelIfMissing(agentsList)
		}
	}, [agentsList, localAgentId, applyAgentModelIfMissing])

	const testConnection = useCallback(() => {
		setConnectionStatus({ state: "testing" })
		vscode.postMessage({ type: "testLettaConnection", values: credentialsRef.current })
	}, [])

	const handleAgentChange = (newAgentId: string) => {
		setLocalAgentId(newAgentId) // Immediate UI update (no round-trip wait)
		localAgentIdRef.current = newAgentId
		setApiConfigurationField("apiModelId", newAgentId) // Persist to settings store

		// Auto-select the agent's active model.
		// If the agentsList is already loaded, use it directly.
		// If not, the applyAgentModelIfMissing effect will catch it once the list arrives.
		const selectedAgent = agentsList.find((a) => a.id === newAgentId)
		if (selectedAgent?.model) {
			setLocalModelId(selectedAgent.model)
			localModelIdRef.current = selectedAgent.model
			setApiConfigurationField("lettaModelId", selectedAgent.model)
		} else {
			// Clear the model so we don't carry over a stale model from a previous agent
			setLocalModelId("")
			localModelIdRef.current = ""
			setApiConfigurationField("lettaModelId", "")
		}

		// Clear the conversation when the agent changes, forcing them to re-select
		setLocalConvId("")
		setApiConfigurationField("lettaConversationId", "")
		// conversation refresh handled by useEffect watching localAgentId + localConvMode
	}

	const handleConvModeChange = (val: string) => {
		setLocalConvMode(val) // Immediate UI update
		setApiConfigurationField("lettaConversationMode", val)
	}

	const handleConvIdChange = (val: string) => {
		setLocalConvId(val)
		setApiConfigurationField("lettaConversationId", val)
	}

	const handleModelChange = (newModelId: string) => {
		setLocalModelId(newModelId)
		localModelIdRef.current = newModelId
		setApiConfigurationField("lettaModelId", newModelId)

		// If an agent is selected, update its model configuration on the server
		if (localAgentId && localAgentIdRef.current) {
			const selectedModel = models.find((m) => m.model === newModelId)
			if (selectedModel) {
				vscode.postMessage({
					type: "updateLettaAgentModel",
					values: {
						agentId: localAgentIdRef.current,
						llmConfig: {
							model: selectedModel.model,
							model_endpoint_type: selectedModel.model_endpoint_type,
							model_endpoint: selectedModel.model_endpoint,
							model_wrapper: selectedModel.model_wrapper,
							context_window: selectedModel.context_window,
						},
					},
				})
			}
		}
	}

	// Derived display state: show a warning badge if model is not set but agent is
	const modelMissing = !!localAgentId && !localModelId

	return (
		<div className="flex flex-col gap-2">
			{/* Base URL */}
			<VSCodeTextField
				value={lettaBaseUrl}
				onInput={(e: any) => setApiConfigurationField("lettaBaseUrl", e.target?.value)}
				placeholder="https://api.letta.com/v1">
				<span className="font-medium">Letta Base URL</span>
			</VSCodeTextField>
			<p className="text-xs text-vscode-descriptionForeground">
				Defaults to Letta Cloud (api.letta.com) if left blank.
			</p>

			{/* API Key */}
			<VSCodeTextField
				value={lettaApiKey}
				onInput={(e: any) => setApiConfigurationField("lettaApiKey", e.target?.value)}
				onBlur={() => lettaApiKey && testConnection()}
				onKeyDown={(e: any) => e.key === "Enter" && lettaApiKey && testConnection()}
				placeholder="Enter your Letta API Key"
				type="password">
				<span className="font-medium">Letta API Key</span>
			</VSCodeTextField>
			<p className="text-xs text-vscode-descriptionForeground">Press Enter or Tab to auto-test the connection.</p>

			{/* Test Connection */}
			<div className="flex items-center gap-2 mt-1">
				<button
					className="text-xs px-2 py-1 bg-vscode-button-background text-vscode-button-foreground hover:bg-vscode-button-hoverBackground border-0 cursor-pointer rounded"
					onClick={testConnection}
					disabled={connectionStatus.state === "testing"}>
					{connectionStatus.state === "testing" ? "Testing..." : "Test Connection"}
				</button>
				{connectionStatus.state === "ok" && (
					<span className="text-xs" style={{ color: "var(--vscode-testing-iconPassed, #388a34)" }}>
						✓ Connected — {connectionStatus.agentCount} agent{connectionStatus.agentCount !== 1 ? "s" : ""}{" "}
						found
					</span>
				)}
				{connectionStatus.state === "error" && (
					<span className="text-xs" style={{ color: "var(--vscode-errorForeground, #f48771)" }}>
						✗ {connectionStatus.error}
					</span>
				)}
			</div>

			{/* Agent */}
			<div className="flex flex-col gap-1 mt-2">
				<div className="flex items-center justify-between">
					<label className="font-medium">Letta Agent</label>
					<button
						className="text-xs text-vscode-textLink-foreground bg-transparent border-0 cursor-pointer p-0"
						style={{ opacity: agentsLoading ? 0.5 : 1 }}
						onClick={() => refreshAgents()}
						disabled={agentsLoading}>
						{agentsLoading ? "Loading..." : "↻ Refresh"}
					</button>
				</div>

				{agentsError && (
					<p className="text-xs" style={{ color: "var(--vscode-errorForeground, #f48771)" }}>
						⚠ {agentsError}
					</p>
				)}

				{agentsList.length > 0 ? (
					<StyledSelect
						value={localAgentId}
						onChange={handleAgentChange}
						options={agentsList.map((a) => ({ id: a.id, label: `${a.name} (${a.id.slice(0, 8)}...)` }))}
						placeholder="— Select an agent —"
					/>
				) : (
					<VSCodeTextField
						value={localAgentId}
						onInput={(e: any) => {
							setLocalAgentId(e.target?.value)
							setApiConfigurationField("apiModelId", e.target?.value)
						}}
						placeholder="agent-id-...">
						{agentsLoading ? "Loading agents..." : "Enter ID, or click ↻ Refresh to list agents"}
					</VSCodeTextField>
				)}
				<p className="text-xs text-vscode-descriptionForeground">The Letta Agent to connect to.</p>
			</div>

			{/* Model Selection */}
			<div className="flex flex-col gap-1 mt-2">
				<div className="flex items-center justify-between">
					<label className="font-medium">
						Letta Model
						{modelMissing && (
							<span
								className="ml-1 text-xs"
								style={{ color: "var(--vscode-errorForeground, #f48771)" }}
								title="Model not set — refresh agents or select manually">
								⚠ not set
							</span>
						)}
					</label>
					<button
						className="text-xs text-vscode-textLink-foreground bg-transparent border-0 cursor-pointer p-0"
						style={{ opacity: modelsLoading ? 0.5 : 1 }}
						onClick={() => refetchModels()}
						disabled={modelsLoading}>
						{modelsLoading ? "Loading..." : "↻ Refresh"}
					</button>
				</div>

				{modelsError && (
					<p className="text-xs" style={{ color: "var(--vscode-errorForeground, #f48771)" }}>
						⚠ {modelsError}
					</p>
				)}

				{models.length > 0 ? (
					<StyledSelect
						value={localModelId}
						onChange={handleModelChange}
						options={models.map((m) => ({ id: m.model, label: m.model }))}
						placeholder="— Select Model —"
						disabled={!localAgentId}
					/>
				) : (
					<VSCodeTextField
						value={localModelId}
						onInput={(e: any) => handleModelChange(e.target?.value)}
						placeholder="model-id"
						disabled={!localAgentId}>
						{modelsLoading
							? "Loading models..."
							: !localAgentId
								? "Select an agent first"
								: "Enter Model ID manually"}
					</VSCodeTextField>
				)}
				<p className="text-xs text-vscode-descriptionForeground">
					The LLM model powering this agent. Auto-populated when you select an agent.
				</p>
			</div>

			{/* Conversation Mode */}
			<div className="flex flex-col gap-1 mt-2">
				<label className="font-medium">Conversation Mode</label>
				<StyledSelect
					value={localConvMode}
					onChange={handleConvModeChange}
					options={[
						{ id: "auto_workspace", label: "Auto per Workspace" },
						{ id: "new_task", label: "New per Roo Code Task" },
						{ id: "manual", label: "Manual Select" },
					]}
				/>
				<p className="text-xs text-vscode-descriptionForeground">
					Auto links by workspace. New creates a fresh thread per task. Manual lets you pick a specific
					conversation.
				</p>
			</div>

			{/* Conversation (manual mode only) */}
			{localConvMode === "manual" && (
				<div className="flex flex-col gap-1 mt-2">
					<div className="flex items-center justify-between">
						<label className="font-medium">Conversation</label>
						{localAgentId && (
							<button
								className="text-xs text-vscode-textLink-foreground bg-transparent border-0 cursor-pointer p-0"
								style={{ opacity: conversationsLoading ? 0.5 : 1 }}
								onClick={() => refreshConversations()}
								disabled={conversationsLoading}>
								{conversationsLoading ? "Loading..." : "↻ Refresh"}
							</button>
						)}
					</div>

					{conversationsError && (
						<p className="text-xs" style={{ color: "var(--vscode-errorForeground, #f48771)" }}>
							⚠ {conversationsError}
						</p>
					)}

					{conversationsList.length > 0 ? (
						<StyledSelect
							value={localConvId}
							onChange={handleConvIdChange}
							options={conversationsList.map((c) => ({ id: c.id, label: c.name || c.id }))}
							placeholder="— Select a conversation —"
						/>
					) : (
						<VSCodeTextField
							value={localConvId}
							onInput={(e: any) => handleConvIdChange(e.target?.value)}
							placeholder="conversation-id-...">
							{!localAgentId
								? "Select an agent first"
								: conversationsLoading
									? "Loading conversations..."
									: "Enter ID manually, or click ↻ Refresh"}
						</VSCodeTextField>
					)}
					<p className="text-xs text-vscode-descriptionForeground">
						The specific conversation to use for all messages.
					</p>
				</div>
			)}
		</div>
	)
}
