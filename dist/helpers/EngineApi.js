"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _base = require("base-64");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var apis = {
  _readDocument: function _readDocument(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._readDocument(baseApi)) : '_readDocument');
  },
  _writeDocument: function _writeDocument(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._writeDocument(baseApi)) : '_writeDocument');
  },
  _deleteCollection: function _deleteCollection(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._deleteCollection(baseApi)) : '_deleteCollection');
  },
  _queryCollection: function _queryCollection(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._queryCollection(baseApi)) : '_queryCollection');
  },
  _writeMapDocument: function _writeMapDocument(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._writeMapDocument(baseApi)) : '_writeMapDocument');
  },
  _customSignin: function _customSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._customSignin(baseApi)) : '_customSignin');
  },
  _customSignup: function _customSignup(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._customSignup(baseApi)) : '_customSignup');
  },
  _googleSignin: function _googleSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._googleSignin(baseApi)) : '_googleSignin');
  },
  _appleSignin: function _appleSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._appleSignin(baseApi)) : '_appleSignin');
  },
  _facebookSignin: function _facebookSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._facebookSignin(baseApi)) : '_facebookSignin');
  },
  _twitterSignin: function _twitterSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._twitterSignin(baseApi)) : '_twitterSignin');
  },
  _githubSignin: function _githubSignin(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._githubSignin(baseApi)) : '_githubSignin');
  },
  _signOut: function _signOut(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._signOut(baseApi)) : '_signOut');
  },
  _invalidateToken: function _invalidateToken(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._invalidateToken(baseApi)) : '_invalidateToken');
  },
  _refreshAuthToken: function _refreshAuthToken(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._refreshAuthToken(baseApi)) : '_refreshAuthToken');
  },
  _downloadFile: function _downloadFile(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._downloadFile(baseApi)) : '_downloadFile');
  },
  _uploadFile: function _uploadFile(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._uploadFile(baseApi)) : '_uploadFile');
  },
  _deleteFile: function _deleteFile(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._deleteFile(baseApi)) : '_deleteFile');
  },
  _deleteFolder: function _deleteFolder(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._deleteFolder(baseApi)) : '_deleteFolder');
  },
  staticStorage: function staticStorage(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis.staticStorage(baseApi)) : 'storage');
  },
  _documentCount: function _documentCount(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._documentCount(baseApi)) : '_documentCount');
  },
  _areYouOk: function _areYouOk(baseApi, ugly) {
    return "".concat(baseApi, "/").concat(ugly ? (0, _base.encode)(apis._areYouOk(baseApi)) : '_areYouOk');
  }
};
var _default = _objectSpread({}, apis);
exports["default"] = _default;
module.exports = exports.default;