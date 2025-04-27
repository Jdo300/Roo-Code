import { EXPERIMENT_IDS, experimentConfigsMap, experiments as Experiments } from "../experiments"
describe("experiments", () => {
	describe("POWER_STEERING", () => {
		it("is configured correctly", () => {
			expect(EXPERIMENT_IDS.POWER_STEERING).toBe("powerSteering")
			expect(experimentConfigsMap.POWER_STEERING).toMatchObject({
				enabled: false,
			})
		})
	})
	describe("isEnabled", () => {
		it("returns false when experiment is not enabled", () => {
			const experiments = {
				powerSteering: false,
			}
			expect(Experiments.isEnabled(experiments, EXPERIMENT_IDS.POWER_STEERING)).toBe(false)
		})
		it("returns true when experiment is enabled", () => {
			const experiments = {
				powerSteering: true,
			}
			expect(Experiments.isEnabled(experiments, EXPERIMENT_IDS.POWER_STEERING)).toBe(true)
		})
		it("returns false when experiment is not present", () => {
			const experiments = {
				powerSteering: false,
			}
			expect(Experiments.isEnabled(experiments, EXPERIMENT_IDS.POWER_STEERING)).toBe(false)
		})
	})
})
//# sourceMappingURL=experiments.test.js.map
