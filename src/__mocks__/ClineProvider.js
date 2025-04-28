import { EventEmitter } from "events"
// Default mock values for configuration
const defaultMockValues = {
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
	soundEnabled: false,
	ttsEnabled: false,
	ttsSpeed: 1,
}
class ClineProvider extends EventEmitter {
	context
	outputChannel
	renderContext
	contextProxy
	viewLaunched = true
	messages = []
	providerSettingsManager = {
		saveConfig: jest.fn().mockResolvedValue(undefined),
		generateId: jest.fn().mockReturnValue("mock-id"),
	}
	values
	constructor(context, outputChannel, renderContext = "sidebar", contextProxy) {
		super()
		this.context = context
		this.outputChannel = outputChannel
		this.renderContext = renderContext
		this.contextProxy = contextProxy
		// Create a fresh copy of mockValues for this instance
		this.values = { ...defaultMockValues }
	}
	getValues() {
		return this.values
	}
	setValues(values) {
		this.values = {
			...this.values,
			...values,
		}
		return Promise.resolve()
	}
	postMessageToWebview() {
		return Promise.resolve()
	}
	removeClineFromStack() {
		return Promise.resolve()
	}
	postStateToWebview() {
		return Promise.resolve()
	}
	initClineWithTask(_text, _images) {
		const taskId = "mock-task-id"
		const cline = Object.assign(new EventEmitter(), {
			taskId,
			instanceId: "mock-instance",
			rootTask: undefined,
			parentTask: undefined,
			taskNumber: 1,
			isPaused: false,
			pausedModeSlug: "code",
		})
		// Register event listeners on the cline instance
		cline.on("taskStarted", () => {
			this.emit("taskStarted", taskId)
		})
		cline.on("message", (message) => {
			this.emit("message", { taskId, ...message })
		})
		cline.on("taskModeSwitched", (mode) => {
			this.emit("taskModeSwitched", taskId, mode)
		})
		cline.on("taskAskResponded", () => {
			this.emit("taskAskResponded", taskId)
		})
		cline.on("taskAborted", () => {
			this.emit("taskAborted", taskId)
		})
		cline.on("taskCompleted", (tokenUsage, toolUsage) => {
			this.emit("taskCompleted", taskId, tokenUsage, toolUsage)
		})
		cline.on("taskSpawned", (childTaskId) => {
			this.emit("taskSpawned", taskId, childTaskId)
		})
		cline.on("taskPaused", () => {
			this.emit("taskPaused", taskId)
		})
		cline.on("taskUnpaused", () => {
			this.emit("taskUnpaused", taskId)
		})
		cline.on("taskTokenUsageUpdated", (usage) => {
			this.emit("taskTokenUsageUpdated", taskId, usage)
		})
		cline.on("taskToolFailed", (tool, error) => {
			this.emit("taskToolFailed", taskId, tool, error)
		})
		// Emit the clineCreated event with the mock cline instance
		this.emit("clineCreated", cline)
		return Promise.resolve({ taskId })
	}
	initClineWithHistoryItem() {
		return Promise.resolve()
	}
	getTaskWithId() {
		return Promise.resolve({ historyItem: {} })
	}
	cancelTask() {
		return Promise.resolve()
	}
	getCurrentTaskStack() {
		return []
	}
	finishSubTask() {
		return Promise.resolve()
	}
}
module.exports = {
	ClineProvider,
}
//# sourceMappingURL=ClineProvider.js.map
