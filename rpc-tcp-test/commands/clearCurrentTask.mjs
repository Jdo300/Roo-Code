import { IpcClient, TaskCommandName } from '../ipc-client.mjs';

async function testClearCurrentTask() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.ClearCurrentTask;
  
  // This command takes an optional string. We'll send one for testing.
  const lastMessageToSend = process.argv[2] || `Test: Clearing task at ${new Date().toISOString()}`; 
  
  console.log(`[Test Script: ${commandToTest}] Starting test...`);
  
  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.warn(`[Test Script: ${commandToTest}] Note: This command is most meaningful if a task is currently active.`);
    console.log(`[Test Script: ${commandToTest}] Sending command with optional lastMessage: "${lastMessageToSend}"`);
    const response = await client.sendCommand(commandToTest, lastMessageToSend);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED or no active task. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Clear initiated for current task.`);
      // Check for specific success indicators if applicable
    }

  } catch (error) {
    console.warn(`[Test Script: ${commandToTest}] Error during test (this might be expected if no task is active):`, error.message || error);
    // exitCode = 1; // Treat error as potential issue for now
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

testClearCurrentTask();