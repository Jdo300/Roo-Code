import type { RooCodeSettings, ClineMessage, TokenUsage, RooCodeEvents } from "../../types/src/roo-code.js"
import type { IpcMessage, TaskCommand, TaskEvent } from "../../types/src/ipc.js"

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
