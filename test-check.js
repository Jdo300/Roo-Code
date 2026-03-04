const { checkExistKey } = require("./build/src/shared/checkExistApiConfig.js")

console.log(
	checkExistKey({
		apiProvider: "letta",
		lettaApiKey: "test-key",
		apiModelId: "agent-123",
	}),
)

console.log(
	checkExistKey({
		apiProvider: "letta",
		lettaApiKey: "test-key",
	}),
)
