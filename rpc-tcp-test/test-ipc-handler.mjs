import { EventEmitter } from "events"
import ipc from "node-ipc"

// TaskCommandName enum to match the server
const TaskCommandName = {
  // Simple commands
  IsReady: "IsReady",
  GetConfiguration: "GetConfiguration",
  GetProfiles: "GetProfiles",
  GetActiveProfile: "GetActiveProfile",
  GetCurrentTaskStack: "GetCurrentTaskStack",

  // Configuration commands
  SetConfiguration: "SetConfiguration",
  CreateProfile: "CreateProfile",
  SetActiveProfile: "SetActiveProfile",
  DeleteProfile: "DeleteProfile",

  // Task management commands
  StartNewTask: "StartNewTask",
  CancelTask: "CancelTask",
  CloseTask: "CloseTask",
  ClearCurrentTask: "ClearCurrentTask",
  CancelCurrentTask: "CancelCurrentTask",
  GetMessages: "GetMessages",
  GetTokenUsage: "GetTokenUsage",
  Log: "Log",
  ResumeTask: "ResumeTask",
  IsTaskInHistory: "IsTaskInHistory",

  // User interaction commands
  SendMessage: "SendMessage",
  PressPrimaryButton: "PressPrimaryButton",
  PressSecondaryButton: "PressSecondaryButton"
}

class TestClient extends EventEmitter {
  constructor() {
    super()
    this.buffer = ""
    this.clientId = null
    this.pendingRequests = new Map()
    this.requestIdCounter = 0

    // Set up event listeners for task events
    this.on("taskCreated", (taskId) => {
      console.log("[Test Client] Task created:", taskId)
    })
    this.on("taskStarted", (taskId) => {
      console.log("[Test Client] Task started:", taskId)
    })
    this.on("taskModeSwitched", (taskId, mode) => {
      console.log("[Test Client] Task switched to mode:", mode)
    })
    this.on("taskPaused", (taskId) => {
      console.log("[Test Client] Task paused:", taskId)
    })
    this.on("taskUnpaused", (taskId) => {
      console.log("[Test Client] Task unpaused:", taskId)
    })
    this.on("taskAskResponded", (taskId) => {
      console.log("[Test Client] Task ask responded:", taskId)
    })
    this.on("taskAborted", (taskId) => {
      console.log("[Test Client] Task aborted:", taskId)
    })
    this.on("taskSpawned", (taskId, parentId) => {
      console.log("[Test Client] Task spawned:", taskId, "from parent:", parentId)
    })
    this.on("taskCompleted", (taskId, tokenUsage, toolUsage) => {
      console.log("[Test Client] Task completed:", taskId)
      console.log("Token usage:", tokenUsage)
      console.log("Tool usage:", toolUsage)
    })
    this.on("taskTokenUsageUpdated", (taskId, tokenUsage) => {
      console.log("[Test Client] Token usage updated:", tokenUsage)
    })
  }

  connect() {
    return new Promise((resolve, reject) => {
      const host = process.env.ROO_CODE_IPC_TCP_HOST || "localhost"
      const port = 7800

      console.log(`Attempting to connect to ${host}:${port}...`)

      let connectionTimeout = setTimeout(() => {
        reject(new Error("Connection timeout after 10s"))
      }, 10000)

      // Configure IPC
      ipc.config.id = "test-client"
      ipc.config.retry = 3000
      ipc.config.maxRetries = 5
      ipc.config.silent = false
      ipc.config.sync = false
      ipc.config.unlink = false
      ipc.config.appspace = ""
      ipc.config.socketRoot = ""
      ipc.config.stopRetrying = false
      ipc.config.logger = console.log

      // Connect using TCP
      ipc.connectToNet("roo-tcp-server", host, port, () => {
        const socket = ipc.of["roo-tcp-server"]
        if (!socket) {
          clearTimeout(connectionTimeout)
          reject(new Error("Failed to establish connection"))
          return
        }

        socket.on("connect", () => {
          console.log("[Test Client] Socket connected")
        })

        socket.on("message", (data) => {
          console.log("[Test Client] Received raw message:", data)
          if (typeof data === "string") {
            this.buffer += data
            this._processBuffer()
          } else {
            this._handleMessage(data)
          }
        })

        socket.on("error", (err) => {
          console.error("[Test Client] Connection error:", err)
          this.emit("error", err)
        })

        socket.on("disconnect", () => {
          console.log("[Test Client] Disconnected from server")
          this.emit("disconnect")
        })

        // Wait for server's Ack message
        this.once("connect", (data) => {
          clearTimeout(connectionTimeout)
          resolve(data)
        })
      })
    })
  }

