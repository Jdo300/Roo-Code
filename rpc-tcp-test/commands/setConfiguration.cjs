// @ts-check
/** @typedef {import('../../out/src/schemas/ipc').TaskCommandName} TaskCommandNameType */
// ConfigurationType typedef removed due to persistent resolution issues with RooCodeSettings

const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

async function testSetConfiguration() {
  const client = new IpcClient();
  let exitCode = 0;
  /** @type {TaskCommandNameType} */
  const commandToTest = TaskCommandName.SetConfiguration;
  console.log(`[Test Script: ${commandToTest}] Starting test...`);

  // Define a sample configuration to set
  // Type annotation removed for sampleConfiguration due to JSDoc import issues
  const sampleConfiguration = {
    model: "test-model-from-script",
    temperature: 0.75,
    // @ts-ignore - Allow custom setting for test
    customSetting: true,
    // @ts-ignore - Allow custom setting for test
    nested: {
      value1: 123,
      value2: "test"
    }
  };

  client.on('error', (err) => {
    console.error(`[Test Script: ${commandToTest}] Client emitted error:`, err);
    // exitCode = 1; // Avoid exiting prematurely
  });

  try {
    console.log(`[Test Script: ${commandToTest}] Connecting to server...`);
    const connectionData = await client.connect();
    console.log(`[Test Script: ${commandToTest}] Connected. Client ID: ${connectionData.clientId}`);

    console.log(`[Test Script: ${commandToTest}] Sending command with data:`, JSON.stringify(sampleConfiguration, null, 2));
    const response = await client.sendCommand(commandToTest, sampleConfiguration);
    console.log(`[Test Script: ${commandToTest}] Response received:`, response);

    // Example assertion: Check if the command executed without an error response.
    // A more robust test would involve getting the configuration afterwards to verify.
    if (response && typeof response === 'object' && response.error) {
      console.error(`[Test Script: ${commandToTest}] Test FAILED. Server returned an error:`, response.error);
      exitCode = 1;
    } else {
      console.log(`[Test Script: ${commandToTest}] Test PASSED (command sent, basic response check). For full verification, use GetConfiguration.`);
      // Optionally, check if response mirrors the set config or is a success status
      // For example, if server echoes back the new config:
      // if (JSON.stringify(response) === JSON.stringify(sampleConfiguration)) { console.log("Config echoed back successfully.") }
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

testSetConfiguration();