import { IpcClient, TaskCommandName } from '../ipc-client.mjs';
import { randomBytes } from 'crypto';

async function testDeleteProfile() {
  const client = new IpcClient();
  let exitCode = 0;
  const commandToTest = TaskCommandName.DeleteProfile;
  // For this test, we'll attempt to delete a uniquely named profile.
  // In a real test suite, you'd create this profile first.
  const profileNameToDelete = `temp-profile-to-delete-${randomBytes(4).toString('hex')}`;
  
  console.log(`[Test Script: ${commandToTest}] Starting test for profile: ${profileNameToDelete}`);

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    // Step 1: Create the profile to ensure it exists before deletion (optional but good for isolated test)
    console.log(`[Test Script: ${commandToTest}] Pre-requisite: Creating profile '${profileNameToDelete}' to delete.`);
    try {
      await client.sendCommand(TaskCommandName.CreateProfile, profileNameToDelete);
      console.log(`[Test Script: ${commandToTest}] Profile '${profileNameToDelete}' created or already existed.`);
    } catch (createError) {
      console.warn(`[Test Script: ${commandToTest}] Could not create profile '${profileNameToDelete}' for deletion test, proceeding anyway. Error: ${createError.message}`);
      // If creation fails, the delete might also fail, which could be an expected outcome.
    }

    console.log(`[Test Script: ${commandToTest}] Sending command to delete profile: ${profileNameToDelete}`);
    const response = await client.sendCommand(commandToTest, profileNameToDelete);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    // A more robust test would involve GetProfiles afterwards to verify deletion.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent). Deletion initiated for profile: ${profileNameToDelete}.`);
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

testDeleteProfile();