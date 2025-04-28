import { z } from "zod"
import { RooCodeEventName } from "./roo-code.js"
/**
 * Ack
 */
export declare const ackSchema: z.ZodObject<
	{
		clientId: z.ZodString
		pid: z.ZodNumber
		ppid: z.ZodNumber
	},
	"strip",
	z.ZodTypeAny,
	{
		clientId: string
		pid: number
		ppid: number
	},
	{
		clientId: string
		pid: number
		ppid: number
	}
>
export type Ack = z.infer<typeof ackSchema>
/**
 * TaskCommand
 */
export declare enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
	GetCurrentTaskStack = "GetCurrentTaskStack",
	ClearCurrentTask = "ClearCurrentTask",
	CancelCurrentTask = "CancelCurrentTask",
	SendMessage = "SendMessage",
	PressPrimaryButton = "PressPrimaryButton",
	PressSecondaryButton = "PressSecondaryButton",
	SetConfiguration = "SetConfiguration",
	IsReady = "IsReady",
	GetMessages = "GetMessages",
	GetTokenUsage = "GetTokenUsage",
	Log = "Log",
	ResumeTask = "ResumeTask",
	IsTaskInHistory = "IsTaskInHistory",
	CreateProfile = "CreateProfile",
	GetProfiles = "GetProfiles",
	SetActiveProfile = "SetActiveProfile",
	getActiveProfile = "getActiveProfile",
	DeleteProfile = "DeleteProfile",
}
export declare const taskCommandSchema: z.ZodDiscriminatedUnion<
	"commandName",
	[
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.StartNewTask>
				data: z.ZodObject<
					{
						configuration: z.ZodObject<
							{
								apiProvider: z.ZodOptional<
									z.ZodEnum<
										[
											"anthropic",
											"glama",
											"openrouter",
											"bedrock",
											"vertex",
											"openai",
											"ollama",
											"vscode-lm",
											"lmstudio",
											"gemini",
											"openai-native",
											"xai",
											"mistral",
											"deepseek",
											"unbound",
											"requesty",
											"human-relay",
											"fake-ai",
										]
									>
								>
								apiModelId: z.ZodOptional<z.ZodString>
								apiKey: z.ZodOptional<z.ZodString>
								anthropicBaseUrl: z.ZodOptional<z.ZodString>
								anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
								glamaModelId: z.ZodOptional<z.ZodString>
								glamaApiKey: z.ZodOptional<z.ZodString>
								openRouterApiKey: z.ZodOptional<z.ZodString>
								openRouterModelId: z.ZodOptional<z.ZodString>
								openRouterBaseUrl: z.ZodOptional<z.ZodString>
								openRouterSpecificProvider: z.ZodOptional<z.ZodString>
								openRouterUseMiddleOutTransform: z.ZodOptional<z.ZodBoolean>
								awsAccessKey: z.ZodOptional<z.ZodString>
								awsSecretKey: z.ZodOptional<z.ZodString>
								awsSessionToken: z.ZodOptional<z.ZodString>
								awsRegion: z.ZodOptional<z.ZodString>
								awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
								awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
								awspromptCacheId: z.ZodOptional<z.ZodString>
								awsProfile: z.ZodOptional<z.ZodString>
								awsUseProfile: z.ZodOptional<z.ZodBoolean>
								awsCustomArn: z.ZodOptional<z.ZodString>
								vertexKeyFile: z.ZodOptional<z.ZodString>
								vertexJsonCredentials: z.ZodOptional<z.ZodString>
								vertexProjectId: z.ZodOptional<z.ZodString>
								vertexRegion: z.ZodOptional<z.ZodString>
								openAiBaseUrl: z.ZodOptional<z.ZodString>
								openAiApiKey: z.ZodOptional<z.ZodString>
								openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
								openAiModelId: z.ZodOptional<z.ZodString>
								openAiCustomModelInfo: z.ZodOptional<
									z.ZodObject<
										{
											maxTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
											contextWindow: z.ZodNumber
											supportsImages: z.ZodOptional<z.ZodBoolean>
											supportsComputerUse: z.ZodOptional<z.ZodBoolean>
											supportsPromptCache: z.ZodBoolean
											inputPrice: z.ZodOptional<z.ZodNumber>
											outputPrice: z.ZodOptional<z.ZodNumber>
											cacheWritesPrice: z.ZodOptional<z.ZodNumber>
											cacheReadsPrice: z.ZodOptional<z.ZodNumber>
											description: z.ZodOptional<z.ZodString>
											reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
											thinking: z.ZodOptional<z.ZodBoolean>
										},
										"strip",
										z.ZodTypeAny,
										{
											contextWindow: number
											supportsPromptCache: boolean
											maxTokens?: number | null | undefined
											supportsImages?: boolean | undefined
											supportsComputerUse?: boolean | undefined
											inputPrice?: number | undefined
											outputPrice?: number | undefined
											cacheWritesPrice?: number | undefined
											cacheReadsPrice?: number | undefined
											description?: string | undefined
											reasoningEffort?: "low" | "medium" | "high" | undefined
											thinking?: boolean | undefined
										},
										{
											contextWindow: number
											supportsPromptCache: boolean
											maxTokens?: number | null | undefined
											supportsImages?: boolean | undefined
											supportsComputerUse?: boolean | undefined
											inputPrice?: number | undefined
											outputPrice?: number | undefined
											cacheWritesPrice?: number | undefined
											cacheReadsPrice?: number | undefined
											description?: string | undefined
											reasoningEffort?: "low" | "medium" | "high" | undefined
											thinking?: boolean | undefined
										}
									>
								>
								openAiUseAzure: z.ZodOptional<z.ZodBoolean>
								azureApiVersion: z.ZodOptional<z.ZodString>
								openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
								ollamaModelId: z.ZodOptional<z.ZodString>
								ollamaBaseUrl: z.ZodOptional<z.ZodString>
								vsCodeLmModelSelector: z.ZodOptional<
									z.ZodObject<
										{
											vendor: z.ZodOptional<z.ZodString>
											family: z.ZodOptional<z.ZodString>
											version: z.ZodOptional<z.ZodString>
											id: z.ZodOptional<z.ZodString>
										},
										"strip",
										z.ZodTypeAny,
										{
											id?: string | undefined
											vendor?: string | undefined
											family?: string | undefined
											version?: string | undefined
										},
										{
											id?: string | undefined
											vendor?: string | undefined
											family?: string | undefined
											version?: string | undefined
										}
									>
								>
								lmStudioModelId: z.ZodOptional<z.ZodString>
								lmStudioBaseUrl: z.ZodOptional<z.ZodString>
								lmStudioDraftModelId: z.ZodOptional<z.ZodString>
								lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
								geminiApiKey: z.ZodOptional<z.ZodString>
								googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
								openAiNativeApiKey: z.ZodOptional<z.ZodString>
								xaiApiKey: z.ZodOptional<z.ZodString>
								mistralApiKey: z.ZodOptional<z.ZodString>
								mistralCodestralUrl: z.ZodOptional<z.ZodString>
								deepSeekBaseUrl: z.ZodOptional<z.ZodString>
								deepSeekApiKey: z.ZodOptional<z.ZodString>
								unboundApiKey: z.ZodOptional<z.ZodString>
								unboundModelId: z.ZodOptional<z.ZodString>
								requestyApiKey: z.ZodOptional<z.ZodString>
								requestyModelId: z.ZodOptional<z.ZodString>
								modelMaxTokens: z.ZodOptional<z.ZodNumber>
								modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
								includeMaxTokens: z.ZodOptional<z.ZodBoolean>
								modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
								reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
								rateLimitSeconds: z.ZodOptional<z.ZodNumber>
								fakeAi: z.ZodOptional<z.ZodUnknown>
							} & {
								currentApiConfigName: z.ZodOptional<z.ZodString>
								listApiConfigMeta: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
											{
												id: z.ZodString
												name: z.ZodString
												apiProvider: z.ZodOptional<
													z.ZodEnum<
														[
															"anthropic",
															"glama",
															"openrouter",
															"bedrock",
															"vertex",
															"openai",
															"ollama",
															"vscode-lm",
															"lmstudio",
															"gemini",
															"openai-native",
															"xai",
															"mistral",
															"deepseek",
															"unbound",
															"requesty",
															"human-relay",
															"fake-ai",
														]
													>
												>
											},
											"strip",
											z.ZodTypeAny,
											{
												id: string
												name: string
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
											},
											{
												id: string
												name: string
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
											}
										>,
										"many"
									>
								>
								pinnedApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>
								lastShownAnnouncementId: z.ZodOptional<z.ZodString>
								customInstructions: z.ZodOptional<z.ZodString>
								taskHistory: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
											{
												id: z.ZodString
												number: z.ZodNumber
												ts: z.ZodNumber
												task: z.ZodString
												tokensIn: z.ZodNumber
												tokensOut: z.ZodNumber
												cacheWrites: z.ZodOptional<z.ZodNumber>
												cacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												size: z.ZodOptional<z.ZodNumber>
											},
											"strip",
											z.ZodTypeAny,
											{
												number: number
												task: string
												id: string
												ts: number
												tokensIn: number
												tokensOut: number
												totalCost: number
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
											},
											{
												number: number
												task: string
												id: string
												ts: number
												tokensIn: number
												tokensOut: number
												totalCost: number
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
											}
										>,
										"many"
									>
								>
								autoApprovalEnabled: z.ZodOptional<z.ZodBoolean>
								alwaysAllowReadOnly: z.ZodOptional<z.ZodBoolean>
								alwaysAllowReadOnlyOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
								alwaysAllowWrite: z.ZodOptional<z.ZodBoolean>
								alwaysAllowWriteOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
								writeDelayMs: z.ZodOptional<z.ZodNumber>
								alwaysAllowBrowser: z.ZodOptional<z.ZodBoolean>
								alwaysApproveResubmit: z.ZodOptional<z.ZodBoolean>
								requestDelaySeconds: z.ZodOptional<z.ZodNumber>
								alwaysAllowMcp: z.ZodOptional<z.ZodBoolean>
								alwaysAllowModeSwitch: z.ZodOptional<z.ZodBoolean>
								alwaysAllowSubtasks: z.ZodOptional<z.ZodBoolean>
								alwaysAllowExecute: z.ZodOptional<z.ZodBoolean>
								allowedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
								browserToolEnabled: z.ZodOptional<z.ZodBoolean>
								browserViewportSize: z.ZodOptional<z.ZodString>
								screenshotQuality: z.ZodOptional<z.ZodNumber>
								remoteBrowserEnabled: z.ZodOptional<z.ZodBoolean>
								remoteBrowserHost: z.ZodOptional<z.ZodString>
								enableCheckpoints: z.ZodOptional<z.ZodBoolean>
								checkpointStorage: z.ZodOptional<z.ZodEnum<["task", "workspace"]>>
								ttsEnabled: z.ZodOptional<z.ZodBoolean>
								ttsSpeed: z.ZodOptional<z.ZodNumber>
								soundEnabled: z.ZodOptional<z.ZodBoolean>
								soundVolume: z.ZodOptional<z.ZodNumber>
								maxOpenTabsContext: z.ZodOptional<z.ZodNumber>
								maxWorkspaceFiles: z.ZodOptional<z.ZodNumber>
								showRooIgnoredFiles: z.ZodOptional<z.ZodBoolean>
								maxReadFileLine: z.ZodOptional<z.ZodNumber>
								terminalOutputLineLimit: z.ZodOptional<z.ZodNumber>
								terminalShellIntegrationTimeout: z.ZodOptional<z.ZodNumber>
								terminalCommandDelay: z.ZodOptional<z.ZodNumber>
								terminalPowershellCounter: z.ZodOptional<z.ZodBoolean>
								terminalZshClearEolMark: z.ZodOptional<z.ZodBoolean>
								terminalZshOhMy: z.ZodOptional<z.ZodBoolean>
								terminalZshP10k: z.ZodOptional<z.ZodBoolean>
								terminalZdotdir: z.ZodOptional<z.ZodBoolean>
								diffEnabled: z.ZodOptional<z.ZodBoolean>
								fuzzyMatchThreshold: z.ZodOptional<z.ZodNumber>
								experiments: z.ZodOptional<
									z.ZodObject<
										{
											powerSteering: z.ZodBoolean
										},
										"strip",
										z.ZodTypeAny,
										{
											powerSteering: boolean
										},
										{
											powerSteering: boolean
										}
									>
								>
								language: z.ZodOptional<
									z.ZodEnum<
										[
											"ca",
											"de",
											"en",
											"es",
											"fr",
											"hi",
											"it",
											"ja",
											"ko",
											"pl",
											"pt-BR",
											"ru",
											"tr",
											"vi",
											"zh-CN",
											"zh-TW",
										]
									>
								>
								telemetrySetting: z.ZodOptional<z.ZodEnum<["unset", "enabled", "disabled"]>>
								mcpEnabled: z.ZodOptional<z.ZodBoolean>
								enableMcpServerCreation: z.ZodOptional<z.ZodBoolean>
								mode: z.ZodOptional<z.ZodString>
								modeApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
								customModes: z.ZodOptional<
									z.ZodArray<
										z.ZodObject<
											{
												slug: z.ZodString
												name: z.ZodString
												roleDefinition: z.ZodString
												customInstructions: z.ZodOptional<z.ZodString>
												groups: z.ZodEffects<
													z.ZodArray<
														z.ZodUnion<
															[
																z.ZodEnum<
																	[
																		"read",
																		"edit",
																		"browser",
																		"command",
																		"mcp",
																		"modes",
																	]
																>,
																z.ZodTuple<
																	[
																		z.ZodEnum<
																			[
																				"read",
																				"edit",
																				"browser",
																				"command",
																				"mcp",
																				"modes",
																			]
																		>,
																		z.ZodObject<
																			{
																				fileRegex: z.ZodEffects<
																					z.ZodOptional<z.ZodString>,
																					string | undefined,
																					string | undefined
																				>
																				description: z.ZodOptional<z.ZodString>
																			},
																			"strip",
																			z.ZodTypeAny,
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			},
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			}
																		>,
																	],
																	null
																>,
															]
														>,
														"many"
													>,
													(
														| "read"
														| "edit"
														| "browser"
														| "command"
														| "mcp"
														| "modes"
														| [
																(
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																),
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[],
													(
														| "read"
														| "edit"
														| "browser"
														| "command"
														| "mcp"
														| "modes"
														| [
																(
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																),
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
												>
												source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
											},
											"strip",
											z.ZodTypeAny,
											{
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "read"
													| "edit"
													| "browser"
													| "command"
													| "mcp"
													| "modes"
													| [
															"read" | "edit" | "browser" | "command" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												customInstructions?: string | undefined
												source?: "global" | "project" | undefined
											},
											{
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "read"
													| "edit"
													| "browser"
													| "command"
													| "mcp"
													| "modes"
													| [
															"read" | "edit" | "browser" | "command" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												customInstructions?: string | undefined
												source?: "global" | "project" | undefined
											}
										>,
										"many"
									>
								>
								customModePrompts: z.ZodOptional<
									z.ZodRecord<
										z.ZodString,
										z.ZodOptional<
											z.ZodObject<
												{
													roleDefinition: z.ZodOptional<z.ZodString>
													customInstructions: z.ZodOptional<z.ZodString>
												},
												"strip",
												z.ZodTypeAny,
												{
													roleDefinition?: string | undefined
													customInstructions?: string | undefined
												},
												{
													roleDefinition?: string | undefined
													customInstructions?: string | undefined
												}
											>
										>
									>
								>
								customSupportPrompts: z.ZodOptional<
									z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
								>
								enhancementApiConfigId: z.ZodOptional<z.ZodString>
							},
							"strip",
							z.ZodTypeAny,
							{
								reasoningEffort?: "low" | "medium" | "high" | undefined
								apiProvider?:
									| "anthropic"
									| "glama"
									| "openrouter"
									| "bedrock"
									| "vertex"
									| "openai"
									| "ollama"
									| "vscode-lm"
									| "lmstudio"
									| "gemini"
									| "openai-native"
									| "xai"
									| "mistral"
									| "deepseek"
									| "unbound"
									| "requesty"
									| "human-relay"
									| "fake-ai"
									| undefined
								customInstructions?: string | undefined
								customModes?:
									| {
											name: string
											slug: string
											roleDefinition: string
											groups: (
												| "read"
												| "edit"
												| "browser"
												| "command"
												| "mcp"
												| "modes"
												| [
														"read" | "edit" | "browser" | "command" | "mcp" | "modes",
														{
															description?: string | undefined
															fileRegex?: string | undefined
														},
												  ]
											)[]
											customInstructions?: string | undefined
											source?: "global" | "project" | undefined
									  }[]
									| undefined
								apiModelId?: string | undefined
								apiKey?: string | undefined
								anthropicBaseUrl?: string | undefined
								anthropicUseAuthToken?: boolean | undefined
								glamaModelId?: string | undefined
								glamaApiKey?: string | undefined
								openRouterApiKey?: string | undefined
								openRouterModelId?: string | undefined
								openRouterBaseUrl?: string | undefined
								openRouterSpecificProvider?: string | undefined
								openRouterUseMiddleOutTransform?: boolean | undefined
								awsAccessKey?: string | undefined
								awsSecretKey?: string | undefined
								awsSessionToken?: string | undefined
								awsRegion?: string | undefined
								awsUseCrossRegionInference?: boolean | undefined
								awsUsePromptCache?: boolean | undefined
								awspromptCacheId?: string | undefined
								awsProfile?: string | undefined
								awsUseProfile?: boolean | undefined
								awsCustomArn?: string | undefined
								vertexKeyFile?: string | undefined
								vertexJsonCredentials?: string | undefined
								vertexProjectId?: string | undefined
								vertexRegion?: string | undefined
								openAiBaseUrl?: string | undefined
								openAiApiKey?: string | undefined
								openAiR1FormatEnabled?: boolean | undefined
								openAiModelId?: string | undefined
								openAiCustomModelInfo?:
									| {
											contextWindow: number
											supportsPromptCache: boolean
											maxTokens?: number | null | undefined
											supportsImages?: boolean | undefined
											supportsComputerUse?: boolean | undefined
											inputPrice?: number | undefined
											outputPrice?: number | undefined
											cacheWritesPrice?: number | undefined
											cacheReadsPrice?: number | undefined
											description?: string | undefined
											reasoningEffort?: "low" | "medium" | "high" | undefined
											thinking?: boolean | undefined
									  }
									| undefined
								openAiUseAzure?: boolean | undefined
								azureApiVersion?: string | undefined
								openAiStreamingEnabled?: boolean | undefined
								ollamaModelId?: string | undefined
								ollamaBaseUrl?: string | undefined
								vsCodeLmModelSelector?:
									| {
											id?: string | undefined
											vendor?: string | undefined
											family?: string | undefined
											version?: string | undefined
									  }
									| undefined
								lmStudioModelId?: string | undefined
								lmStudioBaseUrl?: string | undefined
								lmStudioDraftModelId?: string | undefined
								lmStudioSpeculativeDecodingEnabled?: boolean | undefined
								geminiApiKey?: string | undefined
								googleGeminiBaseUrl?: string | undefined
								openAiNativeApiKey?: string | undefined
								xaiApiKey?: string | undefined
								mistralApiKey?: string | undefined
								mistralCodestralUrl?: string | undefined
								deepSeekBaseUrl?: string | undefined
								deepSeekApiKey?: string | undefined
								unboundApiKey?: string | undefined
								unboundModelId?: string | undefined
								requestyApiKey?: string | undefined
								requestyModelId?: string | undefined
								modelMaxTokens?: number | undefined
								modelMaxThinkingTokens?: number | undefined
								includeMaxTokens?: boolean | undefined
								modelTemperature?: number | null | undefined
								rateLimitSeconds?: number | undefined
								fakeAi?: unknown
								currentApiConfigName?: string | undefined
								listApiConfigMeta?:
									| {
											id: string
											name: string
											apiProvider?:
												| "anthropic"
												| "glama"
												| "openrouter"
												| "bedrock"
												| "vertex"
												| "openai"
												| "ollama"
												| "vscode-lm"
												| "lmstudio"
												| "gemini"
												| "openai-native"
												| "xai"
												| "mistral"
												| "deepseek"
												| "unbound"
												| "requesty"
												| "human-relay"
												| "fake-ai"
												| undefined
									  }[]
									| undefined
								pinnedApiConfigs?: Record<string, boolean> | undefined
								lastShownAnnouncementId?: string | undefined
								taskHistory?:
									| {
											number: number
											task: string
											id: string
											ts: number
											tokensIn: number
											tokensOut: number
											totalCost: number
											cacheWrites?: number | undefined
											cacheReads?: number | undefined
											size?: number | undefined
									  }[]
									| undefined
								autoApprovalEnabled?: boolean | undefined
								alwaysAllowReadOnly?: boolean | undefined
								alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
								alwaysAllowWrite?: boolean | undefined
								alwaysAllowWriteOutsideWorkspace?: boolean | undefined
								writeDelayMs?: number | undefined
								alwaysAllowBrowser?: boolean | undefined
								alwaysApproveResubmit?: boolean | undefined
								requestDelaySeconds?: number | undefined
								alwaysAllowMcp?: boolean | undefined
								alwaysAllowModeSwitch?: boolean | undefined
								alwaysAllowSubtasks?: boolean | undefined
								alwaysAllowExecute?: boolean | undefined
								allowedCommands?: string[] | undefined
								browserToolEnabled?: boolean | undefined
								browserViewportSize?: string | undefined
								screenshotQuality?: number | undefined
								remoteBrowserEnabled?: boolean | undefined
								remoteBrowserHost?: string | undefined
								enableCheckpoints?: boolean | undefined
								checkpointStorage?: "task" | "workspace" | undefined
								ttsEnabled?: boolean | undefined
								ttsSpeed?: number | undefined
								soundEnabled?: boolean | undefined
								soundVolume?: number | undefined
								maxOpenTabsContext?: number | undefined
								maxWorkspaceFiles?: number | undefined
								showRooIgnoredFiles?: boolean | undefined
								maxReadFileLine?: number | undefined
								terminalOutputLineLimit?: number | undefined
								terminalShellIntegrationTimeout?: number | undefined
								terminalCommandDelay?: number | undefined
								terminalPowershellCounter?: boolean | undefined
								terminalZshClearEolMark?: boolean | undefined
								terminalZshOhMy?: boolean | undefined
								terminalZshP10k?: boolean | undefined
								terminalZdotdir?: boolean | undefined
								diffEnabled?: boolean | undefined
								fuzzyMatchThreshold?: number | undefined
								experiments?:
									| {
											powerSteering: boolean
									  }
									| undefined
								language?:
									| "ca"
									| "de"
									| "en"
									| "es"
									| "fr"
									| "hi"
									| "it"
									| "ja"
									| "ko"
									| "pl"
									| "pt-BR"
									| "ru"
									| "tr"
									| "vi"
									| "zh-CN"
									| "zh-TW"
									| undefined
								telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
								mcpEnabled?: boolean | undefined
								enableMcpServerCreation?: boolean | undefined
								mode?: string | undefined
								modeApiConfigs?: Record<string, string> | undefined
								customModePrompts?:
									| Record<
											string,
											| {
													roleDefinition?: string | undefined
													customInstructions?: string | undefined
											  }
											| undefined
									  >
									| undefined
								customSupportPrompts?: Record<string, string | undefined> | undefined
								enhancementApiConfigId?: string | undefined
							},
							{
								reasoningEffort?: "low" | "medium" | "high" | undefined
								apiProvider?:
									| "anthropic"
									| "glama"
									| "openrouter"
									| "bedrock"
									| "vertex"
									| "openai"
									| "ollama"
									| "vscode-lm"
									| "lmstudio"
									| "gemini"
									| "openai-native"
									| "xai"
									| "mistral"
									| "deepseek"
									| "unbound"
									| "requesty"
									| "human-relay"
									| "fake-ai"
									| undefined
								customInstructions?: string | undefined
								customModes?:
									| {
											name: string
											slug: string
											roleDefinition: string
											groups: (
												| "read"
												| "edit"
												| "browser"
												| "command"
												| "mcp"
												| "modes"
												| [
														"read" | "edit" | "browser" | "command" | "mcp" | "modes",
														{
															description?: string | undefined
															fileRegex?: string | undefined
														},
												  ]
											)[]
											customInstructions?: string | undefined
											source?: "global" | "project" | undefined
									  }[]
									| undefined
								apiModelId?: string | undefined
								apiKey?: string | undefined
								anthropicBaseUrl?: string | undefined
								anthropicUseAuthToken?: boolean | undefined
								glamaModelId?: string | undefined
								glamaApiKey?: string | undefined
								openRouterApiKey?: string | undefined
								openRouterModelId?: string | undefined
								openRouterBaseUrl?: string | undefined
								openRouterSpecificProvider?: string | undefined
								openRouterUseMiddleOutTransform?: boolean | undefined
								awsAccessKey?: string | undefined
								awsSecretKey?: string | undefined
								awsSessionToken?: string | undefined
								awsRegion?: string | undefined
								awsUseCrossRegionInference?: boolean | undefined
								awsUsePromptCache?: boolean | undefined
								awspromptCacheId?: string | undefined
								awsProfile?: string | undefined
								awsUseProfile?: boolean | undefined
								awsCustomArn?: string | undefined
								vertexKeyFile?: string | undefined
								vertexJsonCredentials?: string | undefined
								vertexProjectId?: string | undefined
								vertexRegion?: string | undefined
								openAiBaseUrl?: string | undefined
								openAiApiKey?: string | undefined
								openAiR1FormatEnabled?: boolean | undefined
								openAiModelId?: string | undefined
								openAiCustomModelInfo?:
									| {
											contextWindow: number
											supportsPromptCache: boolean
											maxTokens?: number | null | undefined
											supportsImages?: boolean | undefined
											supportsComputerUse?: boolean | undefined
											inputPrice?: number | undefined
											outputPrice?: number | undefined
											cacheWritesPrice?: number | undefined
											cacheReadsPrice?: number | undefined
											description?: string | undefined
											reasoningEffort?: "low" | "medium" | "high" | undefined
											thinking?: boolean | undefined
									  }
									| undefined
								openAiUseAzure?: boolean | undefined
								azureApiVersion?: string | undefined
								openAiStreamingEnabled?: boolean | undefined
								ollamaModelId?: string | undefined
								ollamaBaseUrl?: string | undefined
								vsCodeLmModelSelector?:
									| {
											id?: string | undefined
											vendor?: string | undefined
											family?: string | undefined
											version?: string | undefined
									  }
									| undefined
								lmStudioModelId?: string | undefined
								lmStudioBaseUrl?: string | undefined
								lmStudioDraftModelId?: string | undefined
								lmStudioSpeculativeDecodingEnabled?: boolean | undefined
								geminiApiKey?: string | undefined
								googleGeminiBaseUrl?: string | undefined
								openAiNativeApiKey?: string | undefined
								xaiApiKey?: string | undefined
								mistralApiKey?: string | undefined
								mistralCodestralUrl?: string | undefined
								deepSeekBaseUrl?: string | undefined
								deepSeekApiKey?: string | undefined
								unboundApiKey?: string | undefined
								unboundModelId?: string | undefined
								requestyApiKey?: string | undefined
								requestyModelId?: string | undefined
								modelMaxTokens?: number | undefined
								modelMaxThinkingTokens?: number | undefined
								includeMaxTokens?: boolean | undefined
								modelTemperature?: number | null | undefined
								rateLimitSeconds?: number | undefined
								fakeAi?: unknown
								currentApiConfigName?: string | undefined
								listApiConfigMeta?:
									| {
											id: string
											name: string
											apiProvider?:
												| "anthropic"
												| "glama"
												| "openrouter"
												| "bedrock"
												| "vertex"
												| "openai"
												| "ollama"
												| "vscode-lm"
												| "lmstudio"
												| "gemini"
												| "openai-native"
												| "xai"
												| "mistral"
												| "deepseek"
												| "unbound"
												| "requesty"
												| "human-relay"
												| "fake-ai"
												| undefined
									  }[]
									| undefined
								pinnedApiConfigs?: Record<string, boolean> | undefined
								lastShownAnnouncementId?: string | undefined
								taskHistory?:
									| {
											number: number
											task: string
											id: string
											ts: number
											tokensIn: number
											tokensOut: number
											totalCost: number
											cacheWrites?: number | undefined
											cacheReads?: number | undefined
											size?: number | undefined
									  }[]
									| undefined
								autoApprovalEnabled?: boolean | undefined
								alwaysAllowReadOnly?: boolean | undefined
								alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
								alwaysAllowWrite?: boolean | undefined
								alwaysAllowWriteOutsideWorkspace?: boolean | undefined
								writeDelayMs?: number | undefined
								alwaysAllowBrowser?: boolean | undefined
								alwaysApproveResubmit?: boolean | undefined
								requestDelaySeconds?: number | undefined
								alwaysAllowMcp?: boolean | undefined
								alwaysAllowModeSwitch?: boolean | undefined
								alwaysAllowSubtasks?: boolean | undefined
								alwaysAllowExecute?: boolean | undefined
								allowedCommands?: string[] | undefined
								browserToolEnabled?: boolean | undefined
								browserViewportSize?: string | undefined
								screenshotQuality?: number | undefined
								remoteBrowserEnabled?: boolean | undefined
								remoteBrowserHost?: string | undefined
								enableCheckpoints?: boolean | undefined
								checkpointStorage?: "task" | "workspace" | undefined
								ttsEnabled?: boolean | undefined
								ttsSpeed?: number | undefined
								soundEnabled?: boolean | undefined
								soundVolume?: number | undefined
								maxOpenTabsContext?: number | undefined
								maxWorkspaceFiles?: number | undefined
								showRooIgnoredFiles?: boolean | undefined
								maxReadFileLine?: number | undefined
								terminalOutputLineLimit?: number | undefined
								terminalShellIntegrationTimeout?: number | undefined
								terminalCommandDelay?: number | undefined
								terminalPowershellCounter?: boolean | undefined
								terminalZshClearEolMark?: boolean | undefined
								terminalZshOhMy?: boolean | undefined
								terminalZshP10k?: boolean | undefined
								terminalZdotdir?: boolean | undefined
								diffEnabled?: boolean | undefined
								fuzzyMatchThreshold?: number | undefined
								experiments?:
									| {
											powerSteering: boolean
									  }
									| undefined
								language?:
									| "ca"
									| "de"
									| "en"
									| "es"
									| "fr"
									| "hi"
									| "it"
									| "ja"
									| "ko"
									| "pl"
									| "pt-BR"
									| "ru"
									| "tr"
									| "vi"
									| "zh-CN"
									| "zh-TW"
									| undefined
								telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
								mcpEnabled?: boolean | undefined
								enableMcpServerCreation?: boolean | undefined
								mode?: string | undefined
								modeApiConfigs?: Record<string, string> | undefined
								customModePrompts?:
									| Record<
											string,
											| {
													roleDefinition?: string | undefined
													customInstructions?: string | undefined
											  }
											| undefined
									  >
									| undefined
								customSupportPrompts?: Record<string, string | undefined> | undefined
								enhancementApiConfigId?: string | undefined
							}
						>
						text: z.ZodOptional<z.ZodString>
						images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
						newTab: z.ZodOptional<z.ZodBoolean>
					},
					"strip",
					z.ZodTypeAny,
					{
						configuration: {
							reasoningEffort?: "low" | "medium" | "high" | undefined
							apiProvider?:
								| "anthropic"
								| "glama"
								| "openrouter"
								| "bedrock"
								| "vertex"
								| "openai"
								| "ollama"
								| "vscode-lm"
								| "lmstudio"
								| "gemini"
								| "openai-native"
								| "xai"
								| "mistral"
								| "deepseek"
								| "unbound"
								| "requesty"
								| "human-relay"
								| "fake-ai"
								| undefined
							customInstructions?: string | undefined
							customModes?:
								| {
										name: string
										slug: string
										roleDefinition: string
										groups: (
											| "read"
											| "edit"
											| "browser"
											| "command"
											| "mcp"
											| "modes"
											| [
													"read" | "edit" | "browser" | "command" | "mcp" | "modes",
													{
														description?: string | undefined
														fileRegex?: string | undefined
													},
											  ]
										)[]
										customInstructions?: string | undefined
										source?: "global" | "project" | undefined
								  }[]
								| undefined
							apiModelId?: string | undefined
							apiKey?: string | undefined
							anthropicBaseUrl?: string | undefined
							anthropicUseAuthToken?: boolean | undefined
							glamaModelId?: string | undefined
							glamaApiKey?: string | undefined
							openRouterApiKey?: string | undefined
							openRouterModelId?: string | undefined
							openRouterBaseUrl?: string | undefined
							openRouterSpecificProvider?: string | undefined
							openRouterUseMiddleOutTransform?: boolean | undefined
							awsAccessKey?: string | undefined
							awsSecretKey?: string | undefined
							awsSessionToken?: string | undefined
							awsRegion?: string | undefined
							awsUseCrossRegionInference?: boolean | undefined
							awsUsePromptCache?: boolean | undefined
							awspromptCacheId?: string | undefined
							awsProfile?: string | undefined
							awsUseProfile?: boolean | undefined
							awsCustomArn?: string | undefined
							vertexKeyFile?: string | undefined
							vertexJsonCredentials?: string | undefined
							vertexProjectId?: string | undefined
							vertexRegion?: string | undefined
							openAiBaseUrl?: string | undefined
							openAiApiKey?: string | undefined
							openAiR1FormatEnabled?: boolean | undefined
							openAiModelId?: string | undefined
							openAiCustomModelInfo?:
								| {
										contextWindow: number
										supportsPromptCache: boolean
										maxTokens?: number | null | undefined
										supportsImages?: boolean | undefined
										supportsComputerUse?: boolean | undefined
										inputPrice?: number | undefined
										outputPrice?: number | undefined
										cacheWritesPrice?: number | undefined
										cacheReadsPrice?: number | undefined
										description?: string | undefined
										reasoningEffort?: "low" | "medium" | "high" | undefined
										thinking?: boolean | undefined
								  }
								| undefined
							openAiUseAzure?: boolean | undefined
							azureApiVersion?: string | undefined
							openAiStreamingEnabled?: boolean | undefined
							ollamaModelId?: string | undefined
							ollamaBaseUrl?: string | undefined
							vsCodeLmModelSelector?:
								| {
										id?: string | undefined
										vendor?: string | undefined
										family?: string | undefined
										version?: string | undefined
								  }
								| undefined
							lmStudioModelId?: string | undefined
							lmStudioBaseUrl?: string | undefined
							lmStudioDraftModelId?: string | undefined
							lmStudioSpeculativeDecodingEnabled?: boolean | undefined
							geminiApiKey?: string | undefined
							googleGeminiBaseUrl?: string | undefined
							openAiNativeApiKey?: string | undefined
							xaiApiKey?: string | undefined
							mistralApiKey?: string | undefined
							mistralCodestralUrl?: string | undefined
							deepSeekBaseUrl?: string | undefined
							deepSeekApiKey?: string | undefined
							unboundApiKey?: string | undefined
							unboundModelId?: string | undefined
							requestyApiKey?: string | undefined
							requestyModelId?: string | undefined
							modelMaxTokens?: number | undefined
							modelMaxThinkingTokens?: number | undefined
							includeMaxTokens?: boolean | undefined
							modelTemperature?: number | null | undefined
							rateLimitSeconds?: number | undefined
							fakeAi?: unknown
							currentApiConfigName?: string | undefined
							listApiConfigMeta?:
								| {
										id: string
										name: string
										apiProvider?:
											| "anthropic"
											| "glama"
											| "openrouter"
											| "bedrock"
											| "vertex"
											| "openai"
											| "ollama"
											| "vscode-lm"
											| "lmstudio"
											| "gemini"
											| "openai-native"
											| "xai"
											| "mistral"
											| "deepseek"
											| "unbound"
											| "requesty"
											| "human-relay"
											| "fake-ai"
											| undefined
								  }[]
								| undefined
							pinnedApiConfigs?: Record<string, boolean> | undefined
							lastShownAnnouncementId?: string | undefined
							taskHistory?:
								| {
										number: number
										task: string
										id: string
										ts: number
										tokensIn: number
										tokensOut: number
										totalCost: number
										cacheWrites?: number | undefined
										cacheReads?: number | undefined
										size?: number | undefined
								  }[]
								| undefined
							autoApprovalEnabled?: boolean | undefined
							alwaysAllowReadOnly?: boolean | undefined
							alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
							alwaysAllowWrite?: boolean | undefined
							alwaysAllowWriteOutsideWorkspace?: boolean | undefined
							writeDelayMs?: number | undefined
							alwaysAllowBrowser?: boolean | undefined
							alwaysApproveResubmit?: boolean | undefined
							requestDelaySeconds?: number | undefined
							alwaysAllowMcp?: boolean | undefined
							alwaysAllowModeSwitch?: boolean | undefined
							alwaysAllowSubtasks?: boolean | undefined
							alwaysAllowExecute?: boolean | undefined
							allowedCommands?: string[] | undefined
							browserToolEnabled?: boolean | undefined
							browserViewportSize?: string | undefined
							screenshotQuality?: number | undefined
							remoteBrowserEnabled?: boolean | undefined
							remoteBrowserHost?: string | undefined
							enableCheckpoints?: boolean | undefined
							checkpointStorage?: "task" | "workspace" | undefined
							ttsEnabled?: boolean | undefined
							ttsSpeed?: number | undefined
							soundEnabled?: boolean | undefined
							soundVolume?: number | undefined
							maxOpenTabsContext?: number | undefined
							maxWorkspaceFiles?: number | undefined
							showRooIgnoredFiles?: boolean | undefined
							maxReadFileLine?: number | undefined
							terminalOutputLineLimit?: number | undefined
							terminalShellIntegrationTimeout?: number | undefined
							terminalCommandDelay?: number | undefined
							terminalPowershellCounter?: boolean | undefined
							terminalZshClearEolMark?: boolean | undefined
							terminalZshOhMy?: boolean | undefined
							terminalZshP10k?: boolean | undefined
							terminalZdotdir?: boolean | undefined
							diffEnabled?: boolean | undefined
							fuzzyMatchThreshold?: number | undefined
							experiments?:
								| {
										powerSteering: boolean
								  }
								| undefined
							language?:
								| "ca"
								| "de"
								| "en"
								| "es"
								| "fr"
								| "hi"
								| "it"
								| "ja"
								| "ko"
								| "pl"
								| "pt-BR"
								| "ru"
								| "tr"
								| "vi"
								| "zh-CN"
								| "zh-TW"
								| undefined
							telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
							mcpEnabled?: boolean | undefined
							enableMcpServerCreation?: boolean | undefined
							mode?: string | undefined
							modeApiConfigs?: Record<string, string> | undefined
							customModePrompts?:
								| Record<
										string,
										| {
												roleDefinition?: string | undefined
												customInstructions?: string | undefined
										  }
										| undefined
								  >
								| undefined
							customSupportPrompts?: Record<string, string | undefined> | undefined
							enhancementApiConfigId?: string | undefined
						}
						text?: string | undefined
						images?: string[] | undefined
						newTab?: boolean | undefined
					},
					{
						configuration: {
							reasoningEffort?: "low" | "medium" | "high" | undefined
							apiProvider?:
								| "anthropic"
								| "glama"
								| "openrouter"
								| "bedrock"
								| "vertex"
								| "openai"
								| "ollama"
								| "vscode-lm"
								| "lmstudio"
								| "gemini"
								| "openai-native"
								| "xai"
								| "mistral"
								| "deepseek"
								| "unbound"
								| "requesty"
								| "human-relay"
								| "fake-ai"
								| undefined
							customInstructions?: string | undefined
							customModes?:
								| {
										name: string
										slug: string
										roleDefinition: string
										groups: (
											| "read"
											| "edit"
											| "browser"
											| "command"
											| "mcp"
											| "modes"
											| [
													"read" | "edit" | "browser" | "command" | "mcp" | "modes",
													{
														description?: string | undefined
														fileRegex?: string | undefined
													},
											  ]
										)[]
										customInstructions?: string | undefined
										source?: "global" | "project" | undefined
								  }[]
								| undefined
							apiModelId?: string | undefined
							apiKey?: string | undefined
							anthropicBaseUrl?: string | undefined
							anthropicUseAuthToken?: boolean | undefined
							glamaModelId?: string | undefined
							glamaApiKey?: string | undefined
							openRouterApiKey?: string | undefined
							openRouterModelId?: string | undefined
							openRouterBaseUrl?: string | undefined
							openRouterSpecificProvider?: string | undefined
							openRouterUseMiddleOutTransform?: boolean | undefined
							awsAccessKey?: string | undefined
							awsSecretKey?: string | undefined
							awsSessionToken?: string | undefined
							awsRegion?: string | undefined
							awsUseCrossRegionInference?: boolean | undefined
							awsUsePromptCache?: boolean | undefined
							awspromptCacheId?: string | undefined
							awsProfile?: string | undefined
							awsUseProfile?: boolean | undefined
							awsCustomArn?: string | undefined
							vertexKeyFile?: string | undefined
							vertexJsonCredentials?: string | undefined
							vertexProjectId?: string | undefined
							vertexRegion?: string | undefined
							openAiBaseUrl?: string | undefined
							openAiApiKey?: string | undefined
							openAiR1FormatEnabled?: boolean | undefined
							openAiModelId?: string | undefined
							openAiCustomModelInfo?:
								| {
										contextWindow: number
										supportsPromptCache: boolean
										maxTokens?: number | null | undefined
										supportsImages?: boolean | undefined
										supportsComputerUse?: boolean | undefined
										inputPrice?: number | undefined
										outputPrice?: number | undefined
										cacheWritesPrice?: number | undefined
										cacheReadsPrice?: number | undefined
										description?: string | undefined
										reasoningEffort?: "low" | "medium" | "high" | undefined
										thinking?: boolean | undefined
								  }
								| undefined
							openAiUseAzure?: boolean | undefined
							azureApiVersion?: string | undefined
							openAiStreamingEnabled?: boolean | undefined
							ollamaModelId?: string | undefined
							ollamaBaseUrl?: string | undefined
							vsCodeLmModelSelector?:
								| {
										id?: string | undefined
										vendor?: string | undefined
										family?: string | undefined
										version?: string | undefined
								  }
								| undefined
							lmStudioModelId?: string | undefined
							lmStudioBaseUrl?: string | undefined
							lmStudioDraftModelId?: string | undefined
							lmStudioSpeculativeDecodingEnabled?: boolean | undefined
							geminiApiKey?: string | undefined
							googleGeminiBaseUrl?: string | undefined
							openAiNativeApiKey?: string | undefined
							xaiApiKey?: string | undefined
							mistralApiKey?: string | undefined
							mistralCodestralUrl?: string | undefined
							deepSeekBaseUrl?: string | undefined
							deepSeekApiKey?: string | undefined
							unboundApiKey?: string | undefined
							unboundModelId?: string | undefined
							requestyApiKey?: string | undefined
							requestyModelId?: string | undefined
							modelMaxTokens?: number | undefined
							modelMaxThinkingTokens?: number | undefined
							includeMaxTokens?: boolean | undefined
							modelTemperature?: number | null | undefined
							rateLimitSeconds?: number | undefined
							fakeAi?: unknown
							currentApiConfigName?: string | undefined
							listApiConfigMeta?:
								| {
										id: string
										name: string
										apiProvider?:
											| "anthropic"
											| "glama"
											| "openrouter"
											| "bedrock"
											| "vertex"
											| "openai"
											| "ollama"
											| "vscode-lm"
											| "lmstudio"
											| "gemini"
											| "openai-native"
											| "xai"
											| "mistral"
											| "deepseek"
											| "unbound"
											| "requesty"
											| "human-relay"
											| "fake-ai"
											| undefined
								  }[]
								| undefined
							pinnedApiConfigs?: Record<string, boolean> | undefined
							lastShownAnnouncementId?: string | undefined
							taskHistory?:
								| {
										number: number
										task: string
										id: string
										ts: number
										tokensIn: number
										tokensOut: number
										totalCost: number
										cacheWrites?: number | undefined
										cacheReads?: number | undefined
										size?: number | undefined
								  }[]
								| undefined
							autoApprovalEnabled?: boolean | undefined
							alwaysAllowReadOnly?: boolean | undefined
							alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
							alwaysAllowWrite?: boolean | undefined
							alwaysAllowWriteOutsideWorkspace?: boolean | undefined
							writeDelayMs?: number | undefined
							alwaysAllowBrowser?: boolean | undefined
							alwaysApproveResubmit?: boolean | undefined
							requestDelaySeconds?: number | undefined
							alwaysAllowMcp?: boolean | undefined
							alwaysAllowModeSwitch?: boolean | undefined
							alwaysAllowSubtasks?: boolean | undefined
							alwaysAllowExecute?: boolean | undefined
							allowedCommands?: string[] | undefined
							browserToolEnabled?: boolean | undefined
							browserViewportSize?: string | undefined
							screenshotQuality?: number | undefined
							remoteBrowserEnabled?: boolean | undefined
							remoteBrowserHost?: string | undefined
							enableCheckpoints?: boolean | undefined
							checkpointStorage?: "task" | "workspace" | undefined
							ttsEnabled?: boolean | undefined
							ttsSpeed?: number | undefined
							soundEnabled?: boolean | undefined
							soundVolume?: number | undefined
							maxOpenTabsContext?: number | undefined
							maxWorkspaceFiles?: number | undefined
							showRooIgnoredFiles?: boolean | undefined
							maxReadFileLine?: number | undefined
							terminalOutputLineLimit?: number | undefined
							terminalShellIntegrationTimeout?: number | undefined
							terminalCommandDelay?: number | undefined
							terminalPowershellCounter?: boolean | undefined
							terminalZshClearEolMark?: boolean | undefined
							terminalZshOhMy?: boolean | undefined
							terminalZshP10k?: boolean | undefined
							terminalZdotdir?: boolean | undefined
							diffEnabled?: boolean | undefined
							fuzzyMatchThreshold?: number | undefined
							experiments?:
								| {
										powerSteering: boolean
								  }
								| undefined
							language?:
								| "ca"
								| "de"
								| "en"
								| "es"
								| "fr"
								| "hi"
								| "it"
								| "ja"
								| "ko"
								| "pl"
								| "pt-BR"
								| "ru"
								| "tr"
								| "vi"
								| "zh-CN"
								| "zh-TW"
								| undefined
							telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
							mcpEnabled?: boolean | undefined
							enableMcpServerCreation?: boolean | undefined
							mode?: string | undefined
							modeApiConfigs?: Record<string, string> | undefined
							customModePrompts?:
								| Record<
										string,
										| {
												roleDefinition?: string | undefined
												customInstructions?: string | undefined
										  }
										| undefined
								  >
								| undefined
							customSupportPrompts?: Record<string, string | undefined> | undefined
							enhancementApiConfigId?: string | undefined
						}
						text?: string | undefined
						images?: string[] | undefined
						newTab?: boolean | undefined
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.StartNewTask
				data: {
					configuration: {
						reasoningEffort?: "low" | "medium" | "high" | undefined
						apiProvider?:
							| "anthropic"
							| "glama"
							| "openrouter"
							| "bedrock"
							| "vertex"
							| "openai"
							| "ollama"
							| "vscode-lm"
							| "lmstudio"
							| "gemini"
							| "openai-native"
							| "xai"
							| "mistral"
							| "deepseek"
							| "unbound"
							| "requesty"
							| "human-relay"
							| "fake-ai"
							| undefined
						customInstructions?: string | undefined
						customModes?:
							| {
									name: string
									slug: string
									roleDefinition: string
									groups: (
										| "read"
										| "edit"
										| "browser"
										| "command"
										| "mcp"
										| "modes"
										| [
												"read" | "edit" | "browser" | "command" | "mcp" | "modes",
												{
													description?: string | undefined
													fileRegex?: string | undefined
												},
										  ]
									)[]
									customInstructions?: string | undefined
									source?: "global" | "project" | undefined
							  }[]
							| undefined
						apiModelId?: string | undefined
						apiKey?: string | undefined
						anthropicBaseUrl?: string | undefined
						anthropicUseAuthToken?: boolean | undefined
						glamaModelId?: string | undefined
						glamaApiKey?: string | undefined
						openRouterApiKey?: string | undefined
						openRouterModelId?: string | undefined
						openRouterBaseUrl?: string | undefined
						openRouterSpecificProvider?: string | undefined
						openRouterUseMiddleOutTransform?: boolean | undefined
						awsAccessKey?: string | undefined
						awsSecretKey?: string | undefined
						awsSessionToken?: string | undefined
						awsRegion?: string | undefined
						awsUseCrossRegionInference?: boolean | undefined
						awsUsePromptCache?: boolean | undefined
						awspromptCacheId?: string | undefined
						awsProfile?: string | undefined
						awsUseProfile?: boolean | undefined
						awsCustomArn?: string | undefined
						vertexKeyFile?: string | undefined
						vertexJsonCredentials?: string | undefined
						vertexProjectId?: string | undefined
						vertexRegion?: string | undefined
						openAiBaseUrl?: string | undefined
						openAiApiKey?: string | undefined
						openAiR1FormatEnabled?: boolean | undefined
						openAiModelId?: string | undefined
						openAiCustomModelInfo?:
							| {
									contextWindow: number
									supportsPromptCache: boolean
									maxTokens?: number | null | undefined
									supportsImages?: boolean | undefined
									supportsComputerUse?: boolean | undefined
									inputPrice?: number | undefined
									outputPrice?: number | undefined
									cacheWritesPrice?: number | undefined
									cacheReadsPrice?: number | undefined
									description?: string | undefined
									reasoningEffort?: "low" | "medium" | "high" | undefined
									thinking?: boolean | undefined
							  }
							| undefined
						openAiUseAzure?: boolean | undefined
						azureApiVersion?: string | undefined
						openAiStreamingEnabled?: boolean | undefined
						ollamaModelId?: string | undefined
						ollamaBaseUrl?: string | undefined
						vsCodeLmModelSelector?:
							| {
									id?: string | undefined
									vendor?: string | undefined
									family?: string | undefined
									version?: string | undefined
							  }
							| undefined
						lmStudioModelId?: string | undefined
						lmStudioBaseUrl?: string | undefined
						lmStudioDraftModelId?: string | undefined
						lmStudioSpeculativeDecodingEnabled?: boolean | undefined
						geminiApiKey?: string | undefined
						googleGeminiBaseUrl?: string | undefined
						openAiNativeApiKey?: string | undefined
						xaiApiKey?: string | undefined
						mistralApiKey?: string | undefined
						mistralCodestralUrl?: string | undefined
						deepSeekBaseUrl?: string | undefined
						deepSeekApiKey?: string | undefined
						unboundApiKey?: string | undefined
						unboundModelId?: string | undefined
						requestyApiKey?: string | undefined
						requestyModelId?: string | undefined
						modelMaxTokens?: number | undefined
						modelMaxThinkingTokens?: number | undefined
						includeMaxTokens?: boolean | undefined
						modelTemperature?: number | null | undefined
						rateLimitSeconds?: number | undefined
						fakeAi?: unknown
						currentApiConfigName?: string | undefined
						listApiConfigMeta?:
							| {
									id: string
									name: string
									apiProvider?:
										| "anthropic"
										| "glama"
										| "openrouter"
										| "bedrock"
										| "vertex"
										| "openai"
										| "ollama"
										| "vscode-lm"
										| "lmstudio"
										| "gemini"
										| "openai-native"
										| "xai"
										| "mistral"
										| "deepseek"
										| "unbound"
										| "requesty"
										| "human-relay"
										| "fake-ai"
										| undefined
							  }[]
							| undefined
						pinnedApiConfigs?: Record<string, boolean> | undefined
						lastShownAnnouncementId?: string | undefined
						taskHistory?:
							| {
									number: number
									task: string
									id: string
									ts: number
									tokensIn: number
									tokensOut: number
									totalCost: number
									cacheWrites?: number | undefined
									cacheReads?: number | undefined
									size?: number | undefined
							  }[]
							| undefined
						autoApprovalEnabled?: boolean | undefined
						alwaysAllowReadOnly?: boolean | undefined
						alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
						alwaysAllowWrite?: boolean | undefined
						alwaysAllowWriteOutsideWorkspace?: boolean | undefined
						writeDelayMs?: number | undefined
						alwaysAllowBrowser?: boolean | undefined
						alwaysApproveResubmit?: boolean | undefined
						requestDelaySeconds?: number | undefined
						alwaysAllowMcp?: boolean | undefined
						alwaysAllowModeSwitch?: boolean | undefined
						alwaysAllowSubtasks?: boolean | undefined
						alwaysAllowExecute?: boolean | undefined
						allowedCommands?: string[] | undefined
						browserToolEnabled?: boolean | undefined
						browserViewportSize?: string | undefined
						screenshotQuality?: number | undefined
						remoteBrowserEnabled?: boolean | undefined
						remoteBrowserHost?: string | undefined
						enableCheckpoints?: boolean | undefined
						checkpointStorage?: "task" | "workspace" | undefined
						ttsEnabled?: boolean | undefined
						ttsSpeed?: number | undefined
						soundEnabled?: boolean | undefined
						soundVolume?: number | undefined
						maxOpenTabsContext?: number | undefined
						maxWorkspaceFiles?: number | undefined
						showRooIgnoredFiles?: boolean | undefined
						maxReadFileLine?: number | undefined
						terminalOutputLineLimit?: number | undefined
						terminalShellIntegrationTimeout?: number | undefined
						terminalCommandDelay?: number | undefined
						terminalPowershellCounter?: boolean | undefined
						terminalZshClearEolMark?: boolean | undefined
						terminalZshOhMy?: boolean | undefined
						terminalZshP10k?: boolean | undefined
						terminalZdotdir?: boolean | undefined
						diffEnabled?: boolean | undefined
						fuzzyMatchThreshold?: number | undefined
						experiments?:
							| {
									powerSteering: boolean
							  }
							| undefined
						language?:
							| "ca"
							| "de"
							| "en"
							| "es"
							| "fr"
							| "hi"
							| "it"
							| "ja"
							| "ko"
							| "pl"
							| "pt-BR"
							| "ru"
							| "tr"
							| "vi"
							| "zh-CN"
							| "zh-TW"
							| undefined
						telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
						mcpEnabled?: boolean | undefined
						enableMcpServerCreation?: boolean | undefined
						mode?: string | undefined
						modeApiConfigs?: Record<string, string> | undefined
						customModePrompts?:
							| Record<
									string,
									| {
											roleDefinition?: string | undefined
											customInstructions?: string | undefined
									  }
									| undefined
							  >
							| undefined
						customSupportPrompts?: Record<string, string | undefined> | undefined
						enhancementApiConfigId?: string | undefined
					}
					text?: string | undefined
					images?: string[] | undefined
					newTab?: boolean | undefined
				}
			},
			{
				commandName: TaskCommandName.StartNewTask
				data: {
					configuration: {
						reasoningEffort?: "low" | "medium" | "high" | undefined
						apiProvider?:
							| "anthropic"
							| "glama"
							| "openrouter"
							| "bedrock"
							| "vertex"
							| "openai"
							| "ollama"
							| "vscode-lm"
							| "lmstudio"
							| "gemini"
							| "openai-native"
							| "xai"
							| "mistral"
							| "deepseek"
							| "unbound"
							| "requesty"
							| "human-relay"
							| "fake-ai"
							| undefined
						customInstructions?: string | undefined
						customModes?:
							| {
									name: string
									slug: string
									roleDefinition: string
									groups: (
										| "read"
										| "edit"
										| "browser"
										| "command"
										| "mcp"
										| "modes"
										| [
												"read" | "edit" | "browser" | "command" | "mcp" | "modes",
												{
													description?: string | undefined
													fileRegex?: string | undefined
												},
										  ]
									)[]
									customInstructions?: string | undefined
									source?: "global" | "project" | undefined
							  }[]
							| undefined
						apiModelId?: string | undefined
						apiKey?: string | undefined
						anthropicBaseUrl?: string | undefined
						anthropicUseAuthToken?: boolean | undefined
						glamaModelId?: string | undefined
						glamaApiKey?: string | undefined
						openRouterApiKey?: string | undefined
						openRouterModelId?: string | undefined
						openRouterBaseUrl?: string | undefined
						openRouterSpecificProvider?: string | undefined
						openRouterUseMiddleOutTransform?: boolean | undefined
						awsAccessKey?: string | undefined
						awsSecretKey?: string | undefined
						awsSessionToken?: string | undefined
						awsRegion?: string | undefined
						awsUseCrossRegionInference?: boolean | undefined
						awsUsePromptCache?: boolean | undefined
						awspromptCacheId?: string | undefined
						awsProfile?: string | undefined
						awsUseProfile?: boolean | undefined
						awsCustomArn?: string | undefined
						vertexKeyFile?: string | undefined
						vertexJsonCredentials?: string | undefined
						vertexProjectId?: string | undefined
						vertexRegion?: string | undefined
						openAiBaseUrl?: string | undefined
						openAiApiKey?: string | undefined
						openAiR1FormatEnabled?: boolean | undefined
						openAiModelId?: string | undefined
						openAiCustomModelInfo?:
							| {
									contextWindow: number
									supportsPromptCache: boolean
									maxTokens?: number | null | undefined
									supportsImages?: boolean | undefined
									supportsComputerUse?: boolean | undefined
									inputPrice?: number | undefined
									outputPrice?: number | undefined
									cacheWritesPrice?: number | undefined
									cacheReadsPrice?: number | undefined
									description?: string | undefined
									reasoningEffort?: "low" | "medium" | "high" | undefined
									thinking?: boolean | undefined
							  }
							| undefined
						openAiUseAzure?: boolean | undefined
						azureApiVersion?: string | undefined
						openAiStreamingEnabled?: boolean | undefined
						ollamaModelId?: string | undefined
						ollamaBaseUrl?: string | undefined
						vsCodeLmModelSelector?:
							| {
									id?: string | undefined
									vendor?: string | undefined
									family?: string | undefined
									version?: string | undefined
							  }
							| undefined
						lmStudioModelId?: string | undefined
						lmStudioBaseUrl?: string | undefined
						lmStudioDraftModelId?: string | undefined
						lmStudioSpeculativeDecodingEnabled?: boolean | undefined
						geminiApiKey?: string | undefined
						googleGeminiBaseUrl?: string | undefined
						openAiNativeApiKey?: string | undefined
						xaiApiKey?: string | undefined
						mistralApiKey?: string | undefined
						mistralCodestralUrl?: string | undefined
						deepSeekBaseUrl?: string | undefined
						deepSeekApiKey?: string | undefined
						unboundApiKey?: string | undefined
						unboundModelId?: string | undefined
						requestyApiKey?: string | undefined
						requestyModelId?: string | undefined
						modelMaxTokens?: number | undefined
						modelMaxThinkingTokens?: number | undefined
						includeMaxTokens?: boolean | undefined
						modelTemperature?: number | null | undefined
						rateLimitSeconds?: number | undefined
						fakeAi?: unknown
						currentApiConfigName?: string | undefined
						listApiConfigMeta?:
							| {
									id: string
									name: string
									apiProvider?:
										| "anthropic"
										| "glama"
										| "openrouter"
										| "bedrock"
										| "vertex"
										| "openai"
										| "ollama"
										| "vscode-lm"
										| "lmstudio"
										| "gemini"
										| "openai-native"
										| "xai"
										| "mistral"
										| "deepseek"
										| "unbound"
										| "requesty"
										| "human-relay"
										| "fake-ai"
										| undefined
							  }[]
							| undefined
						pinnedApiConfigs?: Record<string, boolean> | undefined
						lastShownAnnouncementId?: string | undefined
						taskHistory?:
							| {
									number: number
									task: string
									id: string
									ts: number
									tokensIn: number
									tokensOut: number
									totalCost: number
									cacheWrites?: number | undefined
									cacheReads?: number | undefined
									size?: number | undefined
							  }[]
							| undefined
						autoApprovalEnabled?: boolean | undefined
						alwaysAllowReadOnly?: boolean | undefined
						alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
						alwaysAllowWrite?: boolean | undefined
						alwaysAllowWriteOutsideWorkspace?: boolean | undefined
						writeDelayMs?: number | undefined
						alwaysAllowBrowser?: boolean | undefined
						alwaysApproveResubmit?: boolean | undefined
						requestDelaySeconds?: number | undefined
						alwaysAllowMcp?: boolean | undefined
						alwaysAllowModeSwitch?: boolean | undefined
						alwaysAllowSubtasks?: boolean | undefined
						alwaysAllowExecute?: boolean | undefined
						allowedCommands?: string[] | undefined
						browserToolEnabled?: boolean | undefined
						browserViewportSize?: string | undefined
						screenshotQuality?: number | undefined
						remoteBrowserEnabled?: boolean | undefined
						remoteBrowserHost?: string | undefined
						enableCheckpoints?: boolean | undefined
						checkpointStorage?: "task" | "workspace" | undefined
						ttsEnabled?: boolean | undefined
						ttsSpeed?: number | undefined
						soundEnabled?: boolean | undefined
						soundVolume?: number | undefined
						maxOpenTabsContext?: number | undefined
						maxWorkspaceFiles?: number | undefined
						showRooIgnoredFiles?: boolean | undefined
						maxReadFileLine?: number | undefined
						terminalOutputLineLimit?: number | undefined
						terminalShellIntegrationTimeout?: number | undefined
						terminalCommandDelay?: number | undefined
						terminalPowershellCounter?: boolean | undefined
						terminalZshClearEolMark?: boolean | undefined
						terminalZshOhMy?: boolean | undefined
						terminalZshP10k?: boolean | undefined
						terminalZdotdir?: boolean | undefined
						diffEnabled?: boolean | undefined
						fuzzyMatchThreshold?: number | undefined
						experiments?:
							| {
									powerSteering: boolean
							  }
							| undefined
						language?:
							| "ca"
							| "de"
							| "en"
							| "es"
							| "fr"
							| "hi"
							| "it"
							| "ja"
							| "ko"
							| "pl"
							| "pt-BR"
							| "ru"
							| "tr"
							| "vi"
							| "zh-CN"
							| "zh-TW"
							| undefined
						telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
						mcpEnabled?: boolean | undefined
						enableMcpServerCreation?: boolean | undefined
						mode?: string | undefined
						modeApiConfigs?: Record<string, string> | undefined
						customModePrompts?:
							| Record<
									string,
									| {
											roleDefinition?: string | undefined
											customInstructions?: string | undefined
									  }
									| undefined
							  >
							| undefined
						customSupportPrompts?: Record<string, string | undefined> | undefined
						enhancementApiConfigId?: string | undefined
					}
					text?: string | undefined
					images?: string[] | undefined
					newTab?: boolean | undefined
				}
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CancelTask>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CancelTask
				data: string
			},
			{
				commandName: TaskCommandName.CancelTask
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CloseTask>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CloseTask
				data: string
			},
			{
				commandName: TaskCommandName.CloseTask
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetCurrentTaskStack>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetCurrentTaskStack
				data?: undefined
			},
			{
				commandName: TaskCommandName.GetCurrentTaskStack
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.ClearCurrentTask>
				data: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.ClearCurrentTask
				data?: string | undefined
			},
			{
				commandName: TaskCommandName.ClearCurrentTask
				data?: string | undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CancelCurrentTask>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CancelCurrentTask
				data?: undefined
			},
			{
				commandName: TaskCommandName.CancelCurrentTask
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.SendMessage>
				data: z.ZodObject<
					{
						message: z.ZodOptional<z.ZodString>
						images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
					},
					"strip",
					z.ZodTypeAny,
					{
						message?: string | undefined
						images?: string[] | undefined
					},
					{
						message?: string | undefined
						images?: string[] | undefined
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.SendMessage
				data: {
					message?: string | undefined
					images?: string[] | undefined
				}
			},
			{
				commandName: TaskCommandName.SendMessage
				data: {
					message?: string | undefined
					images?: string[] | undefined
				}
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.PressPrimaryButton>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.PressPrimaryButton
				data?: undefined
			},
			{
				commandName: TaskCommandName.PressPrimaryButton
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.PressSecondaryButton>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.PressSecondaryButton
				data?: undefined
			},
			{
				commandName: TaskCommandName.PressSecondaryButton
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.SetConfiguration>
				data: z.ZodAny
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.SetConfiguration
				data?: any
			},
			{
				commandName: TaskCommandName.SetConfiguration
				data?: any
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.IsReady>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.IsReady
				data?: undefined
			},
			{
				commandName: TaskCommandName.IsReady
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetMessages>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetMessages
				data: string
			},
			{
				commandName: TaskCommandName.GetMessages
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetTokenUsage>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetTokenUsage
				data: string
			},
			{
				commandName: TaskCommandName.GetTokenUsage
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.Log>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.Log
				data: string
			},
			{
				commandName: TaskCommandName.Log
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.ResumeTask>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.ResumeTask
				data: string
			},
			{
				commandName: TaskCommandName.ResumeTask
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.IsTaskInHistory>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.IsTaskInHistory
				data: string
			},
			{
				commandName: TaskCommandName.IsTaskInHistory
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.CreateProfile>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.CreateProfile
				data: string
			},
			{
				commandName: TaskCommandName.CreateProfile
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.GetProfiles>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.GetProfiles
				data?: undefined
			},
			{
				commandName: TaskCommandName.GetProfiles
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.SetActiveProfile>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.SetActiveProfile
				data: string
			},
			{
				commandName: TaskCommandName.SetActiveProfile
				data: string
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.getActiveProfile>
				data: z.ZodUndefined
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.getActiveProfile
				data?: undefined
			},
			{
				commandName: TaskCommandName.getActiveProfile
				data?: undefined
			}
		>,
		z.ZodObject<
			{
				commandName: z.ZodLiteral<TaskCommandName.DeleteProfile>
				data: z.ZodString
			},
			"strip",
			z.ZodTypeAny,
			{
				commandName: TaskCommandName.DeleteProfile
				data: string
			},
			{
				commandName: TaskCommandName.DeleteProfile
				data: string
			}
		>,
	]
>
export type TaskCommand = z.infer<typeof taskCommandSchema>
/**
 * TaskEvent
 */
export declare enum EvalEventName {
	Pass = "pass",
	Fail = "fail",
}
export declare const taskEventSchema: z.ZodDiscriminatedUnion<
	"eventName",
	[
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.Message>
				payload: z.ZodTuple<
					[
						z.ZodObject<
							{
								taskId: z.ZodString
								action: z.ZodUnion<[z.ZodLiteral<"created">, z.ZodLiteral<"updated">]>
								message: z.ZodObject<
									{
										ts: z.ZodNumber
										type: z.ZodUnion<[z.ZodLiteral<"ask">, z.ZodLiteral<"say">]>
										ask: z.ZodOptional<
											z.ZodEnum<
												[
													"followup",
													"command",
													"command_output",
													"completion_result",
													"tool",
													"api_req_failed",
													"resume_task",
													"resume_completed_task",
													"mistake_limit_reached",
													"browser_action_launch",
													"use_mcp_server",
													"finishTask",
												]
											>
										>
										say: z.ZodOptional<
											z.ZodEnum<
												[
													"task",
													"error",
													"api_req_started",
													"api_req_finished",
													"api_req_retried",
													"api_req_retry_delayed",
													"api_req_deleted",
													"text",
													"reasoning",
													"completion_result",
													"user_feedback",
													"user_feedback_diff",
													"command_output",
													"tool",
													"shell_integration_warning",
													"browser_action",
													"browser_action_result",
													"command",
													"mcp_server_request_started",
													"mcp_server_response",
													"new_task_started",
													"new_task",
													"checkpoint_saved",
													"rooignore_error",
													"diff_error",
												]
											>
										>
										text: z.ZodOptional<z.ZodString>
										images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
										partial: z.ZodOptional<z.ZodBoolean>
										reasoning: z.ZodOptional<z.ZodString>
										conversationHistoryIndex: z.ZodOptional<z.ZodNumber>
										checkpoint: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>
										progressStatus: z.ZodOptional<
											z.ZodObject<
												{
													icon: z.ZodOptional<z.ZodString>
													text: z.ZodOptional<z.ZodString>
												},
												"strip",
												z.ZodTypeAny,
												{
													text?: string | undefined
													icon?: string | undefined
												},
												{
													text?: string | undefined
													icon?: string | undefined
												}
											>
										>
									},
									"strip",
									z.ZodTypeAny,
									{
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "command"
											| "followup"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "browser_action_launch"
											| "use_mcp_server"
											| "finishTask"
											| undefined
										say?:
											| "command"
											| "task"
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_deleted"
											| "text"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "browser_action"
											| "browser_action_result"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "new_task_started"
											| "new_task"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
									},
									{
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "command"
											| "followup"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "browser_action_launch"
											| "use_mcp_server"
											| "finishTask"
											| undefined
										say?:
											| "command"
											| "task"
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_deleted"
											| "text"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "browser_action"
											| "browser_action_result"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "new_task_started"
											| "new_task"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
									}
								>
							},
							"strip",
							z.ZodTypeAny,
							{
								message: {
									type: "ask" | "say"
									ts: number
									text?: string | undefined
									reasoning?: string | undefined
									ask?:
										| "command"
										| "followup"
										| "command_output"
										| "completion_result"
										| "tool"
										| "api_req_failed"
										| "resume_task"
										| "resume_completed_task"
										| "mistake_limit_reached"
										| "browser_action_launch"
										| "use_mcp_server"
										| "finishTask"
										| undefined
									say?:
										| "command"
										| "task"
										| "command_output"
										| "completion_result"
										| "tool"
										| "error"
										| "api_req_started"
										| "api_req_finished"
										| "api_req_retried"
										| "api_req_retry_delayed"
										| "api_req_deleted"
										| "text"
										| "reasoning"
										| "user_feedback"
										| "user_feedback_diff"
										| "shell_integration_warning"
										| "browser_action"
										| "browser_action_result"
										| "mcp_server_request_started"
										| "mcp_server_response"
										| "new_task_started"
										| "new_task"
										| "checkpoint_saved"
										| "rooignore_error"
										| "diff_error"
										| undefined
									images?: string[] | undefined
									partial?: boolean | undefined
									conversationHistoryIndex?: number | undefined
									checkpoint?: Record<string, unknown> | undefined
									progressStatus?:
										| {
												text?: string | undefined
												icon?: string | undefined
										  }
										| undefined
								}
								taskId: string
								action: "created" | "updated"
							},
							{
								message: {
									type: "ask" | "say"
									ts: number
									text?: string | undefined
									reasoning?: string | undefined
									ask?:
										| "command"
										| "followup"
										| "command_output"
										| "completion_result"
										| "tool"
										| "api_req_failed"
										| "resume_task"
										| "resume_completed_task"
										| "mistake_limit_reached"
										| "browser_action_launch"
										| "use_mcp_server"
										| "finishTask"
										| undefined
									say?:
										| "command"
										| "task"
										| "command_output"
										| "completion_result"
										| "tool"
										| "error"
										| "api_req_started"
										| "api_req_finished"
										| "api_req_retried"
										| "api_req_retry_delayed"
										| "api_req_deleted"
										| "text"
										| "reasoning"
										| "user_feedback"
										| "user_feedback_diff"
										| "shell_integration_warning"
										| "browser_action"
										| "browser_action_result"
										| "mcp_server_request_started"
										| "mcp_server_response"
										| "new_task_started"
										| "new_task"
										| "checkpoint_saved"
										| "rooignore_error"
										| "diff_error"
										| undefined
									images?: string[] | undefined
									partial?: boolean | undefined
									conversationHistoryIndex?: number | undefined
									checkpoint?: Record<string, unknown> | undefined
									progressStatus?:
										| {
												text?: string | undefined
												icon?: string | undefined
										  }
										| undefined
								}
								taskId: string
								action: "created" | "updated"
							}
						>,
					],
					null
				>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.Message
				payload: [
					{
						message: {
							type: "ask" | "say"
							ts: number
							text?: string | undefined
							reasoning?: string | undefined
							ask?:
								| "command"
								| "followup"
								| "command_output"
								| "completion_result"
								| "tool"
								| "api_req_failed"
								| "resume_task"
								| "resume_completed_task"
								| "mistake_limit_reached"
								| "browser_action_launch"
								| "use_mcp_server"
								| "finishTask"
								| undefined
							say?:
								| "command"
								| "task"
								| "command_output"
								| "completion_result"
								| "tool"
								| "error"
								| "api_req_started"
								| "api_req_finished"
								| "api_req_retried"
								| "api_req_retry_delayed"
								| "api_req_deleted"
								| "text"
								| "reasoning"
								| "user_feedback"
								| "user_feedback_diff"
								| "shell_integration_warning"
								| "browser_action"
								| "browser_action_result"
								| "mcp_server_request_started"
								| "mcp_server_response"
								| "new_task_started"
								| "new_task"
								| "checkpoint_saved"
								| "rooignore_error"
								| "diff_error"
								| undefined
							images?: string[] | undefined
							partial?: boolean | undefined
							conversationHistoryIndex?: number | undefined
							checkpoint?: Record<string, unknown> | undefined
							progressStatus?:
								| {
										text?: string | undefined
										icon?: string | undefined
								  }
								| undefined
						}
						taskId: string
						action: "created" | "updated"
					},
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.Message
				payload: [
					{
						message: {
							type: "ask" | "say"
							ts: number
							text?: string | undefined
							reasoning?: string | undefined
							ask?:
								| "command"
								| "followup"
								| "command_output"
								| "completion_result"
								| "tool"
								| "api_req_failed"
								| "resume_task"
								| "resume_completed_task"
								| "mistake_limit_reached"
								| "browser_action_launch"
								| "use_mcp_server"
								| "finishTask"
								| undefined
							say?:
								| "command"
								| "task"
								| "command_output"
								| "completion_result"
								| "tool"
								| "error"
								| "api_req_started"
								| "api_req_finished"
								| "api_req_retried"
								| "api_req_retry_delayed"
								| "api_req_deleted"
								| "text"
								| "reasoning"
								| "user_feedback"
								| "user_feedback_diff"
								| "shell_integration_warning"
								| "browser_action"
								| "browser_action_result"
								| "mcp_server_request_started"
								| "mcp_server_response"
								| "new_task_started"
								| "new_task"
								| "checkpoint_saved"
								| "rooignore_error"
								| "diff_error"
								| undefined
							images?: string[] | undefined
							partial?: boolean | undefined
							conversationHistoryIndex?: number | undefined
							checkpoint?: Record<string, unknown> | undefined
							progressStatus?:
								| {
										text?: string | undefined
										icon?: string | undefined
								  }
								| undefined
						}
						taskId: string
						action: "created" | "updated"
					},
				]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskCreated>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskCreated
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskCreated
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskStarted>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskStarted
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskStarted
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskModeSwitched>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskModeSwitched
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskModeSwitched
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskPaused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskPaused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskPaused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskUnpaused>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskUnpaused
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskUnpaused
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskAskResponded>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskAskResponded
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskAskResponded
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskAborted>
				payload: z.ZodTuple<[z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskAborted
				payload: [string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskAborted
				payload: [string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskSpawned>
				payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskSpawned
				payload: [string, string]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskSpawned
				payload: [string, string]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskCompleted>
				payload: z.ZodTuple<
					[
						z.ZodString,
						z.ZodObject<
							{
								totalTokensIn: z.ZodNumber
								totalTokensOut: z.ZodNumber
								totalCacheWrites: z.ZodOptional<z.ZodNumber>
								totalCacheReads: z.ZodOptional<z.ZodNumber>
								totalCost: z.ZodNumber
								contextTokens: z.ZodNumber
							},
							"strip",
							z.ZodTypeAny,
							{
								totalCost: number
								totalTokensIn: number
								totalTokensOut: number
								contextTokens: number
								totalCacheWrites?: number | undefined
								totalCacheReads?: number | undefined
							},
							{
								totalCost: number
								totalTokensIn: number
								totalTokensOut: number
								contextTokens: number
								totalCacheWrites?: number | undefined
								totalCacheReads?: number | undefined
							}
						>,
						z.ZodRecord<
							z.ZodEnum<
								[
									"execute_command",
									"read_file",
									"write_to_file",
									"append_to_file",
									"apply_diff",
									"insert_content",
									"search_and_replace",
									"search_files",
									"list_files",
									"list_code_definition_names",
									"browser_action",
									"use_mcp_tool",
									"access_mcp_resource",
									"ask_followup_question",
									"attempt_completion",
									"switch_mode",
									"new_task",
									"fetch_instructions",
								]
							>,
							z.ZodObject<
								{
									attempts: z.ZodNumber
									failures: z.ZodNumber
								},
								"strip",
								z.ZodTypeAny,
								{
									attempts: number
									failures: number
								},
								{
									attempts: number
									failures: number
								}
							>
						>,
					],
					null
				>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskCompleted
				payload: [
					string,
					{
						totalCost: number
						totalTokensIn: number
						totalTokensOut: number
						contextTokens: number
						totalCacheWrites?: number | undefined
						totalCacheReads?: number | undefined
					},
					Partial<
						Record<
							| "browser_action"
							| "new_task"
							| "execute_command"
							| "read_file"
							| "write_to_file"
							| "append_to_file"
							| "apply_diff"
							| "insert_content"
							| "search_and_replace"
							| "search_files"
							| "list_files"
							| "list_code_definition_names"
							| "use_mcp_tool"
							| "access_mcp_resource"
							| "ask_followup_question"
							| "attempt_completion"
							| "switch_mode"
							| "fetch_instructions",
							{
								attempts: number
								failures: number
							}
						>
					>,
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskCompleted
				payload: [
					string,
					{
						totalCost: number
						totalTokensIn: number
						totalTokensOut: number
						contextTokens: number
						totalCacheWrites?: number | undefined
						totalCacheReads?: number | undefined
					},
					Partial<
						Record<
							| "browser_action"
							| "new_task"
							| "execute_command"
							| "read_file"
							| "write_to_file"
							| "append_to_file"
							| "apply_diff"
							| "insert_content"
							| "search_and_replace"
							| "search_files"
							| "list_files"
							| "list_code_definition_names"
							| "use_mcp_tool"
							| "access_mcp_resource"
							| "ask_followup_question"
							| "attempt_completion"
							| "switch_mode"
							| "fetch_instructions",
							{
								attempts: number
								failures: number
							}
						>
					>,
				]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskTokenUsageUpdated>
				payload: z.ZodTuple<
					[
						z.ZodString,
						z.ZodObject<
							{
								totalTokensIn: z.ZodNumber
								totalTokensOut: z.ZodNumber
								totalCacheWrites: z.ZodOptional<z.ZodNumber>
								totalCacheReads: z.ZodOptional<z.ZodNumber>
								totalCost: z.ZodNumber
								contextTokens: z.ZodNumber
							},
							"strip",
							z.ZodTypeAny,
							{
								totalCost: number
								totalTokensIn: number
								totalTokensOut: number
								contextTokens: number
								totalCacheWrites?: number | undefined
								totalCacheReads?: number | undefined
							},
							{
								totalCost: number
								totalTokensIn: number
								totalTokensOut: number
								contextTokens: number
								totalCacheWrites?: number | undefined
								totalCacheReads?: number | undefined
							}
						>,
					],
					null
				>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskTokenUsageUpdated
				payload: [
					string,
					{
						totalCost: number
						totalTokensIn: number
						totalTokensOut: number
						contextTokens: number
						totalCacheWrites?: number | undefined
						totalCacheReads?: number | undefined
					},
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskTokenUsageUpdated
				payload: [
					string,
					{
						totalCost: number
						totalTokensIn: number
						totalTokensOut: number
						contextTokens: number
						totalCacheWrites?: number | undefined
						totalCacheReads?: number | undefined
					},
				]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<RooCodeEventName.TaskToolFailed>
				payload: z.ZodTuple<
					[
						z.ZodString,
						z.ZodEnum<
							[
								"execute_command",
								"read_file",
								"write_to_file",
								"append_to_file",
								"apply_diff",
								"insert_content",
								"search_and_replace",
								"search_files",
								"list_files",
								"list_code_definition_names",
								"browser_action",
								"use_mcp_tool",
								"access_mcp_resource",
								"ask_followup_question",
								"attempt_completion",
								"switch_mode",
								"new_task",
								"fetch_instructions",
							]
						>,
						z.ZodString,
					],
					null
				>
				taskId: z.ZodOptional<z.ZodNumber>
			},
			"strip",
			z.ZodTypeAny,
			{
				eventName: RooCodeEventName.TaskToolFailed
				payload: [
					string,
					(
						| "browser_action"
						| "new_task"
						| "execute_command"
						| "read_file"
						| "write_to_file"
						| "append_to_file"
						| "apply_diff"
						| "insert_content"
						| "search_and_replace"
						| "search_files"
						| "list_files"
						| "list_code_definition_names"
						| "use_mcp_tool"
						| "access_mcp_resource"
						| "ask_followup_question"
						| "attempt_completion"
						| "switch_mode"
						| "fetch_instructions"
					),
					string,
				]
				taskId?: number | undefined
			},
			{
				eventName: RooCodeEventName.TaskToolFailed
				payload: [
					string,
					(
						| "browser_action"
						| "new_task"
						| "execute_command"
						| "read_file"
						| "write_to_file"
						| "append_to_file"
						| "apply_diff"
						| "insert_content"
						| "search_and_replace"
						| "search_files"
						| "list_files"
						| "list_code_definition_names"
						| "use_mcp_tool"
						| "access_mcp_resource"
						| "ask_followup_question"
						| "attempt_completion"
						| "switch_mode"
						| "fetch_instructions"
					),
					string,
				]
				taskId?: number | undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<EvalEventName.Pass>
				payload: z.ZodUndefined
				taskId: z.ZodNumber
			},
			"strip",
			z.ZodTypeAny,
			{
				taskId: number
				eventName: EvalEventName.Pass
				payload?: undefined
			},
			{
				taskId: number
				eventName: EvalEventName.Pass
				payload?: undefined
			}
		>,
		z.ZodObject<
			{
				eventName: z.ZodLiteral<EvalEventName.Fail>
				payload: z.ZodUndefined
				taskId: z.ZodNumber
			},
			"strip",
			z.ZodTypeAny,
			{
				taskId: number
				eventName: EvalEventName.Fail
				payload?: undefined
			},
			{
				taskId: number
				eventName: EvalEventName.Fail
				payload?: undefined
			}
		>,
	]
>
export type TaskEvent = z.infer<typeof taskEventSchema>
/**
 * IpcMessage
 */
export declare enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
	EvalEvent = "EvalEvent",
}
export declare enum IpcOrigin {
	Client = "client",
	Server = "server",
}
export declare const ipcMessageSchema: z.ZodDiscriminatedUnion<
	"type",
	[
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.Ack>
				origin: z.ZodLiteral<IpcOrigin.Server>
				data: z.ZodObject<
					{
						clientId: z.ZodString
						pid: z.ZodNumber
						ppid: z.ZodNumber
					},
					"strip",
					z.ZodTypeAny,
					{
						clientId: string
						pid: number
						ppid: number
					},
					{
						clientId: string
						pid: number
						ppid: number
					}
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.Ack
				data: {
					clientId: string
					pid: number
					ppid: number
				}
				origin: IpcOrigin.Server
			},
			{
				type: IpcMessageType.Ack
				data: {
					clientId: string
					pid: number
					ppid: number
				}
				origin: IpcOrigin.Server
			}
		>,
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.TaskCommand>
				origin: z.ZodLiteral<IpcOrigin.Client>
				clientId: z.ZodString
				data: z.ZodDiscriminatedUnion<
					"commandName",
					[
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.StartNewTask>
								data: z.ZodObject<
									{
										configuration: z.ZodObject<
											{
												apiProvider: z.ZodOptional<
													z.ZodEnum<
														[
															"anthropic",
															"glama",
															"openrouter",
															"bedrock",
															"vertex",
															"openai",
															"ollama",
															"vscode-lm",
															"lmstudio",
															"gemini",
															"openai-native",
															"xai",
															"mistral",
															"deepseek",
															"unbound",
															"requesty",
															"human-relay",
															"fake-ai",
														]
													>
												>
												apiModelId: z.ZodOptional<z.ZodString>
												apiKey: z.ZodOptional<z.ZodString>
												anthropicBaseUrl: z.ZodOptional<z.ZodString>
												anthropicUseAuthToken: z.ZodOptional<z.ZodBoolean>
												glamaModelId: z.ZodOptional<z.ZodString>
												glamaApiKey: z.ZodOptional<z.ZodString>
												openRouterApiKey: z.ZodOptional<z.ZodString>
												openRouterModelId: z.ZodOptional<z.ZodString>
												openRouterBaseUrl: z.ZodOptional<z.ZodString>
												openRouterSpecificProvider: z.ZodOptional<z.ZodString>
												openRouterUseMiddleOutTransform: z.ZodOptional<z.ZodBoolean>
												awsAccessKey: z.ZodOptional<z.ZodString>
												awsSecretKey: z.ZodOptional<z.ZodString>
												awsSessionToken: z.ZodOptional<z.ZodString>
												awsRegion: z.ZodOptional<z.ZodString>
												awsUseCrossRegionInference: z.ZodOptional<z.ZodBoolean>
												awsUsePromptCache: z.ZodOptional<z.ZodBoolean>
												awspromptCacheId: z.ZodOptional<z.ZodString>
												awsProfile: z.ZodOptional<z.ZodString>
												awsUseProfile: z.ZodOptional<z.ZodBoolean>
												awsCustomArn: z.ZodOptional<z.ZodString>
												vertexKeyFile: z.ZodOptional<z.ZodString>
												vertexJsonCredentials: z.ZodOptional<z.ZodString>
												vertexProjectId: z.ZodOptional<z.ZodString>
												vertexRegion: z.ZodOptional<z.ZodString>
												openAiBaseUrl: z.ZodOptional<z.ZodString>
												openAiApiKey: z.ZodOptional<z.ZodString>
												openAiR1FormatEnabled: z.ZodOptional<z.ZodBoolean>
												openAiModelId: z.ZodOptional<z.ZodString>
												openAiCustomModelInfo: z.ZodOptional<
													z.ZodObject<
														{
															maxTokens: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
															contextWindow: z.ZodNumber
															supportsImages: z.ZodOptional<z.ZodBoolean>
															supportsComputerUse: z.ZodOptional<z.ZodBoolean>
															supportsPromptCache: z.ZodBoolean
															inputPrice: z.ZodOptional<z.ZodNumber>
															outputPrice: z.ZodOptional<z.ZodNumber>
															cacheWritesPrice: z.ZodOptional<z.ZodNumber>
															cacheReadsPrice: z.ZodOptional<z.ZodNumber>
															description: z.ZodOptional<z.ZodString>
															reasoningEffort: z.ZodOptional<
																z.ZodEnum<["low", "medium", "high"]>
															>
															thinking: z.ZodOptional<z.ZodBoolean>
														},
														"strip",
														z.ZodTypeAny,
														{
															contextWindow: number
															supportsPromptCache: boolean
															maxTokens?: number | null | undefined
															supportsImages?: boolean | undefined
															supportsComputerUse?: boolean | undefined
															inputPrice?: number | undefined
															outputPrice?: number | undefined
															cacheWritesPrice?: number | undefined
															cacheReadsPrice?: number | undefined
															description?: string | undefined
															reasoningEffort?: "low" | "medium" | "high" | undefined
															thinking?: boolean | undefined
														},
														{
															contextWindow: number
															supportsPromptCache: boolean
															maxTokens?: number | null | undefined
															supportsImages?: boolean | undefined
															supportsComputerUse?: boolean | undefined
															inputPrice?: number | undefined
															outputPrice?: number | undefined
															cacheWritesPrice?: number | undefined
															cacheReadsPrice?: number | undefined
															description?: string | undefined
															reasoningEffort?: "low" | "medium" | "high" | undefined
															thinking?: boolean | undefined
														}
													>
												>
												openAiUseAzure: z.ZodOptional<z.ZodBoolean>
												azureApiVersion: z.ZodOptional<z.ZodString>
												openAiStreamingEnabled: z.ZodOptional<z.ZodBoolean>
												ollamaModelId: z.ZodOptional<z.ZodString>
												ollamaBaseUrl: z.ZodOptional<z.ZodString>
												vsCodeLmModelSelector: z.ZodOptional<
													z.ZodObject<
														{
															vendor: z.ZodOptional<z.ZodString>
															family: z.ZodOptional<z.ZodString>
															version: z.ZodOptional<z.ZodString>
															id: z.ZodOptional<z.ZodString>
														},
														"strip",
														z.ZodTypeAny,
														{
															id?: string | undefined
															vendor?: string | undefined
															family?: string | undefined
															version?: string | undefined
														},
														{
															id?: string | undefined
															vendor?: string | undefined
															family?: string | undefined
															version?: string | undefined
														}
													>
												>
												lmStudioModelId: z.ZodOptional<z.ZodString>
												lmStudioBaseUrl: z.ZodOptional<z.ZodString>
												lmStudioDraftModelId: z.ZodOptional<z.ZodString>
												lmStudioSpeculativeDecodingEnabled: z.ZodOptional<z.ZodBoolean>
												geminiApiKey: z.ZodOptional<z.ZodString>
												googleGeminiBaseUrl: z.ZodOptional<z.ZodString>
												openAiNativeApiKey: z.ZodOptional<z.ZodString>
												xaiApiKey: z.ZodOptional<z.ZodString>
												mistralApiKey: z.ZodOptional<z.ZodString>
												mistralCodestralUrl: z.ZodOptional<z.ZodString>
												deepSeekBaseUrl: z.ZodOptional<z.ZodString>
												deepSeekApiKey: z.ZodOptional<z.ZodString>
												unboundApiKey: z.ZodOptional<z.ZodString>
												unboundModelId: z.ZodOptional<z.ZodString>
												requestyApiKey: z.ZodOptional<z.ZodString>
												requestyModelId: z.ZodOptional<z.ZodString>
												modelMaxTokens: z.ZodOptional<z.ZodNumber>
												modelMaxThinkingTokens: z.ZodOptional<z.ZodNumber>
												includeMaxTokens: z.ZodOptional<z.ZodBoolean>
												modelTemperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>
												reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>
												rateLimitSeconds: z.ZodOptional<z.ZodNumber>
												fakeAi: z.ZodOptional<z.ZodUnknown>
											} & {
												currentApiConfigName: z.ZodOptional<z.ZodString>
												listApiConfigMeta: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
															{
																id: z.ZodString
																name: z.ZodString
																apiProvider: z.ZodOptional<
																	z.ZodEnum<
																		[
																			"anthropic",
																			"glama",
																			"openrouter",
																			"bedrock",
																			"vertex",
																			"openai",
																			"ollama",
																			"vscode-lm",
																			"lmstudio",
																			"gemini",
																			"openai-native",
																			"xai",
																			"mistral",
																			"deepseek",
																			"unbound",
																			"requesty",
																			"human-relay",
																			"fake-ai",
																		]
																	>
																>
															},
															"strip",
															z.ZodTypeAny,
															{
																id: string
																name: string
																apiProvider?:
																	| "anthropic"
																	| "glama"
																	| "openrouter"
																	| "bedrock"
																	| "vertex"
																	| "openai"
																	| "ollama"
																	| "vscode-lm"
																	| "lmstudio"
																	| "gemini"
																	| "openai-native"
																	| "xai"
																	| "mistral"
																	| "deepseek"
																	| "unbound"
																	| "requesty"
																	| "human-relay"
																	| "fake-ai"
																	| undefined
															},
															{
																id: string
																name: string
																apiProvider?:
																	| "anthropic"
																	| "glama"
																	| "openrouter"
																	| "bedrock"
																	| "vertex"
																	| "openai"
																	| "ollama"
																	| "vscode-lm"
																	| "lmstudio"
																	| "gemini"
																	| "openai-native"
																	| "xai"
																	| "mistral"
																	| "deepseek"
																	| "unbound"
																	| "requesty"
																	| "human-relay"
																	| "fake-ai"
																	| undefined
															}
														>,
														"many"
													>
												>
												pinnedApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>
												lastShownAnnouncementId: z.ZodOptional<z.ZodString>
												customInstructions: z.ZodOptional<z.ZodString>
												taskHistory: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
															{
																id: z.ZodString
																number: z.ZodNumber
																ts: z.ZodNumber
																task: z.ZodString
																tokensIn: z.ZodNumber
																tokensOut: z.ZodNumber
																cacheWrites: z.ZodOptional<z.ZodNumber>
																cacheReads: z.ZodOptional<z.ZodNumber>
																totalCost: z.ZodNumber
																size: z.ZodOptional<z.ZodNumber>
															},
															"strip",
															z.ZodTypeAny,
															{
																number: number
																task: string
																id: string
																ts: number
																tokensIn: number
																tokensOut: number
																totalCost: number
																cacheWrites?: number | undefined
																cacheReads?: number | undefined
																size?: number | undefined
															},
															{
																number: number
																task: string
																id: string
																ts: number
																tokensIn: number
																tokensOut: number
																totalCost: number
																cacheWrites?: number | undefined
																cacheReads?: number | undefined
																size?: number | undefined
															}
														>,
														"many"
													>
												>
												autoApprovalEnabled: z.ZodOptional<z.ZodBoolean>
												alwaysAllowReadOnly: z.ZodOptional<z.ZodBoolean>
												alwaysAllowReadOnlyOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
												alwaysAllowWrite: z.ZodOptional<z.ZodBoolean>
												alwaysAllowWriteOutsideWorkspace: z.ZodOptional<z.ZodBoolean>
												writeDelayMs: z.ZodOptional<z.ZodNumber>
												alwaysAllowBrowser: z.ZodOptional<z.ZodBoolean>
												alwaysApproveResubmit: z.ZodOptional<z.ZodBoolean>
												requestDelaySeconds: z.ZodOptional<z.ZodNumber>
												alwaysAllowMcp: z.ZodOptional<z.ZodBoolean>
												alwaysAllowModeSwitch: z.ZodOptional<z.ZodBoolean>
												alwaysAllowSubtasks: z.ZodOptional<z.ZodBoolean>
												alwaysAllowExecute: z.ZodOptional<z.ZodBoolean>
												allowedCommands: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
												browserToolEnabled: z.ZodOptional<z.ZodBoolean>
												browserViewportSize: z.ZodOptional<z.ZodString>
												screenshotQuality: z.ZodOptional<z.ZodNumber>
												remoteBrowserEnabled: z.ZodOptional<z.ZodBoolean>
												remoteBrowserHost: z.ZodOptional<z.ZodString>
												enableCheckpoints: z.ZodOptional<z.ZodBoolean>
												checkpointStorage: z.ZodOptional<z.ZodEnum<["task", "workspace"]>>
												ttsEnabled: z.ZodOptional<z.ZodBoolean>
												ttsSpeed: z.ZodOptional<z.ZodNumber>
												soundEnabled: z.ZodOptional<z.ZodBoolean>
												soundVolume: z.ZodOptional<z.ZodNumber>
												maxOpenTabsContext: z.ZodOptional<z.ZodNumber>
												maxWorkspaceFiles: z.ZodOptional<z.ZodNumber>
												showRooIgnoredFiles: z.ZodOptional<z.ZodBoolean>
												maxReadFileLine: z.ZodOptional<z.ZodNumber>
												terminalOutputLineLimit: z.ZodOptional<z.ZodNumber>
												terminalShellIntegrationTimeout: z.ZodOptional<z.ZodNumber>
												terminalCommandDelay: z.ZodOptional<z.ZodNumber>
												terminalPowershellCounter: z.ZodOptional<z.ZodBoolean>
												terminalZshClearEolMark: z.ZodOptional<z.ZodBoolean>
												terminalZshOhMy: z.ZodOptional<z.ZodBoolean>
												terminalZshP10k: z.ZodOptional<z.ZodBoolean>
												terminalZdotdir: z.ZodOptional<z.ZodBoolean>
												diffEnabled: z.ZodOptional<z.ZodBoolean>
												fuzzyMatchThreshold: z.ZodOptional<z.ZodNumber>
												experiments: z.ZodOptional<
													z.ZodObject<
														{
															powerSteering: z.ZodBoolean
														},
														"strip",
														z.ZodTypeAny,
														{
															powerSteering: boolean
														},
														{
															powerSteering: boolean
														}
													>
												>
												language: z.ZodOptional<
													z.ZodEnum<
														[
															"ca",
															"de",
															"en",
															"es",
															"fr",
															"hi",
															"it",
															"ja",
															"ko",
															"pl",
															"pt-BR",
															"ru",
															"tr",
															"vi",
															"zh-CN",
															"zh-TW",
														]
													>
												>
												telemetrySetting: z.ZodOptional<
													z.ZodEnum<["unset", "enabled", "disabled"]>
												>
												mcpEnabled: z.ZodOptional<z.ZodBoolean>
												enableMcpServerCreation: z.ZodOptional<z.ZodBoolean>
												mode: z.ZodOptional<z.ZodString>
												modeApiConfigs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>
												customModes: z.ZodOptional<
													z.ZodArray<
														z.ZodObject<
															{
																slug: z.ZodString
																name: z.ZodString
																roleDefinition: z.ZodString
																customInstructions: z.ZodOptional<z.ZodString>
																groups: z.ZodEffects<
																	z.ZodArray<
																		z.ZodUnion<
																			[
																				z.ZodEnum<
																					[
																						"read",
																						"edit",
																						"browser",
																						"command",
																						"mcp",
																						"modes",
																					]
																				>,
																				z.ZodTuple<
																					[
																						z.ZodEnum<
																							[
																								"read",
																								"edit",
																								"browser",
																								"command",
																								"mcp",
																								"modes",
																							]
																						>,
																						z.ZodObject<
																							{
																								fileRegex: z.ZodEffects<
																									z.ZodOptional<z.ZodString>,
																									string | undefined,
																									string | undefined
																								>
																								description: z.ZodOptional<z.ZodString>
																							},
																							"strip",
																							z.ZodTypeAny,
																							{
																								description?:
																									| string
																									| undefined
																								fileRegex?:
																									| string
																									| undefined
																							},
																							{
																								description?:
																									| string
																									| undefined
																								fileRegex?:
																									| string
																									| undefined
																							}
																						>,
																					],
																					null
																				>,
																			]
																		>,
																		"many"
																	>,
																	(
																		| "read"
																		| "edit"
																		| "browser"
																		| "command"
																		| "mcp"
																		| "modes"
																		| [
																				(
																					| "read"
																					| "edit"
																					| "browser"
																					| "command"
																					| "mcp"
																					| "modes"
																				),
																				{
																					description?: string | undefined
																					fileRegex?: string | undefined
																				},
																		  ]
																	)[],
																	(
																		| "read"
																		| "edit"
																		| "browser"
																		| "command"
																		| "mcp"
																		| "modes"
																		| [
																				(
																					| "read"
																					| "edit"
																					| "browser"
																					| "command"
																					| "mcp"
																					| "modes"
																				),
																				{
																					description?: string | undefined
																					fileRegex?: string | undefined
																				},
																		  ]
																	)[]
																>
																source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
															},
															"strip",
															z.ZodTypeAny,
															{
																name: string
																slug: string
																roleDefinition: string
																groups: (
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																	| [
																			(
																				| "read"
																				| "edit"
																				| "browser"
																				| "command"
																				| "mcp"
																				| "modes"
																			),
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			},
																	  ]
																)[]
																customInstructions?: string | undefined
																source?: "global" | "project" | undefined
															},
															{
																name: string
																slug: string
																roleDefinition: string
																groups: (
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																	| [
																			(
																				| "read"
																				| "edit"
																				| "browser"
																				| "command"
																				| "mcp"
																				| "modes"
																			),
																			{
																				description?: string | undefined
																				fileRegex?: string | undefined
																			},
																	  ]
																)[]
																customInstructions?: string | undefined
																source?: "global" | "project" | undefined
															}
														>,
														"many"
													>
												>
												customModePrompts: z.ZodOptional<
													z.ZodRecord<
														z.ZodString,
														z.ZodOptional<
															z.ZodObject<
																{
																	roleDefinition: z.ZodOptional<z.ZodString>
																	customInstructions: z.ZodOptional<z.ZodString>
																},
																"strip",
																z.ZodTypeAny,
																{
																	roleDefinition?: string | undefined
																	customInstructions?: string | undefined
																},
																{
																	roleDefinition?: string | undefined
																	customInstructions?: string | undefined
																}
															>
														>
													>
												>
												customSupportPrompts: z.ZodOptional<
													z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
												>
												enhancementApiConfigId: z.ZodOptional<z.ZodString>
											},
											"strip",
											z.ZodTypeAny,
											{
												reasoningEffort?: "low" | "medium" | "high" | undefined
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
												customInstructions?: string | undefined
												customModes?:
													| {
															name: string
															slug: string
															roleDefinition: string
															groups: (
																| "read"
																| "edit"
																| "browser"
																| "command"
																| "mcp"
																| "modes"
																| [
																		(
																			| "read"
																			| "edit"
																			| "browser"
																			| "command"
																			| "mcp"
																			| "modes"
																		),
																		{
																			description?: string | undefined
																			fileRegex?: string | undefined
																		},
																  ]
															)[]
															customInstructions?: string | undefined
															source?: "global" | "project" | undefined
													  }[]
													| undefined
												apiModelId?: string | undefined
												apiKey?: string | undefined
												anthropicBaseUrl?: string | undefined
												anthropicUseAuthToken?: boolean | undefined
												glamaModelId?: string | undefined
												glamaApiKey?: string | undefined
												openRouterApiKey?: string | undefined
												openRouterModelId?: string | undefined
												openRouterBaseUrl?: string | undefined
												openRouterSpecificProvider?: string | undefined
												openRouterUseMiddleOutTransform?: boolean | undefined
												awsAccessKey?: string | undefined
												awsSecretKey?: string | undefined
												awsSessionToken?: string | undefined
												awsRegion?: string | undefined
												awsUseCrossRegionInference?: boolean | undefined
												awsUsePromptCache?: boolean | undefined
												awspromptCacheId?: string | undefined
												awsProfile?: string | undefined
												awsUseProfile?: boolean | undefined
												awsCustomArn?: string | undefined
												vertexKeyFile?: string | undefined
												vertexJsonCredentials?: string | undefined
												vertexProjectId?: string | undefined
												vertexRegion?: string | undefined
												openAiBaseUrl?: string | undefined
												openAiApiKey?: string | undefined
												openAiR1FormatEnabled?: boolean | undefined
												openAiModelId?: string | undefined
												openAiCustomModelInfo?:
													| {
															contextWindow: number
															supportsPromptCache: boolean
															maxTokens?: number | null | undefined
															supportsImages?: boolean | undefined
															supportsComputerUse?: boolean | undefined
															inputPrice?: number | undefined
															outputPrice?: number | undefined
															cacheWritesPrice?: number | undefined
															cacheReadsPrice?: number | undefined
															description?: string | undefined
															reasoningEffort?: "low" | "medium" | "high" | undefined
															thinking?: boolean | undefined
													  }
													| undefined
												openAiUseAzure?: boolean | undefined
												azureApiVersion?: string | undefined
												openAiStreamingEnabled?: boolean | undefined
												ollamaModelId?: string | undefined
												ollamaBaseUrl?: string | undefined
												vsCodeLmModelSelector?:
													| {
															id?: string | undefined
															vendor?: string | undefined
															family?: string | undefined
															version?: string | undefined
													  }
													| undefined
												lmStudioModelId?: string | undefined
												lmStudioBaseUrl?: string | undefined
												lmStudioDraftModelId?: string | undefined
												lmStudioSpeculativeDecodingEnabled?: boolean | undefined
												geminiApiKey?: string | undefined
												googleGeminiBaseUrl?: string | undefined
												openAiNativeApiKey?: string | undefined
												xaiApiKey?: string | undefined
												mistralApiKey?: string | undefined
												mistralCodestralUrl?: string | undefined
												deepSeekBaseUrl?: string | undefined
												deepSeekApiKey?: string | undefined
												unboundApiKey?: string | undefined
												unboundModelId?: string | undefined
												requestyApiKey?: string | undefined
												requestyModelId?: string | undefined
												modelMaxTokens?: number | undefined
												modelMaxThinkingTokens?: number | undefined
												includeMaxTokens?: boolean | undefined
												modelTemperature?: number | null | undefined
												rateLimitSeconds?: number | undefined
												fakeAi?: unknown
												currentApiConfigName?: string | undefined
												listApiConfigMeta?:
													| {
															id: string
															name: string
															apiProvider?:
																| "anthropic"
																| "glama"
																| "openrouter"
																| "bedrock"
																| "vertex"
																| "openai"
																| "ollama"
																| "vscode-lm"
																| "lmstudio"
																| "gemini"
																| "openai-native"
																| "xai"
																| "mistral"
																| "deepseek"
																| "unbound"
																| "requesty"
																| "human-relay"
																| "fake-ai"
																| undefined
													  }[]
													| undefined
												pinnedApiConfigs?: Record<string, boolean> | undefined
												lastShownAnnouncementId?: string | undefined
												taskHistory?:
													| {
															number: number
															task: string
															id: string
															ts: number
															tokensIn: number
															tokensOut: number
															totalCost: number
															cacheWrites?: number | undefined
															cacheReads?: number | undefined
															size?: number | undefined
													  }[]
													| undefined
												autoApprovalEnabled?: boolean | undefined
												alwaysAllowReadOnly?: boolean | undefined
												alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
												alwaysAllowWrite?: boolean | undefined
												alwaysAllowWriteOutsideWorkspace?: boolean | undefined
												writeDelayMs?: number | undefined
												alwaysAllowBrowser?: boolean | undefined
												alwaysApproveResubmit?: boolean | undefined
												requestDelaySeconds?: number | undefined
												alwaysAllowMcp?: boolean | undefined
												alwaysAllowModeSwitch?: boolean | undefined
												alwaysAllowSubtasks?: boolean | undefined
												alwaysAllowExecute?: boolean | undefined
												allowedCommands?: string[] | undefined
												browserToolEnabled?: boolean | undefined
												browserViewportSize?: string | undefined
												screenshotQuality?: number | undefined
												remoteBrowserEnabled?: boolean | undefined
												remoteBrowserHost?: string | undefined
												enableCheckpoints?: boolean | undefined
												checkpointStorage?: "task" | "workspace" | undefined
												ttsEnabled?: boolean | undefined
												ttsSpeed?: number | undefined
												soundEnabled?: boolean | undefined
												soundVolume?: number | undefined
												maxOpenTabsContext?: number | undefined
												maxWorkspaceFiles?: number | undefined
												showRooIgnoredFiles?: boolean | undefined
												maxReadFileLine?: number | undefined
												terminalOutputLineLimit?: number | undefined
												terminalShellIntegrationTimeout?: number | undefined
												terminalCommandDelay?: number | undefined
												terminalPowershellCounter?: boolean | undefined
												terminalZshClearEolMark?: boolean | undefined
												terminalZshOhMy?: boolean | undefined
												terminalZshP10k?: boolean | undefined
												terminalZdotdir?: boolean | undefined
												diffEnabled?: boolean | undefined
												fuzzyMatchThreshold?: number | undefined
												experiments?:
													| {
															powerSteering: boolean
													  }
													| undefined
												language?:
													| "ca"
													| "de"
													| "en"
													| "es"
													| "fr"
													| "hi"
													| "it"
													| "ja"
													| "ko"
													| "pl"
													| "pt-BR"
													| "ru"
													| "tr"
													| "vi"
													| "zh-CN"
													| "zh-TW"
													| undefined
												telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
												mcpEnabled?: boolean | undefined
												enableMcpServerCreation?: boolean | undefined
												mode?: string | undefined
												modeApiConfigs?: Record<string, string> | undefined
												customModePrompts?:
													| Record<
															string,
															| {
																	roleDefinition?: string | undefined
																	customInstructions?: string | undefined
															  }
															| undefined
													  >
													| undefined
												customSupportPrompts?: Record<string, string | undefined> | undefined
												enhancementApiConfigId?: string | undefined
											},
											{
												reasoningEffort?: "low" | "medium" | "high" | undefined
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
												customInstructions?: string | undefined
												customModes?:
													| {
															name: string
															slug: string
															roleDefinition: string
															groups: (
																| "read"
																| "edit"
																| "browser"
																| "command"
																| "mcp"
																| "modes"
																| [
																		(
																			| "read"
																			| "edit"
																			| "browser"
																			| "command"
																			| "mcp"
																			| "modes"
																		),
																		{
																			description?: string | undefined
																			fileRegex?: string | undefined
																		},
																  ]
															)[]
															customInstructions?: string | undefined
															source?: "global" | "project" | undefined
													  }[]
													| undefined
												apiModelId?: string | undefined
												apiKey?: string | undefined
												anthropicBaseUrl?: string | undefined
												anthropicUseAuthToken?: boolean | undefined
												glamaModelId?: string | undefined
												glamaApiKey?: string | undefined
												openRouterApiKey?: string | undefined
												openRouterModelId?: string | undefined
												openRouterBaseUrl?: string | undefined
												openRouterSpecificProvider?: string | undefined
												openRouterUseMiddleOutTransform?: boolean | undefined
												awsAccessKey?: string | undefined
												awsSecretKey?: string | undefined
												awsSessionToken?: string | undefined
												awsRegion?: string | undefined
												awsUseCrossRegionInference?: boolean | undefined
												awsUsePromptCache?: boolean | undefined
												awspromptCacheId?: string | undefined
												awsProfile?: string | undefined
												awsUseProfile?: boolean | undefined
												awsCustomArn?: string | undefined
												vertexKeyFile?: string | undefined
												vertexJsonCredentials?: string | undefined
												vertexProjectId?: string | undefined
												vertexRegion?: string | undefined
												openAiBaseUrl?: string | undefined
												openAiApiKey?: string | undefined
												openAiR1FormatEnabled?: boolean | undefined
												openAiModelId?: string | undefined
												openAiCustomModelInfo?:
													| {
															contextWindow: number
															supportsPromptCache: boolean
															maxTokens?: number | null | undefined
															supportsImages?: boolean | undefined
															supportsComputerUse?: boolean | undefined
															inputPrice?: number | undefined
															outputPrice?: number | undefined
															cacheWritesPrice?: number | undefined
															cacheReadsPrice?: number | undefined
															description?: string | undefined
															reasoningEffort?: "low" | "medium" | "high" | undefined
															thinking?: boolean | undefined
													  }
													| undefined
												openAiUseAzure?: boolean | undefined
												azureApiVersion?: string | undefined
												openAiStreamingEnabled?: boolean | undefined
												ollamaModelId?: string | undefined
												ollamaBaseUrl?: string | undefined
												vsCodeLmModelSelector?:
													| {
															id?: string | undefined
															vendor?: string | undefined
															family?: string | undefined
															version?: string | undefined
													  }
													| undefined
												lmStudioModelId?: string | undefined
												lmStudioBaseUrl?: string | undefined
												lmStudioDraftModelId?: string | undefined
												lmStudioSpeculativeDecodingEnabled?: boolean | undefined
												geminiApiKey?: string | undefined
												googleGeminiBaseUrl?: string | undefined
												openAiNativeApiKey?: string | undefined
												xaiApiKey?: string | undefined
												mistralApiKey?: string | undefined
												mistralCodestralUrl?: string | undefined
												deepSeekBaseUrl?: string | undefined
												deepSeekApiKey?: string | undefined
												unboundApiKey?: string | undefined
												unboundModelId?: string | undefined
												requestyApiKey?: string | undefined
												requestyModelId?: string | undefined
												modelMaxTokens?: number | undefined
												modelMaxThinkingTokens?: number | undefined
												includeMaxTokens?: boolean | undefined
												modelTemperature?: number | null | undefined
												rateLimitSeconds?: number | undefined
												fakeAi?: unknown
												currentApiConfigName?: string | undefined
												listApiConfigMeta?:
													| {
															id: string
															name: string
															apiProvider?:
																| "anthropic"
																| "glama"
																| "openrouter"
																| "bedrock"
																| "vertex"
																| "openai"
																| "ollama"
																| "vscode-lm"
																| "lmstudio"
																| "gemini"
																| "openai-native"
																| "xai"
																| "mistral"
																| "deepseek"
																| "unbound"
																| "requesty"
																| "human-relay"
																| "fake-ai"
																| undefined
													  }[]
													| undefined
												pinnedApiConfigs?: Record<string, boolean> | undefined
												lastShownAnnouncementId?: string | undefined
												taskHistory?:
													| {
															number: number
															task: string
															id: string
															ts: number
															tokensIn: number
															tokensOut: number
															totalCost: number
															cacheWrites?: number | undefined
															cacheReads?: number | undefined
															size?: number | undefined
													  }[]
													| undefined
												autoApprovalEnabled?: boolean | undefined
												alwaysAllowReadOnly?: boolean | undefined
												alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
												alwaysAllowWrite?: boolean | undefined
												alwaysAllowWriteOutsideWorkspace?: boolean | undefined
												writeDelayMs?: number | undefined
												alwaysAllowBrowser?: boolean | undefined
												alwaysApproveResubmit?: boolean | undefined
												requestDelaySeconds?: number | undefined
												alwaysAllowMcp?: boolean | undefined
												alwaysAllowModeSwitch?: boolean | undefined
												alwaysAllowSubtasks?: boolean | undefined
												alwaysAllowExecute?: boolean | undefined
												allowedCommands?: string[] | undefined
												browserToolEnabled?: boolean | undefined
												browserViewportSize?: string | undefined
												screenshotQuality?: number | undefined
												remoteBrowserEnabled?: boolean | undefined
												remoteBrowserHost?: string | undefined
												enableCheckpoints?: boolean | undefined
												checkpointStorage?: "task" | "workspace" | undefined
												ttsEnabled?: boolean | undefined
												ttsSpeed?: number | undefined
												soundEnabled?: boolean | undefined
												soundVolume?: number | undefined
												maxOpenTabsContext?: number | undefined
												maxWorkspaceFiles?: number | undefined
												showRooIgnoredFiles?: boolean | undefined
												maxReadFileLine?: number | undefined
												terminalOutputLineLimit?: number | undefined
												terminalShellIntegrationTimeout?: number | undefined
												terminalCommandDelay?: number | undefined
												terminalPowershellCounter?: boolean | undefined
												terminalZshClearEolMark?: boolean | undefined
												terminalZshOhMy?: boolean | undefined
												terminalZshP10k?: boolean | undefined
												terminalZdotdir?: boolean | undefined
												diffEnabled?: boolean | undefined
												fuzzyMatchThreshold?: number | undefined
												experiments?:
													| {
															powerSteering: boolean
													  }
													| undefined
												language?:
													| "ca"
													| "de"
													| "en"
													| "es"
													| "fr"
													| "hi"
													| "it"
													| "ja"
													| "ko"
													| "pl"
													| "pt-BR"
													| "ru"
													| "tr"
													| "vi"
													| "zh-CN"
													| "zh-TW"
													| undefined
												telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
												mcpEnabled?: boolean | undefined
												enableMcpServerCreation?: boolean | undefined
												mode?: string | undefined
												modeApiConfigs?: Record<string, string> | undefined
												customModePrompts?:
													| Record<
															string,
															| {
																	roleDefinition?: string | undefined
																	customInstructions?: string | undefined
															  }
															| undefined
													  >
													| undefined
												customSupportPrompts?: Record<string, string | undefined> | undefined
												enhancementApiConfigId?: string | undefined
											}
										>
										text: z.ZodOptional<z.ZodString>
										images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
										newTab: z.ZodOptional<z.ZodBoolean>
									},
									"strip",
									z.ZodTypeAny,
									{
										configuration: {
											reasoningEffort?: "low" | "medium" | "high" | undefined
											apiProvider?:
												| "anthropic"
												| "glama"
												| "openrouter"
												| "bedrock"
												| "vertex"
												| "openai"
												| "ollama"
												| "vscode-lm"
												| "lmstudio"
												| "gemini"
												| "openai-native"
												| "xai"
												| "mistral"
												| "deepseek"
												| "unbound"
												| "requesty"
												| "human-relay"
												| "fake-ai"
												| undefined
											customInstructions?: string | undefined
											customModes?:
												| {
														name: string
														slug: string
														roleDefinition: string
														groups: (
															| "read"
															| "edit"
															| "browser"
															| "command"
															| "mcp"
															| "modes"
															| [
																	(
																		| "read"
																		| "edit"
																		| "browser"
																		| "command"
																		| "mcp"
																		| "modes"
																	),
																	{
																		description?: string | undefined
																		fileRegex?: string | undefined
																	},
															  ]
														)[]
														customInstructions?: string | undefined
														source?: "global" | "project" | undefined
												  }[]
												| undefined
											apiModelId?: string | undefined
											apiKey?: string | undefined
											anthropicBaseUrl?: string | undefined
											anthropicUseAuthToken?: boolean | undefined
											glamaModelId?: string | undefined
											glamaApiKey?: string | undefined
											openRouterApiKey?: string | undefined
											openRouterModelId?: string | undefined
											openRouterBaseUrl?: string | undefined
											openRouterSpecificProvider?: string | undefined
											openRouterUseMiddleOutTransform?: boolean | undefined
											awsAccessKey?: string | undefined
											awsSecretKey?: string | undefined
											awsSessionToken?: string | undefined
											awsRegion?: string | undefined
											awsUseCrossRegionInference?: boolean | undefined
											awsUsePromptCache?: boolean | undefined
											awspromptCacheId?: string | undefined
											awsProfile?: string | undefined
											awsUseProfile?: boolean | undefined
											awsCustomArn?: string | undefined
											vertexKeyFile?: string | undefined
											vertexJsonCredentials?: string | undefined
											vertexProjectId?: string | undefined
											vertexRegion?: string | undefined
											openAiBaseUrl?: string | undefined
											openAiApiKey?: string | undefined
											openAiR1FormatEnabled?: boolean | undefined
											openAiModelId?: string | undefined
											openAiCustomModelInfo?:
												| {
														contextWindow: number
														supportsPromptCache: boolean
														maxTokens?: number | null | undefined
														supportsImages?: boolean | undefined
														supportsComputerUse?: boolean | undefined
														inputPrice?: number | undefined
														outputPrice?: number | undefined
														cacheWritesPrice?: number | undefined
														cacheReadsPrice?: number | undefined
														description?: string | undefined
														reasoningEffort?: "low" | "medium" | "high" | undefined
														thinking?: boolean | undefined
												  }
												| undefined
											openAiUseAzure?: boolean | undefined
											azureApiVersion?: string | undefined
											openAiStreamingEnabled?: boolean | undefined
											ollamaModelId?: string | undefined
											ollamaBaseUrl?: string | undefined
											vsCodeLmModelSelector?:
												| {
														id?: string | undefined
														vendor?: string | undefined
														family?: string | undefined
														version?: string | undefined
												  }
												| undefined
											lmStudioModelId?: string | undefined
											lmStudioBaseUrl?: string | undefined
											lmStudioDraftModelId?: string | undefined
											lmStudioSpeculativeDecodingEnabled?: boolean | undefined
											geminiApiKey?: string | undefined
											googleGeminiBaseUrl?: string | undefined
											openAiNativeApiKey?: string | undefined
											xaiApiKey?: string | undefined
											mistralApiKey?: string | undefined
											mistralCodestralUrl?: string | undefined
											deepSeekBaseUrl?: string | undefined
											deepSeekApiKey?: string | undefined
											unboundApiKey?: string | undefined
											unboundModelId?: string | undefined
											requestyApiKey?: string | undefined
											requestyModelId?: string | undefined
											modelMaxTokens?: number | undefined
											modelMaxThinkingTokens?: number | undefined
											includeMaxTokens?: boolean | undefined
											modelTemperature?: number | null | undefined
											rateLimitSeconds?: number | undefined
											fakeAi?: unknown
											currentApiConfigName?: string | undefined
											listApiConfigMeta?:
												| {
														id: string
														name: string
														apiProvider?:
															| "anthropic"
															| "glama"
															| "openrouter"
															| "bedrock"
															| "vertex"
															| "openai"
															| "ollama"
															| "vscode-lm"
															| "lmstudio"
															| "gemini"
															| "openai-native"
															| "xai"
															| "mistral"
															| "deepseek"
															| "unbound"
															| "requesty"
															| "human-relay"
															| "fake-ai"
															| undefined
												  }[]
												| undefined
											pinnedApiConfigs?: Record<string, boolean> | undefined
											lastShownAnnouncementId?: string | undefined
											taskHistory?:
												| {
														number: number
														task: string
														id: string
														ts: number
														tokensIn: number
														tokensOut: number
														totalCost: number
														cacheWrites?: number | undefined
														cacheReads?: number | undefined
														size?: number | undefined
												  }[]
												| undefined
											autoApprovalEnabled?: boolean | undefined
											alwaysAllowReadOnly?: boolean | undefined
											alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
											alwaysAllowWrite?: boolean | undefined
											alwaysAllowWriteOutsideWorkspace?: boolean | undefined
											writeDelayMs?: number | undefined
											alwaysAllowBrowser?: boolean | undefined
											alwaysApproveResubmit?: boolean | undefined
											requestDelaySeconds?: number | undefined
											alwaysAllowMcp?: boolean | undefined
											alwaysAllowModeSwitch?: boolean | undefined
											alwaysAllowSubtasks?: boolean | undefined
											alwaysAllowExecute?: boolean | undefined
											allowedCommands?: string[] | undefined
											browserToolEnabled?: boolean | undefined
											browserViewportSize?: string | undefined
											screenshotQuality?: number | undefined
											remoteBrowserEnabled?: boolean | undefined
											remoteBrowserHost?: string | undefined
											enableCheckpoints?: boolean | undefined
											checkpointStorage?: "task" | "workspace" | undefined
											ttsEnabled?: boolean | undefined
											ttsSpeed?: number | undefined
											soundEnabled?: boolean | undefined
											soundVolume?: number | undefined
											maxOpenTabsContext?: number | undefined
											maxWorkspaceFiles?: number | undefined
											showRooIgnoredFiles?: boolean | undefined
											maxReadFileLine?: number | undefined
											terminalOutputLineLimit?: number | undefined
											terminalShellIntegrationTimeout?: number | undefined
											terminalCommandDelay?: number | undefined
											terminalPowershellCounter?: boolean | undefined
											terminalZshClearEolMark?: boolean | undefined
											terminalZshOhMy?: boolean | undefined
											terminalZshP10k?: boolean | undefined
											terminalZdotdir?: boolean | undefined
											diffEnabled?: boolean | undefined
											fuzzyMatchThreshold?: number | undefined
											experiments?:
												| {
														powerSteering: boolean
												  }
												| undefined
											language?:
												| "ca"
												| "de"
												| "en"
												| "es"
												| "fr"
												| "hi"
												| "it"
												| "ja"
												| "ko"
												| "pl"
												| "pt-BR"
												| "ru"
												| "tr"
												| "vi"
												| "zh-CN"
												| "zh-TW"
												| undefined
											telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
											mcpEnabled?: boolean | undefined
											enableMcpServerCreation?: boolean | undefined
											mode?: string | undefined
											modeApiConfigs?: Record<string, string> | undefined
											customModePrompts?:
												| Record<
														string,
														| {
																roleDefinition?: string | undefined
																customInstructions?: string | undefined
														  }
														| undefined
												  >
												| undefined
											customSupportPrompts?: Record<string, string | undefined> | undefined
											enhancementApiConfigId?: string | undefined
										}
										text?: string | undefined
										images?: string[] | undefined
										newTab?: boolean | undefined
									},
									{
										configuration: {
											reasoningEffort?: "low" | "medium" | "high" | undefined
											apiProvider?:
												| "anthropic"
												| "glama"
												| "openrouter"
												| "bedrock"
												| "vertex"
												| "openai"
												| "ollama"
												| "vscode-lm"
												| "lmstudio"
												| "gemini"
												| "openai-native"
												| "xai"
												| "mistral"
												| "deepseek"
												| "unbound"
												| "requesty"
												| "human-relay"
												| "fake-ai"
												| undefined
											customInstructions?: string | undefined
											customModes?:
												| {
														name: string
														slug: string
														roleDefinition: string
														groups: (
															| "read"
															| "edit"
															| "browser"
															| "command"
															| "mcp"
															| "modes"
															| [
																	(
																		| "read"
																		| "edit"
																		| "browser"
																		| "command"
																		| "mcp"
																		| "modes"
																	),
																	{
																		description?: string | undefined
																		fileRegex?: string | undefined
																	},
															  ]
														)[]
														customInstructions?: string | undefined
														source?: "global" | "project" | undefined
												  }[]
												| undefined
											apiModelId?: string | undefined
											apiKey?: string | undefined
											anthropicBaseUrl?: string | undefined
											anthropicUseAuthToken?: boolean | undefined
											glamaModelId?: string | undefined
											glamaApiKey?: string | undefined
											openRouterApiKey?: string | undefined
											openRouterModelId?: string | undefined
											openRouterBaseUrl?: string | undefined
											openRouterSpecificProvider?: string | undefined
											openRouterUseMiddleOutTransform?: boolean | undefined
											awsAccessKey?: string | undefined
											awsSecretKey?: string | undefined
											awsSessionToken?: string | undefined
											awsRegion?: string | undefined
											awsUseCrossRegionInference?: boolean | undefined
											awsUsePromptCache?: boolean | undefined
											awspromptCacheId?: string | undefined
											awsProfile?: string | undefined
											awsUseProfile?: boolean | undefined
											awsCustomArn?: string | undefined
											vertexKeyFile?: string | undefined
											vertexJsonCredentials?: string | undefined
											vertexProjectId?: string | undefined
											vertexRegion?: string | undefined
											openAiBaseUrl?: string | undefined
											openAiApiKey?: string | undefined
											openAiR1FormatEnabled?: boolean | undefined
											openAiModelId?: string | undefined
											openAiCustomModelInfo?:
												| {
														contextWindow: number
														supportsPromptCache: boolean
														maxTokens?: number | null | undefined
														supportsImages?: boolean | undefined
														supportsComputerUse?: boolean | undefined
														inputPrice?: number | undefined
														outputPrice?: number | undefined
														cacheWritesPrice?: number | undefined
														cacheReadsPrice?: number | undefined
														description?: string | undefined
														reasoningEffort?: "low" | "medium" | "high" | undefined
														thinking?: boolean | undefined
												  }
												| undefined
											openAiUseAzure?: boolean | undefined
											azureApiVersion?: string | undefined
											openAiStreamingEnabled?: boolean | undefined
											ollamaModelId?: string | undefined
											ollamaBaseUrl?: string | undefined
											vsCodeLmModelSelector?:
												| {
														id?: string | undefined
														vendor?: string | undefined
														family?: string | undefined
														version?: string | undefined
												  }
												| undefined
											lmStudioModelId?: string | undefined
											lmStudioBaseUrl?: string | undefined
											lmStudioDraftModelId?: string | undefined
											lmStudioSpeculativeDecodingEnabled?: boolean | undefined
											geminiApiKey?: string | undefined
											googleGeminiBaseUrl?: string | undefined
											openAiNativeApiKey?: string | undefined
											xaiApiKey?: string | undefined
											mistralApiKey?: string | undefined
											mistralCodestralUrl?: string | undefined
											deepSeekBaseUrl?: string | undefined
											deepSeekApiKey?: string | undefined
											unboundApiKey?: string | undefined
											unboundModelId?: string | undefined
											requestyApiKey?: string | undefined
											requestyModelId?: string | undefined
											modelMaxTokens?: number | undefined
											modelMaxThinkingTokens?: number | undefined
											includeMaxTokens?: boolean | undefined
											modelTemperature?: number | null | undefined
											rateLimitSeconds?: number | undefined
											fakeAi?: unknown
											currentApiConfigName?: string | undefined
											listApiConfigMeta?:
												| {
														id: string
														name: string
														apiProvider?:
															| "anthropic"
															| "glama"
															| "openrouter"
															| "bedrock"
															| "vertex"
															| "openai"
															| "ollama"
															| "vscode-lm"
															| "lmstudio"
															| "gemini"
															| "openai-native"
															| "xai"
															| "mistral"
															| "deepseek"
															| "unbound"
															| "requesty"
															| "human-relay"
															| "fake-ai"
															| undefined
												  }[]
												| undefined
											pinnedApiConfigs?: Record<string, boolean> | undefined
											lastShownAnnouncementId?: string | undefined
											taskHistory?:
												| {
														number: number
														task: string
														id: string
														ts: number
														tokensIn: number
														tokensOut: number
														totalCost: number
														cacheWrites?: number | undefined
														cacheReads?: number | undefined
														size?: number | undefined
												  }[]
												| undefined
											autoApprovalEnabled?: boolean | undefined
											alwaysAllowReadOnly?: boolean | undefined
											alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
											alwaysAllowWrite?: boolean | undefined
											alwaysAllowWriteOutsideWorkspace?: boolean | undefined
											writeDelayMs?: number | undefined
											alwaysAllowBrowser?: boolean | undefined
											alwaysApproveResubmit?: boolean | undefined
											requestDelaySeconds?: number | undefined
											alwaysAllowMcp?: boolean | undefined
											alwaysAllowModeSwitch?: boolean | undefined
											alwaysAllowSubtasks?: boolean | undefined
											alwaysAllowExecute?: boolean | undefined
											allowedCommands?: string[] | undefined
											browserToolEnabled?: boolean | undefined
											browserViewportSize?: string | undefined
											screenshotQuality?: number | undefined
											remoteBrowserEnabled?: boolean | undefined
											remoteBrowserHost?: string | undefined
											enableCheckpoints?: boolean | undefined
											checkpointStorage?: "task" | "workspace" | undefined
											ttsEnabled?: boolean | undefined
											ttsSpeed?: number | undefined
											soundEnabled?: boolean | undefined
											soundVolume?: number | undefined
											maxOpenTabsContext?: number | undefined
											maxWorkspaceFiles?: number | undefined
											showRooIgnoredFiles?: boolean | undefined
											maxReadFileLine?: number | undefined
											terminalOutputLineLimit?: number | undefined
											terminalShellIntegrationTimeout?: number | undefined
											terminalCommandDelay?: number | undefined
											terminalPowershellCounter?: boolean | undefined
											terminalZshClearEolMark?: boolean | undefined
											terminalZshOhMy?: boolean | undefined
											terminalZshP10k?: boolean | undefined
											terminalZdotdir?: boolean | undefined
											diffEnabled?: boolean | undefined
											fuzzyMatchThreshold?: number | undefined
											experiments?:
												| {
														powerSteering: boolean
												  }
												| undefined
											language?:
												| "ca"
												| "de"
												| "en"
												| "es"
												| "fr"
												| "hi"
												| "it"
												| "ja"
												| "ko"
												| "pl"
												| "pt-BR"
												| "ru"
												| "tr"
												| "vi"
												| "zh-CN"
												| "zh-TW"
												| undefined
											telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
											mcpEnabled?: boolean | undefined
											enableMcpServerCreation?: boolean | undefined
											mode?: string | undefined
											modeApiConfigs?: Record<string, string> | undefined
											customModePrompts?:
												| Record<
														string,
														| {
																roleDefinition?: string | undefined
																customInstructions?: string | undefined
														  }
														| undefined
												  >
												| undefined
											customSupportPrompts?: Record<string, string | undefined> | undefined
											enhancementApiConfigId?: string | undefined
										}
										text?: string | undefined
										images?: string[] | undefined
										newTab?: boolean | undefined
									}
								>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.StartNewTask
								data: {
									configuration: {
										reasoningEffort?: "low" | "medium" | "high" | undefined
										apiProvider?:
											| "anthropic"
											| "glama"
											| "openrouter"
											| "bedrock"
											| "vertex"
											| "openai"
											| "ollama"
											| "vscode-lm"
											| "lmstudio"
											| "gemini"
											| "openai-native"
											| "xai"
											| "mistral"
											| "deepseek"
											| "unbound"
											| "requesty"
											| "human-relay"
											| "fake-ai"
											| undefined
										customInstructions?: string | undefined
										customModes?:
											| {
													name: string
													slug: string
													roleDefinition: string
													groups: (
														| "read"
														| "edit"
														| "browser"
														| "command"
														| "mcp"
														| "modes"
														| [
																(
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																),
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
													customInstructions?: string | undefined
													source?: "global" | "project" | undefined
											  }[]
											| undefined
										apiModelId?: string | undefined
										apiKey?: string | undefined
										anthropicBaseUrl?: string | undefined
										anthropicUseAuthToken?: boolean | undefined
										glamaModelId?: string | undefined
										glamaApiKey?: string | undefined
										openRouterApiKey?: string | undefined
										openRouterModelId?: string | undefined
										openRouterBaseUrl?: string | undefined
										openRouterSpecificProvider?: string | undefined
										openRouterUseMiddleOutTransform?: boolean | undefined
										awsAccessKey?: string | undefined
										awsSecretKey?: string | undefined
										awsSessionToken?: string | undefined
										awsRegion?: string | undefined
										awsUseCrossRegionInference?: boolean | undefined
										awsUsePromptCache?: boolean | undefined
										awspromptCacheId?: string | undefined
										awsProfile?: string | undefined
										awsUseProfile?: boolean | undefined
										awsCustomArn?: string | undefined
										vertexKeyFile?: string | undefined
										vertexJsonCredentials?: string | undefined
										vertexProjectId?: string | undefined
										vertexRegion?: string | undefined
										openAiBaseUrl?: string | undefined
										openAiApiKey?: string | undefined
										openAiR1FormatEnabled?: boolean | undefined
										openAiModelId?: string | undefined
										openAiCustomModelInfo?:
											| {
													contextWindow: number
													supportsPromptCache: boolean
													maxTokens?: number | null | undefined
													supportsImages?: boolean | undefined
													supportsComputerUse?: boolean | undefined
													inputPrice?: number | undefined
													outputPrice?: number | undefined
													cacheWritesPrice?: number | undefined
													cacheReadsPrice?: number | undefined
													description?: string | undefined
													reasoningEffort?: "low" | "medium" | "high" | undefined
													thinking?: boolean | undefined
											  }
											| undefined
										openAiUseAzure?: boolean | undefined
										azureApiVersion?: string | undefined
										openAiStreamingEnabled?: boolean | undefined
										ollamaModelId?: string | undefined
										ollamaBaseUrl?: string | undefined
										vsCodeLmModelSelector?:
											| {
													id?: string | undefined
													vendor?: string | undefined
													family?: string | undefined
													version?: string | undefined
											  }
											| undefined
										lmStudioModelId?: string | undefined
										lmStudioBaseUrl?: string | undefined
										lmStudioDraftModelId?: string | undefined
										lmStudioSpeculativeDecodingEnabled?: boolean | undefined
										geminiApiKey?: string | undefined
										googleGeminiBaseUrl?: string | undefined
										openAiNativeApiKey?: string | undefined
										xaiApiKey?: string | undefined
										mistralApiKey?: string | undefined
										mistralCodestralUrl?: string | undefined
										deepSeekBaseUrl?: string | undefined
										deepSeekApiKey?: string | undefined
										unboundApiKey?: string | undefined
										unboundModelId?: string | undefined
										requestyApiKey?: string | undefined
										requestyModelId?: string | undefined
										modelMaxTokens?: number | undefined
										modelMaxThinkingTokens?: number | undefined
										includeMaxTokens?: boolean | undefined
										modelTemperature?: number | null | undefined
										rateLimitSeconds?: number | undefined
										fakeAi?: unknown
										currentApiConfigName?: string | undefined
										listApiConfigMeta?:
											| {
													id: string
													name: string
													apiProvider?:
														| "anthropic"
														| "glama"
														| "openrouter"
														| "bedrock"
														| "vertex"
														| "openai"
														| "ollama"
														| "vscode-lm"
														| "lmstudio"
														| "gemini"
														| "openai-native"
														| "xai"
														| "mistral"
														| "deepseek"
														| "unbound"
														| "requesty"
														| "human-relay"
														| "fake-ai"
														| undefined
											  }[]
											| undefined
										pinnedApiConfigs?: Record<string, boolean> | undefined
										lastShownAnnouncementId?: string | undefined
										taskHistory?:
											| {
													number: number
													task: string
													id: string
													ts: number
													tokensIn: number
													tokensOut: number
													totalCost: number
													cacheWrites?: number | undefined
													cacheReads?: number | undefined
													size?: number | undefined
											  }[]
											| undefined
										autoApprovalEnabled?: boolean | undefined
										alwaysAllowReadOnly?: boolean | undefined
										alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
										alwaysAllowWrite?: boolean | undefined
										alwaysAllowWriteOutsideWorkspace?: boolean | undefined
										writeDelayMs?: number | undefined
										alwaysAllowBrowser?: boolean | undefined
										alwaysApproveResubmit?: boolean | undefined
										requestDelaySeconds?: number | undefined
										alwaysAllowMcp?: boolean | undefined
										alwaysAllowModeSwitch?: boolean | undefined
										alwaysAllowSubtasks?: boolean | undefined
										alwaysAllowExecute?: boolean | undefined
										allowedCommands?: string[] | undefined
										browserToolEnabled?: boolean | undefined
										browserViewportSize?: string | undefined
										screenshotQuality?: number | undefined
										remoteBrowserEnabled?: boolean | undefined
										remoteBrowserHost?: string | undefined
										enableCheckpoints?: boolean | undefined
										checkpointStorage?: "task" | "workspace" | undefined
										ttsEnabled?: boolean | undefined
										ttsSpeed?: number | undefined
										soundEnabled?: boolean | undefined
										soundVolume?: number | undefined
										maxOpenTabsContext?: number | undefined
										maxWorkspaceFiles?: number | undefined
										showRooIgnoredFiles?: boolean | undefined
										maxReadFileLine?: number | undefined
										terminalOutputLineLimit?: number | undefined
										terminalShellIntegrationTimeout?: number | undefined
										terminalCommandDelay?: number | undefined
										terminalPowershellCounter?: boolean | undefined
										terminalZshClearEolMark?: boolean | undefined
										terminalZshOhMy?: boolean | undefined
										terminalZshP10k?: boolean | undefined
										terminalZdotdir?: boolean | undefined
										diffEnabled?: boolean | undefined
										fuzzyMatchThreshold?: number | undefined
										experiments?:
											| {
													powerSteering: boolean
											  }
											| undefined
										language?:
											| "ca"
											| "de"
											| "en"
											| "es"
											| "fr"
											| "hi"
											| "it"
											| "ja"
											| "ko"
											| "pl"
											| "pt-BR"
											| "ru"
											| "tr"
											| "vi"
											| "zh-CN"
											| "zh-TW"
											| undefined
										telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
										mcpEnabled?: boolean | undefined
										enableMcpServerCreation?: boolean | undefined
										mode?: string | undefined
										modeApiConfigs?: Record<string, string> | undefined
										customModePrompts?:
											| Record<
													string,
													| {
															roleDefinition?: string | undefined
															customInstructions?: string | undefined
													  }
													| undefined
											  >
											| undefined
										customSupportPrompts?: Record<string, string | undefined> | undefined
										enhancementApiConfigId?: string | undefined
									}
									text?: string | undefined
									images?: string[] | undefined
									newTab?: boolean | undefined
								}
							},
							{
								commandName: TaskCommandName.StartNewTask
								data: {
									configuration: {
										reasoningEffort?: "low" | "medium" | "high" | undefined
										apiProvider?:
											| "anthropic"
											| "glama"
											| "openrouter"
											| "bedrock"
											| "vertex"
											| "openai"
											| "ollama"
											| "vscode-lm"
											| "lmstudio"
											| "gemini"
											| "openai-native"
											| "xai"
											| "mistral"
											| "deepseek"
											| "unbound"
											| "requesty"
											| "human-relay"
											| "fake-ai"
											| undefined
										customInstructions?: string | undefined
										customModes?:
											| {
													name: string
													slug: string
													roleDefinition: string
													groups: (
														| "read"
														| "edit"
														| "browser"
														| "command"
														| "mcp"
														| "modes"
														| [
																(
																	| "read"
																	| "edit"
																	| "browser"
																	| "command"
																	| "mcp"
																	| "modes"
																),
																{
																	description?: string | undefined
																	fileRegex?: string | undefined
																},
														  ]
													)[]
													customInstructions?: string | undefined
													source?: "global" | "project" | undefined
											  }[]
											| undefined
										apiModelId?: string | undefined
										apiKey?: string | undefined
										anthropicBaseUrl?: string | undefined
										anthropicUseAuthToken?: boolean | undefined
										glamaModelId?: string | undefined
										glamaApiKey?: string | undefined
										openRouterApiKey?: string | undefined
										openRouterModelId?: string | undefined
										openRouterBaseUrl?: string | undefined
										openRouterSpecificProvider?: string | undefined
										openRouterUseMiddleOutTransform?: boolean | undefined
										awsAccessKey?: string | undefined
										awsSecretKey?: string | undefined
										awsSessionToken?: string | undefined
										awsRegion?: string | undefined
										awsUseCrossRegionInference?: boolean | undefined
										awsUsePromptCache?: boolean | undefined
										awspromptCacheId?: string | undefined
										awsProfile?: string | undefined
										awsUseProfile?: boolean | undefined
										awsCustomArn?: string | undefined
										vertexKeyFile?: string | undefined
										vertexJsonCredentials?: string | undefined
										vertexProjectId?: string | undefined
										vertexRegion?: string | undefined
										openAiBaseUrl?: string | undefined
										openAiApiKey?: string | undefined
										openAiR1FormatEnabled?: boolean | undefined
										openAiModelId?: string | undefined
										openAiCustomModelInfo?:
											| {
													contextWindow: number
													supportsPromptCache: boolean
													maxTokens?: number | null | undefined
													supportsImages?: boolean | undefined
													supportsComputerUse?: boolean | undefined
													inputPrice?: number | undefined
													outputPrice?: number | undefined
													cacheWritesPrice?: number | undefined
													cacheReadsPrice?: number | undefined
													description?: string | undefined
													reasoningEffort?: "low" | "medium" | "high" | undefined
													thinking?: boolean | undefined
											  }
											| undefined
										openAiUseAzure?: boolean | undefined
										azureApiVersion?: string | undefined
										openAiStreamingEnabled?: boolean | undefined
										ollamaModelId?: string | undefined
										ollamaBaseUrl?: string | undefined
										vsCodeLmModelSelector?:
											| {
													id?: string | undefined
													vendor?: string | undefined
													family?: string | undefined
													version?: string | undefined
											  }
											| undefined
										lmStudioModelId?: string | undefined
										lmStudioBaseUrl?: string | undefined
										lmStudioDraftModelId?: string | undefined
										lmStudioSpeculativeDecodingEnabled?: boolean | undefined
										geminiApiKey?: string | undefined
										googleGeminiBaseUrl?: string | undefined
										openAiNativeApiKey?: string | undefined
										xaiApiKey?: string | undefined
										mistralApiKey?: string | undefined
										mistralCodestralUrl?: string | undefined
										deepSeekBaseUrl?: string | undefined
										deepSeekApiKey?: string | undefined
										unboundApiKey?: string | undefined
										unboundModelId?: string | undefined
										requestyApiKey?: string | undefined
										requestyModelId?: string | undefined
										modelMaxTokens?: number | undefined
										modelMaxThinkingTokens?: number | undefined
										includeMaxTokens?: boolean | undefined
										modelTemperature?: number | null | undefined
										rateLimitSeconds?: number | undefined
										fakeAi?: unknown
										currentApiConfigName?: string | undefined
										listApiConfigMeta?:
											| {
													id: string
													name: string
													apiProvider?:
														| "anthropic"
														| "glama"
														| "openrouter"
														| "bedrock"
														| "vertex"
														| "openai"
														| "ollama"
														| "vscode-lm"
														| "lmstudio"
														| "gemini"
														| "openai-native"
														| "xai"
														| "mistral"
														| "deepseek"
														| "unbound"
														| "requesty"
														| "human-relay"
														| "fake-ai"
														| undefined
											  }[]
											| undefined
										pinnedApiConfigs?: Record<string, boolean> | undefined
										lastShownAnnouncementId?: string | undefined
										taskHistory?:
											| {
													number: number
													task: string
													id: string
													ts: number
													tokensIn: number
													tokensOut: number
													totalCost: number
													cacheWrites?: number | undefined
													cacheReads?: number | undefined
													size?: number | undefined
											  }[]
											| undefined
										autoApprovalEnabled?: boolean | undefined
										alwaysAllowReadOnly?: boolean | undefined
										alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
										alwaysAllowWrite?: boolean | undefined
										alwaysAllowWriteOutsideWorkspace?: boolean | undefined
										writeDelayMs?: number | undefined
										alwaysAllowBrowser?: boolean | undefined
										alwaysApproveResubmit?: boolean | undefined
										requestDelaySeconds?: number | undefined
										alwaysAllowMcp?: boolean | undefined
										alwaysAllowModeSwitch?: boolean | undefined
										alwaysAllowSubtasks?: boolean | undefined
										alwaysAllowExecute?: boolean | undefined
										allowedCommands?: string[] | undefined
										browserToolEnabled?: boolean | undefined
										browserViewportSize?: string | undefined
										screenshotQuality?: number | undefined
										remoteBrowserEnabled?: boolean | undefined
										remoteBrowserHost?: string | undefined
										enableCheckpoints?: boolean | undefined
										checkpointStorage?: "task" | "workspace" | undefined
										ttsEnabled?: boolean | undefined
										ttsSpeed?: number | undefined
										soundEnabled?: boolean | undefined
										soundVolume?: number | undefined
										maxOpenTabsContext?: number | undefined
										maxWorkspaceFiles?: number | undefined
										showRooIgnoredFiles?: boolean | undefined
										maxReadFileLine?: number | undefined
										terminalOutputLineLimit?: number | undefined
										terminalShellIntegrationTimeout?: number | undefined
										terminalCommandDelay?: number | undefined
										terminalPowershellCounter?: boolean | undefined
										terminalZshClearEolMark?: boolean | undefined
										terminalZshOhMy?: boolean | undefined
										terminalZshP10k?: boolean | undefined
										terminalZdotdir?: boolean | undefined
										diffEnabled?: boolean | undefined
										fuzzyMatchThreshold?: number | undefined
										experiments?:
											| {
													powerSteering: boolean
											  }
											| undefined
										language?:
											| "ca"
											| "de"
											| "en"
											| "es"
											| "fr"
											| "hi"
											| "it"
											| "ja"
											| "ko"
											| "pl"
											| "pt-BR"
											| "ru"
											| "tr"
											| "vi"
											| "zh-CN"
											| "zh-TW"
											| undefined
										telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
										mcpEnabled?: boolean | undefined
										enableMcpServerCreation?: boolean | undefined
										mode?: string | undefined
										modeApiConfigs?: Record<string, string> | undefined
										customModePrompts?:
											| Record<
													string,
													| {
															roleDefinition?: string | undefined
															customInstructions?: string | undefined
													  }
													| undefined
											  >
											| undefined
										customSupportPrompts?: Record<string, string | undefined> | undefined
										enhancementApiConfigId?: string | undefined
									}
									text?: string | undefined
									images?: string[] | undefined
									newTab?: boolean | undefined
								}
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CancelTask>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CancelTask
								data: string
							},
							{
								commandName: TaskCommandName.CancelTask
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CloseTask>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CloseTask
								data: string
							},
							{
								commandName: TaskCommandName.CloseTask
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetCurrentTaskStack>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetCurrentTaskStack
								data?: undefined
							},
							{
								commandName: TaskCommandName.GetCurrentTaskStack
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.ClearCurrentTask>
								data: z.ZodOptional<z.ZodString>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.ClearCurrentTask
								data?: string | undefined
							},
							{
								commandName: TaskCommandName.ClearCurrentTask
								data?: string | undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CancelCurrentTask>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CancelCurrentTask
								data?: undefined
							},
							{
								commandName: TaskCommandName.CancelCurrentTask
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.SendMessage>
								data: z.ZodObject<
									{
										message: z.ZodOptional<z.ZodString>
										images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
									},
									"strip",
									z.ZodTypeAny,
									{
										message?: string | undefined
										images?: string[] | undefined
									},
									{
										message?: string | undefined
										images?: string[] | undefined
									}
								>
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.SendMessage
								data: {
									message?: string | undefined
									images?: string[] | undefined
								}
							},
							{
								commandName: TaskCommandName.SendMessage
								data: {
									message?: string | undefined
									images?: string[] | undefined
								}
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.PressPrimaryButton>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.PressPrimaryButton
								data?: undefined
							},
							{
								commandName: TaskCommandName.PressPrimaryButton
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.PressSecondaryButton>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.PressSecondaryButton
								data?: undefined
							},
							{
								commandName: TaskCommandName.PressSecondaryButton
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.SetConfiguration>
								data: z.ZodAny
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.SetConfiguration
								data?: any
							},
							{
								commandName: TaskCommandName.SetConfiguration
								data?: any
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.IsReady>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.IsReady
								data?: undefined
							},
							{
								commandName: TaskCommandName.IsReady
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetMessages>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetMessages
								data: string
							},
							{
								commandName: TaskCommandName.GetMessages
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetTokenUsage>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetTokenUsage
								data: string
							},
							{
								commandName: TaskCommandName.GetTokenUsage
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.Log>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.Log
								data: string
							},
							{
								commandName: TaskCommandName.Log
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.ResumeTask>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.ResumeTask
								data: string
							},
							{
								commandName: TaskCommandName.ResumeTask
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.IsTaskInHistory>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.IsTaskInHistory
								data: string
							},
							{
								commandName: TaskCommandName.IsTaskInHistory
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.CreateProfile>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.CreateProfile
								data: string
							},
							{
								commandName: TaskCommandName.CreateProfile
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.GetProfiles>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.GetProfiles
								data?: undefined
							},
							{
								commandName: TaskCommandName.GetProfiles
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.SetActiveProfile>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.SetActiveProfile
								data: string
							},
							{
								commandName: TaskCommandName.SetActiveProfile
								data: string
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.getActiveProfile>
								data: z.ZodUndefined
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.getActiveProfile
								data?: undefined
							},
							{
								commandName: TaskCommandName.getActiveProfile
								data?: undefined
							}
						>,
						z.ZodObject<
							{
								commandName: z.ZodLiteral<TaskCommandName.DeleteProfile>
								data: z.ZodString
							},
							"strip",
							z.ZodTypeAny,
							{
								commandName: TaskCommandName.DeleteProfile
								data: string
							},
							{
								commandName: TaskCommandName.DeleteProfile
								data: string
							}
						>,
					]
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.TaskCommand
				clientId: string
				data:
					| {
							commandName: TaskCommandName.StartNewTask
							data: {
								configuration: {
									reasoningEffort?: "low" | "medium" | "high" | undefined
									apiProvider?:
										| "anthropic"
										| "glama"
										| "openrouter"
										| "bedrock"
										| "vertex"
										| "openai"
										| "ollama"
										| "vscode-lm"
										| "lmstudio"
										| "gemini"
										| "openai-native"
										| "xai"
										| "mistral"
										| "deepseek"
										| "unbound"
										| "requesty"
										| "human-relay"
										| "fake-ai"
										| undefined
									customInstructions?: string | undefined
									customModes?:
										| {
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "read"
													| "edit"
													| "browser"
													| "command"
													| "mcp"
													| "modes"
													| [
															"read" | "edit" | "browser" | "command" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												customInstructions?: string | undefined
												source?: "global" | "project" | undefined
										  }[]
										| undefined
									apiModelId?: string | undefined
									apiKey?: string | undefined
									anthropicBaseUrl?: string | undefined
									anthropicUseAuthToken?: boolean | undefined
									glamaModelId?: string | undefined
									glamaApiKey?: string | undefined
									openRouterApiKey?: string | undefined
									openRouterModelId?: string | undefined
									openRouterBaseUrl?: string | undefined
									openRouterSpecificProvider?: string | undefined
									openRouterUseMiddleOutTransform?: boolean | undefined
									awsAccessKey?: string | undefined
									awsSecretKey?: string | undefined
									awsSessionToken?: string | undefined
									awsRegion?: string | undefined
									awsUseCrossRegionInference?: boolean | undefined
									awsUsePromptCache?: boolean | undefined
									awspromptCacheId?: string | undefined
									awsProfile?: string | undefined
									awsUseProfile?: boolean | undefined
									awsCustomArn?: string | undefined
									vertexKeyFile?: string | undefined
									vertexJsonCredentials?: string | undefined
									vertexProjectId?: string | undefined
									vertexRegion?: string | undefined
									openAiBaseUrl?: string | undefined
									openAiApiKey?: string | undefined
									openAiR1FormatEnabled?: boolean | undefined
									openAiModelId?: string | undefined
									openAiCustomModelInfo?:
										| {
												contextWindow: number
												supportsPromptCache: boolean
												maxTokens?: number | null | undefined
												supportsImages?: boolean | undefined
												supportsComputerUse?: boolean | undefined
												inputPrice?: number | undefined
												outputPrice?: number | undefined
												cacheWritesPrice?: number | undefined
												cacheReadsPrice?: number | undefined
												description?: string | undefined
												reasoningEffort?: "low" | "medium" | "high" | undefined
												thinking?: boolean | undefined
										  }
										| undefined
									openAiUseAzure?: boolean | undefined
									azureApiVersion?: string | undefined
									openAiStreamingEnabled?: boolean | undefined
									ollamaModelId?: string | undefined
									ollamaBaseUrl?: string | undefined
									vsCodeLmModelSelector?:
										| {
												id?: string | undefined
												vendor?: string | undefined
												family?: string | undefined
												version?: string | undefined
										  }
										| undefined
									lmStudioModelId?: string | undefined
									lmStudioBaseUrl?: string | undefined
									lmStudioDraftModelId?: string | undefined
									lmStudioSpeculativeDecodingEnabled?: boolean | undefined
									geminiApiKey?: string | undefined
									googleGeminiBaseUrl?: string | undefined
									openAiNativeApiKey?: string | undefined
									xaiApiKey?: string | undefined
									mistralApiKey?: string | undefined
									mistralCodestralUrl?: string | undefined
									deepSeekBaseUrl?: string | undefined
									deepSeekApiKey?: string | undefined
									unboundApiKey?: string | undefined
									unboundModelId?: string | undefined
									requestyApiKey?: string | undefined
									requestyModelId?: string | undefined
									modelMaxTokens?: number | undefined
									modelMaxThinkingTokens?: number | undefined
									includeMaxTokens?: boolean | undefined
									modelTemperature?: number | null | undefined
									rateLimitSeconds?: number | undefined
									fakeAi?: unknown
									currentApiConfigName?: string | undefined
									listApiConfigMeta?:
										| {
												id: string
												name: string
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
										  }[]
										| undefined
									pinnedApiConfigs?: Record<string, boolean> | undefined
									lastShownAnnouncementId?: string | undefined
									taskHistory?:
										| {
												number: number
												task: string
												id: string
												ts: number
												tokensIn: number
												tokensOut: number
												totalCost: number
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
										  }[]
										| undefined
									autoApprovalEnabled?: boolean | undefined
									alwaysAllowReadOnly?: boolean | undefined
									alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
									alwaysAllowWrite?: boolean | undefined
									alwaysAllowWriteOutsideWorkspace?: boolean | undefined
									writeDelayMs?: number | undefined
									alwaysAllowBrowser?: boolean | undefined
									alwaysApproveResubmit?: boolean | undefined
									requestDelaySeconds?: number | undefined
									alwaysAllowMcp?: boolean | undefined
									alwaysAllowModeSwitch?: boolean | undefined
									alwaysAllowSubtasks?: boolean | undefined
									alwaysAllowExecute?: boolean | undefined
									allowedCommands?: string[] | undefined
									browserToolEnabled?: boolean | undefined
									browserViewportSize?: string | undefined
									screenshotQuality?: number | undefined
									remoteBrowserEnabled?: boolean | undefined
									remoteBrowserHost?: string | undefined
									enableCheckpoints?: boolean | undefined
									checkpointStorage?: "task" | "workspace" | undefined
									ttsEnabled?: boolean | undefined
									ttsSpeed?: number | undefined
									soundEnabled?: boolean | undefined
									soundVolume?: number | undefined
									maxOpenTabsContext?: number | undefined
									maxWorkspaceFiles?: number | undefined
									showRooIgnoredFiles?: boolean | undefined
									maxReadFileLine?: number | undefined
									terminalOutputLineLimit?: number | undefined
									terminalShellIntegrationTimeout?: number | undefined
									terminalCommandDelay?: number | undefined
									terminalPowershellCounter?: boolean | undefined
									terminalZshClearEolMark?: boolean | undefined
									terminalZshOhMy?: boolean | undefined
									terminalZshP10k?: boolean | undefined
									terminalZdotdir?: boolean | undefined
									diffEnabled?: boolean | undefined
									fuzzyMatchThreshold?: number | undefined
									experiments?:
										| {
												powerSteering: boolean
										  }
										| undefined
									language?:
										| "ca"
										| "de"
										| "en"
										| "es"
										| "fr"
										| "hi"
										| "it"
										| "ja"
										| "ko"
										| "pl"
										| "pt-BR"
										| "ru"
										| "tr"
										| "vi"
										| "zh-CN"
										| "zh-TW"
										| undefined
									telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
									mcpEnabled?: boolean | undefined
									enableMcpServerCreation?: boolean | undefined
									mode?: string | undefined
									modeApiConfigs?: Record<string, string> | undefined
									customModePrompts?:
										| Record<
												string,
												| {
														roleDefinition?: string | undefined
														customInstructions?: string | undefined
												  }
												| undefined
										  >
										| undefined
									customSupportPrompts?: Record<string, string | undefined> | undefined
									enhancementApiConfigId?: string | undefined
								}
								text?: string | undefined
								images?: string[] | undefined
								newTab?: boolean | undefined
							}
					  }
					| {
							commandName: TaskCommandName.CancelTask
							data: string
					  }
					| {
							commandName: TaskCommandName.CloseTask
							data: string
					  }
					| {
							commandName: TaskCommandName.GetCurrentTaskStack
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.ClearCurrentTask
							data?: string | undefined
					  }
					| {
							commandName: TaskCommandName.CancelCurrentTask
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SendMessage
							data: {
								message?: string | undefined
								images?: string[] | undefined
							}
					  }
					| {
							commandName: TaskCommandName.PressPrimaryButton
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.PressSecondaryButton
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SetConfiguration
							data?: any
					  }
					| {
							commandName: TaskCommandName.IsReady
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.GetMessages
							data: string
					  }
					| {
							commandName: TaskCommandName.GetTokenUsage
							data: string
					  }
					| {
							commandName: TaskCommandName.Log
							data: string
					  }
					| {
							commandName: TaskCommandName.ResumeTask
							data: string
					  }
					| {
							commandName: TaskCommandName.IsTaskInHistory
							data: string
					  }
					| {
							commandName: TaskCommandName.CreateProfile
							data: string
					  }
					| {
							commandName: TaskCommandName.GetProfiles
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SetActiveProfile
							data: string
					  }
					| {
							commandName: TaskCommandName.getActiveProfile
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.DeleteProfile
							data: string
					  }
				origin: IpcOrigin.Client
			},
			{
				type: IpcMessageType.TaskCommand
				clientId: string
				data:
					| {
							commandName: TaskCommandName.StartNewTask
							data: {
								configuration: {
									reasoningEffort?: "low" | "medium" | "high" | undefined
									apiProvider?:
										| "anthropic"
										| "glama"
										| "openrouter"
										| "bedrock"
										| "vertex"
										| "openai"
										| "ollama"
										| "vscode-lm"
										| "lmstudio"
										| "gemini"
										| "openai-native"
										| "xai"
										| "mistral"
										| "deepseek"
										| "unbound"
										| "requesty"
										| "human-relay"
										| "fake-ai"
										| undefined
									customInstructions?: string | undefined
									customModes?:
										| {
												name: string
												slug: string
												roleDefinition: string
												groups: (
													| "read"
													| "edit"
													| "browser"
													| "command"
													| "mcp"
													| "modes"
													| [
															"read" | "edit" | "browser" | "command" | "mcp" | "modes",
															{
																description?: string | undefined
																fileRegex?: string | undefined
															},
													  ]
												)[]
												customInstructions?: string | undefined
												source?: "global" | "project" | undefined
										  }[]
										| undefined
									apiModelId?: string | undefined
									apiKey?: string | undefined
									anthropicBaseUrl?: string | undefined
									anthropicUseAuthToken?: boolean | undefined
									glamaModelId?: string | undefined
									glamaApiKey?: string | undefined
									openRouterApiKey?: string | undefined
									openRouterModelId?: string | undefined
									openRouterBaseUrl?: string | undefined
									openRouterSpecificProvider?: string | undefined
									openRouterUseMiddleOutTransform?: boolean | undefined
									awsAccessKey?: string | undefined
									awsSecretKey?: string | undefined
									awsSessionToken?: string | undefined
									awsRegion?: string | undefined
									awsUseCrossRegionInference?: boolean | undefined
									awsUsePromptCache?: boolean | undefined
									awspromptCacheId?: string | undefined
									awsProfile?: string | undefined
									awsUseProfile?: boolean | undefined
									awsCustomArn?: string | undefined
									vertexKeyFile?: string | undefined
									vertexJsonCredentials?: string | undefined
									vertexProjectId?: string | undefined
									vertexRegion?: string | undefined
									openAiBaseUrl?: string | undefined
									openAiApiKey?: string | undefined
									openAiR1FormatEnabled?: boolean | undefined
									openAiModelId?: string | undefined
									openAiCustomModelInfo?:
										| {
												contextWindow: number
												supportsPromptCache: boolean
												maxTokens?: number | null | undefined
												supportsImages?: boolean | undefined
												supportsComputerUse?: boolean | undefined
												inputPrice?: number | undefined
												outputPrice?: number | undefined
												cacheWritesPrice?: number | undefined
												cacheReadsPrice?: number | undefined
												description?: string | undefined
												reasoningEffort?: "low" | "medium" | "high" | undefined
												thinking?: boolean | undefined
										  }
										| undefined
									openAiUseAzure?: boolean | undefined
									azureApiVersion?: string | undefined
									openAiStreamingEnabled?: boolean | undefined
									ollamaModelId?: string | undefined
									ollamaBaseUrl?: string | undefined
									vsCodeLmModelSelector?:
										| {
												id?: string | undefined
												vendor?: string | undefined
												family?: string | undefined
												version?: string | undefined
										  }
										| undefined
									lmStudioModelId?: string | undefined
									lmStudioBaseUrl?: string | undefined
									lmStudioDraftModelId?: string | undefined
									lmStudioSpeculativeDecodingEnabled?: boolean | undefined
									geminiApiKey?: string | undefined
									googleGeminiBaseUrl?: string | undefined
									openAiNativeApiKey?: string | undefined
									xaiApiKey?: string | undefined
									mistralApiKey?: string | undefined
									mistralCodestralUrl?: string | undefined
									deepSeekBaseUrl?: string | undefined
									deepSeekApiKey?: string | undefined
									unboundApiKey?: string | undefined
									unboundModelId?: string | undefined
									requestyApiKey?: string | undefined
									requestyModelId?: string | undefined
									modelMaxTokens?: number | undefined
									modelMaxThinkingTokens?: number | undefined
									includeMaxTokens?: boolean | undefined
									modelTemperature?: number | null | undefined
									rateLimitSeconds?: number | undefined
									fakeAi?: unknown
									currentApiConfigName?: string | undefined
									listApiConfigMeta?:
										| {
												id: string
												name: string
												apiProvider?:
													| "anthropic"
													| "glama"
													| "openrouter"
													| "bedrock"
													| "vertex"
													| "openai"
													| "ollama"
													| "vscode-lm"
													| "lmstudio"
													| "gemini"
													| "openai-native"
													| "xai"
													| "mistral"
													| "deepseek"
													| "unbound"
													| "requesty"
													| "human-relay"
													| "fake-ai"
													| undefined
										  }[]
										| undefined
									pinnedApiConfigs?: Record<string, boolean> | undefined
									lastShownAnnouncementId?: string | undefined
									taskHistory?:
										| {
												number: number
												task: string
												id: string
												ts: number
												tokensIn: number
												tokensOut: number
												totalCost: number
												cacheWrites?: number | undefined
												cacheReads?: number | undefined
												size?: number | undefined
										  }[]
										| undefined
									autoApprovalEnabled?: boolean | undefined
									alwaysAllowReadOnly?: boolean | undefined
									alwaysAllowReadOnlyOutsideWorkspace?: boolean | undefined
									alwaysAllowWrite?: boolean | undefined
									alwaysAllowWriteOutsideWorkspace?: boolean | undefined
									writeDelayMs?: number | undefined
									alwaysAllowBrowser?: boolean | undefined
									alwaysApproveResubmit?: boolean | undefined
									requestDelaySeconds?: number | undefined
									alwaysAllowMcp?: boolean | undefined
									alwaysAllowModeSwitch?: boolean | undefined
									alwaysAllowSubtasks?: boolean | undefined
									alwaysAllowExecute?: boolean | undefined
									allowedCommands?: string[] | undefined
									browserToolEnabled?: boolean | undefined
									browserViewportSize?: string | undefined
									screenshotQuality?: number | undefined
									remoteBrowserEnabled?: boolean | undefined
									remoteBrowserHost?: string | undefined
									enableCheckpoints?: boolean | undefined
									checkpointStorage?: "task" | "workspace" | undefined
									ttsEnabled?: boolean | undefined
									ttsSpeed?: number | undefined
									soundEnabled?: boolean | undefined
									soundVolume?: number | undefined
									maxOpenTabsContext?: number | undefined
									maxWorkspaceFiles?: number | undefined
									showRooIgnoredFiles?: boolean | undefined
									maxReadFileLine?: number | undefined
									terminalOutputLineLimit?: number | undefined
									terminalShellIntegrationTimeout?: number | undefined
									terminalCommandDelay?: number | undefined
									terminalPowershellCounter?: boolean | undefined
									terminalZshClearEolMark?: boolean | undefined
									terminalZshOhMy?: boolean | undefined
									terminalZshP10k?: boolean | undefined
									terminalZdotdir?: boolean | undefined
									diffEnabled?: boolean | undefined
									fuzzyMatchThreshold?: number | undefined
									experiments?:
										| {
												powerSteering: boolean
										  }
										| undefined
									language?:
										| "ca"
										| "de"
										| "en"
										| "es"
										| "fr"
										| "hi"
										| "it"
										| "ja"
										| "ko"
										| "pl"
										| "pt-BR"
										| "ru"
										| "tr"
										| "vi"
										| "zh-CN"
										| "zh-TW"
										| undefined
									telemetrySetting?: "unset" | "enabled" | "disabled" | undefined
									mcpEnabled?: boolean | undefined
									enableMcpServerCreation?: boolean | undefined
									mode?: string | undefined
									modeApiConfigs?: Record<string, string> | undefined
									customModePrompts?:
										| Record<
												string,
												| {
														roleDefinition?: string | undefined
														customInstructions?: string | undefined
												  }
												| undefined
										  >
										| undefined
									customSupportPrompts?: Record<string, string | undefined> | undefined
									enhancementApiConfigId?: string | undefined
								}
								text?: string | undefined
								images?: string[] | undefined
								newTab?: boolean | undefined
							}
					  }
					| {
							commandName: TaskCommandName.CancelTask
							data: string
					  }
					| {
							commandName: TaskCommandName.CloseTask
							data: string
					  }
					| {
							commandName: TaskCommandName.GetCurrentTaskStack
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.ClearCurrentTask
							data?: string | undefined
					  }
					| {
							commandName: TaskCommandName.CancelCurrentTask
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SendMessage
							data: {
								message?: string | undefined
								images?: string[] | undefined
							}
					  }
					| {
							commandName: TaskCommandName.PressPrimaryButton
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.PressSecondaryButton
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SetConfiguration
							data?: any
					  }
					| {
							commandName: TaskCommandName.IsReady
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.GetMessages
							data: string
					  }
					| {
							commandName: TaskCommandName.GetTokenUsage
							data: string
					  }
					| {
							commandName: TaskCommandName.Log
							data: string
					  }
					| {
							commandName: TaskCommandName.ResumeTask
							data: string
					  }
					| {
							commandName: TaskCommandName.IsTaskInHistory
							data: string
					  }
					| {
							commandName: TaskCommandName.CreateProfile
							data: string
					  }
					| {
							commandName: TaskCommandName.GetProfiles
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.SetActiveProfile
							data: string
					  }
					| {
							commandName: TaskCommandName.getActiveProfile
							data?: undefined
					  }
					| {
							commandName: TaskCommandName.DeleteProfile
							data: string
					  }
				origin: IpcOrigin.Client
			}
		>,
		z.ZodObject<
			{
				type: z.ZodLiteral<IpcMessageType.TaskEvent>
				origin: z.ZodLiteral<IpcOrigin.Server>
				relayClientId: z.ZodOptional<z.ZodString>
				data: z.ZodDiscriminatedUnion<
					"eventName",
					[
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.Message>
								payload: z.ZodTuple<
									[
										z.ZodObject<
											{
												taskId: z.ZodString
												action: z.ZodUnion<[z.ZodLiteral<"created">, z.ZodLiteral<"updated">]>
												message: z.ZodObject<
													{
														ts: z.ZodNumber
														type: z.ZodUnion<[z.ZodLiteral<"ask">, z.ZodLiteral<"say">]>
														ask: z.ZodOptional<
															z.ZodEnum<
																[
																	"followup",
																	"command",
																	"command_output",
																	"completion_result",
																	"tool",
																	"api_req_failed",
																	"resume_task",
																	"resume_completed_task",
																	"mistake_limit_reached",
																	"browser_action_launch",
																	"use_mcp_server",
																	"finishTask",
																]
															>
														>
														say: z.ZodOptional<
															z.ZodEnum<
																[
																	"task",
																	"error",
																	"api_req_started",
																	"api_req_finished",
																	"api_req_retried",
																	"api_req_retry_delayed",
																	"api_req_deleted",
																	"text",
																	"reasoning",
																	"completion_result",
																	"user_feedback",
																	"user_feedback_diff",
																	"command_output",
																	"tool",
																	"shell_integration_warning",
																	"browser_action",
																	"browser_action_result",
																	"command",
																	"mcp_server_request_started",
																	"mcp_server_response",
																	"new_task_started",
																	"new_task",
																	"checkpoint_saved",
																	"rooignore_error",
																	"diff_error",
																]
															>
														>
														text: z.ZodOptional<z.ZodString>
														images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
														partial: z.ZodOptional<z.ZodBoolean>
														reasoning: z.ZodOptional<z.ZodString>
														conversationHistoryIndex: z.ZodOptional<z.ZodNumber>
														checkpoint: z.ZodOptional<
															z.ZodRecord<z.ZodString, z.ZodUnknown>
														>
														progressStatus: z.ZodOptional<
															z.ZodObject<
																{
																	icon: z.ZodOptional<z.ZodString>
																	text: z.ZodOptional<z.ZodString>
																},
																"strip",
																z.ZodTypeAny,
																{
																	text?: string | undefined
																	icon?: string | undefined
																},
																{
																	text?: string | undefined
																	icon?: string | undefined
																}
															>
														>
													},
													"strip",
													z.ZodTypeAny,
													{
														type: "ask" | "say"
														ts: number
														text?: string | undefined
														reasoning?: string | undefined
														ask?:
															| "command"
															| "followup"
															| "command_output"
															| "completion_result"
															| "tool"
															| "api_req_failed"
															| "resume_task"
															| "resume_completed_task"
															| "mistake_limit_reached"
															| "browser_action_launch"
															| "use_mcp_server"
															| "finishTask"
															| undefined
														say?:
															| "command"
															| "task"
															| "command_output"
															| "completion_result"
															| "tool"
															| "error"
															| "api_req_started"
															| "api_req_finished"
															| "api_req_retried"
															| "api_req_retry_delayed"
															| "api_req_deleted"
															| "text"
															| "reasoning"
															| "user_feedback"
															| "user_feedback_diff"
															| "shell_integration_warning"
															| "browser_action"
															| "browser_action_result"
															| "mcp_server_request_started"
															| "mcp_server_response"
															| "new_task_started"
															| "new_task"
															| "checkpoint_saved"
															| "rooignore_error"
															| "diff_error"
															| undefined
														images?: string[] | undefined
														partial?: boolean | undefined
														conversationHistoryIndex?: number | undefined
														checkpoint?: Record<string, unknown> | undefined
														progressStatus?:
															| {
																	text?: string | undefined
																	icon?: string | undefined
															  }
															| undefined
													},
													{
														type: "ask" | "say"
														ts: number
														text?: string | undefined
														reasoning?: string | undefined
														ask?:
															| "command"
															| "followup"
															| "command_output"
															| "completion_result"
															| "tool"
															| "api_req_failed"
															| "resume_task"
															| "resume_completed_task"
															| "mistake_limit_reached"
															| "browser_action_launch"
															| "use_mcp_server"
															| "finishTask"
															| undefined
														say?:
															| "command"
															| "task"
															| "command_output"
															| "completion_result"
															| "tool"
															| "error"
															| "api_req_started"
															| "api_req_finished"
															| "api_req_retried"
															| "api_req_retry_delayed"
															| "api_req_deleted"
															| "text"
															| "reasoning"
															| "user_feedback"
															| "user_feedback_diff"
															| "shell_integration_warning"
															| "browser_action"
															| "browser_action_result"
															| "mcp_server_request_started"
															| "mcp_server_response"
															| "new_task_started"
															| "new_task"
															| "checkpoint_saved"
															| "rooignore_error"
															| "diff_error"
															| undefined
														images?: string[] | undefined
														partial?: boolean | undefined
														conversationHistoryIndex?: number | undefined
														checkpoint?: Record<string, unknown> | undefined
														progressStatus?:
															| {
																	text?: string | undefined
																	icon?: string | undefined
															  }
															| undefined
													}
												>
											},
											"strip",
											z.ZodTypeAny,
											{
												message: {
													type: "ask" | "say"
													ts: number
													text?: string | undefined
													reasoning?: string | undefined
													ask?:
														| "command"
														| "followup"
														| "command_output"
														| "completion_result"
														| "tool"
														| "api_req_failed"
														| "resume_task"
														| "resume_completed_task"
														| "mistake_limit_reached"
														| "browser_action_launch"
														| "use_mcp_server"
														| "finishTask"
														| undefined
													say?:
														| "command"
														| "task"
														| "command_output"
														| "completion_result"
														| "tool"
														| "error"
														| "api_req_started"
														| "api_req_finished"
														| "api_req_retried"
														| "api_req_retry_delayed"
														| "api_req_deleted"
														| "text"
														| "reasoning"
														| "user_feedback"
														| "user_feedback_diff"
														| "shell_integration_warning"
														| "browser_action"
														| "browser_action_result"
														| "mcp_server_request_started"
														| "mcp_server_response"
														| "new_task_started"
														| "new_task"
														| "checkpoint_saved"
														| "rooignore_error"
														| "diff_error"
														| undefined
													images?: string[] | undefined
													partial?: boolean | undefined
													conversationHistoryIndex?: number | undefined
													checkpoint?: Record<string, unknown> | undefined
													progressStatus?:
														| {
																text?: string | undefined
																icon?: string | undefined
														  }
														| undefined
												}
												taskId: string
												action: "created" | "updated"
											},
											{
												message: {
													type: "ask" | "say"
													ts: number
													text?: string | undefined
													reasoning?: string | undefined
													ask?:
														| "command"
														| "followup"
														| "command_output"
														| "completion_result"
														| "tool"
														| "api_req_failed"
														| "resume_task"
														| "resume_completed_task"
														| "mistake_limit_reached"
														| "browser_action_launch"
														| "use_mcp_server"
														| "finishTask"
														| undefined
													say?:
														| "command"
														| "task"
														| "command_output"
														| "completion_result"
														| "tool"
														| "error"
														| "api_req_started"
														| "api_req_finished"
														| "api_req_retried"
														| "api_req_retry_delayed"
														| "api_req_deleted"
														| "text"
														| "reasoning"
														| "user_feedback"
														| "user_feedback_diff"
														| "shell_integration_warning"
														| "browser_action"
														| "browser_action_result"
														| "mcp_server_request_started"
														| "mcp_server_response"
														| "new_task_started"
														| "new_task"
														| "checkpoint_saved"
														| "rooignore_error"
														| "diff_error"
														| undefined
													images?: string[] | undefined
													partial?: boolean | undefined
													conversationHistoryIndex?: number | undefined
													checkpoint?: Record<string, unknown> | undefined
													progressStatus?:
														| {
																text?: string | undefined
																icon?: string | undefined
														  }
														| undefined
												}
												taskId: string
												action: "created" | "updated"
											}
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.Message
								payload: [
									{
										message: {
											type: "ask" | "say"
											ts: number
											text?: string | undefined
											reasoning?: string | undefined
											ask?:
												| "command"
												| "followup"
												| "command_output"
												| "completion_result"
												| "tool"
												| "api_req_failed"
												| "resume_task"
												| "resume_completed_task"
												| "mistake_limit_reached"
												| "browser_action_launch"
												| "use_mcp_server"
												| "finishTask"
												| undefined
											say?:
												| "command"
												| "task"
												| "command_output"
												| "completion_result"
												| "tool"
												| "error"
												| "api_req_started"
												| "api_req_finished"
												| "api_req_retried"
												| "api_req_retry_delayed"
												| "api_req_deleted"
												| "text"
												| "reasoning"
												| "user_feedback"
												| "user_feedback_diff"
												| "shell_integration_warning"
												| "browser_action"
												| "browser_action_result"
												| "mcp_server_request_started"
												| "mcp_server_response"
												| "new_task_started"
												| "new_task"
												| "checkpoint_saved"
												| "rooignore_error"
												| "diff_error"
												| undefined
											images?: string[] | undefined
											partial?: boolean | undefined
											conversationHistoryIndex?: number | undefined
											checkpoint?: Record<string, unknown> | undefined
											progressStatus?:
												| {
														text?: string | undefined
														icon?: string | undefined
												  }
												| undefined
										}
										taskId: string
										action: "created" | "updated"
									},
								]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.Message
								payload: [
									{
										message: {
											type: "ask" | "say"
											ts: number
											text?: string | undefined
											reasoning?: string | undefined
											ask?:
												| "command"
												| "followup"
												| "command_output"
												| "completion_result"
												| "tool"
												| "api_req_failed"
												| "resume_task"
												| "resume_completed_task"
												| "mistake_limit_reached"
												| "browser_action_launch"
												| "use_mcp_server"
												| "finishTask"
												| undefined
											say?:
												| "command"
												| "task"
												| "command_output"
												| "completion_result"
												| "tool"
												| "error"
												| "api_req_started"
												| "api_req_finished"
												| "api_req_retried"
												| "api_req_retry_delayed"
												| "api_req_deleted"
												| "text"
												| "reasoning"
												| "user_feedback"
												| "user_feedback_diff"
												| "shell_integration_warning"
												| "browser_action"
												| "browser_action_result"
												| "mcp_server_request_started"
												| "mcp_server_response"
												| "new_task_started"
												| "new_task"
												| "checkpoint_saved"
												| "rooignore_error"
												| "diff_error"
												| undefined
											images?: string[] | undefined
											partial?: boolean | undefined
											conversationHistoryIndex?: number | undefined
											checkpoint?: Record<string, unknown> | undefined
											progressStatus?:
												| {
														text?: string | undefined
														icon?: string | undefined
												  }
												| undefined
										}
										taskId: string
										action: "created" | "updated"
									},
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskCreated>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskCreated
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskCreated
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskStarted>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskStarted
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskStarted
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskModeSwitched>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskModeSwitched
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskModeSwitched
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskPaused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskPaused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskPaused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskUnpaused>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskUnpaused
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskUnpaused
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskAskResponded>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskAskResponded
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskAskResponded
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskAborted>
								payload: z.ZodTuple<[z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskAborted
								payload: [string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskAborted
								payload: [string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskSpawned>
								payload: z.ZodTuple<[z.ZodString, z.ZodString], null>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskSpawned
								payload: [string, string]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskSpawned
								payload: [string, string]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskCompleted>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodObject<
											{
												totalTokensIn: z.ZodNumber
												totalTokensOut: z.ZodNumber
												totalCacheWrites: z.ZodOptional<z.ZodNumber>
												totalCacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												contextTokens: z.ZodNumber
											},
											"strip",
											z.ZodTypeAny,
											{
												totalCost: number
												totalTokensIn: number
												totalTokensOut: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											},
											{
												totalCost: number
												totalTokensIn: number
												totalTokensOut: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											}
										>,
										z.ZodRecord<
											z.ZodEnum<
												[
													"execute_command",
													"read_file",
													"write_to_file",
													"append_to_file",
													"apply_diff",
													"insert_content",
													"search_and_replace",
													"search_files",
													"list_files",
													"list_code_definition_names",
													"browser_action",
													"use_mcp_tool",
													"access_mcp_resource",
													"ask_followup_question",
													"attempt_completion",
													"switch_mode",
													"new_task",
													"fetch_instructions",
												]
											>,
											z.ZodObject<
												{
													attempts: z.ZodNumber
													failures: z.ZodNumber
												},
												"strip",
												z.ZodTypeAny,
												{
													attempts: number
													failures: number
												},
												{
													attempts: number
													failures: number
												}
											>
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskCompleted
								payload: [
									string,
									{
										totalCost: number
										totalTokensIn: number
										totalTokensOut: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "browser_action"
											| "new_task"
											| "execute_command"
											| "read_file"
											| "write_to_file"
											| "append_to_file"
											| "apply_diff"
											| "insert_content"
											| "search_and_replace"
											| "search_files"
											| "list_files"
											| "list_code_definition_names"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "fetch_instructions",
											{
												attempts: number
												failures: number
											}
										>
									>,
								]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskCompleted
								payload: [
									string,
									{
										totalCost: number
										totalTokensIn: number
										totalTokensOut: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
									Partial<
										Record<
											| "browser_action"
											| "new_task"
											| "execute_command"
											| "read_file"
											| "write_to_file"
											| "append_to_file"
											| "apply_diff"
											| "insert_content"
											| "search_and_replace"
											| "search_files"
											| "list_files"
											| "list_code_definition_names"
											| "use_mcp_tool"
											| "access_mcp_resource"
											| "ask_followup_question"
											| "attempt_completion"
											| "switch_mode"
											| "fetch_instructions",
											{
												attempts: number
												failures: number
											}
										>
									>,
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskTokenUsageUpdated>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodObject<
											{
												totalTokensIn: z.ZodNumber
												totalTokensOut: z.ZodNumber
												totalCacheWrites: z.ZodOptional<z.ZodNumber>
												totalCacheReads: z.ZodOptional<z.ZodNumber>
												totalCost: z.ZodNumber
												contextTokens: z.ZodNumber
											},
											"strip",
											z.ZodTypeAny,
											{
												totalCost: number
												totalTokensIn: number
												totalTokensOut: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											},
											{
												totalCost: number
												totalTokensIn: number
												totalTokensOut: number
												contextTokens: number
												totalCacheWrites?: number | undefined
												totalCacheReads?: number | undefined
											}
										>,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskTokenUsageUpdated
								payload: [
									string,
									{
										totalCost: number
										totalTokensIn: number
										totalTokensOut: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
								]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskTokenUsageUpdated
								payload: [
									string,
									{
										totalCost: number
										totalTokensIn: number
										totalTokensOut: number
										contextTokens: number
										totalCacheWrites?: number | undefined
										totalCacheReads?: number | undefined
									},
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<RooCodeEventName.TaskToolFailed>
								payload: z.ZodTuple<
									[
										z.ZodString,
										z.ZodEnum<
											[
												"execute_command",
												"read_file",
												"write_to_file",
												"append_to_file",
												"apply_diff",
												"insert_content",
												"search_and_replace",
												"search_files",
												"list_files",
												"list_code_definition_names",
												"browser_action",
												"use_mcp_tool",
												"access_mcp_resource",
												"ask_followup_question",
												"attempt_completion",
												"switch_mode",
												"new_task",
												"fetch_instructions",
											]
										>,
										z.ZodString,
									],
									null
								>
								taskId: z.ZodOptional<z.ZodNumber>
							},
							"strip",
							z.ZodTypeAny,
							{
								eventName: RooCodeEventName.TaskToolFailed
								payload: [
									string,
									(
										| "browser_action"
										| "new_task"
										| "execute_command"
										| "read_file"
										| "write_to_file"
										| "append_to_file"
										| "apply_diff"
										| "insert_content"
										| "search_and_replace"
										| "search_files"
										| "list_files"
										| "list_code_definition_names"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "fetch_instructions"
									),
									string,
								]
								taskId?: number | undefined
							},
							{
								eventName: RooCodeEventName.TaskToolFailed
								payload: [
									string,
									(
										| "browser_action"
										| "new_task"
										| "execute_command"
										| "read_file"
										| "write_to_file"
										| "append_to_file"
										| "apply_diff"
										| "insert_content"
										| "search_and_replace"
										| "search_files"
										| "list_files"
										| "list_code_definition_names"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "fetch_instructions"
									),
									string,
								]
								taskId?: number | undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<EvalEventName.Pass>
								payload: z.ZodUndefined
								taskId: z.ZodNumber
							},
							"strip",
							z.ZodTypeAny,
							{
								taskId: number
								eventName: EvalEventName.Pass
								payload?: undefined
							},
							{
								taskId: number
								eventName: EvalEventName.Pass
								payload?: undefined
							}
						>,
						z.ZodObject<
							{
								eventName: z.ZodLiteral<EvalEventName.Fail>
								payload: z.ZodUndefined
								taskId: z.ZodNumber
							},
							"strip",
							z.ZodTypeAny,
							{
								taskId: number
								eventName: EvalEventName.Fail
								payload?: undefined
							},
							{
								taskId: number
								eventName: EvalEventName.Fail
								payload?: undefined
							}
						>,
					]
				>
			},
			"strip",
			z.ZodTypeAny,
			{
				type: IpcMessageType.TaskEvent
				data:
					| {
							eventName: RooCodeEventName.Message
							payload: [
								{
									message: {
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "command"
											| "followup"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "browser_action_launch"
											| "use_mcp_server"
											| "finishTask"
											| undefined
										say?:
											| "command"
											| "task"
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_deleted"
											| "text"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "browser_action"
											| "browser_action_result"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "new_task_started"
											| "new_task"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
									}
									taskId: string
									action: "created" | "updated"
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskCreated
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskStarted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskModeSwitched
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskPaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskUnpaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskAskResponded
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskAborted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskSpawned
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskCompleted
							payload: [
								string,
								{
									totalCost: number
									totalTokensIn: number
									totalTokensOut: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "browser_action"
										| "new_task"
										| "execute_command"
										| "read_file"
										| "write_to_file"
										| "append_to_file"
										| "apply_diff"
										| "insert_content"
										| "search_and_replace"
										| "search_files"
										| "list_files"
										| "list_code_definition_names"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "fetch_instructions",
										{
											attempts: number
											failures: number
										}
									>
								>,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskTokenUsageUpdated
							payload: [
								string,
								{
									totalCost: number
									totalTokensIn: number
									totalTokensOut: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskToolFailed
							payload: [
								string,
								(
									| "browser_action"
									| "new_task"
									| "execute_command"
									| "read_file"
									| "write_to_file"
									| "append_to_file"
									| "apply_diff"
									| "insert_content"
									| "search_and_replace"
									| "search_files"
									| "list_files"
									| "list_code_definition_names"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "fetch_instructions"
								),
								string,
							]
							taskId?: number | undefined
					  }
					| {
							taskId: number
							eventName: EvalEventName.Pass
							payload?: undefined
					  }
					| {
							taskId: number
							eventName: EvalEventName.Fail
							payload?: undefined
					  }
				origin: IpcOrigin.Server
				relayClientId?: string | undefined
			},
			{
				type: IpcMessageType.TaskEvent
				data:
					| {
							eventName: RooCodeEventName.Message
							payload: [
								{
									message: {
										type: "ask" | "say"
										ts: number
										text?: string | undefined
										reasoning?: string | undefined
										ask?:
											| "command"
											| "followup"
											| "command_output"
											| "completion_result"
											| "tool"
											| "api_req_failed"
											| "resume_task"
											| "resume_completed_task"
											| "mistake_limit_reached"
											| "browser_action_launch"
											| "use_mcp_server"
											| "finishTask"
											| undefined
										say?:
											| "command"
											| "task"
											| "command_output"
											| "completion_result"
											| "tool"
											| "error"
											| "api_req_started"
											| "api_req_finished"
											| "api_req_retried"
											| "api_req_retry_delayed"
											| "api_req_deleted"
											| "text"
											| "reasoning"
											| "user_feedback"
											| "user_feedback_diff"
											| "shell_integration_warning"
											| "browser_action"
											| "browser_action_result"
											| "mcp_server_request_started"
											| "mcp_server_response"
											| "new_task_started"
											| "new_task"
											| "checkpoint_saved"
											| "rooignore_error"
											| "diff_error"
											| undefined
										images?: string[] | undefined
										partial?: boolean | undefined
										conversationHistoryIndex?: number | undefined
										checkpoint?: Record<string, unknown> | undefined
										progressStatus?:
											| {
													text?: string | undefined
													icon?: string | undefined
											  }
											| undefined
									}
									taskId: string
									action: "created" | "updated"
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskCreated
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskStarted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskModeSwitched
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskPaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskUnpaused
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskAskResponded
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskAborted
							payload: [string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskSpawned
							payload: [string, string]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskCompleted
							payload: [
								string,
								{
									totalCost: number
									totalTokensIn: number
									totalTokensOut: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
								Partial<
									Record<
										| "browser_action"
										| "new_task"
										| "execute_command"
										| "read_file"
										| "write_to_file"
										| "append_to_file"
										| "apply_diff"
										| "insert_content"
										| "search_and_replace"
										| "search_files"
										| "list_files"
										| "list_code_definition_names"
										| "use_mcp_tool"
										| "access_mcp_resource"
										| "ask_followup_question"
										| "attempt_completion"
										| "switch_mode"
										| "fetch_instructions",
										{
											attempts: number
											failures: number
										}
									>
								>,
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskTokenUsageUpdated
							payload: [
								string,
								{
									totalCost: number
									totalTokensIn: number
									totalTokensOut: number
									contextTokens: number
									totalCacheWrites?: number | undefined
									totalCacheReads?: number | undefined
								},
							]
							taskId?: number | undefined
					  }
					| {
							eventName: RooCodeEventName.TaskToolFailed
							payload: [
								string,
								(
									| "browser_action"
									| "new_task"
									| "execute_command"
									| "read_file"
									| "write_to_file"
									| "append_to_file"
									| "apply_diff"
									| "insert_content"
									| "search_and_replace"
									| "search_files"
									| "list_files"
									| "list_code_definition_names"
									| "use_mcp_tool"
									| "access_mcp_resource"
									| "ask_followup_question"
									| "attempt_completion"
									| "switch_mode"
									| "fetch_instructions"
								),
								string,
							]
							taskId?: number | undefined
					  }
					| {
							taskId: number
							eventName: EvalEventName.Pass
							payload?: undefined
					  }
					| {
							taskId: number
							eventName: EvalEventName.Fail
							payload?: undefined
					  }
				origin: IpcOrigin.Server
				relayClientId?: string | undefined
			}
		>,
	]
>
export type IpcMessage = z.infer<typeof ipcMessageSchema>
