import { API } from "../api"
import { IpcServer } from "../ipc"
import { ClineProvider } from "../../core/webview/ClineProvider"
import { IpcMessageType, TaskCommandName, TaskCommand, IpcOrigin } from "evals/packages/types/src/ipc" // Removed TaskEvent import
import { RooCodeEventName, RooCodeEvents, ToolName } from "evals/packages/types/src/roo-code"
import * as vscode from "vscode"
import { EventEmitter } from "events"

// Mock dependencies
jest.mock("../ipc")
jest.mock("../../core/webview/ClineProvider")
jest.mock("vscode", () => ({
	...jest.requireActual("vscode"),
	commands: {
		executeCommand: jest.fn(),
	},
	workspace: {
		getConfiguration: jest.fn().mockReturnValue({
			update: jest.fn(),
		}),
	},
}))

// Update the mock class type to match the new constructor signature
interface IpcServerConstructor {
	new (
		options: { socketPath?: string; host?: string; port?: number | string },
		log?: (...args: unknown[]) => void,
	): IpcServer
}
const MockIpcServer = jest.mocked(IpcServer) as unknown as jest.MockedClass<IpcServerConstructor>
const MockClineProvider = ClineProvider as jest.MockedClass<typeof ClineProvider>
const mockExecuteCommand = vscode.commands.executeCommand as jest.Mock
const _mockGetConfiguration = vscode.workspace.getConfiguration as jest.Mock // Prefix with _

