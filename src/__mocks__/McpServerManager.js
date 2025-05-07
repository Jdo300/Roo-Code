const { McpHub } = require("./McpHub")

module.exports = {
	McpServerManager: {
		getInstance: async () => new McpHub(),
		unregisterProvider: () => {},
	},
}
