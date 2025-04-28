import type { RooCodeSettings, ClineMessage, TokenUsage, RooCodeEvents } from "@evals/types"
import type { IpcMessage, TaskCommand, TaskEvent } from "@evals/types"

export interface RooCodeClientOptions {
	host: string
	port: number
	clientId?: string
	connectTimeout?: number
	requestTimeout?: number
}

export interface PendingRequest {
	resolve: (value: any) => void
	reject: (error: Error) => void
	timeout: NodeJS.Timeout
}

export type { RooCodeSettings, ClineMessage, TokenUsage, RooCodeEvents, IpcMessage, TaskCommand, TaskEvent }
