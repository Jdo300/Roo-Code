import { EventEmitter } from "events"
import ipc from "node-ipc"

class TestClient extends EventEmitter {
  constructor() {
    super()
    this.buffer = ""
    this.clientId = null
    this.pendingRequests = new Map()
    this.requestIdCounter = 0
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
        
        if (eventName === "commandResponse") {
          const { commandName, requestId, payload: responsePayload } = payload[0]
          console.log(`[Test Client] Received response for ${commandName}:`, responsePayload)
          this.emit("commandResponse", { commandName, requestId, payload: responsePayload })
        }
      }
    } catch (error) {
      console.error("[Test Client] Failed to handle message:", error)
      this.emit("error", `Failed to handle message: ${error}`)
    }
  }

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
    
    return new Promise((resolve) => {
      this.once("commandResponse", (response) => {
        if (response.requestId === requestId) {
          resolve(response.payload)
        }
      })
    })
  }
}

// Create and run test
async function runTest() {
  const client = new TestClient()
  
  try {
    await client.connect()
    console.log("[Test] Connected, sending IsReady command")
    const isReady = await client.sendCommand("IsReady")
    console.log("[Test] Received isReady:", isReady)
  } catch (err) {
    console.error("[Test] Error:", err)
  } finally {
    client.disconnect()
  }
}

runTest()