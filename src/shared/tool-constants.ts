import type { ToolGroup, ToolName, GenerateImageParams, ToolProgressStatus, ClineAsk } from "@roo-code/types"

export const toolParamNames = [
	"command",
	"path",
	"content",
	"regex",
	"file_pattern",
	"recursive",
	"action",
	"url",
	"coordinate",
	"text",
	"server_name",
	"tool_name",
	"arguments",
	"uri",
	"question",
	"result",
	"diff",
	"mode_slug",
	"reason",
	"line",
	"mode",
	"message",
	"cwd",
	"follow_up",
	"task",
	"size",
	"query",
	"args",
	"skill", // skill tool parameter
	"start_line",
	"end_line",
	"todos",
	"prompt",
	"image",
	// read_file parameters (native protocol)
	"operations", // search_and_replace parameter for multiple operations
	"patch", // apply_patch parameter
	"file_path", // search_replace and edit_file parameter
	"old_string", // search_replace and edit_file parameter
	"new_string", // search_replace and edit_file parameter
	"replace_all", // edit tool parameter for replacing all occurrences
	"expected_replacements", // edit_file parameter for multiple occurrences
	"timeout", // execute_command parameter
	"artifact_id", // read_command_output parameter
	"search", // read_command_output parameter for grep-like search
	"offset", // read_command_output and read_file parameter
	"limit", // read_command_output and read_file parameter
	// read_file indentation mode parameters
	"indentation",
	"anchor_line",
	"max_levels",
	"include_siblings",
	"include_header",
	"max_lines",
	// read_file legacy format parameter (backward compatibility)
	"files",
	"line_ranges",
] as const

export type ToolParamName = (typeof toolParamNames)[number]

export interface ToolUse<TName extends ToolName = ToolName> {
	type: "tool_use"
	id?: string
	name: TName
	originalName?: string
	params: Partial<Record<ToolParamName, string>>
	partial: boolean
	nativeArgs?: any // Will be specialized in tools.ts
	usedLegacyFormat?: boolean // Set by NativeToolCallParser when XML fallback format was used
}

export type ToolGroupConfig = {
	tools: readonly string[]
	alwaysAvailable?: boolean
	customTools?: readonly string[]
}

export const TOOL_DISPLAY_NAMES: Record<ToolName, string> = {
	execute_command: "run commands",
	read_file: "read files",
	read_command_output: "read command output",
	write_to_file: "write files",
	apply_diff: "apply changes",
	edit: "edit files",
	search_and_replace: "apply changes using search and replace",
	search_replace: "apply single search and replace",
	edit_file: "edit files using search and replace",
	apply_patch: "apply patches using codex format",
	search_files: "search files",
	list_files: "list files",
	use_mcp_tool: "use mcp tools",
	access_mcp_resource: "access mcp resources",
	ask_followup_question: "ask questions",
	attempt_completion: "complete tasks",
	switch_mode: "switch modes",
	new_task: "create new task",
	codebase_search: "codebase search",
	update_todo_list: "update todo list",
	run_slash_command: "run slash command",
	skill: "load skill",
	generate_image: "generate images",
	custom_tool: "use custom tools",
} as const

export const TOOL_GROUPS: Record<ToolGroup, ToolGroupConfig> = {
	read: {
		tools: ["read_file", "search_files", "list_files", "codebase_search"],
	},
	edit: {
		tools: ["apply_diff", "write_to_file", "generate_image"],
		customTools: ["edit", "search_replace", "edit_file", "apply_patch"],
	},
	command: {
		tools: ["execute_command", "read_command_output"],
	},
	mcp: {
		tools: ["use_mcp_tool", "access_mcp_resource"],
	},
	modes: {
		tools: ["switch_mode", "new_task"],
		alwaysAvailable: true,
	},
}

export const ALWAYS_AVAILABLE_TOOLS: ToolName[] = [
	"ask_followup_question",
	"attempt_completion",
	"switch_mode",
	"new_task",
	"update_todo_list",
	"run_slash_command",
	"skill",
] as const

export const TOOL_ALIASES: Record<string, ToolName> = {
	write_file: "write_to_file",
	search_and_replace: "edit",
} as const