  disconnect() {
    ipc.disconnect("roo-tcp-server")
  }

  _processBuffer() {
    console.log("[Test Client] Processing buffer:", this.buffer)
    const messages = this.buffer.split("\n")
    this.buffer = messages.pop() || ""

    for (const message of messages) {
      try {
        const parsed = JSON.parse(message)
        this._handleMessage(parsed)
      } catch (error) {
        console.error("[Test Client] Failed to parse message:", error)
        this.emit("error", `Failed to parse message: ${error}`)
      }
    }
  }

  _handleMessage(parsedMsg) {
    console.log("[Test Client] Handling message:", parsedMsg)
    try {
      if (parsedMsg.type === "Ack") {
        this.clientId = parsedMsg.data.clientId
        console.log("[Test Client] Received server-assigned clientId:", this.clientId)
        this.emit("connect", parsedMsg.data)
      } else if (parsedMsg.type === "TaskEvent") {
        const { eventName, payload } = parsedMsg.data
        console.log("[Test Client] Received TaskEvent:", { eventName, payload })
        console.log("[Test Client] Full TaskEvent payload:", JSON.stringify(payload, null, 2))

        switch (eventName) {
          case "commandResponse":
            console.log("[Test Client] Processing commandResponse payload:", JSON.stringify(payload, null, 2))
            const { commandName, requestId, payload: responsePayload } = payload[0]
            console.log(`[Test Client] Received response for ${commandName}:`, responsePayload)
            this.emit("commandResponse", { commandName, requestId, payload: responsePayload })
            break;
          case "message":
            console.log("[Test Client] Received message event:", payload[0])
            const { taskId, action, message } = payload[0]
            console.log(`[Test Client] Task ${taskId} ${action} message:`, message)
            this.emit("message", taskId, action, message)
            break;
          case "taskCreated":
            this.emit("taskCreated", payload[0])
            break;
          case "taskStarted":
            this.emit("taskStarted", payload[0])
            break;
          case "taskModeSwitched":
            this.emit("taskModeSwitched", ...payload)
            break;
          case "taskPaused":
            this.emit("taskPaused", payload[0])
            break;
          case "taskUnpaused":
            this.emit("taskUnpaused", payload[0])
            break;
          case "taskAskResponded":
            this.emit("taskAskResponded", payload[0])
            break;
          case "taskAborted":
            this.emit("taskAborted", payload[0])
            break;
          case "taskSpawned":
            this.emit("taskSpawned", ...payload)
            break;
          case "taskCompleted":
            this.emit("taskCompleted", ...payload)
            break;
          case "taskTokenUsageUpdated":
            this.emit("taskTokenUsageUpdated", ...payload)
            break;
          default:
            console.log("[Test Client] Unhandled event:", eventName, payload)
        }
      }
    } catch (error) {
      console.error("[Test Client] Failed to handle message:", error)
      this.emit("error", `Failed to handle message: ${error}`)
    }
  }

  // Track command results for summary
  testResults = []

