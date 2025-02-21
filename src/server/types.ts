export interface WebSocketMessage {
	message?: string
	command?: string
	value?: any
}

export interface WebSocketCommand {
	type: string
	bool?: boolean
	text?: string
	value?: any
	commands?: string[]
	values?: any
}

export interface WebSocketServerConfig {
	port: number
	enabled: boolean
}
