import type { RooCodeSettings } from "../schemas"
import { EventEmitter } from "events"

// Default mock values for configuration
const defaultMockValues: RooCodeSettings = {
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
	public viewLaunched = true
	public messages = []
	public readonly providerSettingsManager = {
		saveConfig: jest.fn().mockResolvedValue(undefined),
		generateId: jest.fn().mockReturnValue("mock-id"),
	}
	private values: RooCodeSettings

	constructor(
		readonly context: any,
		private readonly outputChannel: any,
		private readonly renderContext: string = "sidebar",
		public readonly contextProxy: any,
	) {
		super()
		// Create a fresh copy of mockValues for this instance
		this.values = { ...defaultMockValues }
	}

	getValues(): RooCodeSettings {
		return this.values
	}

	setValues(values: Partial<RooCodeSettings>): Promise<void> {
		this.values = {
			...this.values,
			...values,
		}
		return Promise.resolve()
	}

	postMessageToWebview(): Promise<void> {
		return Promise.resolve()
	}

	removeClineFromStack(): Promise<void> {
		return Promise.resolve()
	}

	postStateToWebview(): Promise<void> {
		return Promise.resolve()
	}

	initClineWithTask(_text?: string, _images?: string[]): Promise<{ taskId: string }> {
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

		cline.on("message", (message: any) => {
			this.emit("message", { taskId, ...message })
		})

		cline.on("taskModeSwitched", (mode: string) => {
			this.emit("taskModeSwitched", taskId, mode)
		})

		cline.on("taskAskResponded", () => {
			this.emit("taskAskResponded", taskId)
		})

		cline.on("taskAborted", () => {
			this.emit("taskAborted", taskId)
		})

		cline.on("taskCompleted", (tokenUsage: any, toolUsage: any) => {
			this.emit("taskCompleted", taskId, tokenUsage, toolUsage)
		})

		cline.on("taskSpawned", (childTaskId: string) => {
			this.emit("taskSpawned", taskId, childTaskId)
		})

		cline.on("taskPaused", () => {
			this.emit("taskPaused", taskId)
		})

		cline.on("taskUnpaused", () => {
			this.emit("taskUnpaused", taskId)
		})

		cline.on("taskTokenUsageUpdated", (usage: any) => {
			this.emit("taskTokenUsageUpdated", taskId, usage)
		})

		cline.on("taskToolFailed", (tool: any, error: any) => {
			this.emit("taskToolFailed", taskId, tool, error)
		})

		// Emit the clineCreated event with the mock cline instance
		this.emit("clineCreated", cline)

		return Promise.resolve({ taskId })
	}

	initClineWithHistoryItem(): Promise<void> {
		return Promise.resolve()
	}

	getTaskWithId(): Promise<{ historyItem: Record<string, unknown> }> {
		return Promise.resolve({ historyItem: {} })
	}

	cancelTask(): Promise<void> {
		return Promise.resolve()
	}

	getCurrentTaskStack(): string[] {
		return []
	}

	finishSubTask(): Promise<void> {
		return Promise.resolve()
	}
}

module.exports = {
	ClineProvider,
}
