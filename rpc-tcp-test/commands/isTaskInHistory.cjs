// @ts-check
const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testIsTaskInHistory() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {string} */
  const commandToTest = TaskCommandName.IsTaskInHistory;
  
  // IMPORTANT: Replace with a taskId to check.
  const taskIdToCheck = process.argv[2] || 'placeholder-task-id-to-check-history'; 
  
  console.log(`[Test Script: ${commandToTest}] Starting test for taskId: ${taskIdToCheck}`);
  if (taskIdToCheck === 'placeholder-task-id-to-check-history') {
    console.warn(`[Test Script: ${commandToTest}] WARNING: Using a placeholder taskId. Provide a real taskId as a command line argument for a meaningful test.`);
  }

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command to check if task is in history: ${taskIdToCheck}`);
    const response = await client.sendCommand(commandToTest, taskIdToCheck);
    console.log(`[Test Script: ${commandToTest}] Response received (is in history?):`, response);

    // Example assertion: Check if the response is a boolean.
    if (typeof response === 'boolean') {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Task '${taskIdToCheck}' is ${response ? '' : 'not '}in history.`);
    } else if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, response.error);
      // This might happen if the taskId format is invalid, but not typically if task just doesn't exist (should return false).
      exitCode = 1;
    }
     else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected a boolean response, but received:`, typeof response);
      exitCode = 1;
    }

  } catch (error) {
    // An error here might indicate an issue with the command itself, not just a non-existent task.
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

testIsTaskInHistory();