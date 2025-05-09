import { EventEmitter } from "events";
import ipc from "node-ipc";
import { TaskCommandName } from "../../src/schemas/ipc.js"; // Adjusted path

class IpcClient extends EventEmitter {
  constructor() {
    super();
    this.buffer = "";
    this.clientId = null;
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;
    this.socket = null;
  }

  connect(host = process.env.ROO_CODE_IPC_TCP_HOST || "localhost", port = 7800) {
    return new Promise((resolve, reject) => {
      console.log(`[IpcClient] Attempting to connect to ${host}:${port}...`);

      const connectionTimeout = setTimeout(() => {
        reject(new Error(`[IpcClient] Connection timeout after 10s to ${host}:${port}`));
      }, 10000);

      ipc.config.id = `ipc-client-${Date.now()}`; // Unique ID for multiple clients
      ipc.config.retry = 1500;
      ipc.config.maxRetries = 3;
      ipc.config.silent = true;
      ipc.config.sync = false;
      ipc.config.unlink = false;
      ipc.config.appspace = "";
      ipc.config.socketRoot = "";
      ipc.config.stopRetrying = false;
      // ipc.config.logger = console.log; // Optional: enable for debugging ipc library itself

      ipc.connectToNet("roo-tcp-server", host, port, () => {
        this.socket = ipc.of["roo-tcp-server"];
        if (!this.socket) {
          clearTimeout(connectionTimeout);
          reject(new Error("[IpcClient] Failed to establish socket with roo-tcp-server"));
          return;
        }

        this.socket.on("connect", () => {
          console.log("[IpcClient] Socket connected to roo-tcp-server.");
          // The actual 'connected' state is when we receive the Ack
        });

        this.socket.on("message", (data) => {
          if (typeof data === "string") {
            this.buffer += data;
            this._processBuffer();
          } else {
            this._handleMessage(data);
          }
        });

        this.socket.on("error", (err) => {
          console.error("[IpcClient] Connection error:", err);
          this.emit("error", err);
          // Potentially reject connect promise if error happens before Ack
          if (!this.clientId) {
            clearTimeout(connectionTimeout);
            reject(new Error(`[IpcClient] Connection error before Ack: ${err.message || err}`));
          }
        });

        this.socket.on("disconnect", () => {
          console.log("[IpcClient] Disconnected from server.");
          this.clientId = null; // Reset client ID on disconnect
          this.emit("disconnect");
        });

        // Wait for server's Ack message to confirm connection and get clientId
        const onAckReceived = (ackData) => {
          clearTimeout(connectionTimeout);
          if (this.clientId === ackData.clientId) { // Check if already resolved
            resolve(ackData);
          }
        };
        
        this.once("ackReceived", onAckReceived); // Custom event emitted by _handleMessage
      });
    });
  }

  disconnect() {
    if (this.socket) {
      ipc.disconnect("roo-tcp-server");
      console.log("[IpcClient] Disconnect initiated.");
    } else {
      console.log("[IpcClient] No active connection to disconnect.");
    }
  }

  _processBuffer() {
    const messages = this.buffer.split("\n");
    this.buffer = messages.pop() || "";

    for (const message of messages) {
      if (message.trim() === "") continue;
      try {
        const parsed = JSON.parse(message);
        this._handleMessage(parsed);
      } catch (error) {
        console.error("[IpcClient] Failed to parse message:", message, error);
        this.emit("error", new Error(`Failed to parse message: ${error.message}`));
      }
    }
  }

  _handleMessage(parsedMsg) {
    try {
      // console.log("[IpcClient] Raw message received:", JSON.stringify(parsedMsg));
      if (parsedMsg.type === "Ack") {
        this.clientId = parsedMsg.data.clientId;
        console.log("[IpcClient] Received Ack. Client ID:", this.clientId);
        this.emit("ackReceived", parsedMsg.data); // Emit custom event for connect promise
        this.emit("connected", parsedMsg.data); // General connected event
      } else if (parsedMsg.type === "TaskEvent") {
        const { eventName, payload } = parsedMsg.data;
        // console.log(`[IpcClient] Received TaskEvent: ${eventName}`, payload);

        if (eventName === "commandResponse") {
          // The payload for commandResponse is an array with one element
          const responseDetails = payload && payload.length > 0 ? payload[0] : {};
          const { commandName: respCommandName, requestId, payload: responsePayload } = responseDetails;
          
          // console.log(`[IpcClient] commandResponse for ${respCommandName} (reqId: ${requestId})`, responsePayload);

          const pendingRequest = this.pendingRequests.get(requestId);
          if (pendingRequest) {
            clearTimeout(pendingRequest.timeoutId);
            this.pendingRequests.delete(requestId);
            if (responsePayload && responsePayload.error) {
              console.error(`[IpcClient] Command ${respCommandName} (reqId: ${requestId}) failed:`, responsePayload.error);
              pendingRequest.reject(new Error(responsePayload.error.message || JSON.stringify(responsePayload.error)));
            } else {
              pendingRequest.resolve(responsePayload);
            }
          } else {
            // console.warn(`[IpcClient] No matching pending request for commandResponse (reqId: ${requestId})`);
            // Emit as a generic event if no specific promise is waiting
            this.emit("commandResponseUnmatched", { commandName: respCommandName, requestId, payload: responsePayload });
          }
        } else {
          // Emit other task events directly
          // The payload for other events might be a single object or an array
          // For simplicity, we emit the whole payload. Consumers can destructure.
          this.emit(eventName, payload);
        }
      } else {
        // console.warn("[IpcClient] Received unhandled message type:", parsedMsg.type, parsedMsg);
      }
    } catch (error) {
      console.error("[IpcClient] Error handling message:", error, parsedMsg);
      this.emit("error", new Error(`Error handling message: ${error.message}`));
    }
  }

  sendCommand(commandName, commandData) {
    if (!this.clientId) {
      return Promise.reject(new Error("[IpcClient] Client ID not yet assigned. Connect first."));
    }
    if (!this.socket || !this.socket.writable) { // Check if socket is writable
      return Promise.reject(new Error("[IpcClient] Not connected to server or socket not writable."));
    }

    const requestId = `${this.clientId}-${this.requestIdCounter++}-${Date.now()}`;
    const message = {
      type: "TaskCommand",
      origin: "client",
      clientId: this.clientId,
      data: {
        requestId: requestId,
        commandName: commandName,
        data: commandData === undefined ? undefined : commandData,
      },
    };

    // console.log(`[IpcClient] Sending command: ${commandName} (reqId: ${requestId})`, commandData);
    this.socket.emit("message", message); // node-ipc handles JSON stringification for objects

    return new Promise((resolve, reject) => {
      const timeoutDuration = [
        TaskCommandName.StartNewTask,
        TaskCommandName.SendMessage,
        // Add other potentially long-running commands here
      ].includes(commandName) ? 30000 : 10000; // 30s for long, 10s for others

      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          const error = new Error(`[IpcClient] Command ${commandName} (reqId: ${requestId}) timed out after ${timeoutDuration / 1000}s`);
          this.pendingRequests.get(requestId).reject(error); // Reject the stored promise
          this.pendingRequests.delete(requestId);
        }
      }, timeoutDuration);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
    });
  }
}

export { IpcClient, TaskCommandName };