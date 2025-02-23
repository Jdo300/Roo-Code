export type WebSocketMessageType = "message" | "reasoning" | "status"

export interface WebSocketMessage {
	type: WebSocketMessageType
	output?: string // Only for "message" and "reasoning" types
	statusType?: string // Only for "status" type
	text?: string // Optional, for "status" type - text associated with the status
	partial?: boolean
}

export interface WebSocketServerConfig {
	port: number
	enabled: boolean
}
