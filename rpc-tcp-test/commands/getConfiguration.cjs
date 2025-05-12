// @ts-check


const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testGetConfiguration() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {string} */
  const commandToTest = TaskCommandName.GetConfiguration;
  console.log(`[Test Script: ${commandToTest}] Starting test...`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    /** @type {{clientId: string, serverVersion: string}} */
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command...`);
    /** @type {any} */
    const response = await client.sendCommand(commandToTest);
    console.log(`[Test Script: ${commandToTest}] Response received:`, JSON.stringify(response, null, 2));

    // Example assertion: The response should be an object.
    if (typeof response === 'object' && response !== null) {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Received an object as configuration.`);
      // Further checks can be added here, e.g., checking for specific known config keys
      // if (response.hasOwnProperty('someExpectedConfigKey')) { ... }
    } else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected an object, but received:`, typeof response);
      exitCode = 1;
    }

  } catch (error) {
    // @ts-ignore
    console.error(`[Test Script: ${commandToTest}] Error during test:`, error.message || error);
    exitCode = 1;
  } finally {
    console.log(`[Test Script: ${commandToTest}] Disconnecting...`);
    try {
      await client.disconnect();
      console.log(`[Test Script: ${commandToTest}] Disconnected.`);
    } catch (disconnectError) {
      // @ts-ignore
      console.error(`[Test Script: ${commandToTest}] Error during disconnect:`, disconnectError.message || disconnectError);
      if (exitCode === 0) exitCode = 1;
    }
    console.log(`[Test Script: ${commandToTest}] Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

testGetConfiguration();