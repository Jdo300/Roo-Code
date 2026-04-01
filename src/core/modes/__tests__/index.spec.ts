import { describe, it, expect, vi, beforeEach } from "vitest"
import * as vscode from "vscode"
import { type ModeConfig } from "@roo-code/types"
import { getFullModeDetails, getAllModesWithPrompts } from "../index"
import { addCustomInstructions } from "../../prompts/sections/custom-instructions"
import { modes } from "../../../shared/modes"

vi.mock("vscode")
vi.mock("../../prompts/sections/custom-instructions", () => ({
	addCustomInstructions: vi.fn().mockResolvedValue("Combined instructions"),
}))

describe("core/modes", () => {
	describe("getFullModeDetails", () => {
		beforeEach(() => {
			vi.clearAllMocks()
			vi.mocked(addCustomInstructions).mockResolvedValue("Combined instructions")
		})

		it("returns base mode when no overrides exist", async () => {
			const result = await getFullModeDetails("debug")
			expect(result).toMatchObject({
				slug: "debug",
				name: "🪲 Debug",
				roleDefinition:
					"You are Roo, an expert software debugger specializing in systematic problem diagnosis and resolution.",
			})
		})

		it("applies custom mode overrides", async () => {
			const customModes: ModeConfig[] = [
				{
					slug: "debug",
					name: "Custom Debug",
					roleDefinition: "Custom debug role",
					groups: ["read"],
				},
			]

			const result = await getFullModeDetails("debug", customModes)
			expect(result).toMatchObject({
				slug: "debug",
				name: "Custom Debug",
				roleDefinition: "Custom debug role",
				groups: ["read"],
			})
		})

		it("applies prompt component overrides", async () => {
			const customModePrompts = {
				debug: {
					roleDefinition: "Overridden role",
					customInstructions: "Overridden instructions",
				},
			}

			const result = await getFullModeDetails("debug", undefined, customModePrompts)
			expect(result.roleDefinition).toBe("Overridden role")
			expect(result.customInstructions).toBe("Overridden instructions")
		})

		it("combines custom instructions when cwd provided", async () => {
			const options = {
				cwd: "/test/path",
				globalCustomInstructions: "Global instructions",
				language: "en",
			}

			await getFullModeDetails("debug", undefined, undefined, options)

			expect(addCustomInstructions).toHaveBeenCalledWith(
				expect.any(String),
				"Global instructions",
				"/test/path",
				"debug",
				{ language: "en" },
			)
		})

		it("falls back to first mode for non-existent mode", async () => {
			const result = await getFullModeDetails("non-existent")
			expect(result).toMatchObject({
				...modes[0],
			})
		})
	})

	describe("getAllModesWithPrompts", () => {
		it("returns modes from globalState", async () => {
			const mockContext = {
				globalState: {
					get: vi.fn().mockImplementation((key) => {
						if (key === "customModes") return [{ slug: "custom", name: "Custom" }]
						if (key === "customModePrompts") return { custom: { roleDefinition: "Custom Role" } }
						return undefined
					}),
				},
			} as unknown as vscode.ExtensionContext

			const result = await getAllModesWithPrompts(mockContext)
			const customMode = result.find((m) => m.slug === "custom")
			expect(customMode).toBeDefined()
			expect(customMode?.roleDefinition).toBe("Custom Role")
		})
	})
})
