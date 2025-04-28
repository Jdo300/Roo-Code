import { z } from "zod"
import { Keys } from "./utils.js"
/**
 * ProviderName
 */
export declare const providerNames: readonly [
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
export declare const providerNamesSchema: z.ZodEnum<
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
export type ProviderName = z.infer<typeof providerNamesSchema>
/**
 * ToolGroup
 */
export declare const toolGroups: readonly ["read", "edit", "browser", "command", "mcp", "modes"]
export declare const toolGroupsSchema: z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>
export type ToolGroup = z.infer<typeof toolGroupsSchema>
/**
 * CheckpointStorage
 */
export declare const checkpointStorages: readonly ["task", "workspace"]
export declare const checkpointStoragesSchema: z.ZodEnum<["task", "workspace"]>
export type CheckpointStorage = z.infer<typeof checkpointStoragesSchema>
export declare const isCheckpointStorage: (value: string) => value is CheckpointStorage
/**
 * Language
 */
export declare const languages: readonly [
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
export declare const languagesSchema: z.ZodEnum<
	["ca", "de", "en", "es", "fr", "hi", "it", "ja", "ko", "pl", "pt-BR", "ru", "tr", "vi", "zh-CN", "zh-TW"]
>
export type Language = z.infer<typeof languagesSchema>
export declare const isLanguage: (value: string) => value is Language
/**
 * TelemetrySetting
 */
export declare const telemetrySettings: readonly ["unset", "enabled", "disabled"]
export declare const telemetrySettingsSchema: z.ZodEnum<["unset", "enabled", "disabled"]>
export type TelemetrySetting = z.infer<typeof telemetrySettingsSchema>
/**
 * ModelInfo
 */
export declare const modelInfoSchema: z.ZodObject<
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
export type ModelInfo = z.infer<typeof modelInfoSchema>
/**
 * ApiConfigMeta
 */
export declare const apiConfigMetaSchema: z.ZodObject<
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
>
export type ApiConfigMeta = z.infer<typeof apiConfigMetaSchema>
/**
 * HistoryItem
 */
export declare const historyItemSchema: z.ZodObject<
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
>
export type HistoryItem = z.infer<typeof historyItemSchema>
/**
 * GroupOptions
 */
export declare const groupOptionsSchema: z.ZodObject<
	{
		fileRegex: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>
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
>
export type GroupOptions = z.infer<typeof groupOptionsSchema>
/**
 * GroupEntry
 */
export declare const groupEntrySchema: z.ZodUnion<
	[
		z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
		z.ZodTuple<
			[
				z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
				z.ZodObject<
					{
						fileRegex: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>
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
>
export type GroupEntry = z.infer<typeof groupEntrySchema>
export declare const modeConfigSchema: z.ZodObject<
	{
		slug: z.ZodString
		name: z.ZodString
		roleDefinition: z.ZodString
		customInstructions: z.ZodOptional<z.ZodString>
		groups: z.ZodEffects<
			z.ZodArray<
				z.ZodUnion<
					[
						z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
						z.ZodTuple<
							[
								z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
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
						"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
						"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
>
export type ModeConfig = z.infer<typeof modeConfigSchema>
/**
 * CustomModesSettings
 */
export declare const customModesSettingsSchema: z.ZodObject<
	{
		customModes: z.ZodEffects<
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
										z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
										z.ZodTuple<
											[
												z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
			>,
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
			}[],
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
			}[]
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		customModes: {
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
	},
	{
		customModes: {
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
	}
>
export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>
/**
 * PromptComponent
 */
export declare const promptComponentSchema: z.ZodObject<
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
export type PromptComponent = z.infer<typeof promptComponentSchema>
/**
 * CustomModePrompts
 */
export declare const customModePromptsSchema: z.ZodRecord<
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
export type CustomModePrompts = z.infer<typeof customModePromptsSchema>
/**
 * CustomSupportPrompts
 */
export declare const customSupportPromptsSchema: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>
/**
 * ExperimentId
 */
export declare const experimentIds: readonly ["powerSteering"]
export declare const experimentIdsSchema: z.ZodEnum<["powerSteering"]>
export type ExperimentId = z.infer<typeof experimentIdsSchema>
/**
 * Experiments
 */
declare const experimentsSchema: z.ZodObject<
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
export type Experiments = z.infer<typeof experimentsSchema>
/**
 * ProviderSettings
 */
export declare const providerSettingsSchema: z.ZodObject<
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
	}
>
export type ProviderSettings = z.infer<typeof providerSettingsSchema>
export declare const PROVIDER_SETTINGS_KEYS: Keys<ProviderSettings>[]
/**
 * GlobalSettings
 */
export declare const globalSettingsSchema: z.ZodObject<
	{
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
										z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
										z.ZodTuple<
											[
												z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
		customSupportPrompts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>>
		enhancementApiConfigId: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
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
export type GlobalSettings = z.infer<typeof globalSettingsSchema>
export declare const GLOBAL_SETTINGS_KEYS: Keys<GlobalSettings>[]
/**
 * RooCodeSettings
 */
export declare const rooCodeSettingsSchema: z.ZodObject<
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
										z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
										z.ZodTuple<
											[
												z.ZodEnum<["read", "edit", "browser", "command", "mcp", "modes"]>,
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
										"read" | "edit" | "browser" | "command" | "mcp" | "modes",
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
		customSupportPrompts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>>
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
export type RooCodeSettings = GlobalSettings & ProviderSettings
export declare const ROO_CODE_SETTINGS_KEYS: Keys<RooCodeSettings>[]
/**
 * SecretState
 */
export type SecretState = Pick<
	ProviderSettings,
	| "apiKey"
	| "glamaApiKey"
	| "openRouterApiKey"
	| "awsAccessKey"
	| "awsSecretKey"
	| "awsSessionToken"
	| "openAiApiKey"
	| "geminiApiKey"
	| "openAiNativeApiKey"
	| "deepSeekApiKey"
	| "mistralApiKey"
	| "unboundApiKey"
	| "requestyApiKey"
>
export declare const SECRET_STATE_KEYS: Keys<SecretState>[]
export declare const isSecretStateKey: (key: string) => key is Keys<SecretState>
/**
 * GlobalState
 */
export type GlobalState = Omit<RooCodeSettings, Keys<SecretState>>
export declare const GLOBAL_STATE_KEYS: Keys<GlobalState>[]
export declare const isGlobalStateKey: (key: string) => key is Keys<GlobalState>
/**
 * ClineAsk
 */
export declare const clineAsks: readonly [
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
export declare const clineAskSchema: z.ZodEnum<
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
export type ClineAsk = z.infer<typeof clineAskSchema>
export declare const clineSays: readonly [
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
export declare const clineSaySchema: z.ZodEnum<
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
export type ClineSay = z.infer<typeof clineSaySchema>
/**
 * ToolProgressStatus
 */
export declare const toolProgressStatusSchema: z.ZodObject<
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
export type ToolProgressStatus = z.infer<typeof toolProgressStatusSchema>
/**
 * ClineMessage
 */
export declare const clineMessageSchema: z.ZodObject<
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
export type ClineMessage = z.infer<typeof clineMessageSchema>
/**
 * TokenUsage
 */
export declare const tokenUsageSchema: z.ZodObject<
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
>
export type TokenUsage = z.infer<typeof tokenUsageSchema>
/**
 * ToolName
 */
export declare const toolNames: readonly [
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
export declare const toolNamesSchema: z.ZodEnum<
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
>
export type ToolName = z.infer<typeof toolNamesSchema>
/**
 * ToolUsage
 */
export declare const toolUsageSchema: z.ZodRecord<
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
>
export type ToolUsage = z.infer<typeof toolUsageSchema>
/**
 * RooCodeEvent
 */
export declare enum RooCodeEventName {
	Connect = "connect",
	Message = "message",
	TaskCreated = "taskCreated",
	TaskStarted = "taskStarted",
	TaskModeSwitched = "taskModeSwitched",
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskAskResponded = "taskAskResponded",
	TaskAborted = "taskAborted",
	TaskSpawned = "taskSpawned",
	TaskCompleted = "taskCompleted",
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",
}
export declare const rooCodeEventsSchema: z.ZodObject<
	{
		message: z.ZodTuple<
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
		taskCreated: z.ZodTuple<[z.ZodString], null>
		taskStarted: z.ZodTuple<[z.ZodString], null>
		taskModeSwitched: z.ZodTuple<[z.ZodString, z.ZodString], null>
		taskPaused: z.ZodTuple<[z.ZodString], null>
		taskUnpaused: z.ZodTuple<[z.ZodString], null>
		taskAskResponded: z.ZodTuple<[z.ZodString], null>
		taskAborted: z.ZodTuple<[z.ZodString], null>
		taskSpawned: z.ZodTuple<[z.ZodString, z.ZodString], null>
		taskCompleted: z.ZodTuple<
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
		taskTokenUsageUpdated: z.ZodTuple<
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
		taskToolFailed: z.ZodTuple<
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
	},
	"strip",
	z.ZodTypeAny,
	{
		message: [
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
		taskCreated: [string]
		taskStarted: [string]
		taskModeSwitched: [string, string]
		taskPaused: [string]
		taskUnpaused: [string]
		taskAskResponded: [string]
		taskAborted: [string]
		taskSpawned: [string, string]
		taskCompleted: [
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
		taskTokenUsageUpdated: [
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
		taskToolFailed: [
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
	},
	{
		message: [
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
		taskCreated: [string]
		taskStarted: [string]
		taskModeSwitched: [string, string]
		taskPaused: [string]
		taskUnpaused: [string]
		taskAskResponded: [string]
		taskAborted: [string]
		taskSpawned: [string, string]
		taskCompleted: [
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
		taskTokenUsageUpdated: [
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
		taskToolFailed: [
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
	}
>
export type RooCodeEvents = z.infer<typeof rooCodeEventsSchema>
export {}
