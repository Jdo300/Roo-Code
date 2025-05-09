// @ts-check

/** @typedef {import('../../out/src/schemas/ipc').TaskCommandName} TaskCommandNameEnum */

const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testIsReady() {
  const client = new IpcClient();
  let exitCode = 0;
  // Use the runtime TaskCommandName for logging
  console.log(`[Test Script: ${TaskCommandName.IsReady}] Starting test...`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${TaskCommandName.IsReady}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely if disconnect hasn't run
  });

  try {
    console.log(`[Test Script: ${TaskCommandName.IsReady}] Connecting to server...`);
    /** @type {{clientId: string, serverVersion: string}} */
    const connectionData = await client.connect();
    console.log(`[Test Script: ${TaskCommandName.IsReady}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${TaskCommandName.IsReady}] Sending command...`);
    // Use the imported TaskCommandName enum for the command
    /** @type {any} */ // Assuming response can be varied, adjust if a specific type is expected
    const response = await client.sendCommand(TaskCommandName.IsReady);
    console.log(`[Test Script: ${TaskCommandName.IsReady}] Response received:`, response);

    // Example assertion: The response for IsReady is often a boolean true or an object like { isReady: true }
    // Adjust based on actual expected server response.
    if (response === true || (typeof response === 'object' && response !== null && response.isReady === true)) {
      console.log(`[Test Script: ${TaskCommandName.IsReady}] Test PASSED.`);
    } else {
      console.error(`[Test Script: ${TaskCommandName.IsReady}] Test FAILED. Unexpected response format or value.`);
      exitCode = 1;
    }

  } catch (error) {
    // @ts-ignore
    console.error(`[Test Script: ${TaskCommandName.IsReady}] Error during test:`, error.message || error);
    exitCode = 1;
  } finally {
    console.log(`[Test Script: ${TaskCommandName.IsReady}] Disconnecting...`);
    try {
      await client.disconnect(); // Assuming disconnect might be async or involve ipc operations
      console.log(`[Test Script: ${TaskCommandName.IsReady}] Disconnected.`);
    } catch (disconnectError) {
      // @ts-ignore
      console.error(`[Test Script: ${TaskCommandName.IsReady}] Error during disconnect:`, disconnectError.message || disconnectError);
      if (exitCode === 0) exitCode = 1; // Ensure failure if disconnect errors
    }
    console.log(`[Test Script: ${TaskCommandName.IsReady}] Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

testIsReady();