  sendCommand(commandName, commandData) {
    if (!this.clientId) {
      throw new Error("Client ID not yet assigned by server. Wait for 'connect' event.")
    }

    const socket = ipc.of["roo-tcp-server"]
    if (!socket) {
      throw new Error("Not connected to server")
    }

    const requestId = `${this.clientId}-${this.requestIdCounter++}-${Date.now()}`

    const message = {
      type: "TaskCommand",
      origin: "client",
      clientId: this.clientId,
      requestId: requestId,
      data: {
        commandName: commandName,
        data: commandData === undefined ? undefined : commandData,
      },
    }

    console.log("[Test Client] Sending command:", message)
    socket.emit("message", message)
    
    return new Promise((resolve, reject) => {
      // Add timeout
      // Use longer timeout for task-related commands
      const taskCommands = [
        TaskCommandName.StartNewTask,
        TaskCommandName.GetMessages,
        TaskCommandName.GetTokenUsage,
        TaskCommandName.SendMessage
      ]
      const timeoutDuration = taskCommands.includes(commandName) ? 30000 : 10000
      const timeout = setTimeout(() => {
        // Remove the listener if timeout occurs
        this.removeListener("commandResponse", listener)
        this.removeListener("error", errorHandler)
        reject(new Error(`Command ${commandName} timed out after ${timeoutDuration/1000}s`))
      }, timeoutDuration)

      // Use 'on' and manually remove the listener
      const listener = (response) => {
        console.log("[Test Client] Checking response match:", {
          receivedCommandName: response.commandName,
          expectedCommandName: commandName,
          receivedRequestId: response.requestId,
          expectedRequestId: requestId,
          receivedPayload: response.payload
        })

        // Match on command name since server may not return requestId
        // Handle special cases where we might get other responses while waiting
        if (response.commandName === commandName ||
            (response.commandName === 'GetConfiguration' && commandName === 'StartNewTask') ||
            (response.commandName === 'GetMessages' && commandName === 'GetMessages')) {
          console.log("[Test Client] Command response matched")
          clearTimeout(timeout)
          // Remove this specific listener
          this.removeListener("commandResponse", listener)
          // Track result
          this.testResults.push({
            command: commandName,
            data: commandData,
            response: response.payload,
            success: !response.payload?.error
          })
          resolve(response.payload)
        } else {
          console.log("[Test Client] Command response did not match")
        }
      }

      // Add error handler
      const errorHandler = (err) => {
        console.error("[Test Client] Command error:", err)
        clearTimeout(timeout)
        this.removeListener("commandResponse", listener)
        this.removeListener("error", errorHandler)
        reject(err)
      }

      this.on("error", errorHandler)

      this.on("commandResponse", listener)
    })
  }

  // Print summary table for a phase
  printPhaseSummary(phase) {
    console.log(`\n=== Phase ${phase} Summary ===`)
    console.log("Command".padEnd(20) + "| Result".padEnd(10) + "| Details")
    console.log("-".repeat(50))
    
    this.testResults.forEach(result => {
      const status = result.success ? "✓" : "✗"
      const details = result.success ?
        (typeof result.response === 'object' ? JSON.stringify(result.response) : result.response) :
        result.response?.error || 'Failed'
      
      console.log(
        result.command.padEnd(20) +
        `| ${status}`.padEnd(10) +
        `| ${details}`
      )
    })

    // Clear results for next phase
    this.testResults = []
  }
}

// Test data
/* Skipping profile and config test data
const TEST_PROFILE = "test-profile-1"
const TEST_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4000
}
*/

// Task test data
const TEST_MESSAGE = "Now multiply by 10"

// Test phases
/* Skipping Phase 1 for now
async function runPhase1(client) {
  console.log("\n=== Phase 1: Simple Commands ===")
  
  try {
    // IsReady
    console.log("\nTesting IsReady...")
    await client.sendCommand(TaskCommandName.IsReady)

    // GetConfiguration
    console.log("\nTesting GetConfiguration...")
    await client.sendCommand(TaskCommandName.GetConfiguration)

    // GetProfiles
    console.log("\nTesting GetProfiles...")
    await client.sendCommand(TaskCommandName.GetProfiles)

    // GetActiveProfile
    console.log("\nTesting GetActiveProfile...")
    await client.sendCommand(TaskCommandName.GetActiveProfile)

    // GetCurrentTaskStack
    console.log("\nTesting GetCurrentTaskStack...")
    await client.sendCommand(TaskCommandName.GetCurrentTaskStack)

    // Print phase summary
    client.printPhaseSummary(1)
  } catch (err) {
    console.error("Phase 1 Error:", err)
    throw err
  }
}
*/

