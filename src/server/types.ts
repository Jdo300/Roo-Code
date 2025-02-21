export interface WebSocketMessage {
    message?: string;
    command: string;
    value?: unknown;
}

export interface WebSocketServerConfig {
    port: number;
    enabled: boolean;
}
