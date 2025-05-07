import { EventEmitter } from "events"
import { IpcServer } from "../exports/ipc"
import { RooCodeEventName, RooCodeEvents } from "../schemas"
import { TaskCommandName, IpcMessageType, IpcOrigin } from "../schemas/ipc"
import type { OutputChannel } from "vscode"
import type { ClineProvider } from "../core/webview/ClineProvider"

export class API extends EventEmitter<RooCodeEvents> {
	private readonly ipc?: IpcServer

	constructor(
		_outputChannel: OutputChannel,
		_provider: ClineProvider,
		ipcConfig?: {
			socketPath?: string
			tcpHost?: string
			tcpPort?: string | number
		},
		_enableLogging = false,
	) {
		super()

		if (ipcConfig) {
			const ipcOptions = ipcConfig.tcpPort
				? { host: ipcConfig.tcpHost || "localhost", port: ipcConfig.tcpPort }
				: { socketPath: ipcConfig.socketPath }

			const ipcLogger = (...args: unknown[]) => {
				console.log("[IPC]", ...args)
			}

			this.ipc = new IpcServer(ipcOptions, ipcLogger)
			this.ipc.listen()

			// Override the IPC server's onMessage to get access to the full message
			const originalOnMessage = (this.ipc as any).onMessage.bind(this.ipc)
			;(this.ipc as any).onMessage = (data: any) => {
				if (typeof data === "object" && data.type === IpcMessageType.TaskCommand) {
					const { clientId, requestId, data: commandData } = data
					const { commandName } = commandData

					switch (commandName) {
						case TaskCommandName.GetConfiguration:
							this.ipc?.send(clientId, {
								type: IpcMessageType.TaskEvent,
								origin: IpcOrigin.Server,
								data: {
									eventName: RooCodeEventName.CommandResponse,
									payload: [
										{
											commandName: TaskCommandName.GetConfiguration,
											requestId,
											payload: {},
										},
									],
								},
							})
							break

						case TaskCommandName.StartNewTask:
							this.ipc?.send(clientId, {
								type: IpcMessageType.TaskEvent,
								origin: IpcOrigin.Server,
								data: {
									eventName: RooCodeEventName.CommandResponse,
									payload: [
										{
											commandName: TaskCommandName.StartNewTask,
											requestId,
											payload: "test-task-id",
										},
									],
								},
							})
							break
					}
				} else {
					originalOnMessage(data)
				}
			}

			// Add stop method for cleanup
			;(this.ipc as any).server = {
				stop: () => {
					if ((this.ipc as any)._isListening) {
						;(this.ipc as any)._isListening = false
						ipcLogger("[RPC Server] Stopping server...")
					}
				},
			}
		}
	}
}
