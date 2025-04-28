import { API } from "../api"
import { IpcServer } from "../ipc"
import { ClineProvider } from "../../core/webview/ClineProvider"
import { IpcMessageType, TaskCommandName, IpcOrigin } from "evals/packages/types/src/ipc"
import { RooCodeEventName } from "evals/packages/types/src/roo-code"
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
const MockIpcServer = jest.mocked(IpcServer)
const MockClineProvider = ClineProvider
const mockExecuteCommand = vscode.commands.executeCommand
const _mockGetConfiguration = vscode.workspace.getConfiguration // Prefix with _
describe("API", () => {
	let mockOutputChannel
	let mockSidebarProvider
	let api
	let mockIpcInstance
	let mockExtensionContext
	let mockContextProxy
	let mockCline
	const wait = () => Promise.resolve()
	beforeEach(async () => {
		// Set up basic mocks
		mockOutputChannel = { appendLine: jest.fn(), show: jest.fn() }
		mockExtensionContext = {
			extensionUri: "fake/uri",
			globalStorageUri: { fsPath: "/mock/storage" },
		}
		mockContextProxy = { initialize: jest.fn(), extensionUri: "fake/uri" }
		// Create mock sidebar provider
		const provider = new MockClineProvider(mockExtensionContext, mockOutputChannel, "sidebar", mockContextProxy)
		mockSidebarProvider = Object.assign(provider, new EventEmitter())
		// Mock getValues
		jest.spyOn(mockSidebarProvider, "getValues").mockReturnValue({
			listApiConfigMeta: [
				{
					id: "mock-id",
					name: "default",
					apiProvider: "openai",
				},
			],
			currentApiConfigName: "default",
			allowedCommands: [],
			apiProvider: "openai",
			customInstructions: "",
			diffEnabled: false,
			enableCheckpoints: false,
			experiments: {
				powerSteering: false,
			},
			fuzzyMatchThreshold: 0.8,
			mode: "code",
		})
		// Mock IPC server
		mockIpcInstance = {
			listen: jest.fn(),
			on: jest.fn(),
			broadcast: jest.fn(),
			of: jest.fn().mockReturnThis(),
			emit: jest.fn(),
		}
		// Mock IPC server constructor
		MockIpcServer.mockImplementation(() => mockIpcInstance)
		// Create mock Cline instance
		const emitter = new EventEmitter()
		const baseCline = {
			cwd: "/mock/cwd",
			getSavedApiConversationHistory: jest.fn(),
			addToApiConversationHistory: jest.fn(),
			overwriteApiConversationHistory: jest.fn(),
			fileLog: jest.fn().mockImplementation((...args) => {
				console.log("[Mock FileLog]", ...args)
				return Promise.resolve()
			}),
		}
		mockCline = Object.assign(emitter, baseCline, {
			taskId: "mock-task-id",
			instanceId: "mock-instance",
			rootTask: undefined,
			parentTask: undefined,
			taskNumber: 1,
			isPaused: false,
			pausedModeSlug: "code",
			pauseInterval: undefined,
			apiConfiguration: {
				apiProvider: "openai",
				apiKey: "mock-key",
			},
			api: {
				send: jest.fn(),
			},
			promptCacheKey: "mock-cache-key",
			rooIgnoreController: undefined,
			fileContextTracker: {
				addFile: jest.fn(),
				removeFile: jest.fn(),
			},
			urlContentFetcher: {
				fetch: jest.fn(),
			},
			browserSession: {
				launch: jest.fn(),
				close: jest.fn(),
			},
			didEditFile: false,
			customInstructions: undefined,
			diffStrategy: undefined,
			diffEnabled: false,
			fuzzyMatchThreshold: 1.0,
			apiConversationHistory: [],
			clineMessages: [],
			consecutiveMistakeCount: 0,
			consecutiveMistakeLimit: 3,
			consecutiveMistakeCountForApplyDiff: new Map(),
			providerRef: new WeakRef(mockSidebarProvider),
			globalStoragePath: "/mock/storage",
			abort: false,
			didFinishAbortingStream: false,
			abandoned: false,
			diffViewProvider: {
				show: jest.fn(),
			},
			lastApiRequestTime: undefined,
			isInitialized: true,
			enableCheckpoints: false,
			checkpointService: undefined,
			checkpointServiceInitializing: false,
			isWaitingForFirstChunk: false,
			isStreaming: false,
			currentStreamingContentIndex: 0,
			assistantMessageContent: [],
			presentAssistantMessageLocked: false,
			presentAssistantMessageHasPendingUpdates: false,
			userMessageContent: [],
			userMessageContentReady: false,
			didRejectTool: false,
			didAlreadyUseTool: false,
			didCompleteReadingStream: false,
			toolUsage: {},
			fileLog: jest.fn().mockImplementation((...args) => {
				console.log("[Mock FileLog]", ...args)
				return Promise.resolve()
			}),
		})
		// Create API instance
		api = new API(mockOutputChannel, mockSidebarProvider, { socketPath: "/fake/socket/path" }, false)
		// Wait for API to initialize
		await new Promise((resolve) => setTimeout(resolve, 0))
		// Register event listeners
		mockSidebarProvider.emit("clineCreated", mockCline)
		// Wait for event listeners to register
		await new Promise((resolve) => setTimeout(resolve, 0))
		// Add Cline to API's taskMap
		api["taskMap"].set("mock-task-id", mockSidebarProvider)
		// Clear any previous calls to broadcast
		mockIpcInstance.broadcast.mockClear()
	})
	afterEach(() => {
		jest.clearAllMocks()
	})
	// Test TaskCommand handling
	describe("TaskCommand handling", () => {
		it("should handle StartNewTask command and call startNewTask", async () => {
			const commandData = {
				commandName: TaskCommandName.StartNewTask,
				data: {
					configuration: { allowedCommands: ["test"] },
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
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(startNewTaskSpy).toHaveBeenCalledWith(commandData.data)
		})
		it("should handle CancelTask command and call cancelTask", async () => {
			const taskId = "task123"
			const commandData = {
				commandName: TaskCommandName.CancelTask,
				data: taskId,
			}
			const clientId = "client1"
			const cancelTaskSpy = jest.spyOn(api, "cancelTask")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(cancelTaskSpy).toHaveBeenCalledWith(taskId)
		})
		it("should handle CloseTask command and execute vscode commands", async () => {
			const taskId = "task123"
			const commandData = {
				commandName: TaskCommandName.CloseTask,
				data: taskId,
			}
			const clientId = "client1"
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(mockExecuteCommand).toHaveBeenCalledWith("workbench.action.files.saveFiles")
			expect(mockExecuteCommand).toHaveBeenCalledWith("workbench.action.closeWindow")
		})
		it("should handle GetCurrentTaskStack command and call getCurrentTaskStack", () => {
			const commandData = {
				commandName: TaskCommandName.GetCurrentTaskStack,
				data: undefined,
			}
			const clientId = "client1"
			const getCurrentTaskStackSpy = jest.spyOn(api, "getCurrentTaskStack")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(getCurrentTaskStackSpy).toHaveBeenCalled()
		})
		it("should handle ClearCurrentTask command and call clearCurrentTask", async () => {
			const lastMessage = "task cleared"
			const commandData = {
				commandName: TaskCommandName.ClearCurrentTask,
				data: lastMessage,
			}
			const clientId = "client1"
			const clearCurrentTaskSpy = jest.spyOn(api, "clearCurrentTask")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(clearCurrentTaskSpy).toHaveBeenCalledWith(lastMessage)
		})
		it("should handle CancelCurrentTask command and call cancelCurrentTask", async () => {
			const commandData = {
				commandName: TaskCommandName.CancelCurrentTask,
				data: undefined,
			}
			const clientId = "client1"
			const cancelCurrentTaskSpy = jest.spyOn(api, "cancelCurrentTask")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(cancelCurrentTaskSpy).toHaveBeenCalled()
		})
		it("should handle SendMessage command and call sendMessage", async () => {
			const messageData = { message: "hello", images: ["img2"] }
			const commandData = {
				commandName: TaskCommandName.SendMessage,
				data: messageData,
			}
			const clientId = "client1"
			const sendMessageSpy = jest.spyOn(api, "sendMessage")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(sendMessageSpy).toHaveBeenCalledWith(messageData.message, messageData.images)
		})
		it("should handle PressPrimaryButton command and call pressPrimaryButton", async () => {
			const commandData = {
				commandName: TaskCommandName.PressPrimaryButton,
				data: undefined,
			}
			const clientId = "client1"
			const pressPrimaryButtonSpy = jest.spyOn(api, "pressPrimaryButton")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(pressPrimaryButtonSpy).toHaveBeenCalled()
		})
		it("should handle PressSecondaryButton command and call pressSecondaryButton", async () => {
			const commandData = {
				commandName: TaskCommandName.PressSecondaryButton,
				data: undefined,
			}
			const clientId = "client1"
			const pressSecondaryButtonSpy = jest.spyOn(api, "pressSecondaryButton")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(pressSecondaryButtonSpy).toHaveBeenCalled()
		})
		it("should handle SetConfiguration command and call setConfiguration", async () => {
			const configValues = { allowedCommands: ["test2"] }
			const commandData = {
				commandName: TaskCommandName.SetConfiguration,
				data: configValues,
			}
			const clientId = "client1"
			const setConfigurationSpy = jest.spyOn(api, "setConfiguration")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(setConfigurationSpy).toHaveBeenCalledWith(configValues)
		})
		it("should handle IsReady command and call isReady", () => {
			const commandData = {
				commandName: TaskCommandName.IsReady,
				data: undefined,
			}
			const clientId = "client1"
			const isReadySpy = jest.spyOn(api, "isReady")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(isReadySpy).toHaveBeenCalled()
		})
		it("should handle GetMessages command and call getMessages", () => {
			const taskId = "task456"
			const commandData = {
				commandName: TaskCommandName.GetMessages,
				data: taskId,
			}
			const clientId = "client1"
			const getMessagesSpy = jest.spyOn(api, "getMessages")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(getMessagesSpy).toHaveBeenCalledWith(taskId)
		})
		it("should handle GetTokenUsage command and call getTokenUsage", () => {
			const taskId = "task789"
			const commandData = {
				commandName: TaskCommandName.GetTokenUsage,
				data: taskId,
			}
			const clientId = "client1"
			const getTokenUsageSpy = jest.spyOn(api, "getTokenUsage")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(getTokenUsageSpy).toHaveBeenCalledWith(taskId)
		})
		it("should handle Log command and call log", () => {
			const message = "log message"
			const commandData = {
				commandName: TaskCommandName.Log,
				data: message,
			}
			const clientId = "client1"
			const logSpy = jest.spyOn(api, "log") // log is private, need to access as any
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(logSpy).toHaveBeenCalledWith(`[API] ${TaskCommandName.Log} -> ${message}`)
			expect(logSpy).toHaveBeenCalledWith(message)
		})
		it("should handle ResumeTask command and call resumeTask", async () => {
			const taskId = "task101"
			const commandData = {
				commandName: TaskCommandName.ResumeTask,
				data: taskId,
			}
			const clientId = "client1"
			const resumeTaskSpy = jest.spyOn(api, "resumeTask")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(resumeTaskSpy).toHaveBeenCalledWith(taskId)
		})
		it("should handle IsTaskInHistory command and call isTaskInHistory", () => {
			const taskId = "task112"
			const commandData = {
				commandName: TaskCommandName.IsTaskInHistory,
				data: taskId,
			}
			const clientId = "client1"
			const isTaskInHistorySpy = jest.spyOn(api, "isTaskInHistory")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(isTaskInHistorySpy).toHaveBeenCalledWith(taskId)
		})
		it("should handle CreateProfile command and call createProfile", async () => {
			const profileName = "new-profile"
			const commandData = {
				commandName: TaskCommandName.CreateProfile,
				data: profileName,
			}
			const clientId = "client1"
			const createProfileSpy = jest.spyOn(api, "createProfile")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(createProfileSpy).toHaveBeenCalledWith(profileName)
		})
		it("should handle GetProfiles command and call getProfiles", () => {
			const commandData = {
				commandName: TaskCommandName.GetProfiles,
				data: undefined,
			}
			const clientId = "client1"
			const getProfilesSpy = jest.spyOn(api, "getProfiles")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(getProfilesSpy).toHaveBeenCalled()
		})
		it("should handle SetActiveProfile command and call setActiveProfile", async () => {
			const profileName = "active-profile"
			const commandData = {
				commandName: TaskCommandName.SetActiveProfile,
				data: profileName,
			}
			const clientId = "client1"
			const setActiveProfileSpy = jest.spyOn(api, "setActiveProfile")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(setActiveProfileSpy).toHaveBeenCalledWith(profileName)
		})
		it("should handle getActiveProfile command and call getActiveProfile", () => {
			const commandData = {
				commandName: TaskCommandName.getActiveProfile,
				data: undefined,
			}
			const clientId = "client1"
			const getActiveProfileSpy = jest.spyOn(api, "getActiveProfile")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				taskCommandHandler(clientId, commandData)
			}
			expect(getActiveProfileSpy).toHaveBeenCalled()
		})
		it("should handle DeleteProfile command and call deleteProfile", async () => {
			const profileName = "delete-profile"
			const commandData = {
				commandName: TaskCommandName.DeleteProfile,
				data: profileName,
			}
			const clientId = "client1"
			const deleteProfileSpy = jest.spyOn(api, "deleteProfile")
			const taskCommandHandler = mockIpcInstance.on.mock.calls.find(
				(call) => call[0] === IpcMessageType.TaskCommand,
			)?.[1]
			if (taskCommandHandler) {
				await taskCommandHandler(clientId, commandData)
			}
			expect(deleteProfileSpy).toHaveBeenCalledWith(profileName)
		})
	})
	// Test TaskEvent broadcasting
	describe("TaskEvent broadcasting", () => {
		it("should broadcast TaskStarted event", async () => {
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskStarted", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskStarted,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast Message event", async () => {
			const message = {
				type: "say",
				text: "hello",
				partial: false,
				ts: Date.now(),
			}
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("message", { taskId: mockCline.taskId, action: "created", message })
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.Message,
					payload: [{ taskId: "mock-task-id", action: "created", message }],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskModeSwitched event", async () => {
			const mode = "code"
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskModeSwitched", mockCline.taskId, mode)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskModeSwitched,
					payload: ["mock-task-id", mode],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskAskResponded event", async () => {
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskAskResponded", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskAskResponded,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskAborted event", async () => {
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskAborted", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskAborted,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskCompleted event", async () => {
			const tokenUsage = {
				totalTokensIn: 100,
				totalTokensOut: 50,
				contextTokens: 20,
				totalCacheReads: 0,
				totalCacheWrites: 0,
				totalCost: 1.0,
			}
			const toolUsage = {
				read_file: { attempts: 1, failures: 0 },
				write_to_file: { attempts: 1, failures: 0 },
				execute_command: { attempts: 0, failures: 0 },
				apply_diff: { attempts: 0, failures: 0 },
				insert_content: { attempts: 0, failures: 0 },
				search_and_replace: { attempts: 0, failures: 0 },
				search_files: { attempts: 0, failures: 0 },
				list_files: { attempts: 0, failures: 0 },
				list_code_definition_names: { attempts: 0, failures: 0 },
				browser_action: { attempts: 0, failures: 0 },
				use_mcp_tool: { attempts: 0, failures: 0 },
				access_mcp_resource: { attempts: 0, failures: 0 },
				ask_followup_question: { attempts: 0, failures: 0 },
				attempt_completion: { attempts: 0, failures: 0 },
				switch_mode: { attempts: 0, failures: 0 },
				new_task: { attempts: 0, failures: 0 },
				fetch_instructions: { attempts: 0, failures: 0 },
				append_to_file: { attempts: 0, failures: 0 },
			}
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskCompleted", mockCline.taskId, tokenUsage, toolUsage)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskCompleted,
					payload: ["mock-task-id", tokenUsage, toolUsage],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskSpawned event", async () => {
			const childTaskId = "task142"
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskSpawned", mockCline.taskId, childTaskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskSpawned,
					payload: ["mock-task-id", childTaskId],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskPaused event", async () => {
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskPaused", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskPaused,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskUnpaused event", async () => {
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskUnpaused", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskUnpaused,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskTokenUsageUpdated event", async () => {
			const usage = {
				totalTokensIn: 50,
				totalTokensOut: 25,
				contextTokens: 10,
				totalCacheReads: 0,
				totalCacheWrites: 0,
				totalCost: 0.5,
			}
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskTokenUsageUpdated", mockCline.taskId, usage)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskTokenUsageUpdated,
					payload: ["mock-task-id", usage],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskToolFailed event", async () => {
			const tool = "read_file"
			const error = "Tool failed message"
			// Wait for event listeners to be registered
			await wait()
			await wait()
			api.emit("taskToolFailed", mockCline.taskId, tool, error)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskToolFailed,
					payload: ["mock-task-id", tool, error],
				},
				origin: IpcOrigin.Server,
			})
		})
		it("should broadcast TaskCreated event", async () => {
			await wait()
			api.emit("taskCreated", mockCline.taskId)
			expect(mockIpcInstance.broadcast).toHaveBeenCalledWith({
				type: IpcMessageType.TaskEvent,
				data: {
					eventName: RooCodeEventName.TaskCreated,
					payload: ["mock-task-id"],
				},
				origin: IpcOrigin.Server,
			})
		})
	})
})
//# sourceMappingURL=api.test.js.map
