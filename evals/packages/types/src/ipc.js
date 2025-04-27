import { z } from "zod"
import { RooCodeEventName, rooCodeEventsSchema, rooCodeSettingsSchema } from "./roo-code.js"
/**
 * Ack
 */
export const ackSchema = z.object({
	clientId: z.string(),
	pid: z.number(),
	ppid: z.number(),
})
/**
 * TaskCommand
 */
export var TaskCommandName
;(function (TaskCommandName) {
	TaskCommandName["StartNewTask"] = "StartNewTask"
	TaskCommandName["CancelTask"] = "CancelTask"
	TaskCommandName["CloseTask"] = "CloseTask"
	TaskCommandName["GetCurrentTaskStack"] = "GetCurrentTaskStack"
	TaskCommandName["ClearCurrentTask"] = "ClearCurrentTask"
	TaskCommandName["CancelCurrentTask"] = "CancelCurrentTask"
	TaskCommandName["SendMessage"] = "SendMessage"
	TaskCommandName["PressPrimaryButton"] = "PressPrimaryButton"
	TaskCommandName["PressSecondaryButton"] = "PressSecondaryButton"
	TaskCommandName["SetConfiguration"] = "SetConfiguration"
	TaskCommandName["IsReady"] = "IsReady"
	TaskCommandName["GetMessages"] = "GetMessages"
	TaskCommandName["GetTokenUsage"] = "GetTokenUsage"
	TaskCommandName["Log"] = "Log"
	TaskCommandName["ResumeTask"] = "ResumeTask"
	TaskCommandName["IsTaskInHistory"] = "IsTaskInHistory"
	TaskCommandName["CreateProfile"] = "CreateProfile"
	TaskCommandName["GetProfiles"] = "GetProfiles"
	TaskCommandName["SetActiveProfile"] = "SetActiveProfile"
	TaskCommandName["getActiveProfile"] = "getActiveProfile"
	TaskCommandName["DeleteProfile"] = "DeleteProfile"
})(TaskCommandName || (TaskCommandName = {}))
export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: rooCodeSettingsSchema,
			text: z.string().optional(),
			images: z.array(z.string()).optional(),
			newTab: z.boolean().optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetCurrentTaskStack),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.ClearCurrentTask),
		data: z.string().optional(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelCurrentTask),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SendMessage),
		data: z.object({
			message: z.string().optional(),
			images: z.array(z.string()).optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.PressPrimaryButton),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.PressSecondaryButton),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SetConfiguration),
		data: z.any(), // Using z.any() for Partial<ConfigurationValues> as the exact schema isn't in roo-code.d.ts
	}),
	z.object({
		commandName: z.literal(TaskCommandName.IsReady),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetMessages),
		data: z.string(), // taskId
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetTokenUsage),
		data: z.string(), // taskId
	}),
	z.object({
		commandName: z.literal(TaskCommandName.Log),
		data: z.string(), // message
	}),
	z.object({
		commandName: z.literal(TaskCommandName.ResumeTask),
		data: z.string(), // taskId
	}),
	z.object({
		commandName: z.literal(TaskCommandName.IsTaskInHistory),
		data: z.string(), // taskId
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CreateProfile),
		data: z.string(), // name
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetProfiles),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SetActiveProfile),
		data: z.string(), // name
	}),
	z.object({
		commandName: z.literal(TaskCommandName.getActiveProfile),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.DeleteProfile),
		data: z.string(), // name
	}),
])
/**
 * TaskEvent
 */
export var EvalEventName
;(function (EvalEventName) {
	EvalEventName["Pass"] = "pass"
	EvalEventName["Fail"] = "fail"
})(EvalEventName || (EvalEventName = {}))
export const taskEventSchema = z.discriminatedUnion("eventName", [
	z.object({
		eventName: z.literal(RooCodeEventName.Message),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCreated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCreated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskStarted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskModeSwitched),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskPaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskUnpaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAskResponded),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAborted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskSpawned),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCompleted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskTokenUsageUpdated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskToolFailed),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(EvalEventName.Pass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(EvalEventName.Fail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])
/**
 * IpcMessage
 */
export var IpcMessageType
;(function (IpcMessageType) {
	IpcMessageType["Connect"] = "Connect"
	IpcMessageType["Disconnect"] = "Disconnect"
	IpcMessageType["Ack"] = "Ack"
	IpcMessageType["TaskCommand"] = "TaskCommand"
	IpcMessageType["TaskEvent"] = "TaskEvent"
	IpcMessageType["EvalEvent"] = "EvalEvent"
})(IpcMessageType || (IpcMessageType = {}))
export var IpcOrigin
;(function (IpcOrigin) {
	IpcOrigin["Client"] = "client"
	IpcOrigin["Server"] = "server"
})(IpcOrigin || (IpcOrigin = {}))
export const ipcMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		clientId: z.string(),
		data: taskCommandSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])
//# sourceMappingURL=ipc.js.map
