import { z } from "zod"

import { RooCodeEventName, rooCodeEventsSchema, rooCodeSettingsSchema } from "./index"

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
	GetActiveProfile = "GetActiveProfile",
	DeleteProfile = "DeleteProfile",
}

export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: rooCodeSettingsSchema,
			text: z.string(),
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
	// Task Management Commands
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
	// Configuration Commands
	z.object({
		commandName: z.literal(TaskCommandName.SetConfiguration),
		data: z.any(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetConfiguration),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.IsReady),
		data: z.undefined(),
	}),
	// Task Information Commands
	z.object({
		commandName: z.literal(TaskCommandName.GetMessages),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetTokenUsage),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.Log),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.ResumeTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.IsTaskInHistory),
		data: z.string(),
	}),
	// Profile Management Commands
	z.object({
		commandName: z.literal(TaskCommandName.CreateProfile),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetProfiles),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.SetActiveProfile),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.GetActiveProfile),
		data: z.undefined(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.DeleteProfile),
		data: z.string(),
	}),
])

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskEvent
 */

export const taskEventSchema = z.discriminatedUnion("eventName", [
	z.object({
		eventName: z.literal(RooCodeEventName.Message),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.Message],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCreated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCreated],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskStarted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskStarted],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskModeSwitched),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskModeSwitched],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskPaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskPaused],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskUnpaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskUnpaused],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAskResponded),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAskResponded],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAborted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAborted],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskSpawned),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskSpawned],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCompleted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCompleted],
	}),
	z.object({
		eventName: z.literal(RooCodeEventName.TaskTokenUsageUpdated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskTokenUsageUpdated],
	}),
	// Add case for the new CommandResponse event
	z.object({
		eventName: z.literal(RooCodeEventName.CommandResponse),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.CommandResponse], // Use the schema defined in index.ts
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
