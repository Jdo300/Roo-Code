const querystring = require("querystring")

const commands = [
	{ command: "requestState" },
	{ command: "alwaysAllowReadOnly", value: true },
	{ command: "alwaysAllowReadOnly", value: false },
]

commands.forEach((command) => {
	console.log(querystring.escape(JSON.stringify(command)))
})
