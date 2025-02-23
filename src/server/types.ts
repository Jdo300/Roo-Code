export type WebSocketMessageType = "message" | "reasoning" | "status" | "question"

export interface WebSocketMessage {
	type: WebSocketMessageType
	output?: string // Only for "message" and "reasoning" types
	statusType?: string // Only for "status" type
	text?: string // For "status" and "question" types - the actual text content
	partial?: boolean
}

export interface WebSocketServerConfig {
	port: number
	enabled: boolean
}
