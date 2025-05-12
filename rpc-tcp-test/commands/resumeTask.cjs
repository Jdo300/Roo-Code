// @ts-check
const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testResumeTask() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {string} */
  const commandToTest = TaskCommandName.ResumeTask;
  
  // IMPORTANT: Replace with a valid taskId from a PAUSED task.
  const taskIdToResume = process.argv[2] || 'placeholder-task-id-to-resume'; 
  
  console.log(`[Test Script: ${commandToTest}] Starting test for taskId: ${taskIdToResume}`);
  if (taskIdToResume === 'placeholder-task-id-to-resume') {
    console.warn(`[Test Script: ${commandToTest}] WARNING: Using a placeholder taskId. Provide a real taskId of a PAUSED task as a command line argument for a meaningful test.`);
  }

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.warn(`[Test Script: ${commandToTest}] Note: This command is effective only if task '${taskIdToResume}' is currently paused on the server.`);
    console.log(`[Test Script: ${commandToTest}] Sending command to resume task: ${taskIdToResume}`);
    const response = await client.sendCommand(commandToTest, taskIdToResume);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED or task could not be resumed. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Resume initiated for task: ${taskIdToResume}.`);
      // Check for specific success indicators if applicable
    }

  } catch (error) {
    console.warn(`[Test Script: ${commandToTest}] Error during test (this might be expected if taskId is invalid, not found, or not paused):`, error.message || error);
    if (taskIdToResume !== 'placeholder-task-id-to-resume') {
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
      console.error(`[Test Script: ${commandToTest}] Error during disconnect:`, disconnectError);
      if (exitCode === 0) exitCode = 1;
    }
    console.log(`[Test Script: ${commandToTest}] Exiting with code ${exitCode}.`);
    process.exit(exitCode);
  }
}

testResumeTask();