"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCacheStore = exports.simplifyError = exports.releaseCacheStore = exports.buildFetchInterface = exports.awaitReachableServer = void 0;
var _listeners = require("./listeners");
var _values = require("./values");
var _variables = require("./variables");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var updateCacheStore = function updateCacheStore() {
  clearTimeout(_variables.Scoped.cacheStorageReducer);
  _variables.Scoped.cacheStorageReducer = setTimeout(function () {
    window.localStorage.setItem(_values.CACHE_STORAGE_PATH, JSON.stringify({
      DatabaseStore: _variables.CacheStore.DatabaseStore,
      DatabaseRecords: _variables.CacheStore.DatabaseRecords,
      AuthStore: _variables.CacheStore.AuthStore,
      PendingWrites: _variables.CacheStore.PendingWrites
    }));
  }, 500);
};
exports.updateCacheStore = updateCacheStore;
var releaseCacheStore = function releaseCacheStore() {
  var j = JSON.parse(window.localStorage.getItem(_values.CACHE_STORAGE_PATH) || '{}');
  console.log('mosquitoCache: ', JSON.stringify(j));
  Object.keys(j).forEach(function (e) {
    _variables.CacheStore[e] = j[e];
  });
  Object.entries(_variables.CacheStore.AuthStore).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    _variables.Scoped.AuthJWTToken[key] = value === null || value === void 0 ? void 0 : value.token;
  });
  // TODO: commit pending write
};
exports.releaseCacheStore = releaseCacheStore;
var awaitReachableServer = function awaitReachableServer(projectUrl) {
  return new Promise(function (resolve) {
    if (_variables.Scoped.IS_CONNECTED[projectUrl]) {
      resolve();
      return;
    }
    var l = _listeners.ServerReachableListener.startKeyListener(projectUrl, function (t) {
      if (t) {
        resolve();
        l();
      }
    }, true);
  });
};
exports.awaitReachableServer = awaitReachableServer;
var buildFetchInterface = function buildFetchInterface(body, accessKey, authToken, method) {
  return {
    body: JSON.stringify(_objectSpread({}, body)),
    headers: _objectSpread({
      'Content-type': 'application/json',
      'Authorization': "Bearer ".concat(btoa(accessKey))
    }, authToken ? {
      'Mosquitodb-Token': authToken
    } : {}),
    method: method || 'POST'
  };
};
exports.buildFetchInterface = buildFetchInterface;
var simplifyError = function simplifyError(error, message) {
  return {
    simpleError: {
      error: error,
      message: message
    }
  };
};
exports.simplifyError = simplifyError;