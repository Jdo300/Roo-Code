import { providerSettingsWithIdSchema } from "./packages/types/src/provider-settings.js"
console.log(providerSettingsWithIdSchema.parse({ apiProvider: "letta", lettaApiKey: "test-key" }))
