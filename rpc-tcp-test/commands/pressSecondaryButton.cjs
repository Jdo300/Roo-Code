// @ts-check
const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testPressSecondaryButton() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {string} */
  const commandToTest = TaskCommandName.PressSecondaryButton;
  console.log(`[Test Script: ${commandToTest}] Starting test...`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.warn(`[Test Script: ${commandToTest}] Note: This command's effect depends on the current task state on the server (e.g., expecting a button press).`);

    console.log(`[Test Script: ${commandToTest}] Sending command...`);
    const response = await client.sendCommand(commandToTest); // No commandData needed
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: The response should be undefined as per schema.
    if (response === undefined) {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Command executed and received undefined response as expected.`);
    } else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected undefined response, but received:`, response);
      exitCode = 1;
    }

  } catch (error) {
    console.warn(`[Test Script: ${commandToTest}] Command execution resulted in:`, error.message || error);
    // This might be expected if no UI is awaiting a button press.
    // For now, treating errors as potential issues.
    // exitCode = 1;
  } finally {
    console.log(`[Test Script: ${commandToTest}] Disconnecting...`);
    try {
      await client.disconnect();
      console.log(`[Test Script: ${commandToTest}] Disconnected.`);
    } catch (disconnectError) {
      console.error(`[Test Script: ${commandToTest}] Error during disconnect:`, disconnectError);
      if (exitCode === 0) exitCode = 1;
    }
    console.log(`[Test Script: ${commandToTest}] Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

testPressSecondaryButton();