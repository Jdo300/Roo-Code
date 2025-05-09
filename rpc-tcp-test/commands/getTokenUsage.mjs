import { IpcClient, TaskCommandName } from '../ipc-client.mjs';

async function testGetTokenUsage() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.GetTokenUsage;
  
  // IMPORTANT: Replace with a valid taskId from an active or existing task.
  const taskIdToQuery = process.argv[2] || 'placeholder-task-id-for-tokens'; 
  
  console.log(`[Test Script: ${commandToTest}] Starting test for taskId: ${taskIdToQuery}`);
  if (taskIdToQuery === 'placeholder-task-id-for-tokens') {
    console.warn(`[Test Script: ${commandToTest}] WARNING: Using a placeholder taskId. Provide a real taskId as a command line argument for a meaningful test.`);
  }

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command to get token usage for task: ${taskIdToQuery}`);
    const response = await client.sendCommand(commandToTest, taskIdToQuery);
    console.log(`[Test Script: ${commandToTest}] Response received (token usage):`, JSON.stringify(response, null, 2));

    // Example assertion: Check if the response is an object.
    if (typeof response === 'object' && response !== null && !response.error) {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Received an object for token usage.`);
      // Further checks can be done on the structure of the token usage object if known
      // e.g., if (response.hasOwnProperty('totalTokens')) { ... }
    } else if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED or task did not exist. Server returned an error:`, response.error);
      exitCode = 1;
    }
     else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected an object, but received:`, typeof response);
      exitCode = 1;
    }

  } catch (error) {
    console.warn(`[Test Script: ${commandToTest}] Error during test (this might be expected if taskId is invalid/not found):`, error.message || error);
    if (taskIdToQuery !== 'placeholder-task-id-for-tokens') {
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

testGetTokenUsage();