const { BaseProvider } = require("./base-provider")

module.exports = {
	BaseProvider,
	RouterProvider: class RouterProvider extends BaseProvider {},
	GlamaProvider: class GlamaProvider extends BaseProvider {},
	OpenAIProvider: class OpenAIProvider extends BaseProvider {},
	AnthropicProvider: class AnthropicProvider extends BaseProvider {},
	OllamaProvider: class OllamaProvider extends BaseProvider {},
	LMStudioProvider: class LMStudioProvider extends BaseProvider {},
	VSCodeLMProvider: class VSCodeLMProvider extends BaseProvider {},
	GeminiProvider: class GeminiProvider extends BaseProvider {},
	OpenAINativeProvider: class OpenAINativeProvider extends BaseProvider {},
	MistralProvider: class MistralProvider extends BaseProvider {},
	DeepSeekProvider: class DeepSeekProvider extends BaseProvider {},
	UnboundProvider: class UnboundProvider extends BaseProvider {},
	RequestyProvider: class RequestyProvider extends BaseProvider {},
	XAIProvider: class XAIProvider extends BaseProvider {},
	FakeAIProvider: class FakeAIProvider extends BaseProvider {},
}
