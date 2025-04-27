"use strict"
var __extends =
	(this && this.__extends) ||
	(function () {
		var extendStatics = function (d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function (d, b) {
						d.__proto__ = b
					}) ||
				function (d, b) {
					for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]
				}
			return extendStatics(d, b)
		}
		return function (d, b) {
			if (typeof b !== "function" && b !== null)
				throw new TypeError("Class extends value " + String(b) + " is not a constructor or null")
			extendStatics(d, b)
			function __() {
				this.constructor = d
			}
			d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.IpcServer = void 0
var node_events_1 = require("node:events")
var crypto = require("node:crypto")
var node_ipc_1 = require("node-ipc")
var types_1 = require("@evals/types")
var IpcServer = /** @class */ (function (_super) {
	__extends(IpcServer, _super)
	function IpcServer(socketPath, log) {
		if (log === void 0) {
			log = console.log
		}
		var _this = _super.call(this) || this
		_this._isListening = false
		_this._socketPath = socketPath
		_this._log = log
		_this._clients = new Map()
		return _this
	}
	IpcServer.prototype.listen = function () {
		var _this = this
		this._isListening = true
		node_ipc_1.default.config.silent = true
		node_ipc_1.default.serve(this.socketPath, function () {
			node_ipc_1.default.server.on("connect", function (socket) {
				return _this.onConnect(socket)
			})
			node_ipc_1.default.server.on("socket.disconnected", function (socket) {
				return _this.onDisconnect(socket)
			})
			node_ipc_1.default.server.on("message", function (data) {
				return _this.onMessage(data)
			})
		})
		node_ipc_1.default.server.start()
	}
	IpcServer.prototype.onConnect = function (socket) {
		var clientId = crypto.randomBytes(6).toString("hex")
		this._clients.set(clientId, socket)
		this.log("[server#onConnect] clientId = ".concat(clientId, ", # clients = ").concat(this._clients.size))
		this.send(socket, {
			type: types_1.IpcMessageType.Ack,
			origin: types_1.IpcOrigin.Server,
			data: { clientId: clientId, pid: process.pid, ppid: process.ppid },
		})
		this.emit(types_1.IpcMessageType.Connect, clientId)
	}
	IpcServer.prototype.onDisconnect = function (destroyedSocket) {
		var disconnectedClientId
		for (var _i = 0, _a = this._clients.entries(); _i < _a.length; _i++) {
			var _b = _a[_i],
				clientId = _b[0],
				socket = _b[1]
			if (socket === destroyedSocket) {
				disconnectedClientId = clientId
				this._clients.delete(clientId)
				break
			}
		}
		this.log(
			"[server#socket.disconnected] clientId = "
				.concat(disconnectedClientId, ", # clients = ")
				.concat(this._clients.size),
		)
		if (disconnectedClientId) {
			this.emit(types_1.IpcMessageType.Disconnect, disconnectedClientId)
		}
	}
	IpcServer.prototype.onMessage = function (data) {
		if (typeof data !== "object") {
			this.log("[server#onMessage] invalid data", data)
			return
		}
		var result = types_1.ipcMessageSchema.safeParse(data)
		if (!result.success) {
			this.log("[server#onMessage] invalid payload", result.error, data)
			return
		}
		var payload = result.data
		if (payload.origin === types_1.IpcOrigin.Client) {
			switch (payload.type) {
				case types_1.IpcMessageType.TaskCommand:
					// Emit the generic TaskCommand event for now.
					// The handling of specific command names will be done in src/exports/api.ts
					this.emit(types_1.IpcMessageType.TaskCommand, payload.clientId, payload.data)
					break
			}
		}
	}
	IpcServer.prototype.log = function () {
		var args = []
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i]
		}
		this._log.apply(this, args)
	}
	IpcServer.prototype.broadcast = function (message) {
		this.log("[server#broadcast] message =", message)
		node_ipc_1.default.server.broadcast("message", message)
	}
	IpcServer.prototype.send = function (client, message) {
		this.log("[server#send] message =", message)
		if (typeof client === "string") {
			var socket = this._clients.get(client)
			if (socket) {
				node_ipc_1.default.server.emit(socket, "message", message)
			}
		} else {
			node_ipc_1.default.server.emit(client, "message", message)
		}
	}
	Object.defineProperty(IpcServer.prototype, "socketPath", {
		get: function () {
			return this._socketPath
		},
		enumerable: false,
		configurable: true,
	})
	Object.defineProperty(IpcServer.prototype, "isListening", {
		get: function () {
			return this._isListening
		},
		enumerable: false,
		configurable: true,
	})
	return IpcServer
})(node_events_1.default)
exports.IpcServer = IpcServer
