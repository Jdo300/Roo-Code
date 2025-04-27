export const EXPERIMENT_IDS = {
	POWER_STEERING: "powerSteering",
}
export const experimentConfigsMap = {
	POWER_STEERING: { enabled: false },
}
export const experimentDefault = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [EXPERIMENT_IDS[_], config.enabled]),
)
export const experiments = {
	get: (id) => experimentConfigsMap[id],
	isEnabled: (experimentsConfig, id) => experimentsConfig[id] ?? experimentDefault[id],
}
//# sourceMappingURL=experiments.js.map
