// @ts-check
const { IpcClient, TaskCommandName } = require('../ipc-client.cjs');

// All known TaskEvent names from src/schemas/index.ts (RooCodeEventName)
// The client emits these directly.
const ALL_TASK_EVENT_NAMES = [
  "message", "taskCreated", "taskStarted", "taskModeSwitched", 
  "taskPaused", "taskUnpaused", "taskAskResponded", "taskAborted", 
  "taskSpawned", "taskCompleted", "taskTokenUsageUpdated",
  // "commandResponse" is handled by sendCommand promises, but we can also listen for unmatched ones
];

async function monitorTaskEvents() {
  const client = new IpcClient();
  console.log(`[Monitor Script] Starting event monitor... (Press Ctrl+C to stop)`);

  client.on('error', (err) => {
    console.error(`[Monitor Script] Client emitted error:`, err);
  });

  client.on('connected', (connectionData) => {
    console.log(`[Monitor Script] Connected to server. Client ID: ${connectionData.clientId}`);
    
    // Optionally start a task if a prompt is provided as a command line argument
    const initialPrompt = process.argv[2];
    if (initialPrompt) {
      console.log(`[Monitor Script] Attempting to start a new task with prompt: "${initialPrompt}"`);
      client.sendCommand(TaskCommandName.StartNewTask, {
        configuration: {}, // Minimal config
        text: initialPrompt,
      })
      .then(taskId => {
        console.log(`[Monitor Script] Started task with ID: ${taskId}. Monitoring its events.`);
      })
      .catch(err => {
        console.error(`[Monitor Script] Error starting task:`, err);
      });
    } else {
      console.log("[Monitor Script] Listening passively for events from any task activity.");
    }
  });

  client.on('disconnect', () => {
    console.log("[Monitor Script] Disconnected from server. Restart script to monitor again.");
    process.exit(0);
  });

  // Listener for unmatched command responses (not tied to a sendCommand promise in this script)
  client.on('commandResponseUnmatched', (eventData) => {
    const { commandName, requestId, payload } = eventData;
    if (commandName === TaskCommandName.GetConfiguration) {
      console.log(`[Monitor Script] Received Unmatched Command Response for: ${commandName} (requestId: ${requestId}). Payload omitted due to size.`);
    } else {
      console.log(`[Monitor Script] Received Unmatched Command Response for: ${commandName} (requestId: ${requestId}):`, JSON.stringify(payload, null, 2));
    }
  });

  // Generic listener for all other task events
  ALL_TASK_EVENT_NAMES.forEach(eventName => {
    client.on(eventName, (payload) => {
      // The payload structure can vary. For 'message' it's often an array like [{taskId, action, message}].
      // For others like 'taskCreated', it might be [taskId].
      // We'll log the event name and the raw payload for now.
      console.log(`[Monitor Script] Event '${eventName}':`, JSON.stringify(payload, null, 2));
    });
  });

  try {
    await client.connect();
    // Keep the script running. Connection logic handles initial console logs.
    console.log("[Monitor Script] Client connection initiated. Waiting for 'connected' event or errors.");
  } catch (error) {
    console.error(`[Monitor Script] Failed to connect or fatal error:`, error.message || error);
    process.exit(1);
  }

  // Keep alive until Ctrl+C or disconnect event
  // process.stdin.resume(); // Not strictly needed if we rely on disconnect event or Ctrl+C
  
  function handleExit(signal) {
    console.log(`[Monitor Script] Received ${signal}. Disconnecting and exiting.`);
    client.disconnect(); // Attempt graceful disconnect
    // Give a moment for disconnect message to be processed if IPC is slow
    setTimeout(() => process.exit(0), 500); 
  }

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

monitorTaskEvents();