import { Anthropic } from "@anthropic-ai/sdk"
import {
	toolParamNames,
	type ToolParamName,
	type ToolUse,
	type ToolGroupConfig,
	TOOL_DISPLAY_NAMES,
	TOOL_GROUPS,
	ALWAYS_AVAILABLE_TOOLS,
	TOOL_ALIASES,
} from "./tool-constants"

export {
	toolParamNames,
	type ToolParamName,
	type ToolUse,
	type ToolGroupConfig,
	TOOL_DISPLAY_NAMES,
	TOOL_GROUPS,
	ALWAYS_AVAILABLE_TOOLS,
	TOOL_ALIASES,
} from "./tool-constants"

import type { ClineAsk, ToolProgressStatus, ToolGroup, ToolName, GenerateImageParams } from "@roo-code/types"

export type ToolResponse = string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>

export type AskApproval = (
	type: ClineAsk,
	partialMessage?: string,
	progressStatus?: ToolProgressStatus,
	forceApproval?: boolean,
) => Promise<boolean>

export type HandleError = (action: string, error: Error) => Promise<void>

export type PushToolResult = (content: ToolResponse) => void

export type AskFinishSubTaskApproval = () => Promise<boolean>

export interface TextContent {
	type: "text"
	content: string
	partial: boolean
}

/**
 * Type map defining the native (typed) argument structure for each tool.
 * Tools not listed here will fall back to `any` for backward compatibility.
 */
export type NativeToolArgs = {
	access_mcp_resource: { server_name: string; uri: string }
	read_file: import("@roo-code/types").ReadFileToolParams
	read_command_output: { artifact_id: string; search?: string; offset?: number; limit?: number }
	attempt_completion: { result: string }
	execute_command: { command: string; cwd?: string; timeout?: number | null }
	apply_diff: { path: string; diff: string }
	edit: { file_path: string; old_string: string; new_string: string; replace_all?: boolean }
	search_and_replace: { file_path: string; old_string: string; new_string: string; replace_all?: boolean }
	search_replace: { file_path: string; old_string: string; new_string: string }
	edit_file: { file_path: string; old_string: string; new_string: string; expected_replacements?: number }
	apply_patch: { patch: string }
	list_files: { path: string; recursive?: boolean }
	new_task: { mode: string; message: string; todos?: string }
	ask_followup_question: {
		question: string
		follow_up: Array<{ text: string; mode?: string }>
	}
	codebase_search: { query: string; path?: string }
	generate_image: GenerateImageParams
	run_slash_command: { command: string; args?: string }
	skill: { skill: string; args?: string }
	search_files: { path: string; regex: string; file_pattern?: string | null }
	switch_mode: { mode_slug: string; reason: string }
	update_todo_list: { todos: string }
	use_mcp_tool: { server_name: string; tool_name: string; arguments?: Record<string, unknown> }
	write_to_file: { path: string; content: string }
	// Add more tools as they are migrated to native protocol
}

/**
 * Represents a native MCP tool call from the model.
 * In native mode, MCP tools are called directly with their prefixed name (e.g., "mcp_serverName_toolName")
 * rather than through the use_mcp_tool wrapper. This type preserves the original tool name
 * so it appears correctly in API conversation history.
 */
export interface McpToolUse {
	type: "mcp_tool_use"
	id?: string // Tool call ID from the API
	/** The original tool name from the API (e.g., "mcp_serverName_toolName") */
	name: string
	/** Extracted server name from the tool name */
	serverName: string
	/** Extracted tool name from the tool name */
	toolName: string
	/** Arguments passed to the MCP tool */
	arguments: Record<string, unknown>
	partial: boolean
}

export interface ExecuteCommandToolUse extends ToolUse<"execute_command"> {
	name: "execute_command"
	// Pick<Record<ToolParamName, string>, "command"> makes "command" required, but Partial<> makes it optional
	params: Partial<Pick<Record<ToolParamName, string>, "command" | "cwd" | "timeout">>
}

