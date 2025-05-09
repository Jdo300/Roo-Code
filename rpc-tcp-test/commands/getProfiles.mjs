import { IpcClient, TaskCommandName } from '../ipc-client.mjs';

async function testGetProfiles() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.GetProfiles;
  console.log(`[Test Script: ${commandToTest}] Starting test...`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command...`);
    const response = await client.sendCommand(commandToTest);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: The response should be an array (of profile names).
    if (Array.isArray(response)) {
      console.log(`[Test Script: ${commandToTest}] Test PASSED. Received an array. Profiles: ${JSON.stringify(response)}`);
      // You could add further checks, e.g., if a 'default' profile is expected
      // if (response.includes('default')) { ... }
    } else {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Expected an array, but received:`, typeof response);
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

testGetProfiles();