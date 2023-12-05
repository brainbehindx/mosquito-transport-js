"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenRefreshListener = exports.StoreReadyListener = exports.ServerReachableListener = exports.DatabaseRecordsListener = exports.AuthTokenListener = exports.AuthListener = void 0;
var _subscriptionListener = _interopRequireDefault(require("subscription-listener"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var AuthListener = new _subscriptionListener["default"]();
exports.AuthListener = AuthListener;
var AuthTokenListener = new _subscriptionListener["default"]();
exports.AuthTokenListener = AuthTokenListener;
var TokenRefreshListener = new _subscriptionListener["default"]();
exports.TokenRefreshListener = TokenRefreshListener;
var StoreReadyListener = new _subscriptionListener["default"]();
exports.StoreReadyListener = StoreReadyListener;
var ServerReachableListener = new _subscriptionListener["default"]();
exports.ServerReachableListener = ServerReachableListener;
var DatabaseRecordsListener = new _subscriptionListener["default"]();
exports.DatabaseRecordsListener = DatabaseRecordsListener;