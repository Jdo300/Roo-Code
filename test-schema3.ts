import { discriminatedProviderSettingsWithIdSchema } from "./packages/types/src/provider-settings.js"
console.log(discriminatedProviderSettingsWithIdSchema.parse({ apiProvider: "letta", lettaApiKey: "test-key" }))
