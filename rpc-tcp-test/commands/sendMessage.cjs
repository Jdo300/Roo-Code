// @ts-check
const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testSendMessage() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {string} */
  const commandToTest = TaskCommandName.SendMessage;
  
  // Define the message payload
  const messagePayload = {
    message: process.argv[2] || "Hello from the SendMessage test script!",
    // images: [] // Optional: Add base64 image strings here for testing
  };
  
  console.log(`[Test Script: ${commandToTest}] Starting test...`);
  
  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.warn(`[Test Script: ${commandToTest}] Note: This command requires a task to be active on the server to receive the message.`);
    console.log(`[Test Script: ${commandToTest}] Sending command with payload:`, JSON.stringify(messagePayload));
    const response = await client.sendCommand(commandToTest, messagePayload);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED or no active task. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Message sent to server.`);
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

testSendMessage();