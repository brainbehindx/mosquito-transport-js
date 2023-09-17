"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MosquitoDbCollection = void 0;
var _lodash = _interopRequireDefault(require("lodash"));
var _socket2 = require("socket.io-client");
var _EngineApi = _interopRequireDefault(require("../../helpers/EngineApi"));
var _listeners = require("../../helpers/listeners");
var _peripherals = require("../../helpers/peripherals");
var _utils = require("../../helpers/utils");
var _variables = require("../../helpers/variables");
var _accessor = require("./accessor");
var _validator = require("./validator");
var _accessor2 = require("../auth/accessor");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MosquitoDbCollection = /*#__PURE__*/_createClass(function MosquitoDbCollection(_config) {
  var _this = this;
  _classCallCheck(this, MosquitoDbCollection);
  _defineProperty(this, "find", function (find) {
    return {
      get: function get(config) {
        return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), config);
      },
      listen: function listen(callback, error, config) {
        return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), config);
      },
      count: function count() {
        return countCollection(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }));
      },
      limit: function limit(_limit) {
        return {
          get: function get(config) {
            return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
              find: find,
              limit: _limit
            }), config);
          },
          random: function random(config) {
            return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
              find: find,
              limit: _limit,
              random: true
            }), config);
          },
          listen: function listen(callback, error, config) {
            return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
              find: find,
              limit: _limit
            }), config);
          },
          sort: function sort(_sort, direction) {
            return {
              get: function get(config) {
                return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
                  find: find,
                  limit: _limit,
                  sort: _sort,
                  direction: direction
                }), config);
              },
              listen: function listen(callback, error, config) {
                return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
                  find: find,
                  limit: _limit,
                  sort: _sort,
                  direction: direction
                }), config);
              }
            };
          }
        };
      },
      sort: function sort(_sort2, direction) {
        return {
          get: function get(config) {
            return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
              find: find,
              sort: _sort2,
              direction: direction
            }), config);
          },
          listen: function listen(callback, error, config) {
            return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
              find: find,
              sort: _sort2,
              direction: direction
            }), config);
          },
          limit: function limit(_limit2) {
            return {
              get: function get(config) {
                return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
                  find: find,
                  sort: _sort2,
                  direction: direction,
                  limit: _limit2
                }), config);
              },
              listen: function listen(callback, error, config) {
                return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
                  find: find,
                  sort: _sort2,
                  direction: direction,
                  limit: _limit2
                }), config);
              }
            };
          }
        };
      }
    };
  });
  _defineProperty(this, "sort", function (sort, direction) {
    return _this.find().sort(sort, direction);
  });
  _defineProperty(this, "limit", function (limit) {
    return _this.find().limit(limit);
  });
  _defineProperty(this, "count", function () {
    return countCollection(_objectSpread({}, _this.builder));
  });
  _defineProperty(this, "get", function (config) {
    return findObject(_objectSpread({}, _this.builder), config);
  });
  _defineProperty(this, "listen", function (callback, error, config) {
    return listenDocument(callback, error, _objectSpread({}, _this.builder), config);
  });
  _defineProperty(this, "findOne", function (findOne) {
    return {
      listen: function listen(callback, error, config) {
        return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
          findOne: findOne
        }), config);
      },
      get: function get(config) {
        return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
          findOne: findOne
        }), config);
      }
    };
  });
  _defineProperty(this, "onDisconnect", function () {
    return {
      setOne: function setOne(value) {
        return initOnDisconnectionTask(_objectSpread({}, _this.builder), value, 'setOne');
      },
      setMany: function setMany(value) {
        return initOnDisconnectionTask(_objectSpread({}, _this.builder), value, 'setMany');
      },
      updateOne: function updateOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'updateOne');
      },
      updateMany: function updateMany(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'updateMany');
      },
      mergeOne: function mergeOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'mergeOne');
      },
      mergeMany: function mergeMany(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'mergeMany');
      },
      deleteOne: function deleteOne(find) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), null, 'deleteOne');
      },
      deleteMany: function deleteMany(find) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), null, 'deleteMany');
      },
      replaceOne: function replaceOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'replaceOne');
      },
      putOne: function putOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          find: find
        }), value, 'putOne');
      }
    };
  });
  _defineProperty(this, "setOne", function (value) {
    return commitData(_this.builder, value, 'setOne');
  });
  _defineProperty(this, "setMany", function (value) {
    return commitData(_this.builder, value, 'setMany');
  });
  _defineProperty(this, "updateOne", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'updateOne');
  });
  _defineProperty(this, "updateMany", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'updateMany');
  });
  _defineProperty(this, "mergeOne", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'mergeOne');
  });
  _defineProperty(this, "mergeMany", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'mergeMany');
  });
  _defineProperty(this, "replaceOne", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'replaceOne');
  });
  _defineProperty(this, "putOne", function (find, value) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'putOne');
  });
  _defineProperty(this, "deleteOne", function (find) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), null, 'deleteOne');
  });
  _defineProperty(this, "deleteMany", function (find) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), null, 'deleteMany');
  });
  this.builder = _objectSpread({}, _config);
}

