import { IpcClient, TaskCommandName } from '../ipc-client.mjs';
import { randomBytes } from 'crypto';

async function testCreateProfile() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.CreateProfile;
  // Generate a unique profile name for each test run to avoid conflicts
  const profileNameToCreate = `test-profile-${randomBytes(4).toString('hex')}`;
  console.log(`[Test Script: ${commandToTest}] Starting test for profile: ${profileNameToCreate}`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command to create profile: ${profileNameToCreate}`);
    const response = await client.sendCommand(commandToTest, profileNameToCreate);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    // A more robust test would involve GetProfiles afterwards to verify creation.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Profile creation initiated for: ${profileNameToCreate}.`);
      // Optionally, check if response confirms success, e.g. response === profileNameToCreate or response.success === true
    }

  } catch (error) {
    console.error(`[Test Script: ${commandToTest}] Error during test:`, error.message || error);
    exitCode = 1;
  } finally {
    console.log(`[Test Script: ${commandToTest}] Disconnecting...`);
    // Optional: Attempt to delete the created profile as cleanup, though this adds complexity
    // if (exitCode === 0) { // Only if create seemed to succeed
    //   try {
    //     console.log(`[Test Script: ${commandToTest}] Cleaning up: Deleting profile ${profileNameToCreate}`);
    //     await client.sendCommand(TaskCommandName.DeleteProfile, profileNameToCreate);
    //     console.log(`[Test Script: ${commandToTest}] Cleanup: Delete command sent for ${profileNameToCreate}`);
    //   } catch (cleanupError) {
    //     console.warn(`[Test Script: ${commandToTest}] Warning: Error during cleanup deletion of ${profileNameToCreate}:`, cleanupError.message);
    //   }
    // }
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

testCreateProfile();