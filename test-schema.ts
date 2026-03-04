import { providerSettingsSchema } from "./packages/types/src/provider-settings.js"
console.log(providerSettingsSchema.parse({ apiProvider: "letta", lettaApiKey: "xyz" }))
