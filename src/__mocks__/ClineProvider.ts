import { EventEmitter } from "events"
import type { ExtensionContext, OutputChannel } from "vscode"
import type { ContextProxy } from "../core/config/ContextProxy"

export class ClineProvider extends EventEmitter {
	public isViewLaunched = true
	public messages: any[] = []

	constructor(
		readonly context: ExtensionContext,
		private readonly outputChannel: OutputChannel,
		private readonly renderContext: "sidebar" | "editor" = "sidebar",
		public readonly contextProxy: ContextProxy,
	) {
		super()
	}

	getCurrentCline() {
		return undefined
	}

	getCurrentTaskStack() {
		return []
	}

	async removeClineFromStack() {}

	async updateApiConfiguration() {}

	async initClineWithTask() {
		return { taskId: "test-task-id" }
	}
}
