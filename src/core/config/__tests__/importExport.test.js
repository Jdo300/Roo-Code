// npx jest src/core/config/__tests__/importExport.test.ts
import fs from "fs/promises"
import * as path from "path"
import * as vscode from "vscode"
import { importSettings, exportSettings } from "../importExport"
import { ProviderSettingsManager } from "../ProviderSettingsManager"
// Mock VSCode modules
jest.mock("vscode", () => ({
	window: {
		showOpenDialog: jest.fn(),
		showSaveDialog: jest.fn(),
	},
	Uri: {
		file: jest.fn((filePath) => ({ fsPath: filePath })),
	},
}))
// Mock fs/promises
jest.mock("fs/promises", () => ({
	readFile: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
}))
// Mock os module
jest.mock("os", () => ({
	homedir: jest.fn(() => "/mock/home"),
}))
describe("importExport", () => {
	let mockProviderSettingsManager
	let mockContextProxy
	let mockExtensionContext
	let mockCustomModesManager
	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks()
		// Setup providerSettingsManager mock
		mockProviderSettingsManager = {
			export: jest.fn(),
			import: jest.fn(),
			listConfig: jest.fn(),
		}
		// Setup contextProxy mock with properly typed export method
		mockContextProxy = {
			setValues: jest.fn(),
			setValue: jest.fn(),
			export: jest.fn().mockImplementation(() => Promise.resolve({})),
		}
		// Setup customModesManager mock
		mockCustomModesManager = {
			updateCustomMode: jest.fn(),
		}
		const map = new Map()
		mockExtensionContext = {
			secrets: {
				get: jest.fn().mockImplementation((key) => map.get(key)),
				store: jest.fn().mockImplementation((key, value) => map.set(key, value)),
			},
		}
	})
	describe("importSettings", () => {
		it("should return success: false when user cancels file selection", async () => {
			// Mock user canceling file selection
			vscode.window.showOpenDialog.mockResolvedValue(undefined)
			const result = await importSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result).toEqual({ success: false })
			expect(vscode.window.showOpenDialog).toHaveBeenCalledWith({
				filters: { JSON: ["json"] },
				canSelectMany: false,
			})
			expect(fs.readFile).not.toHaveBeenCalled()
			expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
			expect(mockContextProxy.setValues).not.toHaveBeenCalled()
		})
		it("should import settings successfully from a valid file", async () => {
			// Mock successful file selection
			vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
			// Valid settings content
			const mockFileContent = JSON.stringify({
				providerProfiles: {
					currentApiConfigName: "test",
					apiConfigs: {
						test: {
							apiProvider: "openai",
							apiKey: "test-key",
							id: "test-id",
						},
					},
				},
				globalSettings: {
					mode: "code",
					autoApprovalEnabled: true,
				},
			})
			fs.readFile.mockResolvedValue(mockFileContent)
			// Mock export returning previous provider profiles
			const previousProviderProfiles = {
				currentApiConfigName: "default",
				apiConfigs: {
					default: {
						apiProvider: "anthropic",
						id: "default-id",
					},
				},
			}
			mockProviderSettingsManager.export.mockResolvedValue(previousProviderProfiles)
			// Mock listConfig
			mockProviderSettingsManager.listConfig.mockResolvedValue([
				{ name: "test", id: "test-id", apiProvider: "openai" },
				{ name: "default", id: "default-id", apiProvider: "anthropic" },
			])
			// Mock contextProxy.export
			mockContextProxy.export.mockResolvedValue({
				mode: "code",
			})
			const result = await importSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result.success).toBe(true)
			expect(fs.readFile).toHaveBeenCalledWith("/mock/path/settings.json", "utf-8")
			expect(mockProviderSettingsManager.export).toHaveBeenCalled()
			expect(mockProviderSettingsManager.import).toHaveBeenCalledWith({
				...previousProviderProfiles,
				currentApiConfigName: "test",
				apiConfigs: {
					test: {
						apiProvider: "openai",
						apiKey: "test-key",
						id: "test-id",
					},
				},
			})
			expect(mockContextProxy.setValues).toHaveBeenCalledWith({
				mode: "code",
				autoApprovalEnabled: true,
			})
			expect(mockContextProxy.setValue).toHaveBeenCalledWith("currentApiConfigName", "test")
			expect(mockContextProxy.setValue).toHaveBeenCalledWith("listApiConfigMeta", [
				{ name: "test", id: "test-id", apiProvider: "openai" },
				{ name: "default", id: "default-id", apiProvider: "anthropic" },
			])
		})
		it("should return success: false when file content is invalid", async () => {
			// Mock successful file selection
			vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
			// Invalid content (missing required fields)
			const mockInvalidContent = JSON.stringify({
				providerProfiles: { apiConfigs: {} },
				globalSettings: {},
			})
			fs.readFile.mockResolvedValue(mockInvalidContent)
			const result = await importSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result).toEqual({ success: false })
			expect(fs.readFile).toHaveBeenCalledWith("/mock/path/settings.json", "utf-8")
			expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
			expect(mockContextProxy.setValues).not.toHaveBeenCalled()
		})
		it("should return success: false when file content is not valid JSON", async () => {
			// Mock successful file selection
			vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
			// Invalid JSON
			const mockInvalidJson = "{ this is not valid JSON }"
			fs.readFile.mockResolvedValue(mockInvalidJson)
			const result = await importSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result).toEqual({ success: false })
			expect(fs.readFile).toHaveBeenCalledWith("/mock/path/settings.json", "utf-8")
			expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
			expect(mockContextProxy.setValues).not.toHaveBeenCalled()
		})
		it("should return success: false when reading file fails", async () => {
			// Mock successful file selection
			vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
			fs.readFile.mockRejectedValue(new Error("File read error"))
			const result = await importSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result).toEqual({ success: false })
			expect(fs.readFile).toHaveBeenCalledWith("/mock/path/settings.json", "utf-8")
			expect(mockProviderSettingsManager.import).not.toHaveBeenCalled()
			expect(mockContextProxy.setValues).not.toHaveBeenCalled()
		})
		it("should not clobber existing api configs", async () => {
			const providerSettingsManager = new ProviderSettingsManager(mockExtensionContext)
			await providerSettingsManager.saveConfig("openai", { apiProvider: "openai", id: "openai" })
			const configs = await providerSettingsManager.listConfig()
			expect(configs[0].name).toBe("default")
			expect(configs[1].name).toBe("openai")
			vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
			const mockFileContent = JSON.stringify({
				globalSettings: { mode: "code" },
				providerProfiles: {
					currentApiConfigName: "anthropic",
					apiConfigs: { default: { apiProvider: "anthropic", id: "anthropic" } },
				},
			})
			fs.readFile.mockResolvedValue(mockFileContent)
			mockContextProxy.export.mockResolvedValue({ mode: "code" })
			const result = await importSettings({
				providerSettingsManager,
				contextProxy: mockContextProxy,
				customModesManager: mockCustomModesManager,
			})
			expect(result.success).toBe(true)
			expect(result.providerProfiles?.apiConfigs["openai"]).toBeDefined()
			expect(result.providerProfiles?.apiConfigs["default"]).toBeDefined()
			expect(result.providerProfiles?.apiConfigs["default"].apiProvider).toBe("anthropic")
		})
	})
	it("should call updateCustomMode for each custom mode in config", async () => {
		vscode.window.showOpenDialog.mockResolvedValue([{ fsPath: "/mock/path/settings.json" }])
		const customModes = [
			{
				slug: "mode1",
				name: "Mode One",
				roleDefinition: "Custom role one",
				groups: [],
			},
			{
				slug: "mode2",
				name: "Mode Two",
				roleDefinition: "Custom role two",
				groups: [],
			},
		]
		const mockFileContent = JSON.stringify({
			providerProfiles: {
				currentApiConfigName: "test",
				apiConfigs: {},
			},
			globalSettings: {
				mode: "code",
				customModes,
			},
		})
		fs.readFile.mockResolvedValue(mockFileContent)
		mockProviderSettingsManager.export.mockResolvedValue({
			currentApiConfigName: "test",
			apiConfigs: {},
		})
		mockProviderSettingsManager.listConfig.mockResolvedValue([])
		const result = await importSettings({
			providerSettingsManager: mockProviderSettingsManager,
			contextProxy: mockContextProxy,
			customModesManager: mockCustomModesManager,
		})
		expect(result.success).toBe(true)
		expect(mockCustomModesManager.updateCustomMode).toHaveBeenCalledTimes(customModes.length)
		customModes.forEach((mode) => {
			expect(mockCustomModesManager.updateCustomMode).toHaveBeenCalledWith(mode.slug, mode)
		})
	})
	describe("exportSettings", () => {
		it("should not export settings when user cancels file selection", async () => {
			// Mock user canceling file selection
			vscode.window.showSaveDialog.mockResolvedValue(undefined)
			await exportSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
			})
			expect(vscode.window.showSaveDialog).toHaveBeenCalledWith({
				filters: { JSON: ["json"] },
				defaultUri: expect.anything(),
			})
			expect(mockProviderSettingsManager.export).not.toHaveBeenCalled()
			expect(mockContextProxy.export).not.toHaveBeenCalled()
			expect(fs.writeFile).not.toHaveBeenCalled()
		})
		it("should export settings to the selected file location", async () => {
			// Mock successful file location selection
			vscode.window.showSaveDialog.mockResolvedValue({
				fsPath: "/mock/path/roo-code-settings.json",
			})
			// Mock providerProfiles data
			const mockProviderProfiles = {
				currentApiConfigName: "test",
				apiConfigs: {
					test: {
						apiProvider: "openai",
						id: "test-id",
					},
				},
				migrations: {
					rateLimitSecondsMigrated: false,
				},
			}
			mockProviderSettingsManager.export.mockResolvedValue(mockProviderProfiles)
			// Mock globalSettings data
			const mockGlobalSettings = {
				mode: "code",
				autoApprovalEnabled: true,
			}
			mockContextProxy.export.mockResolvedValue(mockGlobalSettings)
			await exportSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
			})
			expect(vscode.window.showSaveDialog).toHaveBeenCalledWith({
				filters: { JSON: ["json"] },
				defaultUri: expect.anything(),
			})
			expect(mockProviderSettingsManager.export).toHaveBeenCalled()
			expect(mockContextProxy.export).toHaveBeenCalled()
			expect(fs.mkdir).toHaveBeenCalledWith("/mock/path", { recursive: true })
			expect(fs.writeFile).toHaveBeenCalledWith(
				"/mock/path/roo-code-settings.json",
				JSON.stringify(
					{
						providerProfiles: mockProviderProfiles,
						globalSettings: mockGlobalSettings,
					},
					null,
					2,
				),
				"utf-8",
			)
		})
		it("should handle errors during the export process", async () => {
			// Mock successful file location selection
			vscode.window.showSaveDialog.mockResolvedValue({
				fsPath: "/mock/path/roo-code-settings.json",
			})
			// Mock provider profiles
			mockProviderSettingsManager.export.mockResolvedValue({
				currentApiConfigName: "test",
				apiConfigs: {
					test: {
						apiProvider: "openai",
						id: "test-id",
					},
				},
				migrations: {
					rateLimitSecondsMigrated: false,
				},
			})
			// Mock global settings
			mockContextProxy.export.mockResolvedValue({
				mode: "code",
			})
			fs.writeFile.mockRejectedValue(new Error("Write error"))
			// The function catches errors internally and doesn't throw or return anything
			await exportSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
			})
			expect(vscode.window.showSaveDialog).toHaveBeenCalled()
			expect(mockProviderSettingsManager.export).toHaveBeenCalled()
			expect(mockContextProxy.export).toHaveBeenCalled()
			expect(fs.mkdir).toHaveBeenCalledWith("/mock/path", { recursive: true })
			expect(fs.writeFile).toHaveBeenCalled()
			// The error is caught and the function exits silently
		})
		it("should handle errors during directory creation", async () => {
			// Mock successful file location selection
			vscode.window.showSaveDialog.mockResolvedValue({
				fsPath: "/mock/path/roo-code-settings.json",
			})
			// Mock provider profiles
			mockProviderSettingsManager.export.mockResolvedValue({
				currentApiConfigName: "test",
				apiConfigs: {
					test: {
						apiProvider: "openai",
						id: "test-id",
					},
				},
				migrations: {
					rateLimitSecondsMigrated: false,
				},
			})
			// Mock global settings
			mockContextProxy.export.mockResolvedValue({
				mode: "code",
			})
			fs.mkdir.mockRejectedValue(new Error("Directory creation error"))
			// The function catches errors internally and doesn't throw or return anything
			await exportSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
			})
			expect(vscode.window.showSaveDialog).toHaveBeenCalled()
			expect(mockProviderSettingsManager.export).toHaveBeenCalled()
			expect(mockContextProxy.export).toHaveBeenCalled()
			expect(fs.mkdir).toHaveBeenCalled()
			expect(fs.writeFile).not.toHaveBeenCalled() // Should not be called since mkdir failed
		})
		it("should use the correct default save location", async () => {
			// Mock user cancels to avoid full execution
			vscode.window.showSaveDialog.mockResolvedValue(undefined)
			// Call the function
			await exportSettings({
				providerSettingsManager: mockProviderSettingsManager,
				contextProxy: mockContextProxy,
			})
			// Verify the default save location
			expect(vscode.window.showSaveDialog).toHaveBeenCalledWith({
				filters: { JSON: ["json"] },
				defaultUri: expect.anything(),
			})
			// Verify Uri.file was called with the correct path
			expect(vscode.Uri.file).toHaveBeenCalledWith(path.join("/mock/home", "Documents", "roo-code-settings.json"))
		})
	})
})
//# sourceMappingURL=importExport.test.js.map
