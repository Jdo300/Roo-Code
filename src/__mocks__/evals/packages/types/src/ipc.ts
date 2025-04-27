// Mock implementation of ipc.ts
const IpcMessageType = Object.freeze({
	TaskCommand: "TaskCommand",
	TaskEvent: "TaskEvent",
})

const TaskCommandName = Object.freeze({
	StartNewTask: "StartNewTask",
	CancelTask: "CancelTask",
	CloseTask: "CloseTask",
	GetCurrentTaskStack: "GetCurrentTaskStack",
	ClearCurrentTask: "ClearCurrentTask",
	CancelCurrentTask: "CancelCurrentTask",
	SendMessage: "SendMessage",
	PressPrimaryButton: "PressPrimaryButton",
	PressSecondaryButton: "PressSecondaryButton",
	SetConfiguration: "SetConfiguration",
	IsReady: "IsReady",
	GetMessages: "GetMessages",
	GetTokenUsage: "GetTokenUsage",
	Log: "Log",
	ResumeTask: "ResumeTask",
	IsTaskInHistory: "IsTaskInHistory",
	CreateProfile: "CreateProfile",
	GetProfiles: "GetProfiles",
	SetActiveProfile: "SetActiveProfile",
	getActiveProfile: "getActiveProfile",
	DeleteProfile: "DeleteProfile",
})

const IpcOrigin = Object.freeze({
	Server: "Server",
	Client: "Client",
})

// Create a dummy TaskCommand object that matches the interface shape
const dummyTaskCommand = {
	commandName: "StartNewTask",
	data: undefined,
}

module.exports = {
	IpcMessageType,
	TaskCommandName,
	IpcOrigin,
	TaskCommand: dummyTaskCommand,
}
