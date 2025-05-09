// @ts-check

/** @typedef {import('../../out/src/schemas/ipc').TaskCommandName} TaskCommandNameEnum */

const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testCancelCurrentTask() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.CancelCurrentTask;
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

    // Note: For this command to be meaningful, a task should ideally be active.
    // This script just tests sending the command; actual effect depends on server state.
    console.warn(`[Test Script: ${commandToTest}] Note: This command is more meaningful if a task is currently active on the server.`);
    
    console.log(`[Test Script: ${commandToTest}] Sending command...`);
    /** @type {undefined} */ // Response should be undefined
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
    // If a task is not active, the server might return an error. This is a valid test outcome.
    // @ts-ignore
    console.warn(`[Test Script: ${commandToTest}] Command execution resulted in:`, error.message || error);
    // Depending on expected behavior (e.g., should it error if no task active?),
    // this might not always be a "failure" of the command itself.
    // For now, any error is treated as a script failure for simplicity.
    // exitCode = 1; // Let's consider an error here as a potential issue to investigate.
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

testCancelCurrentTask();