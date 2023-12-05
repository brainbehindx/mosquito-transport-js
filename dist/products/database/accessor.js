"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trySendPendingWrite = exports.removePendingWrite = exports.listenQueryEntry = exports.insertRecord = exports.getRecord = exports.generateRecordID = exports.addPendingWrites = void 0;
var _peripherals = require("../../helpers/peripherals");
var _utils = require("../../helpers/utils");
var _variables = require("../../helpers/variables");
var _validator = require("./validator");
var _get = _interopRequireDefault(require("lodash/get"));
var _set = _interopRequireDefault(require("lodash/set"));
var _unset = _interopRequireDefault(require("lodash/unset"));
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _values = require("../../helpers/values");
var _listeners = require("../../helpers/listeners");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var listenQueryEntry = function listenQueryEntry(callback, _ref) {
  var accessId = _ref.accessId,
    builder = _ref.builder,
    config = _ref.config,
    processId = _ref.processId;
  var lastObj = '';
  var _ref2 = config || {},
    _ref2$episode = _ref2.episode,
    episode = _ref2$episode === void 0 ? 0 : _ref2$episode;
  var l = _listeners.DatabaseRecordsListener.listenTo(accessId, /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(dispatchId) {
      var cache;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getRecord(builder, accessId);
          case 2:
            cache = _context.sent;
            if (cache && !(0, _isEqual["default"])(lastObj, cache[episode]) && dispatchId === processId) callback(cache[episode]);
            lastObj = cache[episode];
          case 5:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }());
  return function () {
    lastObj = undefined;
    l();
  };
};
exports.listenQueryEntry = listenQueryEntry;
var insertRecord = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(builder, accessId, query, value) {
    var projectUrl, _builder$dbUrl, dbUrl, _builder$dbName, dbName, path, _query$config, extraction, excludeFields, returnOnly, kaf, colData;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _utils.awaitStore)();
        case 2:
          projectUrl = builder.projectUrl, _builder$dbUrl = builder.dbUrl, dbUrl = _builder$dbUrl === void 0 ? _values.DEFAULT_DB_URL : _builder$dbUrl, _builder$dbName = builder.dbName, dbName = _builder$dbName === void 0 ? _values.DEFAULT_DB_NAME : _builder$dbName, path = builder.path, _query$config = query === null || query === void 0 ? void 0 : query.config, extraction = _query$config.extraction, excludeFields = _query$config.excludeFields, returnOnly = _query$config.returnOnly, kaf = "".concat((0, _peripherals.objToUniqueString)(extraction || {}), ",").concat((excludeFields || []).join(','), ",").concat((returnOnly || []).join(',')), colData = (0, _get["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'data', kaf], []);
          (Array.isArray(value) ? value : [value]).forEach(function (e) {
            var b4DocIndex = colData.findIndex(function (v) {
              return v._id === e._id;
            });
            if (b4DocIndex === -1) {
              colData.push(e);
            } else colData[b4DocIndex] = e;
          });
          (0, _set["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'data', kaf], _toConsumableArray(colData));
          (0, _set["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'record', accessId], {
            query: query,
            result: value,
            registeredOn: Date.now()
          });
          (0, _utils.updateCacheStore)();
        case 7:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function insertRecord(_x2, _x3, _x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();
exports.insertRecord = insertRecord;
var getRecord = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(builder, accessId) {
    var projectUrl, _builder$dbUrl2, dbUrl, _builder$dbName2, dbName, path, command, config, find, findOne, sort, direction, limit, random, _ref6, extraction, excludeFields, returnOnly, kaf, colData, colRecord, choosenColData;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _utils.awaitStore)();
        case 2:
          projectUrl = builder.projectUrl, _builder$dbUrl2 = builder.dbUrl, dbUrl = _builder$dbUrl2 === void 0 ? _values.DEFAULT_DB_URL : _builder$dbUrl2, _builder$dbName2 = builder.dbName, dbName = _builder$dbName2 === void 0 ? _values.DEFAULT_DB_NAME : _builder$dbName2, path = builder.path, command = builder.command, config = command.config, find = command.find, findOne = command.findOne, sort = command.sort, direction = command.direction, limit = command.limit, random = command.random, _ref6 = config || {}, extraction = _ref6.extraction, excludeFields = _ref6.excludeFields, returnOnly = _ref6.returnOnly, kaf = "".concat((0, _peripherals.objToUniqueString)(extraction || {}), ",").concat((excludeFields || []).join(','), ",").concat((returnOnly || []).join(',')), colData = (0, _get["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'data', kaf], []), colRecord = (0, _get["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'record', accessId]);
          if (colRecord) {
            _context3.next = 5;
            break;
          }
          return _context3.abrupt("return", null);
        case 5:
          choosenColData = colData.filter(function (v) {
            return (0, _validator.confirmFilterDoc)(v, findOne || find || {});
          });
          if (random) {
            choosenColData = (0, _peripherals.shuffleArray)(choosenColData);
          } else if (sort) {
            choosenColData = (0, _peripherals.sortArrayByObjectKey)(choosenColData, sort);
            if (direction === -1 || direction === 'desc' || direction === 'descending') choosenColData = choosenColData.reverse();
          }
          if (findOne) {
            choosenColData = choosenColData[0];
          } else if (limit) choosenColData.filter(function (_, i) {
            return i < limit;
          });
          return _context3.abrupt("return", [choosenColData, colRecord.result]);
        case 9:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function getRecord(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();
exports.getRecord = getRecord;
var generateRecordID = function generateRecordID(builder, config) {
  var command = builder.command,
    path = builder.path,
    countDoc = builder.countDoc,
    _ref7 = command || {},
    find = _ref7.find,
    findOne = _ref7.findOne,
    sort = _ref7.sort,
    direction = _ref7.direction,
    limit = _ref7.limit,
    _ref8 = config || {},
    extraction = _ref8.extraction,
    _ref8$retrieval = _ref8.retrieval,
    retrieval = _ref8$retrieval === void 0 ? _values.RETRIEVAL.DEFAULT : _ref8$retrieval,
    _ref8$delivery = _ref8.delivery,
    delivery = _ref8$delivery === void 0 ? _values.DELIVERY.DEFAULT : _ref8$delivery,
    _ref8$excludeFields = _ref8.excludeFields,
    excludeFields = _ref8$excludeFields === void 0 ? [] : _ref8$excludeFields,
    _ref8$returnOnly = _ref8.returnOnly,
    returnOnly = _ref8$returnOnly === void 0 ? [] : _ref8$returnOnly,
    accessId = "collection:".concat(path, "->excludes:").concat((Array.isArray(excludeFields) ? excludeFields : [excludeFields]).filter(function (v) {
      return v !== undefined;
    }).join(','), "->includes:").concat((Array.isArray(returnOnly) ? returnOnly : [returnOnly]).filter(function (v) {
      return v !== undefined;
    }).join(','), "->").concat(countDoc ? 'countDoc:yes->' : '', "sort:").concat(sort || '', "->direction:").concat(direction || '', "->limit:").concat(limit || '', "->").concat(findOne ? 'findOne' : 'find', ":").concat((0, _peripherals.objToUniqueString)(findOne || find || {}), ":extraction:").concat((0, _peripherals.objToUniqueString)(extraction || {}), ":retrieval:").concat(retrieval, ":delivery:").concat(delivery);
  return accessId;
};
exports.generateRecordID = generateRecordID;
var addPendingWrites = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(builder, writeId, result) {
    var projectUrl, _builder$dbUrl3, dbUrl, _builder$dbName3, dbName, path, writeObj, find, type, isAtomic, colObj, editions, duplicateSets;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _utils.awaitStore)();
        case 2:
          projectUrl = builder.projectUrl, _builder$dbUrl3 = builder.dbUrl, dbUrl = _builder$dbUrl3 === void 0 ? _values.DEFAULT_DB_URL : _builder$dbUrl3, _builder$dbName3 = builder.dbName, dbName = _builder$dbName3 === void 0 ? _values.DEFAULT_DB_NAME : _builder$dbName3, path = builder.path, writeObj = result.value, find = result.find, type = result.type, isAtomic = type === 'updateOne' || type === 'updateMany' || type === 'mergeOne' || type === 'mergeMany', colObj = (0, _get["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'data'], {});
          editions = [], duplicateSets = {};
          Object.entries(colObj).forEach(function (_ref10) {
            var _ref11 = _slicedToArray(_ref10, 2),
              kaf = _ref11[0],
              colList = _ref11[1];
            var hasEndCommit,
              editionSet = [];
            if (type === 'setOne' || type === 'setMany') {
              (type === 'setOne' ? [writeObj] : writeObj).forEach(function (e) {
                if (colList.findIndex(function (v) {
                  return v._id === e._id;
                }) === -1) {
                  editionSet.push({
                    doc: deserializeNonAtomicWrite(e),
                    dex: 'push',
                    docId: writeObj._id
                  });
                } else if (!duplicateSets[e._id]) console.error("document with _id=".concat(e._id, " already exist locally with ").concat(type, "() operation, will try committing it online"));
                duplicateSets[e._id] = true;
              });
            } else {
              colList.forEach(function (doc, docDex) {
                if (hasEndCommit) return;
                var afDoc = undefined;
                if ((0, _validator.confirmFilterDoc)(doc, find || {})) {
                  if (type === 'deleteMany') {
                    afDoc = null;
                  } else if (type === 'deleteOne') {
                    afDoc = null;
                    hasEndCommit = true;
                  } else if (isAtomic) {
                    var _deserializeAtomicWri;
                    if (((_deserializeAtomicWri = deserializeAtomicWrite({}, _objectSpread({}, writeObj))) !== null && _deserializeAtomicWri !== void 0 && _deserializeAtomicWri._id || find !== null && find !== void 0 && find._id) && type.endsWith('Many')) throw "avoid providing \"_id\" for ".concat(type, "() operation, use ").concat(type.substring(0, type.length - 4), "One instead as _id only reference a single document");
                    afDoc = deserializeAtomicWrite(_objectSpread({}, doc), _objectSpread({}, writeObj));
                    if (type.endsWith('One')) hasEndCommit = true;
                  } else {
                    afDoc = deserializeNonAtomicWrite(_objectSpread({}, writeObj));
                    hasEndCommit = true;
                  }
                }
                if (afDoc !== undefined) editionSet.push({
                  doc: afDoc,
                  dex: docDex,
                  docId: doc._id,
                  b4Doc: _objectSpread({}, doc)
                });
              });
            }
            if (!editionSet.length) {
              var hasNoID;
              if (type === 'putOne') {
                var nDoc = deserializeNonAtomicWrite(writeObj),
                  nId = (nDoc === null || nDoc === void 0 ? void 0 : nDoc._id) || (find === null || find === void 0 ? void 0 : find._id);
                if (nId) {
                  editionSet.push({
                    doc: _objectSpread(_objectSpread({}, nDoc), {}, {
                      _id: nId
                    }),
                    dex: 'push',
                    docId: nId
                  });
                } else hasNoID = true;
              } else if (type === 'mergeOne' || type === 'mergeMany') {
                var _nDoc = deserializeAtomicWrite({}, writeObj),
                  _nId = (_nDoc === null || _nDoc === void 0 ? void 0 : _nDoc._id) || (find === null || find === void 0 ? void 0 : find._id);
                if (_nId && type === 'mergeMany') throw "avoid providing \"_id\" for mergeMany() operation, use mergeOne instead as _id only reference a single document";
                if (_nId) {
                  editionSet.push({
                    doc: _objectSpread(_objectSpread({}, _nDoc), {}, {
                      _id: _nId
                    }),
                    dex: 'push',
                    docId: _nId
                  });
                } else hasNoID = true;
              }
              if (hasNoID) console.error("no data found locally and _id was not provided for ".concat(type, "() operation, skipping local and proceeding to online commit"));
            }
            editions.push([kaf, editionSet]);
          });
          editions.forEach(function (_ref12) {
            var _ref13 = _slicedToArray(_ref12, 2),
              kaf = _ref13[0],
              list = _ref13[1];
            list.forEach(function (_ref14) {
              var doc = _ref14.doc,
                dex = _ref14.dex,
                docId = _ref14.docId;
              if (dex === 'push') {
                colObj[kaf].push(_objectSpread({}, doc));
              } else if (doc === null) {
                colObj[kaf] = colObj[kaf].filter(function (v) {
                  return v._id !== docId;
                });
              } else {
                colObj[kaf] = colObj[kaf].map(function (v) {
                  return v._id === docId ? _objectSpread({}, doc) : v;
                });
              }
            });
          });
          (0, _set["default"])(_variables.CacheStore.PendingWrites, [projectUrl, "".concat(dbUrl).concat(dbName).concat(path), writeId], {
            find: find,
            value: writeObj,
            type: type,
            editions: editions,
            addedOn: Date.now()
          });
          (0, _utils.updateCacheStore)();
          notifyDatabaseNodeChanges(builder);
        case 9:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function addPendingWrites(_x8, _x9, _x10) {
    return _ref9.apply(this, arguments);
  };
}();
exports.addPendingWrites = addPendingWrites;
var removePendingWrite = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(builder, writeId, revert) {
    var projectUrl, _builder$dbUrl4, dbUrl, _builder$dbName4, dbName, path, pObj, colObj;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _utils.awaitStore)();
        case 2:
          projectUrl = builder.projectUrl, _builder$dbUrl4 = builder.dbUrl, dbUrl = _builder$dbUrl4 === void 0 ? _values.DEFAULT_DB_URL : _builder$dbUrl4, _builder$dbName4 = builder.dbName, dbName = _builder$dbName4 === void 0 ? _values.DEFAULT_DB_NAME : _builder$dbName4, path = builder.path, pObj = (0, _get["default"])(_variables.CacheStore.PendingWrites, [projectUrl, "".concat(dbUrl).concat(dbName).concat(path), writeId]), colObj = (0, _get["default"])(_variables.CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'data']);
          if (pObj) {
            _context5.next = 5;
            break;
          }
          return _context5.abrupt("return");
        case 5:
          if (revert && colObj) pObj.editions.forEach(function (_ref16) {
            var _ref17 = _slicedToArray(_ref16, 2),
              kaf = _ref17[0],
              list = _ref17[1];
            list.forEach(function (_ref18) {
              var doc = _ref18.doc,
                dex = _ref18.dex,
                docId = _ref18.docId,
                b4Doc = _ref18.b4Doc;
              if (dex === 'push') {
                colObj[kaf] = colObj[kaf].filter(function (v) {
                  return v._id !== docId;
                });
              } else if (doc === null) {
                colObj[kaf] = [].concat(_toConsumableArray(colObj[kaf]), [b4Doc]);
              } else {
                colObj[kaf] = colObj[kaf].map(function (v) {
                  return v._id === docId ? _objectSpread({}, b4Doc) : v;
                });
              }
            });
          });
          (0, _unset["default"])(_variables.CacheStore.PendingWrites, [projectUrl, "".concat(dbUrl).concat(dbName).concat(path), writeId]);
          (0, _utils.updateCacheStore)();
          notifyDatabaseNodeChanges(builder);
        case 9:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function removePendingWrite(_x11, _x12, _x13) {
    return _ref15.apply(this, arguments);
  };
}();
exports.removePendingWrite = removePendingWrite;
var trySendPendingWrite = function trySendPendingWrite() {};
exports.trySendPendingWrite = trySendPendingWrite;
var notifyDatabaseNodeChanges = function notifyDatabaseNodeChanges(builder) {};
var deserializeNonAtomicWrite = function deserializeNonAtomicWrite(writeObj) {
  var bj = {};
  (0, _peripherals.queryEntries)(writeObj, []).forEach(function (_ref19) {
    var _ref20 = _slicedToArray(_ref19, 2),
      segment = _ref20[0],
      value = _ref20[1];
    if (segment[0].startsWith('$')) throw "unexpected field \"".concat(segment[0], "\"");
    if (segment.slice(-1)[0] === '$timestamp' && value === 'now') {
      segment.pop();
      value = Date.now();
    }
    (0, _set["default"])(bj, segment.join('.'), value);
  });
  return bj;
};
var deserializeAtomicWrite = function deserializeAtomicWrite(b4Doc, writeObj) {
  var afDoc = _objectSpread({}, b4Doc),
    affectedObj = {};
  (0, _peripherals.queryEntries)(writeObj, []).forEach(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2),
      segment = _ref22[0],
      value = _ref22[1];
    var _ref23 = [segment[0], segment.filter(function (_, i) {
        return i;
      })],
      op = _ref23[0],
      path = _ref23[1];
    if (!_values.WRITE_OPS_LIST.includes(op) || !path.length) throw "MongoInvalidArgumentError: Update document requires atomic operators";
    if (path.length > 1 && (0, _peripherals.IS_RAW_OBJECT)(writeObj[op][path[0]]) && !affectedObj[path[0]]) {
      affectedObj[path[0]] = true;
      afDoc[path[0]] = {};
    }
    var nodeValue = (0, _get["default"])(b4Doc, path.join('.'));
    if (op === _values.WRITE_OPS.$UNSET) {
      (0, _unset["default"])(afDoc, path.join('.'));
    } else {
      if ([_values.WRITE_OPS.$MAX, _values.WRITE_OPS.$MIN, _values.WRITE_OPS.$INC, _values.WRITE_OPS.$MUL].filter(function (v) {
        return v === op;
      }).length && isNaN(value)) throw "expected a number for \"".concat(op, "\" operation but got ").concat(value);
      if (path.slice(-1)[0] === '$timestamp' && value === 'now') {
        var k = [_values.WRITE_OPS.$SET, _values.WRITE_OPS.$UNSET];
        if (!k.includes(op)) throw "invalid operator for updating timestamp, expected any of ".concat(k);
        path.pop();
        value = Date.now();
      }
      if (op === _values.WRITE_OPS.$RENAME) {
        if (nodeValue === undefined) return;
        if (typeof value !== 'string') throw "".concat(op, " operator expected a string value at ").concat(path.join('.'));
        (0, _unset["default"])(afDoc, path.join('.'));
        path[path.length - 1] = value;
      }
      (0, _set["default"])(afDoc, path.join('.'), op === _values.WRITE_OPS.$SET ? value : op === _values.WRITE_OPS.$INC ? isNaN(nodeValue) ? value : nodeValue + value : op === _values.WRITE_OPS.$MAX ? isNaN(nodeValue) ? value : value > nodeValue ? value : nodeValue : op === _values.WRITE_OPS.$MIN ? isNaN(nodeValue) ? value : value < nodeValue ? value : nodeValue : op === _values.WRITE_OPS.$MUL ? isNaN(nodeValue) ? 0 : value * nodeValue : op === _values.WRITE_OPS.$PULL ? Array.isArray(nodeValue) ? nodeValue.filter(function (v) {
        return !(0, _isEqual["default"])(v, value);
      }) : [value] : op === _values.WRITE_OPS.$PUSH ? Array.isArray(nodeValue) ? [].concat(_toConsumableArray(nodeValue), [value]) : [value] : op === _values.WRITE_OPS.$RENAME ? nodeValue : null // TODO:
      );
    }
  });

  return afDoc;
};