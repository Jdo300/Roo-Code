// @ts-check

/** @typedef {import('../out/src/schemas/ipc').TaskCommandName} TaskCommandNameEnum */

const { EventEmitter } = require("events");
const ipc = require("node-ipc");

const TaskCommandName = {
    StartNewTask: "StartNewTask",
    CancelTask: "CancelTask",
    CloseTask: "CloseTask",
    GetCurrentTaskStack: "GetCurrentTaskStack",
    ClearCurrentTask: "ClearCurrentTask",
    CancelCurrentTask: "CancelCurrentTask",
    SendMessage: "SendMessage",
    PressPrimaryButton: "PressPrimaryButton",
    PressSecondaryButton: "PressSecondaryButton",
    SetConfiguration: "SetConfiguration",
    GetConfiguration: "GetConfiguration",
    IsReady: "IsReady",
    GetMessages: "GetMessages",
    GetTokenUsage: "GetTokenUsage",
    Log: "Log",
    ResumeTask: "ResumeTask",
    IsTaskInHistory: "IsTaskInHistory",
    CreateProfile: "CreateProfile",
    GetProfiles: "GetProfiles",
    SetActiveProfile: "SetActiveProfile",
    GetActiveProfile: "GetActiveProfile",
    DeleteProfile: "DeleteProfile",
};

/**
 * @class IpcClient
 * @extends EventEmitter
 */
class IpcClient extends EventEmitter {
  constructor() {
    super();
    this.buffer = "";
    /** @type {string | null} */
    this.clientId = null;
    /** @type {Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void, timeoutId: NodeJS.Timeout }>} */
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;
    /** @type {any} */ // Using any to bypass JSDoc type issue for now
    this.socket = null;
  }

  /**
   * @param {string} [host]
   * @param {number} [port]
   * @returns {Promise<{clientId: string, serverVersion: string}>}
   */
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
      ipc.config.sync = false; // Explicitly false for TCP client
      ipc.config.unlink = false; // Not relevant for TCP
      ipc.config.appspace = "";
      ipc.config.socketRoot = "";
      ipc.config.stopRetrying = false; // Allow retries as configured
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
          } else if (typeof data === 'object' && data !== null) {
            this._handleMessage(data);
          } else {
            console.warn("[IpcClient] Received message of unexpected type:", typeof data, data);
          }
        });

        this.socket.on("error", (err) => {
          console.error("[IpcClient] Connection error:", err);
          this.emit("error", err);
          if (!this.clientId) { // If error happens before Ack
            clearTimeout(connectionTimeout);
            reject(new Error(`[IpcClient] Connection error before Ack: ${err.message || err}`));
          }
        });

        this.socket.on("disconnect", () => {
          console.log("[IpcClient] Disconnected from server.");
          this.clientId = null; // Reset client ID on disconnect
          this.emit("disconnect");
        });

        /** @type {(ackData: {clientId: string, serverVersion: string}) => void} */
        const onAckReceived = (ackData) => {
          clearTimeout(connectionTimeout);
          resolve(ackData);
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
    let boundary = this.buffer.indexOf('\n');
    while (boundary !== -1) {
      const messageString = this.buffer.substring(0, boundary);
      this.buffer = this.buffer.substring(boundary + 1);
      if (messageString.trim() === "") {
        boundary = this.buffer.indexOf('\n');
        continue;
      }
      try {
        const parsed = JSON.parse(messageString);
        this._handleMessage(parsed);
      } catch (error) {
        console.error("[IpcClient] Failed to parse message from buffer:", messageString, error);
        this.emit("error", new Error(`Failed to parse message: ${error.message}`));
      }
      boundary = this.buffer.indexOf('\n');
    }
  }

  /**
   * @param {any} parsedMsg
   */
  _handleMessage(parsedMsg) {
    try {
      // console.log("[IpcClient] Raw message received:", JSON.stringify(parsedMsg));
      if (parsedMsg.type === "Ack") {
        this.clientId = parsedMsg.data.clientId;
        console.log("[IpcClient] Received Ack. Client ID:", this.clientId, "Server Version:", parsedMsg.data.serverVersion);
        this.emit("ackReceived", parsedMsg.data); // Emit custom event for connect promise
        this.emit("connected", parsedMsg.data); // General connected event
      } else if (parsedMsg.type === "TaskEvent") {
        const { eventName, payload } = parsedMsg.data;
        // console.log(`[IpcClient] Received TaskEvent: ${eventName}`, payload);

        if (eventName === "commandResponse") {
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
            this.emit("commandResponseUnmatched", { commandName: respCommandName, requestId, payload: responsePayload });
          }
        } else {
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

  /**
   * @param {string} commandName
   * @param {any} [commandData]
   * @returns {Promise<any>}
   */
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
        data: commandData === undefined ? undefined : commandData, // Keep undefined if not provided
      },
    };

    // console.log(`[IpcClient] Sending command: ${commandName} (reqId: ${requestId})`, commandData);
    // For TCP, node-ipc expects a string or buffer. Server side expects newline-terminated JSON strings.
    this.socket.emit(JSON.stringify(message) + '\n');

    return new Promise((resolve, reject) => {
      const timeoutDuration = [
        TaskCommandName.StartNewTask, // Runtime enum value
        TaskCommandName.SendMessage,  // Runtime enum value
        // Add other potentially long-running commands here
      ].includes(commandName) ? 30000 : 10000; // 30s for long, 10s for others

      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          const error = new Error(`[IpcClient] Command ${commandName} (reqId: ${requestId}) timed out after ${timeoutDuration / 1000}s`);
          this.pendingRequests.get(requestId)?.reject(error); // Use optional chaining
          this.pendingRequests.delete(requestId);
        }
      }, timeoutDuration);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
    });
  }
}

module.exports = { IpcClient, TaskCommandName }; // Export runtime TaskCommandName