/* Skipping Phase 2 for now
async function runPhase2(client) {
  console.log("\n=== Phase 2: Configuration & Profile Commands ===")

  try {
    // SetConfiguration
    console.log("\nTesting SetConfiguration...")
    await client.sendCommand(TaskCommandName.SetConfiguration, TEST_CONFIG)

    // CreateProfile
    console.log("\nTesting CreateProfile...")
    await client.sendCommand(TaskCommandName.CreateProfile, TEST_PROFILE)

    // Verify profile exists
    const profiles = await client.sendCommand(TaskCommandName.GetProfiles)
    if (!profiles.includes(TEST_PROFILE)) {
      throw new Error("Created profile not found in profiles list")
    }

    // SetActiveProfile
    console.log("\nTesting SetActiveProfile...")
    await client.sendCommand(TaskCommandName.SetActiveProfile, TEST_PROFILE)

    // Verify active profile
    const activeProfile = await client.sendCommand(TaskCommandName.GetActiveProfile)
    if (activeProfile !== TEST_PROFILE) {
      throw new Error("Active profile not set correctly")
    }

    // DeleteProfile
    console.log("\nTesting DeleteProfile...")
    await client.sendCommand(TaskCommandName.DeleteProfile, TEST_PROFILE)

    // Verify profile deleted
    const updatedProfiles = await client.sendCommand(TaskCommandName.GetProfiles)
    if (updatedProfiles.includes(TEST_PROFILE)) {
      throw new Error("Profile not deleted successfully")
    }

    // Print phase summary
    client.printPhaseSummary(2)
  } catch (err) {
    console.error("Phase 2 Error:", err)
    throw err
  }
}
*/

async function runPhase3(client) {
  console.log("\n=== Phase 3: Task Management Commands ===")
  
  try {
    // Get and set specific profile
    console.log("\nSetting active profile to 'default'...")
    await client.sendCommand(TaskCommandName.SetActiveProfile, "default")
    
    // StartNewTask with minimal config
    console.log("\nTesting StartNewTask...")
    const taskId = await client.sendCommand(TaskCommandName.StartNewTask, {
      configuration: undefined, // This will make the API use the active profile's settings
      text: "What's 2+2?",
      images: undefined
    })
    console.log("Task started with ID:", taskId)

    // Wait for user confirmation before sending message
    process.stdout.write("\nPress Enter when ready to send test message...")
    await new Promise(resolve => {
      const cleanup = () => {
        process.stdin.removeListener('data', onData)
        process.stdin.pause()
        resolve()
      }
      const onData = () => cleanup()
      process.stdin.resume()
      process.stdin.once('data', onData)
    })

    // SendMessage
    console.log("\nTesting SendMessage...")
    await client.sendCommand(TaskCommandName.SendMessage, {
      message: TEST_MESSAGE,
      images: undefined
    })

    // Wait for user confirmation before pressing buttons
    process.stdout.write("\nPress Enter when ready to test button interactions...")
    await new Promise(resolve => {
      const cleanup = () => {
        process.stdin.removeListener('data', onData)
        process.stdin.pause()
        resolve()
      }
      const onData = () => cleanup()
      process.stdin.resume()
      process.stdin.once('data', onData)
    })

    // PressPrimaryButton
    console.log("\nTesting PressPrimaryButton...")
    await client.sendCommand(TaskCommandName.PressPrimaryButton)

    // PressSecondaryButton
    console.log("\nTesting PressSecondaryButton...")
    await client.sendCommand(TaskCommandName.PressSecondaryButton)

    // GetMessages
    console.log("\nTesting GetMessages...")
    await client.sendCommand(TaskCommandName.GetMessages, taskId)

    // GetTokenUsage
    console.log("\nTesting GetTokenUsage...")
    await client.sendCommand(TaskCommandName.GetTokenUsage, taskId)

    // CancelTask
    console.log("\nTesting CancelTask...")
    await client.sendCommand(TaskCommandName.CancelTask, taskId)

    // Print phase summary
    client.printPhaseSummary(3)
  } catch (err) {
    console.error("Phase 3 Error:", err)
    throw err
  }
}

// Main test runner
async function runTest() {
  const client = new TestClient()
  
  try {
    await client.connect()
    
    // Skip Phase 1 & 2, run only Phase 3 - Task Management
    console.log("\nStarting Phase 3 - Task Management (Interactive)")
    console.log("This phase requires user interaction.")
    process.stdout.write("Press Enter to begin Phase 3...")
    await new Promise(resolve => {
      const cleanup = () => {
        process.stdin.removeListener('data', onData)
        process.stdin.pause()
        resolve()
      }
      const onData = () => cleanup()
      process.stdin.resume()
      process.stdin.once('data', onData)
    })
    
    await runPhase3(client)
    console.log("\nPhase 3 completed successfully!")
    
  } catch (err) {
    console.error("[Test] Error:", err)
  } finally {
    client.disconnect()
    // Ensure process exits
    process.exit(0)
  }
}

// Run the tests
runTest()