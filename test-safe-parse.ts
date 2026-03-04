import { providerSettingsWithIdSchema } from "./packages/types/src/provider-settings.js"

const config = { apiProvider: "letta", lettaApiKey: "abc", lettaModelId: "gpt-4", apiModelId: "agent_123" }
const result = providerSettingsWithIdSchema.safeParse(config)
console.log(result.success)
if (!result.success) console.log(result.error)
