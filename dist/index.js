"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "DOCUMENT_EXTRACTION", {
  enumerable: true,
  get: function get() {
    return _types.DOCUMENT_EXTRACTION;
  }
});
Object.defineProperty(exports, "FIND_GEO_JSON", {
  enumerable: true,
  get: function get() {
    return _types.FIND_GEO_JSON;
  }
});
Object.defineProperty(exports, "GEO_JSON", {
  enumerable: true,
  get: function get() {
    return _types.GEO_JSON;
  }
});
exports.MosquitoDbClient = void 0;
Object.defineProperty(exports, "TIMESTAMP", {
  enumerable: true,
  get: function get() {
    return _types.TIMESTAMP;
  }
});
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
var _validator = require("./products/database/validator");
var _values = require("./helpers/values");
var _accessor2 = require("./products/database/accessor");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MosquitoDbClient = /*#__PURE__*/function () {
  function MosquitoDbClient(_config) {
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
      (0, _validator.validateCollectionPath)(path);
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
    _defineProperty(this, "fetchHttp", function (endpoint, init, config) {
      return (0, _http_callable.mfetch)(endpoint, init, _objectSpread(_objectSpread({}, _this.config), {}, {
        method: config
      }));
    });
    _defineProperty(this, "listenReachableServer", function (callback) {
      return (0, _peripherals.listenReachableServer)(callback, _this.config.projectUrl);
    });
    _defineProperty(this, "wipeDatabaseCache", function () {});
    validateMosquitoDbConfig(_config);
    this.config = _objectSpread(_objectSpread({}, _config), {}, {
      uglify: _config.uglifyRequest,
      apiUrl: _config.projectUrl,
      projectUrl: _config.projectUrl.split('/').filter(function (_, i, a) {
        return i !== a.length - 1;
      }).join('/')
    });
    if (!_variables.Scoped.ReleaseCacheData) throw "releaseCache must be called before creating any mosquitodb instance";
    var projectUrl = this.config.projectUrl;
    if (!_variables.Scoped.InitializedProject[projectUrl]) {
      _variables.Scoped.InitializedProject[projectUrl] = true;
      _variables.Scoped.LastTokenRefreshRef[projectUrl] = 0;
      (0, _accessor.triggerAuth)(projectUrl);
      (0, _accessor.triggerAuthToken)(projectUrl);
      (0, _accessor.initTokenRefresher)(_objectSpread({}, this.config), true);
      var socket = (0, _socket.io)("ws://".concat(projectUrl.split('://')[1]), {
        transports: ['websocket', 'polling', 'flashsocket']
      });
      socket.on('connect', function () {
        _listeners.ServerReachableListener.dispatch(projectUrl, true);
      });
      socket.on('disconnect', function () {
        _listeners.ServerReachableListener.dispatch(projectUrl, false);
      });
      (0, _peripherals.listenReachableServer)(function (c) {
        _variables.Scoped.IS_CONNECTED[projectUrl] = c;
        if (c) (0, _accessor2.trySendPendingWrite)();
      }, projectUrl);
      _listeners.TokenRefreshListener.listenTo(projectUrl, function (v) {
        _variables.Scoped.IS_TOKEN_READY[projectUrl] = v;
      });
    }
  }
  _createClass(MosquitoDbClient, null, [{
    key: "releaseCache",
    value: function releaseCache(prop) {
      if (_variables.Scoped.ReleaseCacheData) throw "calling releaseCache multiple times is prohibited";
      validateReleaseCacheProp(_objectSpread({}, prop));
      _variables.Scoped.ReleaseCacheData = _objectSpread({}, prop);
      (0, _utils.releaseCacheStore)(_objectSpread({}, prop));
    }
  }]);
  return MosquitoDbClient;
}();
exports.MosquitoDbClient = MosquitoDbClient;
var validateReleaseCacheProp = function validateReleaseCacheProp(prop) {
  var cacheList = _toConsumableArray(Object.values(_values.CACHE_PROTOCOL));
  Object.entries(prop).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      k = _ref2[0],
      v = _ref2[1];
    if (k === 'cachePassword') {
      if (typeof v !== 'string' || v.trim().length <= 0) throw "Invalid value supplied to cachePassword, value must be a string and greater than 0 characters";
    } else if (k === 'cacheProtocol') {
      if (!cacheList.includes("".concat(v))) throw "unknown value supplied to ".concat(k, ", expected any of ").concat(cacheList);
    } else throw "Unexpected property named ".concat(k);
  });
};
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
    if (typeof v !== 'number' || v <= 0 || !(0, _peripherals.IS_WHOLE_NUMBER)(v)) throw "Invalid value supplied to maxRetries, value must be whole number and greater than zero";
  },
  uglifyRequest: function uglifyRequest() {
    if (typeof v !== 'boolean') throw "Invalid value supplied to uglifyRequest, value must be a boolean";
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