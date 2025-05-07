import { EventEmitter } from "events"

import type { ProviderSettings, GlobalSettings, ClineMessage, TokenUsage, RooCodeEvents } from "./types"
export type { RooCodeSettings, ProviderSettings, GlobalSettings, ClineMessage, TokenUsage, RooCodeEvents }

import { RooCodeEventName } from "../schemas"
export type { RooCodeEventName }

type RooCodeSettings = GlobalSettings & ProviderSettings

import { TaskCommandName } from "../schemas/ipc" // Import TaskCommandName

export interface RooCodeAPI
	extends EventEmitter<
		RooCodeEvents & {
			commandResponse: [{ commandName: TaskCommandName; requestId: string; payload: any }]
		}
	> {
	/**
	 * Starts a new task with an optional initial message and images.
	 * @param task Optional initial task message.
	 * @param images Optional array of image data URIs (e.g., "data:image/webp;base64,...").
	 * @returns The ID of the new task.
	 */
	startNewTask({
		configuration,
		text,
		images,
		newTab,
		clientId,
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
		clientId: string
	}): Promise<string>

	/**
	 * Resumes a task with the given ID.
	 * @param taskId The ID of the task to resume.
	 * @throws Error if the task is not found in the task history.
	 */
	resumeTask(taskId: string, clientId: string): Promise<void>

	/**
	 * Checks if a task with the given ID is in the task history.
	 * @param taskId The ID of the task to check.
	 * @returns True if the task is in the task history, false otherwise.
	 */
	isTaskInHistory(taskId: string, clientId: string): Promise<boolean>

	/**
	 * Returns the current task stack.
	 * @param clientId The ID of the requesting client.
	 * @returns An array of task IDs.
	 */
	getCurrentTaskStack(clientId: string): string[]

	/**
	 * Clears the current task.
	 * @param lastMessage Optional last message to display.
	 * @param clientId The ID of the requesting client.
	 */
	clearCurrentTask(lastMessage: string | undefined, clientId: string): Promise<void>

	/**
	 * Cancels the current task.
	 * @param clientId The ID of the requesting client.
	 */
	cancelCurrentTask(clientId: string): Promise<void>

	/**
	 * Sends a message to the current task.
	 * @param message Optional message to send.
	 * @param images Optional array of image data URIs.
	 * @param clientId The ID of the requesting client.
	 */
	sendMessage(message: string | undefined, images: string[] | undefined, clientId: string): Promise<void>

	/**
	 * Simulates pressing the primary button in the chat interface.
	 * @param clientId The ID of the requesting client.
	 */
	pressPrimaryButton(clientId: string): Promise<void>

	/**
	 * Simulates pressing the secondary button in the chat interface.
	 * @param clientId The ID of the requesting client.
	 */
	pressSecondaryButton(clientId: string): Promise<void>

	/**
	 * Returns the current configuration.
	 * @param clientId The ID of the requesting client.
	 * @returns The current configuration.
	 */
	getConfiguration(clientId: string): RooCodeSettings

	/**
	 * Sets the configuration for the current task.
	 * @param values An object containing key-value pairs to set.
	 * @param clientId The ID of the requesting client.
	 */
	setConfiguration(values: RooCodeSettings, clientId: string): Promise<void>

	/**
	 * Creates a new API configuration profile.
	 * @param name The name of the profile.
	 * @param clientId The ID of the requesting client.
	 * @returns The ID of the created profile.
	 */
	createProfile(name: string, clientId: string): Promise<string>

	/**
	 * Returns a list of all configured profile names.
	 * @param clientId The ID of the requesting client.
	 * @returns Array of profile names.
	 */
	getProfiles(clientId: string): string[]

	/**
	 * Changes the active API configuration profile.
	 * @param name The name of the profile to activate.
	 * @param clientId The ID of the requesting client.
	 * @throws Error if the profile does not exist.
	 */
	setActiveProfile(name: string, clientId: string): Promise<void>

	/**
	 * Returns the name of the currently active profile.
	 * @param clientId The ID of the requesting client.
	 * @returns The profile name, or undefined if no profile is active.
	 */
	getActiveProfile(clientId: string): string | undefined

	/**
	 * Deletes a profile by name
	 * @param name The name of the profile to delete
	 * @throws Error if the profile does not exist
	 */
	deleteProfile(name: string, clientId: string): Promise<void>

	/**
	 * Returns true if the API is ready to use.
	 * @param clientId The ID of the requesting client.
	 */
	isReady(clientId: string): boolean

	/**
	 * Retrieves messages for a given task ID.
	 * @param taskId The ID of the task.
	 */
	getMessages(taskId: string, clientId: string): void

	/**
	 * Retrieves token usage for a given task ID.
	 * @param taskId The ID of the task.
	 * @param clientId The ID of the requesting client.
	 */
	getTokenUsage(taskId: string, clientId: string): void
}
