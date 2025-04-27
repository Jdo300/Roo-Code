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
exports.IpcClient = void 0
var node_events_1 = require("node:events")
var crypto = require("node:crypto")
var node_ipc_1 = require("node-ipc")
var types_1 = require("@evals/types")
var IpcClient = /** @class */ (function (_super) {
	__extends(IpcClient, _super)
	function IpcClient(socketPath, log) {
		if (log === void 0) {
			log = console.log
		}
		var _this = _super.call(this) || this
		_this._isConnected = false
		_this._socketPath = socketPath
		_this._id = "roo-code-evals-".concat(crypto.randomBytes(6).toString("hex"))
		_this._log = log
		node_ipc_1.default.config.silent = true
		node_ipc_1.default.connectTo(_this._id, _this.socketPath, function () {
			var _a, _b, _c
			;(_a = node_ipc_1.default.of[_this._id]) === null || _a === void 0
				? void 0
				: _a.on("connect", function () {
						return _this.onConnect()
					})
			;(_b = node_ipc_1.default.of[_this._id]) === null || _b === void 0
				? void 0
				: _b.on("disconnect", function () {
						return _this.onDisconnect()
					})
			;(_c = node_ipc_1.default.of[_this._id]) === null || _c === void 0
				? void 0
				: _c.on("message", function (data) {
						return _this.onMessage(data)
					})
		})
		return _this
	}
	IpcClient.prototype.onConnect = function () {
		if (this._isConnected) {
			return
		}
		this.log("[client#onConnect]")
		this._isConnected = true
		this.emit(types_1.IpcMessageType.Connect)
	}
	IpcClient.prototype.onDisconnect = function () {
		if (!this._isConnected) {
			return
		}
		this.log("[client#onDisconnect]")
		this._isConnected = false
		this.emit(types_1.IpcMessageType.Disconnect)
	}
	IpcClient.prototype.onMessage = function (data) {
		if (typeof data !== "object") {
			this._log("[client#onMessage] invalid data", data)
			return
		}
		var result = types_1.ipcMessageSchema.safeParse(data)
		if (!result.success) {
			this.log("[client#onMessage] invalid payload", result.error, data)
			return
		}
		var payload = result.data
		if (payload.origin === types_1.IpcOrigin.Server) {
			switch (payload.type) {
				case types_1.IpcMessageType.Ack:
					this._clientId = payload.data.clientId
					this.emit(types_1.IpcMessageType.Ack, payload.data)
					break
				case types_1.IpcMessageType.TaskEvent:
					this.emit(types_1.IpcMessageType.TaskEvent, payload.data)
					break
			}
		}
	}
	IpcClient.prototype.log = function () {
		var args = []
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i]
		}
		this._log.apply(this, args)
	}
	IpcClient.prototype.sendMessage = function (message) {
		var _a
		;(_a = node_ipc_1.default.of[this._id]) === null || _a === void 0 ? void 0 : _a.emit("message", message)
	}
	IpcClient.prototype.disconnect = function () {
		try {
			node_ipc_1.default.disconnect(this._id)
			// @TODO: Should we set _disconnect here?
		} catch (error) {
			this.log("[client#disconnect] error disconnecting", error)
		}
	}
	Object.defineProperty(IpcClient.prototype, "socketPath", {
		get: function () {
			return this._socketPath
		},
		enumerable: false,
		configurable: true,
	})
	Object.defineProperty(IpcClient.prototype, "clientId", {
		get: function () {
			return this._clientId
		},
		enumerable: false,
		configurable: true,
	})
	Object.defineProperty(IpcClient.prototype, "isConnected", {
		get: function () {
			return this._isConnected
		},
		enumerable: false,
		configurable: true,
	})
	Object.defineProperty(IpcClient.prototype, "isReady", {
		get: function () {
			return this._isConnected && this._clientId !== undefined
		},
		enumerable: false,
		configurable: true,
	})
	return IpcClient
})(node_events_1.default)
exports.IpcClient = IpcClient
