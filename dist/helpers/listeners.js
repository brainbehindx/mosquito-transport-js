"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenRefreshListener = exports.ServerReachableListener = exports.InitializedProject = exports.DatabaseRecordsListener = exports.AuthTokenListener = exports.AuthListener = void 0;
var _GlobalListener = _interopRequireDefault(require("./GlobalListener"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var InitializedProject = {};
exports.InitializedProject = InitializedProject;
var AuthListener = new _GlobalListener["default"]();
exports.AuthListener = AuthListener;
var AuthTokenListener = new _GlobalListener["default"]();
exports.AuthTokenListener = AuthTokenListener;
var TokenRefreshListener = new _GlobalListener["default"]();
exports.TokenRefreshListener = TokenRefreshListener;
var ServerReachableListener = new _GlobalListener["default"]();
exports.ServerReachableListener = ServerReachableListener;
var DatabaseRecordsListener = new _GlobalListener["default"]();
exports.DatabaseRecordsListener = DatabaseRecordsListener;