describe("API", () => {
	let mockOutputChannel: any
	let mockSidebarProvider: jest.Mocked<ClineProvider & EventEmitter<RooCodeEvents>>
	let api: API
	let mockIpcInstance: jest.Mocked<IpcServer>
	let mockExtensionContext: any
	let mockContextProxy: any

	beforeEach(() => {
		mockOutputChannel = { appendLine: jest.fn(), show: jest.fn() }
		mockExtensionContext = { extensionUri: "fake/uri" }
		mockContextProxy = { initialize: jest.fn(), extensionUri: "fake/uri" }

		mockSidebarProvider = new MockClineProvider(
			mockExtensionContext,
			mockOutputChannel,
			"sidebar",
			mockContextProxy,
		) as jest.Mocked<ClineProvider & EventEmitter<RooCodeEvents>>

		// Mock the IPC server instance created in the constructor
		mockIpcInstance = {
			listen: jest.fn(),
			on: jest.fn(),
			broadcast: jest.fn(),
			of: jest.fn().mockReturnThis(), // Chainable method
			emit: jest.fn(),
		} as any
		// Explicitly define the log parameter as optional with the correct type
		MockIpcServer.mockImplementation(
			(
				_options: { socketPath?: string; host?: string; port?: number | string },
				_log?: (...args: unknown[]) => void,
			) => {
				// Simulate the instance created in the constructor
				return mockIpcInstance
			},
		)

		api = new API(mockOutputChannel, mockSidebarProvider, { socketPath: "/fake/socket/path" }, false)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	// Test TaskCommand handling
	describe("TaskCommand handling", () => {
		it("should handle StartNewTask command and call startNewTask", async () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.StartNewTask,
				data: {
					configuration: { allowedCommands: ["test"] } as any,
					text: "start task",
					images: ["img1"],
					newTab: true,
				},
			}
			const clientId = "client1"

			// Spy on the actual startNewTask method of the API instance
			const startNewTaskSpy = jest.spyOn(api, "startNewTask")

			// Simulate receiving the IPC message
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined

			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(startNewTaskSpy).toHaveBeenCalledWith(commandData.data)
		})

		it("should handle CancelTask command and call cancelTask", async () => {
			const taskId = "task123"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.CancelTask,
				data: taskId,
			}
			const clientId = "client1"

			const cancelTaskSpy = jest.spyOn(api, "cancelTask")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(cancelTaskSpy).toHaveBeenCalledWith(taskId)
		})

		it("should handle CloseTask command and execute vscode commands", async () => {
			const taskId = "task123"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.CloseTask,
				data: taskId,
			}
			const clientId = "client1"

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(mockExecuteCommand).toHaveBeenCalledWith("workbench.action.files.saveFiles")
			expect(mockExecuteCommand).toHaveBeenCalledWith("workbench.action.closeWindow")
		})

		it("should handle GetCurrentTaskStack command and call getCurrentTaskStack", () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.GetCurrentTaskStack,
				data: undefined,
			}
			const clientId = "client1"

			const getCurrentTaskStackSpy = jest.spyOn(api, "getCurrentTaskStack")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(getCurrentTaskStackSpy).toHaveBeenCalled()
		})

		it("should handle ClearCurrentTask command and call clearCurrentTask", async () => {
			const lastMessage = "task cleared"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.ClearCurrentTask,
				data: lastMessage,
			}
			const clientId = "client1"

			const clearCurrentTaskSpy = jest.spyOn(api, "clearCurrentTask")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(clearCurrentTaskSpy).toHaveBeenCalledWith(lastMessage)
		})

		it("should handle CancelCurrentTask command and call cancelCurrentTask", async () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.CancelCurrentTask,
				data: undefined,
			}
			const clientId = "client1"

			const cancelCurrentTaskSpy = jest.spyOn(api, "cancelCurrentTask")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(cancelCurrentTaskSpy).toHaveBeenCalled()
		})

		it("should handle SendMessage command and call sendMessage", async () => {
			const messageData = { message: "hello", images: ["img2"] }
			const commandData: TaskCommand = {
				commandName: TaskCommandName.SendMessage,
				data: messageData,
			}
			const clientId = "client1"

			const sendMessageSpy = jest.spyOn(api, "sendMessage")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(sendMessageSpy).toHaveBeenCalledWith(messageData.message, messageData.images)
		})

		it("should handle PressPrimaryButton command and call pressPrimaryButton", async () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.PressPrimaryButton,
				data: undefined,
			}
			const clientId = "client1"

			const pressPrimaryButtonSpy = jest.spyOn(api, "pressPrimaryButton")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(pressPrimaryButtonSpy).toHaveBeenCalled()
		})

		it("should handle PressSecondaryButton command and call pressSecondaryButton", async () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.PressSecondaryButton,
				data: undefined,
			}
			const clientId = "client1"

			const pressSecondaryButtonSpy = jest.spyOn(api, "pressSecondaryButton")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(pressSecondaryButtonSpy).toHaveBeenCalled()
		})

		it("should handle SetConfiguration command and call setConfiguration", async () => {
			const configValues = { allowedCommands: ["test2"] } as any
			const commandData: TaskCommand = {
				commandName: TaskCommandName.SetConfiguration,
				data: configValues,
			}
			const clientId = "client1"

			const setConfigurationSpy = jest.spyOn(api, "setConfiguration")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(setConfigurationSpy).toHaveBeenCalledWith(configValues)
		})

		it("should handle IsReady command and call isReady", () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.IsReady,
				data: undefined,
			}
			const clientId = "client1"

			const isReadySpy = jest.spyOn(api, "isReady")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(isReadySpy).toHaveBeenCalled()
		})

		it("should handle GetMessages command and call getMessages", () => {
			const taskId = "task456"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.GetMessages,
				data: taskId,
			}
			const clientId = "client1"

			const getMessagesSpy = jest.spyOn(api, "getMessages")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(getMessagesSpy).toHaveBeenCalledWith(taskId)
		})

		it("should handle GetTokenUsage command and call getTokenUsage", () => {
			const taskId = "task789"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.GetTokenUsage,
				data: taskId,
			}
			const clientId = "client1"

			const getTokenUsageSpy = jest.spyOn(api, "getTokenUsage")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(getTokenUsageSpy).toHaveBeenCalledWith(taskId)
		})

		it("should handle Log command and call log", () => {
			const message = "log message"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.Log,
				data: message,
			}
			const clientId = "client1"

			const logSpy = jest.spyOn(api as any, "log") // log is private, need to access as any

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(logSpy).toHaveBeenCalledWith(`[API] ${TaskCommandName.Log} -> ${message}`)
			expect(logSpy).toHaveBeenCalledWith(message)
		})

		it("should handle ResumeTask command and call resumeTask", async () => {
			const taskId = "task101"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.ResumeTask,
				data: taskId,
			}
			const clientId = "client1"

			const resumeTaskSpy = jest.spyOn(api, "resumeTask")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(resumeTaskSpy).toHaveBeenCalledWith(taskId)
		})

		it("should handle IsTaskInHistory command and call isTaskInHistory", () => {
			const taskId = "task112"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.IsTaskInHistory,
				data: taskId,
			}
			const clientId = "client1"

			const isTaskInHistorySpy = jest.spyOn(api, "isTaskInHistory")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(isTaskInHistorySpy).toHaveBeenCalledWith(taskId)
		})

		it("should handle CreateProfile command and call createProfile", async () => {
			const profileName = "new-profile"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.CreateProfile,
				data: profileName,
			}
			const clientId = "client1"

			const createProfileSpy = jest.spyOn(api, "createProfile")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(createProfileSpy).toHaveBeenCalledWith(profileName)
		})

		it("should handle GetProfiles command and call getProfiles", () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.GetProfiles,
				data: undefined,
			}
			const clientId = "client1"

			const getProfilesSpy = jest.spyOn(api, "getProfiles")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(getProfilesSpy).toHaveBeenCalled()
		})

		it("should handle SetActiveProfile command and call setActiveProfile", async () => {
			const profileName = "active-profile"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.SetActiveProfile,
				data: profileName,
			}
			const clientId = "client1"

			const setActiveProfileSpy = jest.spyOn(api, "setActiveProfile")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(setActiveProfileSpy).toHaveBeenCalledWith(profileName)
		})

		it("should handle getActiveProfile command and call getActiveProfile", () => {
			const commandData: TaskCommand = {
				commandName: TaskCommandName.getActiveProfile,
				data: undefined,
			}
			const clientId = "client1"

			const getActiveProfileSpy = jest.spyOn(api, "getActiveProfile")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}

			expect(getActiveProfileSpy).toHaveBeenCalled()
		})

		it("should handle DeleteProfile command and call deleteProfile", async () => {
			const profileName = "delete-profile"
			const commandData: TaskCommand = {
				commandName: TaskCommandName.DeleteProfile,
				data: profileName,
			}
			const clientId = "client1"

			const deleteProfileSpy = jest.spyOn(api, "deleteProfile")

			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call: any) => call[0] === IpcMessageType.TaskCommand,
			)?.[1] as ((clientId: string, data: TaskCommand) => Promise<void> | void) | undefined
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}

			expect(deleteProfileSpy).toHaveBeenCalledWith(profileName)
		})
	})

	// Test TaskEvent broadcasting
	describe("TaskEvent broadcasting", () => {
		it("should broadcast TaskStarted event", () => {
			const taskId = "task123"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskStarted, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskStarted,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast Message event", () => {
			const taskId = "task456"
			const message = {
				message: { type: "say" as const, ts: Date.now(), text: "hello", partial: false },
				taskId,
				action: "created" as const,
			}
			const expectedPayload = [message]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.Message, message)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.Message,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskModeSwitched event", () => {
			const taskId = "task789"
			const mode = "code"
			const expectedPayload = [taskId, mode]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskModeSwitched, taskId, mode)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskModeSwitched,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskAskResponded event", () => {
			const taskId = "task101"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskAskResponded, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskAskResponded,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskAborted event", () => {
			const taskId = "task112"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskAborted, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskAborted,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskCompleted event", () => {
			const taskId = "task131"
			const tokenUsage = {
				totalCost: 1,
				totalTokensIn: 100,
				totalTokensOut: 50,
				contextTokens: 20,
				totalCacheWrites: 0,
				totalCacheReads: 0,
			}
			const toolUsage = { read_file: { attempts: 1, failures: 0 }, write_to_file: { attempts: 1, failures: 0 } }
			const expectedPayload = [taskId, tokenUsage, toolUsage]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskCompleted, taskId, tokenUsage, toolUsage)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskCompleted,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskSpawned event", () => {
			const parentTaskId = "task141"
			const childTaskId = "task142"
			const expectedPayload = [parentTaskId, childTaskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskSpawned, parentTaskId, childTaskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskSpawned,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskPaused event", () => {
			const taskId = "task151"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskPaused, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskPaused,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskUnpaused event", () => {
			const taskId = "task161"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskUnpaused, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskUnpaused,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskTokenUsageUpdated event", () => {
			const taskId = "task171"
			const usage = {
				totalCost: 0.5,
				totalTokensIn: 50,
				totalTokensOut: 25,
				contextTokens: 10,
				totalCacheWrites: 0,
				totalCacheReads: 0,
			}
			const expectedPayload = [taskId, usage]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskTokenUsageUpdated, taskId, usage)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskTokenUsageUpdated,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskToolFailed event", () => {
			const taskId = "task181"
			const tool: ToolName = "read_file"
			const error = "Tool failed message"
			const expectedPayload = [taskId, tool, error]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskToolFailed, taskId, tool, error)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskToolFailed,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})

		it("should broadcast TaskCreated event", () => {
			const taskId = "task191"
			const expectedPayload = [taskId]

			// Simulate the ClineProvider emitting the event
			mockSidebarProvider.emit(RooCodeEventName.TaskCreated, taskId)

			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskCreated,
					payload: expectedPayload,
				},
				origin: IpcOrigin.Server,
			})
		})
	})
})
