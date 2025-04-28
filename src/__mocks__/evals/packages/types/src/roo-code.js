"use strict"
// Mock implementation of roo-code.ts
const RooCodeEventName = Object.freeze({
	TaskStarted: "taskStarted",
	Message: "message",
	TaskModeSwitched: "taskModeSwitched",
	TaskAskResponded: "taskAskResponded",
	TaskAborted: "taskAborted",
	TaskCompleted: "taskCompleted",
	TaskSpawned: "taskSpawned",
	TaskPaused: "taskPaused",
	TaskUnpaused: "taskUnpaused",
	TaskTokenUsageUpdated: "taskTokenUsageUpdated",
	TaskToolFailed: "taskToolFailed",
	TaskCreated: "taskCreated",
})
const ToolName = Object.freeze({
	read_file: "read_file",
	write_to_file: "write_to_file",
	execute_command: "execute_command",
	browser_action: "browser_action",
})
// Create dummy objects for type exports
const dummyRooCodeEvents = {}
module.exports = {
	RooCodeEventName,
	RooCodeEvents: dummyRooCodeEvents,
	ToolName,
}
//# sourceMappingURL=roo-code.js.map
