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
	GetConfiguration = "GetConfiguration",
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
		commandName: z.literal(TaskCommandName.GetConfiguration),
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
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
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
	}),
	z.object({
		commandName: z.literal(TaskCommandName.ClearCurrentTask),
		data: z.string().optional(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelCurrentTask),
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
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
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
	}),
	z.object({
		commandName: z.literal(TaskCommandName.PressSecondaryButton),
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SetConfiguration),
		data: rooCodeSettingsSchema.partial(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.IsReady),
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
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
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SetActiveProfile),
		data: z.string(), // name
	}),
	z.object({
		commandName: z.literal(TaskCommandName.getActiveProfile),
		data: z.union([z.undefined(), z.object({})]).optional(), // Accept undefined or empty object, and make the field optional
	}),
	z.object({
		commandName: z.literal(TaskCommandName.DeleteProfile),
		data: z.string(), // name
	}),
])

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskResponse
 */

export const taskResponseSchema = z.object({
	commandName: z.nativeEnum(TaskCommandName), // The command this is a response to
	data: z.any().optional(), // The response data from the API method
	// Add a unique identifier to link response to command if needed, e.g., commandId: z.string()
})

export type TaskResponse = z.infer<typeof taskResponseSchema>

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
	TaskResponse = "TaskResponse",
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
		// Define commandName as an enum of all possible command names
		commandName: z.nativeEnum(TaskCommandName),
		// Define data as a union of all possible data schemas from taskCommandSchema options
		data: z.any().optional(), // Temporarily simplify data schema to any().optional() for debugging
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskResponse),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(), // Optional: if relaying response to a specific client
		data: taskResponseSchema,
	}),
])

export type IpcMessage = z.infer<typeof ipcMessageSchema>
