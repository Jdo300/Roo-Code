const { RooCodeClient } = require('./index.cjs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

async function testCommands() {
    const client = new RooCodeClient(7800);

    try {
        console.log("Connecting to Roo Code WebSocket server...");
        await client.connect();
        console.log("Connected! Interactive command test started.\n");
        console.log("Type JSON commands and press Enter to send. Type 'help' for command examples or 'exit' to quit.\n");

        readline.prompt();

        readline.on('line', async (input) => {
            const command = input.trim();

            if (command.toLowerCase() === 'exit') {
                console.log("Exiting interactive test, closing connection...");
                await client.close();
                readline.close();
                console.log("Connection closed.");
                return;
            }

            if (command.toLowerCase() === 'help') {
                console.log("\n--- Command Examples ---");
                console.log("\nBasic Commands:");
                console.log("- Send a chat message:");
                console.log('  {"type": "invoke", "invoke": "sendMessage", "text": "Hello Cline!"}');
                console.log("\nSetting Commands with Verification:");
                console.log("- Enable auto-approve for files (with verification):");
                console.log('  {"command": "alwaysAllowFiles", "value": true, "verify": true}');
                console.log("- Disable auto-approve for terminal (with verification):");
                console.log('  {"command": "alwaysAllowTerminal", "value": false, "verify": true}');
                console.log("\nOther Commands:");
                console.log("- Request current state:");
                console.log('  {"command": "requestState"}');
                console.log("\nVerification Details:");
                console.log("Adding 'verify': true to commands will:");
                console.log("1. Send the setting update command");
                console.log("2. Request the current state");
                console.log("3. Verify the setting was updated correctly");
                console.log("4. Return success/failure in the response");
                console.log("--- End Examples ---\n");
                readline.prompt();
                return;
            }

            let jsonCommand;
            try {
                jsonCommand = JSON.parse(command);
            } catch (e) {
                console.error("Invalid JSON command. Please enter valid JSON.");
                readline.prompt();
                return;
            }

            try {
                // If verification is requested, we need to:
                // 1. Send the command
                // 2. Request the current state
                // 3. Verify the setting was updated correctly
                if (jsonCommand.verify) {
                    const settingName = jsonCommand.command;
                    const expectedValue = jsonCommand.value;

                    // Send the setting update command
                    const updateResponse = await client.send(settingName, expectedValue);
                    console.log("Command Response:", updateResponse);

                    // Request current state to verify
                    const stateResponse = await client.send("requestState");
                    
                    // Get the actual value from state
                    const state = stateResponse?.message ? JSON.parse(stateResponse.message) : null;
                    const actualValue = state ? state[settingName] : undefined;

                    // Verify the setting was updated correctly
                    const success = actualValue === expectedValue;
                    
                    console.log("Verification Result:", {
                        setting: settingName,
                        success,
                        expectedValue,
                        actualValue
                    });
                } else {
                    // No verification requested, just send the command
                    const response = await client.send(jsonCommand.command, jsonCommand.value);
                    console.log("Response:", response);
                }
            } catch (error) {
                console.error("Error sending command:", error);
            }

            readline.prompt();
        });

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

testCommands();