// writeBatchMap = (map) => commitData({ ...this.builder, find }, map, 'writeBatchMap');
);
exports.MosquitoDbCollection = MosquitoDbCollection;
var listenDocument = function listenDocument(callback, onError, builder, config) {
  var projectUrl = builder.projectUrl,
    dbUrl = builder.dbUrl,
    dbName = builder.dbName,
    accessKey = builder.accessKey,
    path = builder.path,
    find = builder.find,
    findOne = builder.findOne,
    sort = builder.sort,
    direction = builder.direction,
    limit = builder.limit,
    disableCache = builder.disableCache,
    accessId = (0, _accessor.generateRecordID)(builder, config);
  var hasCancelled,
    hasRespond,
    cacheListener,
    socket,
    wasDisconnected,
    lastToken = _variables.Scoped.AuthJWTToken[projectUrl] || null,
    lastInitRef = 0;
  if (!disableCache) {
    cacheListener = _listeners.DatabaseRecordsListener.startKeyListener(accessId, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var cache;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _accessor.getRecord)(projectUrl, dbUrl, dbName, path, accessId);
          case 2:
            cache = _context.sent;
            if (cache) callback === null || callback === void 0 ? void 0 : callback(cache.value);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })));
    _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var a;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return fetch(_EngineApi["default"]._areYouOk(projectUrl));
          case 3:
            _context2.next = 5;
            return _context2.sent.json();
          case 5:
            a = _context2.sent;
            if (!(a.status !== 'yes')) {
              _context2.next = 8;
              break;
            }
            throw 'am_sick';
          case 8:
            _context2.next = 15;
            break;
          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](0);
            if (!(hasRespond || hasCancelled)) {
              _context2.next = 14;
              break;
            }
            return _context2.abrupt("return");
          case 14:
            _listeners.DatabaseRecordsListener.triggerKeyListener(accessId);
          case 15:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[0, 10]]);
    }))();
  }
  var init = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var processID;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            processID = ++lastInitRef;
            _context4.next = 3;
            return (0, _accessor2.awaitRefreshToken)(projectUrl);
          case 3:
            if (!(hasCancelled || processID !== lastInitRef)) {
              _context4.next = 5;
              break;
            }
            return _context4.abrupt("return");
          case 5:
            socket = (0, _socket2.io)("ws://".concat(projectUrl.split('://')[1]), {
              auth: {
                mtoken: _variables.Scoped.AuthJWTToken[projectUrl],
                commands: {
                  config: config,
                  path: path,
                  find: findOne || find,
                  sort: sort,
                  direction: direction,
                  limit: limit
                },
                dbName: dbName,
                dbUrl: dbUrl,
                accessKey: accessKey
              },
              transports: ['websocket', 'polling', 'flashsocket']
            });
            socket.emit(findOne ? '_listenDocument' : '_listenCollection');
            socket.on('mSnapshot', /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_ref4) {
                var _ref6, err, snapshot;
                return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                  while (1) switch (_context3.prev = _context3.next) {
                    case 0:
                      _ref6 = _slicedToArray(_ref4, 2), err = _ref6[0], snapshot = _ref6[1];
                      hasRespond = true;
                      if (!err) {
                        _context3.next = 6;
                        break;
                      }
                      onError === null || onError === void 0 ? void 0 : onError((err === null || err === void 0 ? void 0 : err.simpleError) || (0, _utils.simplifyError)('unexpected_error', "".concat(e)).simpleError);
                      _context3.next = 13;
                      break;
                    case 6:
                      if (!disableCache) {
                        _context3.next = 10;
                        break;
                      }
                      callback === null || callback === void 0 ? void 0 : callback(snapshot);
                      _context3.next = 13;
                      break;
                    case 10:
                      _context3.next = 12;
                      return (0, _accessor.insertRecord)(projectUrl, dbUrl, dbName, path, accessId, {
                        sort: sort,
                        direction: direction,
                        limit: limit,
                        find: find,
                        findOne: findOne,
                        config: config
                      }, snapshot);
                    case 12:
                      _listeners.DatabaseRecordsListener.triggerKeyListener(accessId);
                    case 13:
                    case "end":
                      return _context3.stop();
                  }
                }, _callee3);
              }));
              return function (_x) {
                return _ref5.apply(this, arguments);
              };
            }());
            socket.on('connect', function () {
              if (wasDisconnected) socket.emit(findOne ? '_listenDocument' : '_listenCollection');
            });
            socket.on('disconnect', function () {
              wasDisconnected = true;
            });
          case 10:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return function init() {
      return _ref3.apply(this, arguments);
    };
  }();
  init();
  var tokenListener = (0, _accessor2.listenToken)(function (t) {
    if ((t || null) !== lastToken) {
      var _socket, _socket$close;
      (_socket = socket) === null || _socket === void 0 ? void 0 : (_socket$close = _socket.close) === null || _socket$close === void 0 ? void 0 : _socket$close.call(_socket);
      wasDisconnected = undefined;
      init();
    }
    lastToken = t;
  }, projectUrl);
  return function () {
    var _cacheListener;
    if (hasCancelled) return;
    hasCancelled = true;
    if (socket) socket.close();
    (_cacheListener = cacheListener) === null || _cacheListener === void 0 ? void 0 : _cacheListener();
    tokenListener === null || tokenListener === void 0 ? void 0 : tokenListener();
  };
};
var countCollection = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(builder) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries, maxRetries, path, find, disableCache, accessId, retries, readValue, g;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries = builder.maxRetries, maxRetries = _builder$maxRetries === void 0 ? 7 : _builder$maxRetries, path = builder.path, find = builder.find, disableCache = builder.disableCache, accessId = (0, _accessor.generateRecordID)(_objectSpread(_objectSpread({}, builder), {}, {
            countDoc: true
          }));
          retries = 0;
          readValue = function readValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(resolve, reject) {
                var r, onlineListener;
                return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                  while (1) switch (_context5.prev = _context5.next) {
                    case 0:
                      ++retries;
                      _context5.prev = 1;
                      _context5.next = 4;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 4:
                      _context5.next = 6;
                      return fetch(_EngineApi["default"]._documentCount(projectUrl), (0, _utils.buildFetchInterface)({
                        commands: {
                          path: path,
                          find: find
                        },
                        dbName: dbName,
                        dbUrl: dbUrl
                      }, accessKey, _variables.Scoped.AuthJWTToken[projectUrl]));
                    case 6:
                      _context5.next = 8;
                      return _context5.sent.json();
                    case 8:
                      r = _context5.sent;
                      if (!r.simpleError) {
                        _context5.next = 11;
                        break;
                      }
                      throw r;
                    case 11:
                      resolve(r.result);
                      if (!disableCache) (0, _accessor.insertRecord)(projectUrl, dbUrl, dbName, path, accessId, {
                        find: find,
                        isCount: true
                      }, r.result);
                      _context5.next = 35;
                      break;
                    case 15:
                      _context5.prev = 15;
                      _context5.t0 = _context5["catch"](1);
                      if (!(_context5.t0 !== null && _context5.t0 !== void 0 && _context5.t0.simpleError)) {
                        _context5.next = 21;
                        break;
                      }
                      reject(_context5.t0 === null || _context5.t0 === void 0 ? void 0 : _context5.t0.simpleError);
                      _context5.next = 35;
                      break;
                    case 21:
                      _context5.t1 = !disableCache;
                      if (!_context5.t1) {
                        _context5.next = 26;
                        break;
                      }
                      _context5.next = 25;
                      return (0, _accessor.getRecord)(projectUrl, dbUrl, dbName, path, accessId);
                    case 25:
                      _context5.t1 = _context5.sent;
                    case 26:
                      if (!_context5.t1) {
                        _context5.next = 34;
                        break;
                      }
                      _context5.t2 = resolve;
                      _context5.next = 30;
                      return (0, _accessor.getRecord)(projectUrl, dbUrl, dbName, path, accessId);
                    case 30:
                      _context5.t3 = _context5.sent.value;
                      (0, _context5.t2)(_context5.t3);
                      _context5.next = 35;
                      break;
                    case 34:
                      if (retries > maxRetries) {
                        reject({
                          error: 'retry_limit_exceeded',
                          message: "retry exceed limit(".concat(maxRetries, ")")
                        });
                      } else {
                        onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                          if (connected) {
                            onlineListener();
                            readValue().then(resolve, reject);
                          }
                        }, projectUrl);
                      }
                    case 35:
                    case "end":
                      return _context5.stop();
                  }
                }, _callee5, null, [[1, 15]]);
              }));
              return function (_x3, _x4) {
                return _ref8.apply(this, arguments);
              };
            }());
          };
          _context6.next = 5;
          return readValue();
        case 5:
          g = _context6.sent;
          return _context6.abrupt("return", g);
        case 7:
        case "end":
          return _context6.stop();
      }
    }, _callee6);
  }));
  return function countCollection(_x2) {
    return _ref7.apply(this, arguments);
  };
}();
var initOnDisconnectionTask = function initOnDisconnectionTask(builder, value, type) {
  var hasCancelled, socket;
  _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
    var projectUrl, dbUrl, dbName, accessKey, path, find;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, path = builder.path, find = builder.find;
          _context7.next = 3;
          return (0, _accessor2.awaitRefreshToken)(projectUrl);
        case 3:
          if (!hasCancelled) {
            _context7.next = 5;
            break;
          }
          return _context7.abrupt("return");
        case 5:
          socket = (0, _socket2.io)("ws://".concat(projectUrl.split('://')[1]), {
            auth: {
              mtoken: _variables.Scoped.AuthJWTToken[projectUrl],
              commands: {
                path: path,
                find: find,
                value: value,
                scope: type
              },
              dbName: dbName,
              dbUrl: dbUrl,
              accessKey: accessKey
            },
            transports: ['websocket', 'polling', 'flashsocket']
          });
          socket.emit('_startDisconnectWriteTask');
        case 7:
        case "end":
          return _context7.stop();
      }
    }, _callee7);
  }))();
  return function () {
    if (hasCancelled) return;
    if (socket) socket.emit('_cancelDisconnectWriteTask');
    setTimeout(function () {
      if (socket) socket.close();
    }, 700);
    hasCancelled = true;
  };
};
var findObject = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(builder, config) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries2, maxRetries, path, find, findOne, sort, direction, limit, disableCache, random, accessId, retries, readValue, g;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries2 = builder.maxRetries, maxRetries = _builder$maxRetries2 === void 0 ? 7 : _builder$maxRetries2, path = builder.path, find = builder.find, findOne = builder.findOne, sort = builder.sort, direction = builder.direction, limit = builder.limit, disableCache = builder.disableCache, random = builder.random, accessId = (0, _accessor.generateRecordID)(builder, config);
          if (disableCache) {
            _context9.next = 6;
            break;
          }
          (0, _validator.validateReadConfig)(config);
          (0, _validator.validateFilter)(find);
          if (!(typeof limit === 'number' && (!(0, _peripherals.IS_WHOLE_NUMBER)(limit) || limit <= 0))) {
            _context9.next = 6;
            break;
          }
          throw "limit() has an invalid argument, expected a positive whole number";
        case 6:
          retries = 0;
          readValue = function readValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(resolve, reject) {
                var r, onlineListener;
                return _regeneratorRuntime().wrap(function _callee8$(_context8) {
                  while (1) switch (_context8.prev = _context8.next) {
                    case 0:
                      ++retries;
                      _context8.prev = 1;
                      _context8.next = 4;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 4:
                      _context8.next = 6;
                      return fetch(_EngineApi["default"][findOne ? '_readDocument' : '_queryCollection'](projectUrl), (0, _utils.buildFetchInterface)({
                        commands: {
                          config: config,
                          path: path,
                          find: findOne || find,
                          sort: sort,
                          direction: direction,
                          limit: limit,
                          random: random
                        },
                        dbName: dbName,
                        dbUrl: dbUrl
                      }, accessKey, _variables.Scoped.AuthJWTToken[projectUrl]));
                    case 6:
                      _context8.next = 8;
                      return _context8.sent.json();
                    case 8:
                      r = _context8.sent;
                      if (!r.simpleError) {
                        _context8.next = 11;
                        break;
                      }
                      throw r;
                    case 11:
                      if (!disableCache) (0, _accessor.insertRecord)(projectUrl, dbUrl, dbName, path, accessId, {
                        sort: sort,
                        direction: direction,
                        limit: limit,
                        find: find,
                        findOne: findOne,
                        config: config
                      }, r.result);
                      resolve(r.result);
                      _context8.next = 35;
                      break;
                    case 15:
                      _context8.prev = 15;
                      _context8.t0 = _context8["catch"](1);
                      if (!(_context8.t0 !== null && _context8.t0 !== void 0 && _context8.t0.simpleError)) {
                        _context8.next = 21;
                        break;
                      }
                      reject(_context8.t0 === null || _context8.t0 === void 0 ? void 0 : _context8.t0.simpleError);
                      _context8.next = 35;
                      break;
                    case 21:
                      _context8.t1 = !disableCache;
                      if (!_context8.t1) {
                        _context8.next = 26;
                        break;
                      }
                      _context8.next = 25;
                      return (0, _accessor.getRecord)(projectUrl, dbUrl, dbName, path, accessId);
                    case 25:
                      _context8.t1 = _context8.sent;
                    case 26:
                      if (!_context8.t1) {
                        _context8.next = 34;
                        break;
                      }
                      _context8.t2 = resolve;
                      _context8.next = 30;
                      return (0, _accessor.getRecord)(projectUrl, dbUrl, dbName, path, accessId);
                    case 30:
                      _context8.t3 = _context8.sent.value;
                      (0, _context8.t2)(_context8.t3);
                      _context8.next = 35;
                      break;
                    case 34:
                      if (retries > maxRetries) {
                        reject({
                          error: 'retry_limit_exceeded',
                          message: "retry exceed limit(".concat(maxRetries, ")")
                        });
                      } else {
                        onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                          if (connected) {
                            onlineListener();
                            readValue().then(resolve, reject);
                          }
                        }, projectUrl);
                      }
                    case 35:
                    case "end":
                      return _context8.stop();
                  }
                }, _callee8, null, [[1, 15]]);
              }));
              return function (_x7, _x8) {
                return _ref11.apply(this, arguments);
              };
            }());
          };
          _context9.next = 10;
          return readValue();
        case 10:
          g = _context9.sent;
          return _context9.abrupt("return", g);
        case 12:
        case "end":
          return _context9.stop();
      }
    }, _callee9);
  }));
  return function findObject(_x5, _x6) {
    return _ref10.apply(this, arguments);
  };
}();
var commitData = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(builder, value, type) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries3, maxRetries, path, find, disableCache, writeId, b4Data, retries, sendValue;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries3 = builder.maxRetries, maxRetries = _builder$maxRetries3 === void 0 ? 7 : _builder$maxRetries3, path = builder.path, find = builder.find, disableCache = builder.disableCache, writeId = "".concat(++_variables.Scoped.PendingIte);
          if (disableCache) {
            _context11.next = 14;
            break;
          }
          (0, _validator.validateWriteValue)(value, builder.find, type);
          if (!(type === 'set')) {
            _context11.next = 7;
            break;
          }
          b4Data = (Array.isArray(value) ? value : [value]).map(function (v) {
            if (!(v !== null && v !== void 0 && v._id)) throw 'No _id found in set() operation mosquitodb';
            return (0, _accessor.accessData)(projectUrl, dbUrl, dbName, path, {
              _id: v._id
            });
          });
          _context11.next = 10;
          break;
        case 7:
          _context11.next = 9;
          return (0, _accessor.accessData)(projectUrl, dbUrl, dbName, path, find);
        case 9:
          b4Data = _context11.sent;
        case 10:
          _context11.next = 12;
          return (0, _accessor.addPendingWrites)(projectUrl, dbUrl, dbName, writeId, {
            builder: builder,
            value: value,
            type: type,
            find: find
          });
        case 12:
          _context11.next = 14;
          return (0, _accessor.commitStore)(projectUrl, dbUrl, dbName, path, value, find, type);
        case 14:
          retries = 0;
          sendValue = function sendValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(resolve, reject) {
                var r, _e$simpleError, onlineListener;
                return _regeneratorRuntime().wrap(function _callee10$(_context10) {
                  while (1) switch (_context10.prev = _context10.next) {
                    case 0:
                      ++retries;
                      _context10.prev = 1;
                      _context10.next = 4;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 4:
                      _context10.next = 6;
                      return fetch(_EngineApi["default"]['_writeDocument'](projectUrl), (0, _utils.buildFetchInterface)({
                        commands: {
                          path: path,
                          scope: type,
                          value: value,
                          find: find
                        },
                        dbName: dbName,
                        dbUrl: dbUrl
                      }, accessKey, _variables.Scoped.AuthJWTToken[projectUrl]));
                    case 6:
                      _context10.next = 8;
                      return _context10.sent.json();
                    case 8:
                      r = _context10.sent;
                      if (!r.simpleError) {
                        _context10.next = 11;
                        break;
                      }
                      throw r;
                    case 11:
                      if (!disableCache) (0, _accessor.removePendingWrite)(projectUrl, dbUrl, dbName, writeId);
                      resolve({
                        status: 'sent',
                        committed: r.committed
                      });
                      _context10.next = 18;
                      break;
                    case 15:
                      _context10.prev = 15;
                      _context10.t0 = _context10["catch"](1);
                      if (_context10.t0 !== null && _context10.t0 !== void 0 && _context10.t0.simpleError) {
                        console.error("".concat(type, " error (").concat(path, "), ").concat((_e$simpleError = _context10.t0.simpleError) === null || _e$simpleError === void 0 ? void 0 : _e$simpleError.message));
                        if (!disableCache) {
                          (0, _accessor.removePendingWrite)(projectUrl, dbUrl, dbName, writeId);
                          (0, _accessor.updateDatabaseStore)(projectUrl, dbUrl, dbName, path, b4Data.map(function (v) {
                            return {
                              _id: v._id,
                              value: v
                            };
                          }));
                        }
                        reject(_context10.t0 === null || _context10.t0 === void 0 ? void 0 : _context10.t0.simpleError);
                      } else if (retries > maxRetries) {
                        console.error("retry exceed limit(".concat(maxRetries, "): ").concat(type, " error (").concat(path, "), ").concat(_context10.t0));
                        if (!disableCache) (0, _accessor.removePendingWrite)(projectUrl, dbUrl, dbName, writeId);
                      } else {
                        onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                          if (connected) {
                            onlineListener();
                            sendValue();
                          }
                        }, projectUrl);
                        resolve({
                          status: 'pending'
                        });
                      }
                    case 18:
                    case "end":
                      return _context10.stop();
                  }
                }, _callee10, null, [[1, 15]]);
              }));
              return function (_x12, _x13) {
                return _ref13.apply(this, arguments);
              };
            }());
          };
          _context11.next = 18;
          return sendValue();
        case 18:
          return _context11.abrupt("return", _context11.sent);
        case 19:
        case "end":
          return _context11.stop();
      }
    }, _callee11);
  }));
  return function commitData(_x9, _x10, _x11) {
    return _ref12.apply(this, arguments);
  };
}();