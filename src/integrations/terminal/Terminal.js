import * as vscode from "vscode"
import pWaitFor from "p-wait-for"
import { mergePromise, TerminalProcess } from "./TerminalProcess"
import { truncateOutput, applyRunLengthEncoding, processCarriageReturns, processBackspaces } from "../misc/extract-text"
// Import TerminalRegistry here to avoid circular dependencies
const { TerminalRegistry } = require("./TerminalRegistry")
export const TERMINAL_SHELL_INTEGRATION_TIMEOUT = 5000
export class Terminal {
	static shellIntegrationTimeout = TERMINAL_SHELL_INTEGRATION_TIMEOUT
	static commandDelay = 0
	static powershellCounter = false
	static terminalZshClearEolMark = true
	static terminalZshOhMy = false
	static terminalZshP10k = false
	static terminalZdotdir = false
	static compressProgressBar = true
	terminal
	busy
	id
	running
	streamClosed
	process
	taskId
	cmdCounter = 0
	completedProcesses = []
	initialCwd
	constructor(id, terminal, cwd) {
		this.id = id
		this.terminal = terminal
		this.busy = false
		this.running = false
		this.streamClosed = false
		// Initial working directory is used as a fallback when
		// shell integration is not yet initialized or unavailable:
		this.initialCwd = cwd
	}
	/**
	 * Gets the current working directory from shell integration or falls back to initial cwd
	 * @returns The current working directory
	 */
	getCurrentWorkingDirectory() {
		// Try to get the cwd from shell integration if available
		if (this.terminal.shellIntegration?.cwd) {
			return this.terminal.shellIntegration.cwd.fsPath
		} else {
			// Fall back to the initial cwd
			return this.initialCwd
		}
	}
	/**
	 * Checks if the stream is closed
	 */
	isStreamClosed() {
		return this.streamClosed
	}
	/**
	 * Sets the active stream for this terminal and notifies the process
	 * @param stream The stream to set, or undefined to clean up
	 * @throws Error if process is undefined when a stream is provided
	 */
	setActiveStream(stream) {
		if (stream) {
			// New stream is available
			if (!this.process) {
				this.running = false
				console.warn(
					`[Terminal ${this.id}] process is undefined, so cannot set terminal stream (probably user-initiated non-Roo command)`,
				)
				return
			}
			this.streamClosed = false
			this.process.emit("stream_available", stream)
		} else {
			// Stream is being closed
			this.streamClosed = true
		}
	}
	/**
	 * Handles shell execution completion for this terminal
	 * @param exitDetails The exit details of the shell execution
	 */
	shellExecutionComplete(exitDetails) {
		this.busy = false
		if (this.process) {
			// Add to the front of the queue (most recent first)
			if (this.process.hasUnretrievedOutput()) {
				this.completedProcesses.unshift(this.process)
			}
			this.process.emit("shell_execution_complete", exitDetails)
			this.process = undefined
		}
	}
	/**
	 * Gets the last executed command
	 * @returns The last command string or empty string if none
	 */
	getLastCommand() {
		// Return the command from the active process or the most recent process in the queue
		if (this.process) {
			return this.process.command || ""
		} else if (this.completedProcesses.length > 0) {
			return this.completedProcesses[0].command || ""
		}
		return ""
	}
	/**
	 * Cleans the process queue by removing processes that no longer have unretrieved output
	 * or don't belong to the current task
	 */
	cleanCompletedProcessQueue() {
		// Keep only processes with unretrieved output
		this.completedProcesses = this.completedProcesses.filter((process) => process.hasUnretrievedOutput())
	}
	/**
	 * Gets all processes with unretrieved output
	 * @returns Array of processes with unretrieved output
	 */
	getProcessesWithOutput() {
		// Clean the queue first to remove any processes without output
		this.cleanCompletedProcessQueue()
		return [...this.completedProcesses]
	}
	/**
	 * Gets all unretrieved output from both active and completed processes
	 * @returns Combined unretrieved output from all processes
	 */
	getUnretrievedOutput() {
		let output = ""
		// First check completed processes to maintain chronological order
		for (const process of this.completedProcesses) {
			const processOutput = process.getUnretrievedOutput()
			if (processOutput) {
				output += processOutput
			}
		}
		// Then check active process for most recent output
		const activeOutput = this.process?.getUnretrievedOutput()
		if (activeOutput) {
			output += activeOutput
		}
		this.cleanCompletedProcessQueue()
		return output
	}
	runCommand(command, callbacks) {
		// We set busy before the command is running because the terminal may be waiting
		// on terminal integration, and we must prevent another instance from selecting
		// the terminal for use during that time.
		this.busy = true
		// Create process immediately
		const process = new TerminalProcess(this)
		// Store the command on the process for reference
		process.command = command
		// Set process on terminal
		this.process = process
		// Set up event handlers from callbacks before starting process
		// This ensures that we don't miss any events because they are
		// configured before the process starts.
		if (callbacks) {
			if (callbacks.onLine) {
				process.on("line", (line) => callbacks.onLine(line, process))
			}
			if (callbacks.onCompleted) {
				process.once("completed", (output) => callbacks.onCompleted(output, process))
			}
			if (callbacks.onShellExecutionComplete) {
				process.once("shell_execution_complete", (details) =>
					callbacks.onShellExecutionComplete(details, process),
				)
			}
			if (callbacks.onNoShellIntegration) {
				process.once("no_shell_integration", (msg) => callbacks.onNoShellIntegration(msg, process))
			}
		}
		const promise = new Promise((resolve, reject) => {
			// Set up event handlers
			process.once("continue", () => resolve())
			process.once("error", (error) => {
				console.error(`[Terminal ${this.id}] error:`, error)
				reject(error)
			})
			// Wait for shell integration before executing the command
			pWaitFor(() => this.terminal.shellIntegration !== undefined, { timeout: Terminal.shellIntegrationTimeout })
				.then(() => {
					// Clean up temporary directory if shell integration is available, zsh did its job:
					TerminalRegistry.zshCleanupTmpDir(this.id)
					// Run the command in the terminal
					process.run(command)
				})
				.catch(() => {
					console.log(`[Terminal ${this.id}] Shell integration not available. Command execution aborted.`)
					// Clean up temporary directory if shell integration is not available
					TerminalRegistry.zshCleanupTmpDir(this.id)
					process.emit(
						"no_shell_integration",
						`Shell integration initialization sequence '\\x1b]633;A' was not received within ${Terminal.shellIntegrationTimeout / 1000}s. Shell integration has been disabled for this terminal instance. Increase the timeout in the settings if necessary.`,
					)
				})
		})
		return mergePromise(process, promise)
	}
	/**
	 * Gets the terminal contents based on the number of commands to include
	 * @param commands Number of previous commands to include (-1 for all)
	 * @returns The selected terminal contents
	 */
	static async getTerminalContents(commands = -1) {
		// Save current clipboard content
		const tempCopyBuffer = await vscode.env.clipboard.readText()
		try {
			// Select terminal content
			if (commands < 0) {
				await vscode.commands.executeCommand("workbench.action.terminal.selectAll")
			} else {
				for (let i = 0; i < commands; i++) {
					await vscode.commands.executeCommand("workbench.action.terminal.selectToPreviousCommand")
				}
			}
			// Copy selection and clear it
			await vscode.commands.executeCommand("workbench.action.terminal.copySelection")
			await vscode.commands.executeCommand("workbench.action.terminal.clearSelection")
			// Get copied content
			let terminalContents = (await vscode.env.clipboard.readText()).trim()
			// Restore original clipboard content
			await vscode.env.clipboard.writeText(tempCopyBuffer)
			if (tempCopyBuffer === terminalContents) {
				// No terminal content was copied
				return ""
			}
			// Process multi-line content
			const lines = terminalContents.split("\n")
			const lastLine = lines.pop()?.trim()
			if (lastLine) {
				let i = lines.length - 1
				while (i >= 0 && !lines[i].trim().startsWith(lastLine)) {
					i--
				}
				terminalContents = lines.slice(Math.max(i, 0)).join("\n")
			}
			return terminalContents
		} catch (error) {
			// Ensure clipboard is restored even if an error occurs
			await vscode.env.clipboard.writeText(tempCopyBuffer)
			throw error
		}
	}
	/**
	 * Compresses terminal output by applying run-length encoding and truncating to line limit
	 * @param input The terminal output to compress
	 * @returns The compressed terminal output
	 */
	static compressTerminalOutput(input, lineLimit) {
		// Apply carriage return processing if the feature is enabled
		let processedInput = input
		if (Terminal.compressProgressBar) {
			processedInput = processCarriageReturns(processedInput)
			processedInput = processBackspaces(processedInput)
		}
		return truncateOutput(applyRunLengthEncoding(processedInput), lineLimit)
	}
	/**
	 * Sets the command delay in milliseconds
	 * @param delayMs The delay in milliseconds
	 */
	static setCommandDelay(delayMs) {
		Terminal.commandDelay = delayMs
	}
	/**
	 * Gets the command delay in milliseconds
	 * @returns The command delay in milliseconds
	 */
	static getCommandDelay() {
		return Terminal.commandDelay
	}
	/**
	 * Sets whether to use the PowerShell counter workaround
	 * @param enabled Whether to enable the PowerShell counter workaround
	 */
	static setPowershellCounter(enabled) {
		Terminal.powershellCounter = enabled
	}
	/**
	 * Gets whether to use the PowerShell counter workaround
	 * @returns Whether the PowerShell counter workaround is enabled
	 */
	static getPowershellCounter() {
		return Terminal.powershellCounter
	}
	/**
	 * Sets whether to clear the ZSH EOL mark
	 * @param enabled Whether to clear the ZSH EOL mark
	 */
	static setTerminalZshClearEolMark(enabled) {
		Terminal.terminalZshClearEolMark = enabled
	}
	/**
	 * Gets whether to clear the ZSH EOL mark
	 * @returns Whether the ZSH EOL mark clearing is enabled
	 */
	static getTerminalZshClearEolMark() {
		return Terminal.terminalZshClearEolMark
	}
	/**
	 * Sets whether to enable Oh My Zsh shell integration
	 * @param enabled Whether to enable Oh My Zsh shell integration
	 */
	static setTerminalZshOhMy(enabled) {
		Terminal.terminalZshOhMy = enabled
	}
	/**
	 * Gets whether Oh My Zsh shell integration is enabled
	 * @returns Whether Oh My Zsh shell integration is enabled
	 */
	static getTerminalZshOhMy() {
		return Terminal.terminalZshOhMy
	}
	/**
	 * Sets whether to enable Powerlevel10k shell integration
	 * @param enabled Whether to enable Powerlevel10k shell integration
	 */
	static setTerminalZshP10k(enabled) {
		Terminal.terminalZshP10k = enabled
	}
	/**
	 * Gets whether Powerlevel10k shell integration is enabled
	 * @returns Whether Powerlevel10k shell integration is enabled
	 */
	static getTerminalZshP10k() {
		return Terminal.terminalZshP10k
	}
	/**
	 * Sets whether to enable ZDOTDIR handling for zsh
	 * @param enabled Whether to enable ZDOTDIR handling
	 */
	static setTerminalZdotdir(enabled) {
		Terminal.terminalZdotdir = enabled
	}
	/**
	 * Gets whether ZDOTDIR handling is enabled
	 * @returns Whether ZDOTDIR handling is enabled
	 */
	static getTerminalZdotdir() {
		return Terminal.terminalZdotdir
	}
	/**
	 * Sets whether to compress progress bar output by processing carriage returns
	 * @param enabled Whether to enable progress bar compression
	 */
	static setCompressProgressBar(enabled) {
		Terminal.compressProgressBar = enabled
	}
	/**
	 * Gets whether progress bar compression is enabled
	 * @returns Whether progress bar compression is enabled
	 */
	static getCompressProgressBar() {
		return Terminal.compressProgressBar
	}
	/**
	 * Sets the shell integration timeout in milliseconds
	 * @param timeoutMs The timeout in milliseconds (1000-60000)
	 */
	static setShellIntegrationTimeout(timeoutMs) {
		Terminal.shellIntegrationTimeout = timeoutMs
	}
	/**
	 * Gets the shell integration timeout in milliseconds
	 * @returns The timeout in milliseconds
	 */
	static getShellIntegrationTimeout() {
		return Terminal.shellIntegrationTimeout
	}
}
//# sourceMappingURL=Terminal.js.map
