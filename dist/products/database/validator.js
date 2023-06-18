"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateWriteValue = exports.validateReadOptions = exports.validateReadConfig = exports.validateRawWriteValue = exports.validateFilter = exports.validateDocumentId = exports.validateCollectionPath = exports.validateBuilder = exports.confirmFilterDoc = void 0;
var _peripherals = require("../../helpers/peripherals");
var _lodash = _interopRequireDefault(require("lodash"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var validateBuilder = function validateBuilder() {};
exports.validateBuilder = validateBuilder;
var validateReadOptions = function validateReadOptions() {};
exports.validateReadOptions = validateReadOptions;
var validateReadConfig = function validateReadConfig(config) {
  if (config) {
    if (!(0, _peripherals.IS_RAW_OBJECT)(config)) throw "Invalid value assigned to 'config', expected a raw object";
    Object.keys(config).forEach(function (e) {
      if (e === 'excludeFields' || e === 'returnOnly') {
        if (typeof config[e] !== 'string' && !Array.isArray(config[e])) throw "invalid value supplied to ".concat(e, ", expected either a string or array of string");
      } else throw "unexpected property '".concat(e, "' found in config");
    });
  }
};
exports.validateReadConfig = validateReadConfig;
var FOREIGN_DOC_PROPS = ['_id', 'collection', 'find'];
var validateWriteValue = function validateWriteValue(value, filter, type) {
  var isObject = (0, _peripherals.IS_RAW_OBJECT)(value);
  if (type === 'set') {
    (Array.isArray(value) ? value : [value]).forEach(function (e) {
      if (!(0, _peripherals.IS_RAW_OBJECT)(e)) throw "expected raw Object in mosquitodb ".concat(type, "() operation but got ").concat(e);
      if (!value._id) throw 'No _id found in set() operation mosquitodb';
    });
    return;
  }
  if (type !== 'delete' && type !== 'deleteMany') if (!isObject) throw "expected raw Object in mosquitodb ".concat(type, "() operation but got ").concat(value);
  validateFilter(filter);
  validateRawWriteValue(value);
  (0, _peripherals.everyEntrie)(value, function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    if (key === '_foreign_doc' || key === '_foreign_col') {
      var p = Array.isArray(value) ? value : [value];
      validateCollectionPath(p.collection);
      p.forEach(function (e) {
        Object.keys(e).forEach(function (e) {
          if (!FOREIGN_DOC_PROPS.includes(e)) throw "Unknown props of \"".concat(e, "\" in \"").concat(key, "\" (mosquitodb)");
        });
      });
      if (key === '_foreign_col') {
        validateFilter(f.find);
      } else validateDocumentId(p._id);
    }
  });
};
exports.validateWriteValue = validateWriteValue;
var validateRawWriteValue = function validateRawWriteValue(value) {};
exports.validateRawWriteValue = validateRawWriteValue;
var validateFilter = function validateFilter() {
  var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return evaluateFilter({}, filter);
};
exports.validateFilter = validateFilter;
var validateCollectionPath = function validateCollectionPath(path) {
  if (typeof path !== 'string' || path.includes('.') || !path.trim()) throw "invalid collection path \"".concat(path, "\", expected non-empty string and mustn't contain \".\"");
};
exports.validateCollectionPath = validateCollectionPath;
var validateDocumentId = function validateDocumentId(id) {
  if (!id) throw "_id is required";
};
exports.validateDocumentId = validateDocumentId;
var confirmFilterDoc = function confirmFilterDoc(data, filter) {
  var logics = [[], [], [], []];
  Object.entries(filter).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];
    if (key === '$and') {
      value.forEach(function (v) {
        return logics[0].push(evaluateFilter(data, v));
      });
    } else if (key === '$or') {
      value.forEach(function (v) {
        return logics[1].push(evaluateFilter(data, v));
      });
    } else logics[0].push(evaluateFilter(data, _defineProperty({}, "".concat(key), value)));
  });
  return !logics[0].filter(function (v) {
    return !v;
  }).length && (!logics[1].length || !!logics[1].filter(function (v) {
    return v;
  }).length);
};
exports.confirmFilterDoc = confirmFilterDoc;
var TYPE_OPERATORS = ['number', 'string', 'array', 'bool', 'object', 'regex', 'null', 'decimal'];
var $TEXT_OPERATOR = ['$search', '$caseSensitive'];
var evaluateFilter = function evaluateFilter(data) {
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var logics = [];
  Object.entries(filter).forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      key = _ref6[0],
      value = _ref6[1];
    if (key.startsWith('$')) {
      throw "No query operator should be placed at the first level except ($or, $and, $not, $nor) at {".concat(key, ": ").concat(value, "}");
    } else {
      if ((0, _peripherals.IS_RAW_OBJECT)(value)) {
        (0, _peripherals.queryEntries)(value, undefined, ['$text', '$timestamp']).forEach(function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2),
            node = _ref8[0],
            q = _ref8[1];
          if (node.includes('$all')) {
            if (node !== '$all') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $all';
              if (!node.endsWith('.$all')) throw '$all operator must be at the last level';
            }
            if (!Array.isArray(q)) throw 'The operator value of $all must be an array';
            var d = "".concat(key).concat(node === '$all' ? '' : '.' + node.split('.$all').join('')),
              dv = _lodash["default"].get(data, d);
            if (Array.isArray(dv)) {
              logics.push(!q.filter(function (v) {
                return !dv.includes(v);
              }).length);
            } else logics.push(false);
          } else if (node.includes('$in')) {
            if (node !== '$in') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $in';
              if (!node.endsWith('.$in')) throw '$in operator must be at the last level';
            }
            if (!Array.isArray(q)) throw 'The operator value of $in must be an array';
            var _d2 = "".concat(key).concat(node === '$in' ? '' : '.' + node.split('.$in').join('')),
              _dv = _lodash["default"].get(data, _d2);
            if (Array.isArray(_dv)) {
              logics.push(!!q.filter(function (v) {
                return v instanceof RegExp ? testAll(_dv, v) : _dv.includes(v);
              }).length);
            } else logics.push(false);
          } else if (node.includes('$nin')) {
            if (node !== '$nin') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $nin';
              if (!node.endsWith('.$nin')) throw '$nin operator must be at the last level';
            }
            if (!Array.isArray(q)) throw 'The operator value of $nin must be an array';
            var _d3 = "".concat(key).concat(node === '$nin' ? '' : '.' + node.split('.$nin').join('')),
              _dv2 = _lodash["default"].get(data, _d3);
            if (Array.isArray(_dv2)) {
              logics.push(!q.filter(function (v) {
                return v instanceof RegExp ? !testAll(_dv2, v) : !_dv2.includes(v);
              }).length);
            } else logics.push(false);
          } else if (node.includes('$gt')) {
            if (node !== '$gt') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $gt';
              if (!node.endsWith('.$gt')) throw '$gt operator must be at the last level';
            }
            var _d4 = "".concat(key).concat(node === '$gt' ? '' : '.' + node.split('.$gt').join('')),
              _dv3 = _lodash["default"].get(data, _d4);
            if (typeof q === 'number') {
              logics.push(typeof _dv3 === 'number' && q > _dv3);
            } else if (IS_TIMESTAMP(q)) {
              logics.push(IS_TIMESTAMP(_dv3) && _dv3.$timestamp > (q.$timestamp === 'now' ? Date.now() : q.$timestamp));
            } else throw 'Unknown type supplied to $gt, expected any of (number, string, Timestamp)';
          } else if (node.includes('$gte')) {
            if (node !== '$gte') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $gte';
              if (!node.endsWith('.$gte')) throw '$gte operator must be at the last level';
            }
            var _d5 = "".concat(key).concat(node === '$gte' ? '' : '.' + node.split('.$gte').join('')),
              _dv4 = _lodash["default"].get(data, _d5);
            if (typeof q === 'number') {
              logics.push(typeof _dv4 === 'number' && q >= _dv4);
            } else if (IS_TIMESTAMP(q)) {
              logics.push(IS_TIMESTAMP(_dv4) && _dv4.$timestamp >= (q.$timestamp === 'now' ? Date.now() : q.$timestamp));
            } else throw 'Unknown type supplied to $gte, expected any of (number, string, Timestamp)';
          } else if (node.includes('$lt')) {
            if (node !== '$lt') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $lt';
              if (!node.endsWith('.$lt')) throw '$lt operator must be at the last level';
            }
            var _d6 = "".concat(key).concat(node === '$lt' ? '' : '.' + node.split('.$lt').join('')),
              _dv5 = _lodash["default"].get(data, _d6);
            if (typeof q === 'number') {
              logics.push(typeof _dv5 === 'number' && q < _dv5);
            } else if (IS_TIMESTAMP(q)) {
              logics.push(IS_TIMESTAMP(_dv5) && _dv5.$timestamp < (q.$timestamp === 'now' ? Date.now() : q.$timestamp));
            } else throw 'Unknown type supplied to $lt, expected any of (number, string, Timestamp)';
          } else if (node.includes('$lte')) {
            if (node !== '$lte') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $lte';
              if (!node.endsWith('.$lte')) throw '$lte operator must be at the last level';
            }
            var _d7 = "".concat(key).concat(node === '$lte' ? '' : '.' + node.split('.$lte').join('')),
              _dv6 = _lodash["default"].get(data, _d7);
            if (typeof q === 'number') {
              logics.push(typeof _dv6 === 'number' && q <= _dv6);
            } else if (IS_TIMESTAMP(q)) {
              logics.push(IS_TIMESTAMP(_dv6) && _dv6.$timestamp <= (q.$timestamp === 'now' ? Date.now() : q.$timestamp));
            } else throw 'Unknown type supplied to $lte, expected any of (number, string, Timestamp)';
          } else if (key === '$text') {
            if (!(0, _peripherals.IS_RAW_OBJECT)(q)) throw "Expected an object for $text value";
            Object.entries(q).forEach(function (_ref9) {
              var _ref10 = _slicedToArray(_ref9, 2),
                k = _ref10[0],
                v = _ref10[1];
              if (k === '$search') {
                if (typeof v !== 'string') throw "Invalid value type for $search, expected string but got ".concat(_typeof(v));
              } else if (k === '$caseSensitive') {
                if (typeof v !== 'boolean') throw "Invalid value type for $caseSensitive, expected boolean but got ".concat(_typeof(v));
              } else throw "Invalid property \"".concat(k, "\", only expecting any of ").concat($TEXT_OPERATOR.join(', '));
            });
            if (typeof q.$search !== 'string') throw "Invalid value supplied to $search, expected a string but got ".concat(_typeof(q.$search));
            var _d8 = "".concat(key).concat(node === '$text' ? '' : '.' + node.split('.$text').join('')),
              _dv7 = _lodash["default"].get(data, _d8),
              s = q.$caseSensitive ? q.$search : q.$search.toLowerCase();
            if (typeof _dv7 === 'string') {
              logics.push(q.$search.startsWith('"') && q.$search.endsWith('"') ? _dv7.includes(s) : !!s.split(' ').filter(function (v) {
                return _dv7.includes(v);
              }).length);
            } else logics.push(false);
          } else if (node.includes('$eq')) {
            if (node !== '$eq') {
              if (node.split('.$') >= 3) throw "You must not provide additional operator for $eq";
              if (!node.endsWith('.$eq')) throw '$eq operator must be at the last level';
            }
            var _d9 = "".concat(key).concat(node === '$eq' ? '' : '.' + node.split('.$eq').join('')),
              _dv8 = _lodash["default"].get(data, _d9);
            logics.push(q instanceof RegExp ? q.test(_dv8) : _dv8 === q);
          } else if (node.includes('$regex')) {
            if (node !== '$regex') {
              if (node.split('.$') >= 3) throw "You must not provide additional operator for $regex";
              if (!node.endsWith('.$regex')) throw '$regex operator must be at the last level';
            }
            var _d10 = "".concat(key).concat(node === '$regex' ? '' : '.' + node.split('.$regex').join('')),
              _dv9 = _lodash["default"].get(data, _d10);
            if (!(q instanceof RegExp)) throw "$regex must have a regex value";
            logics.push(q.test(_dv9));
          } else if (node.includes('$exists')) {
            if (node !== '$exists') {
              if (node.split('.$') >= 3) throw "You must not provide additional operator for $exists";
              if (!node.endsWith('.$exists')) throw '$exists operator must be at the last level';
            }
            var _d11 = "".concat(key).concat(node === '$exists' ? '' : '.' + node.split('.$exists').join('')),
              _dv10 = _lodash["default"].get(data, _d11);
            logics.push(q ? _dv10 !== undefined : _dv10 === undefined);
          } else if (node.includes('$type')) {
            if (node !== '$type') {
              if (node.split('.$') >= 3) throw "You must not provide additional operator for $type";
              if (!node.endsWith('$type')) throw '$type operator must be at the last level';
            }
            var isType = false;
            var _d12 = "".concat(key).concat(node === '$type' ? '' : '.' + node.split('.$type').join('')),
              _dv11 = _lodash["default"].get(data, _d12),
              cack = function cack(q) {
                if (q === 'number') {
                  if (!isType) isType = typeof _dv11 === 'number';
                } else if (q === 'bool') {
                  if (!isType) isType = typeof _dv11 === 'boolean';
                } else if (q === 'string') {
                  if (!isType) isType = typeof _dv11 === 'string';
                } else if (q === 'array') {
                  if (!isType) isType = Array.isArray(_dv11);
                } else if (q === 'null') {
                  if (!isType) isType = _dv11 === null;
                } else if (q === 'regex') {
                  if (!isType) isType = _dv11 instanceof RegExp;
                } else if (q === 'object') {
                  if (!isType) isType = _typeof(_dv11) === 'object';
                } else if (q === 'decimal') {
                  if (!isType) isType = typeof _dv11 === 'number' && "".concat(_dv11).includes('.');
                } else throw "unknown value supplied to $type, supported type are (".concat(TYPE_OPERATORS.join(', '), ")");
              };
            if (Array.isArray(q)) {
              q.forEach(function (e) {
                cack(e);
              });
            } else if (typeof q === 'string') {
              cack(q);
            } else throw "$type must either be a string or array";
            logics.push(isType);
          } else if (node.includes('$ne')) {
            if (node !== '$ne') {
              if (node.split('.$') >= 3) throw "You must not provide additional operator for $ne";
              if (!node.endsWith('.$ne')) throw '$ne operator must be at the last level';
            }
            var _d13 = "".concat(key).concat(node === '$ne' ? '' : '.' + node.split('.$ne').join('')),
              _dv12 = _lodash["default"].get(data, _d13);
            logics.push(q instanceof RegExp ? !q.test(_dv12) : _dv12 !== q);
          } else if (node.includes('$size')) {
            if (node !== '$size') {
              if (node.split('.$') >= 3) throw 'You must not provide additional operator for $size';
              if (!node.endsWith('.$size')) throw '$size operator must be at the last level';
            }
            if (!IS_WHOLE_NUMBER(q)) throw 'The operator value of $size must be a whole number';
            var _d14 = "".concat(key).concat(node === '$size' ? '' : '.' + node.split('.$size').join('')),
              _dv13 = _lodash["default"].get(data, _d14);
            if (Array.isArray(_dv13)) {
              logics.push(_dv13.length === q);
            } else logics.push(false);
          } else if (node.includes('$')) {
            throw "Unknown query operator \"".concat(node, "\"");
          } else {
            var _d15 = "".concat(key, ".").concat(node),
              _dv14 = _lodash["default"].get(data, _d15);
            logics.push(q instanceof RegExp ? q.test(_dv14) : _dv14 === q);
          }
        });
      } else {
        if (value instanceof RegExp) {
          logics.push(value.test(_lodash["default"].get(data, key)));
        } else logics.push(_lodash["default"].get(data, key) === value);
      }
    }
  });
  return !logics.filter(function (v) {
    return !v;
  }).length;
};