export interface ReadFileToolUse extends ToolUse<"read_file"> {
	name: "read_file"
	params: Partial<
		Pick<
			Record<ToolParamName, string>,
			| "args"
			| "path"
			| "start_line"
			| "end_line"
			| "mode"
			| "offset"
			| "limit"
			| "indentation"
			| "anchor_line"
			| "max_levels"
			| "include_siblings"
			| "include_header"
		>
	>
}

export interface WriteToFileToolUse extends ToolUse<"write_to_file"> {
	name: "write_to_file"
	params: Partial<Pick<Record<ToolParamName, string>, "path" | "content">>
}

export interface CodebaseSearchToolUse extends ToolUse<"codebase_search"> {
	name: "codebase_search"
	params: Partial<Pick<Record<ToolParamName, string>, "query" | "path">>
}

export interface SearchFilesToolUse extends ToolUse<"search_files"> {
	name: "search_files"
	params: Partial<Pick<Record<ToolParamName, string>, "path" | "regex" | "file_pattern">>
}

export interface ListFilesToolUse extends ToolUse<"list_files"> {
	name: "list_files"
	params: Partial<Pick<Record<ToolParamName, string>, "path" | "recursive">>
}

export interface UseMcpToolToolUse extends ToolUse<"use_mcp_tool"> {
	name: "use_mcp_tool"
	params: Partial<Pick<Record<ToolParamName, string>, "server_name" | "tool_name" | "arguments">>
}

export interface AccessMcpResourceToolUse extends ToolUse<"access_mcp_resource"> {
	name: "access_mcp_resource"
	params: Partial<Pick<Record<ToolParamName, string>, "server_name" | "uri">>
}

export interface AskFollowupQuestionToolUse extends ToolUse<"ask_followup_question"> {
	name: "ask_followup_question"
	params: Partial<Pick<Record<ToolParamName, string>, "question" | "follow_up">>
}

export interface AttemptCompletionToolUse extends ToolUse<"attempt_completion"> {
	name: "attempt_completion"
	params: Partial<Pick<Record<ToolParamName, string>, "result">>
}

export interface SwitchModeToolUse extends ToolUse<"switch_mode"> {
	name: "switch_mode"
	params: Partial<Pick<Record<ToolParamName, string>, "mode_slug" | "reason">>
}

export interface NewTaskToolUse extends ToolUse<"new_task"> {
	name: "new_task"
	params: Partial<Pick<Record<ToolParamName, string>, "mode" | "message" | "todos">>
}

export interface RunSlashCommandToolUse extends ToolUse<"run_slash_command"> {
	name: "run_slash_command"
	params: Partial<Pick<Record<ToolParamName, string>, "command" | "args">>
}

export interface SkillToolUse extends ToolUse<"skill"> {
	name: "skill"
	params: Partial<Pick<Record<ToolParamName, string>, "skill" | "args">>
}

export interface GenerateImageToolUse extends ToolUse<"generate_image"> {
	name: "generate_image"
	params: Partial<Pick<Record<ToolParamName, string>, "prompt" | "path" | "image">>
}

export type DiffResult =
	| { success: true; content: string; failParts?: DiffResult[] }
	| ({
			success: false
			error?: string
			details?: {
				similarity?: number
				threshold?: number
				matchedRange?: { start: number; end: number }
				searchContent?: string
				bestMatch?: string
			}
			failParts?: DiffResult[]
	  } & ({ error: string } | { failParts: DiffResult[] }))

export interface DiffItem {
	content: string
	startLine?: number
}

export interface DiffStrategy {
	/**
	 * Get the name of this diff strategy for analytics and debugging
	 * @returns The name of the diff strategy
	 */
	getName(): string

	/**
	 * Apply a diff to the original content
	 * @param originalContent The original file content
	 * @param diffContent The diff content in the strategy's format (string for legacy, DiffItem[] for new)
	 * @param startLine Optional line number where the search block starts. If not provided, searches the entire file.
	 * @param endLine Optional line number where the search block ends. If not provided, searches the entire file.
	 * @returns A DiffResult object containing either the successful result or error details
	 */
	applyDiff(
		originalContent: string,
		diffContent: string | DiffItem[],
		startLine?: number,
		endLine?: number,
	): Promise<DiffResult>

	getProgressStatus?(toolUse: ToolUse, result?: any): ToolProgressStatus
}
