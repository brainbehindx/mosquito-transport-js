"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simplifyError = exports.simplifyCaughtError = exports.queryEntries = exports.prefixStoragePath = exports.oEntries = exports.listenReachableServer = exports.getUrlExtension = exports.flatRawEntries = exports.flatEntries = exports.everyEntrie = exports.IS_WHOLE_NUMBER = exports.IS_RAW_OBJECT = void 0;
var _listeners = require("./listeners");
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
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var simplifyError = function simplifyError(error, message) {
  return {
    simpleError: {
      error: error,
      message: message
    }
  };
};
exports.simplifyError = simplifyError;
var simplifyCaughtError = function simplifyCaughtError(e) {
  return e !== null && e !== void 0 && e.simpleError ? e : simplifyError('unexpected_error', "".concat(e));
};
exports.simplifyCaughtError = simplifyCaughtError;
var everyEntrie = function everyEntrie(obj, callback) {
  if (_typeof(obj) !== 'object' || Array.isArray(obj)) return;
  oEntries(obj).forEach(function (e) {
    callback === null || callback === void 0 ? void 0 : callback(e);
  });
};
exports.everyEntrie = everyEntrie;
var flatEntries = function flatEntries(obj) {
  return oEntries(obj);
};
exports.flatEntries = flatEntries;
var flatRawEntries = function flatRawEntries() {
  return oEntries(obj, false);
};
exports.flatRawEntries = flatRawEntries;
var oEntries = function oEntries(obj) {
  var includeObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var o = [];
  Object.entries(obj).forEach(function (e) {
    o.push(e);
    if (_typeof(e[1]) === 'object' && !Array.isArray(e[1])) {
      o = [].concat(_toConsumableArray(o), _toConsumableArray(oEntries(e[1])));
    }
  });
  return o.filter(function (v) {
    return includeObj || _typeof(v[1]) !== 'object' || Array.isArray(v[1]);
  });
};
exports.oEntries = oEntries;
var IS_RAW_OBJECT = function IS_RAW_OBJECT(e) {
  return _typeof(e) === 'object' && !Array.isArray(e);
};
exports.IS_RAW_OBJECT = IS_RAW_OBJECT;
var IS_WHOLE_NUMBER = function IS_WHOLE_NUMBER(v) {
  return typeof v === 'number' && !"".concat(v).includes('.');
};
exports.IS_WHOLE_NUMBER = IS_WHOLE_NUMBER;
var queryEntries = function queryEntries(obj) {
  var lastPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var exceptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var o = [];
  Object.entries(obj).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    if (_typeof(value) === 'object' && !Array.isArray(value) && !exceptions.includes(key)) {
      o = [].concat(_toConsumableArray(o), _toConsumableArray(queryEntries(value, "".concat(lastPath).concat(key, "."))));
    } else o.push(["".concat(lastPath).concat(key), value]);
  });
  return o;
};
exports.queryEntries = queryEntries;
var listenReachableServer = function listenReachableServer(callback, projectUrl) {
  return _listeners.ServerReachableListener.startKeyListener(projectUrl, function (t) {
    if (typeof t === 'boolean') callback === null || callback === void 0 ? void 0 : callback(t);
  }, true);
};
exports.listenReachableServer = listenReachableServer;
var prefixStoragePath = function prefixStoragePath(path) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'file:///';
  if (!path) return path;
  if (!path.startsWith('/') && !path.includes(':')) return prefix + path;
  return prefix + path.split('/').filter(function (v, i) {
    return i && v;
  }).join('/');
};
exports.prefixStoragePath = prefixStoragePath;
var getUrlExtension = function getUrlExtension(url) {
  var r = url.split(/[#?]/)[0].split(".").pop().trim();
  return r === url ? '' : r;
};
exports.getUrlExtension = getUrlExtension;