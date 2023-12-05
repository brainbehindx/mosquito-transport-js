"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateWriteValue = exports.validateReadConfig = exports.validateFilter = exports.validateCollectionPath = exports.confirmFilterDoc = void 0;
var _peripherals = require("../../helpers/peripherals");
var _values = require("../../helpers/values");
var _get = _interopRequireDefault(require("lodash/get"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
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
var dirn = ['desc', 'asc', 'ascending', 'descending'];
var validateReadConfig = function validateReadConfig(config) {
  var excludedNodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var nodeList = ['excludeFields', 'returnOnly', 'extraction', 'episode', 'retrieval', 'disableAuth', 'disableMinimizer'].filter(function (v) {
    return !excludedNodes.includes(v);
  });
  if (config) {
    if (!(0, _peripherals.IS_RAW_OBJECT)(config)) throw "Invalid value assigned to 'config', expected a raw object";
    Object.entries(config).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];
      if (!nodeList.includes(k)) throw "unexpected property '".concat(k, "' found in config");
      if (k === 'excludeFields' || k === 'returnOnly') {
        if (typeof v !== 'string' && !Array.isArray(v)) throw "invalid value supplied to ".concat(k, ", expected either a string or array of string");
        if (Array.isArray(v)) {
          v.forEach(function (e) {
            if (typeof e !== 'string') throw "invalid value supplied to ".concat(k, ", expected a string in array but got ").concat(e);
          });
        }
      } else if (k === 'extraction') {
        (Array.isArray(v) ? v : [v]).forEach(function (e, i) {
          var limit = e.limit,
            sort = e.sort,
            direction = e.direction,
            collection = e.collection,
            find = e.find,
            findOne = e.findOne;
          if (typeof limit === 'number' && (!(0, _peripherals.IS_WHOLE_NUMBER)(limit) || limit <= 0)) throw "invalid value supplied to limit of extraction[".concat(i, "], expected a positive whole number but got ").concat(limit);
          if (sort && typeof sort !== 'string') throw "invalid value supplied to sort in extraction[".concat(i, "], expected a string value but got ").concat(sort);
          if (collection && typeof collection !== 'string') throw "invalid value supplied to collection in extraction[".concat(i, "], expected a string value but got ").concat(collection);
          if (direction && direction !== 1 && direction !== -1 && !dirn.includes(direction)) throw "invalid value supplied to direction in extraction[".concat(i, "], expected any of ").concat([1, -1].concat(dirn), " but got ").concat(direction);
        });
      } else if (k === 'episode') {
        if (v !== 0 && v !== 1) throw "invalid value supplied to ".concat(k, ", expected either 0 or 1 but got ").concat(v);
      } else if (k === 'retrieval') {
        var h = Object.values(_values.RETRIEVAL);
        if (!h.includes(v)) throw "invalid value supplied to ".concat(k, ", expected any of ").concat(h, " but got ").concat(v);
      } else if (k === 'disableAuth' || k === 'disableMinimizer') {
        if (typeof v !== 'boolean') throw "invalid value supplied to ".concat(k, ", expected a boolean value but got ").concat(v);
      } else throw "unexpected property '".concat(k, "' found in config");
    });
  }
};
exports.validateReadConfig = validateReadConfig;
var validateWriteValue = function validateWriteValue(value, filter, type) {
  var isObject = (0, _peripherals.IS_RAW_OBJECT)(value);
  if (type === 'setOne' || type === 'setMany') {
    if (type === 'setOne' && !isObject) {
      throw "expected raw object in ".concat(type, "() operation but got ").concat(value);
    } else if (type === 'setMany' && !Array.isArray(value)) throw "expected an array of document in ".concat(type, "() operation but got ").concat(value);
    var duplicateID = {};
    (Array.isArray(value) ? value : [value]).forEach(function (e) {
      if (!(0, _peripherals.IS_RAW_OBJECT)(e)) throw "expected raw object in ".concat(type, "() operation but got ").concat(e);
      if (duplicateID[e._id]) throw "duplicate document _id:".concat(e._id, " found in ").concat(type, "() operation");
      if (!e._id) throw "No _id found in ".concat(type, "() operation");
      duplicateID[e._id] = true;
    });
    return;
  }
  if (type !== 'deleteOne' && type !== 'deleteMany') if (!isObject) throw "expected raw object in ".concat(type, "() operation but got ").concat(value);
  validateFilter(filter);
  (0, _peripherals.queryEntries)(value, []).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
      segment = _ref4[0];
    if (segment.filter(function (v) {
      return v === '_foreign_doc';
    }).length) throw "\"_foreign_doc\" is a reserved word, don't use it as a field in a document";

    // TODO: validate rest
  });
};
exports.validateWriteValue = validateWriteValue;
var validateFilter = function validateFilter() {
  var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return evaluateFilter({}, filter);
};
exports.validateFilter = validateFilter;
var validateCollectionPath = function validateCollectionPath(path) {
  if (typeof path !== 'string' || path.includes('.') || !path.trim()) throw "invalid collection path \"".concat(path, "\", expected non-empty string and mustn't contain \".\"");
};
exports.validateCollectionPath = validateCollectionPath;
var confirmFilterDoc = function confirmFilterDoc(data, filter) {
  // [$and, $or]
  var logics = [[], []];
  Object.entries(filter).forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      key = _ref6[0],
      value = _ref6[1];
    if (key === '$and') {
      if (!Array.isArray(value)) throw "$and must be an array";
      value.forEach(function (v) {
        return logics[0].push(evaluateFilter(data, v));
      });
    } else if (key === '$or') {
      if (!Array.isArray(value)) throw "$and must be an array";
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
var dataTypesValue = ['double', 'string', 'object', 'array', 'decimal',
// 'long',
'int', 'bool', 'date', 'null', 'number'];
var $IN = _values.READ_OPS.$IN,
  $NIN = _values.READ_OPS.$NIN,
  $GT = _values.READ_OPS.$GT,
  $GTE = _values.READ_OPS.$GTE,
  $LT = _values.READ_OPS.$LT,
  $LTE = _values.READ_OPS.$LTE,
  $EQ = _values.READ_OPS.$EQ,
  $EXISTS = _values.READ_OPS.$EXISTS,
  $REGEX = _values.READ_OPS.$REGEX,
  $NE = _values.READ_OPS.$NE,
  $SIZE = _values.READ_OPS.$SIZE,
  $TEXT = _values.READ_OPS.$TEXT,
  $TYPE = _values.READ_OPS.$TYPE;

// TODO: fix exact field value doc, deep nesting and other query

var evaluateFilter = function evaluateFilter() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!(0, _peripherals.IS_RAW_OBJECT)(data)) throw "data must be a raw object";
  if (!(0, _peripherals.IS_RAW_OBJECT)(filter)) throw "expected a raw object but got ".concat(filter);
  var dataObj = _objectSpread({}, data),
    logics = [];
  (0, _peripherals.queryEntries)(filter, []).forEach(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      segment = _ref8[0],
      value = _ref8[1];
    var commandSplit = segment.map(function (e, i) {
      return e.startsWith('$') ? {
        $: e,
        i: i
      } : null;
    }).filter(function (v) {
      return v;
    });
    if (commandSplit.length) {
      var _commandSplit$ = commandSplit[0],
        $ = _commandSplit$.$,
        dex = _commandSplit$.i,
        pathValue = dex ? (0, _get["default"])(dataObj, segment.filter(function (_, i) {
          return i < dex;
        }).join('.')) : null;
      if (!_values.READ_OPS_LIST.includes($)) throw "\"".concat($, "\" operation is currently not supported");
      if ($ !== $TEXT && (dex !== segment.length - 1 || !dex)) throw "\"".concat($, " must be at the last position as an operator\"");
      if ($ === $IN) {
        if (!Array.isArray(value)) throw "The value assigned to \"".concat($, "\" operator must be an array");
        if (pathValue !== undefined) {
          logics.push(!!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return !!value.filter(function (t) {
              return checkTestEquality(t, v);
            }).length;
          }).length);
        } else logics.push(false);
      } else if ($ === $NIN) {
        if (!Array.isArray(value)) throw "The value assigned to \"".concat($, "\" operator must be an array");
        if (pathValue !== undefined) {
          logics.push(!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return !!value.filter(function (t) {
              return checkTestEquality(t, v);
            }).length;
          }).length);
        } else logics.push(true);
      } else if ($ === $GT) {
        if (pathValue !== undefined) {
          logics.push(!!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return v > value;
          }).length);
        } else logics.push(false);
      } else if ($ === $GTE) {
        if (pathValue !== undefined) {
          logics.push(!!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return v >= value;
          }).length);
        } else logics.push(false);
      } else if ($ === $LT) {
        if (pathValue !== undefined) {
          logics.push(!!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return v < value;
          }).length);
        } else logics.push(false);
      } else if ($ === $LTE) {
        if (pathValue !== undefined) {
          logics.push(!!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
            return v <= value;
          }).length);
        } else logics.push(false);
      } else if ($ === $TEXT) {
        if (commandSplit.slice(-1)[0].$ === '$search') {
          var _dataObj$$text = dataObj.$text,
            $caseSensitive = _dataObj$$text.$caseSensitive,
            _dataObj$$text$$local = _dataObj$$text.$localFields,
            $localFields = _dataObj$$text$$local === void 0 ? [] : _dataObj$$text$$local,
            $search = _dataObj$$text.$search;
          if (typeof value !== 'string' || typeof $search !== 'string') throw "$search must have a string value";
          var searchTxt = $localFields.map(function (v) {
            return (0, _get["default"])(dataObj, v || '');
          }).map(function (v) {
            return "".concat(typeof v === 'string' ? v : Array.isArray(v) ? v.map(function (v) {
              return typeof v === 'string' ? v : '';
            }).join(' ').trim() : '').trim();
          }).join(' ').trim();
          logics.push($caseSensitive ? searchTxt.includes(value.trim()) : searchTxt.toLowerCase().includes(value.toLowerCase().trim()));
        }
      } else if ($ === $EQ) {} else if ($ === $EXISTS) {} else if ($ === $REGEX) {} else if ($ === $NE) {} else if ($ === $SIZE) {
        if (!(0, _peripherals.IS_WHOLE_NUMBER)(value) || v < 0) throw '$size must be a positive whole number';
        logics.push(Array.isArray(pathValue) && pathValue.length === value);
      } else if ($ === $TYPE) {
        if (!dataTypesValue.includes(value)) throw "invalid value supplied to ".concat($, ", mosquitodb only recognise \"").concat(dataTypesValue, "\" data types");
        var cock = function cock(v) {
          if (typeof v === 'number') {
            if (isNaN(v)) {
              return (value === 'decimal' || value === 'double') && (0, _peripherals.IS_DECIMAL_NUMBER)(v) || value === 'int' || value === 'number';
            }
          } else if (typeof v === 'boolean') {
            return value === 'bool';
          } else if (typeof v === 'string') {
            return value === 'string';
          } else if (v === null) {
            return value === 'null';
          } else if (v instanceof RegExp) {
            return value === 'regex';
          } else if (v instanceof Date) {
            return value === 'date';
          } else if ((0, _peripherals.IS_RAW_OBJECT)(v)) {
            return value === 'object';
          }
          return false;
        };
        logics.push(Array.isArray(pathValue) && value === 'array' || !!(Array.isArray(pathValue) ? pathValue : [pathValue]).filter(function (v) {
          return cock(v);
        }).length);
      }
    } else {
      var _pathValue = (0, _get["default"])(dataObj, segment.join('.'));
      if (_pathValue !== undefined) {
        logics.push(!!(Array.isArray(_pathValue) ? _pathValue : [_pathValue]).filter(function (v) {
          return !!checkTestEquality(value, v);
        }).length);
      } else logics.push(false);
    }
  });
  return !logics.filter(function (v) {
    return !v;
  }).length;
};
var checkTestEquality = function checkTestEquality(test, o) {
  if (test instanceof RegExp) {
    if (typeof o === 'string') return test.test(o);else return false;
  } else return (0, _isEqual["default"])(test, o);
};