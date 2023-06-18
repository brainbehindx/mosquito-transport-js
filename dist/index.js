"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "FIELD_DELETION", {
  enumerable: true,
  get: function get() {
    return _types.FIELD_DELETION;
  }
});
Object.defineProperty(exports, "INCREMENT", {
  enumerable: true,
  get: function get() {
    return _types.INCREMENT;
  }
});
Object.defineProperty(exports, "TIMESTAMP", {
  enumerable: true,
  get: function get() {
    return _types.TIMESTAMP;
  }
});
exports["default"] = void 0;
var _peripherals = require("./helpers/peripherals");
var _utils = require("./helpers/utils");
var _variables = require("./helpers/variables");
var _auth = require("./products/auth");
var _database = require("./products/database");
var _storage = require("./products/storage");
var _listeners = require("./helpers/listeners");
var _accessor = require("./products/auth/accessor");
var _types = require("./products/database/types");
var _http_callable = require("./products/http_callable");
var _socket = require("socket.io-client");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
(0, _utils.releaseCacheStore)();
var MosquitoDbClient = /*#__PURE__*/_createClass(function MosquitoDbClient(config) {
  var _this = this;
  _classCallCheck(this, MosquitoDbClient);
  _defineProperty(this, "getDatabase", function (dbName, dbUrl) {
    return {
      collection: function collection(path) {
        return new _database.MosquitoDbCollection(_objectSpread(_objectSpread(_objectSpread({}, _this.config), {}, {
          path: path
        }, dbName ? {
          dbName: dbName
        } : {}), dbUrl ? {
          dbUrl: dbUrl
        } : {}));
      }
    };
  });
  _defineProperty(this, "collection", function (path) {
    return new _database.MosquitoDbCollection(_objectSpread(_objectSpread({}, _this.config), {}, {
      path: path
    }));
  });
  _defineProperty(this, "auth", function () {
    return new _auth.MosquitoDbAuth(_objectSpread({}, _this.config));
  });
  _defineProperty(this, "storage", function () {
    return new _storage.MosquitoDbStorage(_objectSpread({}, _this.config));
  });
  _defineProperty(this, "fetchHttp", function (endpoint, init) {
    return (0, _http_callable.mfetch)(endpoint, init, _objectSpread({}, _this.config));
  });
  _defineProperty(this, "listenReachableServer", function (callback) {
    return (0, _peripherals.listenReachableServer)(callback, _this.config.projectUrl);
  });
  validateMosquitoDbConfig(config);
  this.config = _objectSpread(_objectSpread({}, config), {}, {
    apiUrl: config.projectUrl,
    projectUrl: config.projectUrl.split('/').filter(function (_, i, a) {
      return i !== a.length - 1;
    }).join('/')
  });
  var projectUrl = this.config.projectUrl;
  if (!_listeners.InitializedProject[projectUrl]) {
    _listeners.InitializedProject[projectUrl] = true;
    _variables.Scoped.LastTokenRefreshRef[projectUrl] = 0;
    (0, _accessor.triggerAuth)(projectUrl);
    (0, _accessor.triggerAuthToken)(projectUrl);
    (0, _accessor.initTokenRefresher)(_objectSpread({}, this.config), true);
    var socket = (0, _socket.io)("ws://".concat(projectUrl.split('://')[1]));
    socket.on('connect', function () {
      _listeners.ServerReachableListener.triggerKeyListener(projectUrl, true);
    });
    socket.on('disconnect', function () {
      _listeners.ServerReachableListener.triggerKeyListener(projectUrl, false);
    });
    (0, _peripherals.listenReachableServer)(function (c) {
      _variables.Scoped.IS_CONNECTED[projectUrl] = c;
    }, projectUrl);
  }
});
var validator = {
  dbName: function dbName(v) {
    if (typeof v !== 'string' || !v.trim()) throw "Invalid value supplied to dbName, value must be string and greater than one";
  },
  dbUrl: function dbUrl(v) {
    if (typeof v !== 'string' || !v.trim()) throw "Invalid value supplied to dbUrl, value must be string and greater than one";
  },
  heapMemory: function heapMemory(v) {
    if (typeof v !== 'number' || v <= 0) throw "Invalid value supplied to heapMemory, value must be number and greater than zero";
  },
  projectUrl: function projectUrl(v) {
    if (typeof v !== 'string' || !v.trim()) throw "Invalid value supplied to projectUrl, value must be a string and greater than one";
  },
  disableCache: function disableCache(v) {
    if (typeof v !== 'boolean') throw "Invalid value supplied to disableCache, value must be a boolean";
  },
  accessKey: function accessKey(v) {
    if (typeof v !== 'string' || !v.trim()) throw "Invalid value supplied to accessKey, value must be a string and greater than one";
  },
  maxRetries: function maxRetries(v) {
    if (typeof v !== 'number' || v <= 0) throw "Invalid value supplied to maxRetries, value must be number and greater than zero";
  },
  awaitStorage: function awaitStorage(v) {
    if (v !== undefined && typeof v !== 'boolean') throw "Invalid value supplied to awaitStorage, expected a boolean but got ".concat(v);
  }
};
var validateMosquitoDbConfig = function validateMosquitoDbConfig(config) {
  if (_typeof(config) !== 'object') throw 'mosquitoDB config is not an object';
  var h = Object.keys(config);
  for (var i = 0; i < h.length; i++) {
    var k = h[i];
    if (!validator[k]) throw "Unexpected property named ".concat(k);
    validator[k](config[k]);
  }
  if (!config['projectUrl']) throw 'projectUrl is a required property in MosquitoDb() constructor';
  if (!config['accessKey']) throw 'accessKey is a required property in MosquitoDb() constructor';
};
var _default = MosquitoDbClient;
exports["default"] = _default;