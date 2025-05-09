// @ts-check
/** @typedef {import('../../out/src/schemas/ipc').TaskCommandName} TaskCommandNameType */
// StartTaskPayload and Configuration typedefs removed due to persistent resolution issues.

const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testStartNewTask() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {TaskCommandNameType} */
  const commandToTest = TaskCommandName.StartNewTask;
  
  // Define the payload for starting a new task
  // Type annotation removed for startTaskPayload due to JSDoc import issues
  const startTaskPayload = {
    // Using an empty object; assumes server handles defaults or schema allows it.
    // If needed, provide a minimal valid RooCodeSettings object here.
    configuration: ({}), // Type cast removed
    text: process.argv[2] || "What is the capital of France?", // Initial prompt
    // images: [], // Optional: Add base64 image strings
    // newTab: false // Optional: Specify if it should open in a new tab/context
  };
  
  console.log(`[Test Script: ${commandToTest}] Starting test...`);
  
  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command with payload:`, JSON.stringify(startTaskPayload));
    // The response should be the taskId of the newly created task
    const responseTaskId = await client.sendCommand(commandToTest, startTaskPayload);
    console.log(`[Test Script: ${commandToTest}] Response received (taskId):`, responseTaskId);

    // Example assertion: Check if the response is a non-empty string (the taskId).
    if (typeof responseTaskId === 'string' && responseTaskId.length > 0) {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Received taskId: ${responseTaskId}`);
      // In a more complex scenario, you might store this taskId to use in subsequent command tests
    } else if (responseTaskId && typeof responseTaskId === 'object' && responseTaskId.error) {
        console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, responseTaskId.error);
        exitCode = 1;
    } else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected a non-empty string taskId, but received:`, responseTaskId);
      exitCode = 1;
    }

  } catch (error) {
    console.error(`[Test Script: ${commandToTest}] Error during test:`, error.message || error);
    exitCode = 1;
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

testStartNewTask();