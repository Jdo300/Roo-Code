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

export type Ack = z.infer<typeof ackSchema>

/**
 * TaskCommand
 */

export enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
	GetCurrentTaskStack = "GetCurrentTaskStack",
	ClearCurrentTask = "ClearCurrentTask",
	CancelCurrentTask = "CancelCurrentTask",
	SendMessage = "SendMessage",
	PressPrimaryButton = "PressPrimaryButton",
	PressSecondaryButton = "PressSecondaryButton",
	SetConfiguration = "SetConfiguration",
	IsReady = "IsReady",
	GetMessages = "GetMessages",
	GetTokenUsage = "GetTokenUsage",
	Log = "Log",
	ResumeTask = "ResumeTask",
	IsTaskInHistory = "IsTaskInHistory",
	CreateProfile = "CreateProfile",
	GetProfiles = "GetProfiles",
	SetActiveProfile = "SetActiveProfile",
	getActiveProfile = "getActiveProfile",
	DeleteProfile = "DeleteProfile",
}

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
		data: rooCodeSettingsSchema.partial(),
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

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskEvent
 */

export enum EvalEventName {
	Pass = "pass",
	Fail = "fail",
}

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

export type TaskEvent = z.infer<typeof taskEventSchema>

/**
 * IpcMessage
 */

export enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
	EvalEvent = "EvalEvent",
}

export enum IpcOrigin {
	Client = "client",
	Server = "server",
}

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

export type IpcMessage = z.infer<typeof ipcMessageSchema>
