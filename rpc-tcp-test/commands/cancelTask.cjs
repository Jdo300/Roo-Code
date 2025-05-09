// @ts-check


const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testCancelTask() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.CancelTask;
  
  // IMPORTANT: Replace with a valid taskId from an active or existing task for this test to be meaningful.
  // This could be passed as a command-line argument or set from a previous StartNewTask command.
  const taskIdToCancel = process.argv[2] || 'placeholder-task-id-to-cancel'; 
  
  console.log(`[Test Script: ${commandToTest}] Starting test for taskId: ${taskIdToCancel}`);
  if (taskIdToCancel === 'placeholder-task-id-to-cancel') {
    console.warn(`[Test Script: ${commandToTest}] WARNING: Using a placeholder taskId. Provide a real taskId as a command line argument for a meaningful test.`);
  }

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    /** @type {{clientId: string, serverVersion: string}} */
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command to cancel task: ${taskIdToCancel}`);
    /** @type {undefined} */ // Response should be undefined
    const response = await client.sendCommand(commandToTest, taskIdToCancel);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    // For CancelTask, an undefined response is success.
    if (response === undefined) {
        console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Cancellation initiated for task: ${taskIdToCancel}.`);
    } else {
      // This case indicates an unexpected response format if sendCommand didn't reject for an error.
      console.warn(`[Test Script: ${commandToTest}] Command sent, but response was not undefined as expected. Response:`, response);
      exitCode = 1; // Treat unexpected non-undefined response as a failure.
    }

  } catch (error) {
    // @ts-ignore
    console.warn(`[Test Script: ${commandToTest}] Error during test (this might be expected if taskId is invalid/not found):`, error.message || error);
    // If using the placeholder, an error is likely.
    if (taskIdToCancel !== 'placeholder-task-id-to-cancel') {
        exitCode = 1;
    } else {
        console.log(`[Test Script: ${commandToTest}] Error with placeholder taskId is noted.`);
    }
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

testCancelTask();