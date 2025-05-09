import { IpcClient, TaskCommandName } from '../ipc-client.mjs';

async function testSetActiveProfile() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.SetActiveProfile;
  const profileToActivate = 'default'; // Or use a known existing profile
  console.log(`[Test Script: ${commandToTest}] Starting test to activate profile: ${profileToActivate}`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.warn(`[Test Script: ${commandToTest}] Note: This test assumes the profile '${profileToActivate}' exists on the server.`);
    console.log(`[Test Script: ${commandToTest}] Sending command to activate profile: ${profileToActivate}`);
    const response = await client.sendCommand(commandToTest, profileToActivate);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    // A more robust test would involve GetActiveProfile afterwards to verify.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Activation initiated for profile: ${profileToActivate}.`);
      // Optionally, check if response confirms success, e.g. response.success === true
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

testSetActiveProfile();