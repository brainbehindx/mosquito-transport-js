"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MosquitoDbCollection = void 0;
var _socket2 = require("socket.io-client");
var _EngineApi = _interopRequireDefault(require("../../helpers/EngineApi"));
var _listeners = require("../../helpers/listeners");
var _peripherals = require("../../helpers/peripherals");
var _utils = require("../../helpers/utils");
var _variables = require("../../helpers/variables");
var _accessor = require("./accessor");
var _validator = require("./validator");
var _accessor2 = require("../auth/accessor");
var _values = require("../../helpers/values");
var _set = _interopRequireDefault(require("lodash/set"));
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
          command: {
            find: find
          }
        }), config);
      },
      listen: function listen(callback, error, config) {
        return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), config);
      },
      count: function count(config) {
        return countCollection(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), config);
      },
      limit: function limit(_limit) {
        return {
          get: function get(config) {
            return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
              command: {
                find: find,
                limit: _limit
              }
            }), config);
          },
          random: function random(config) {
            return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
              command: {
                find: find,
                limit: _limit,
                random: true
              }
            }), config);
          },
          listen: function listen(callback, error, config) {
            return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
              command: {
                find: find,
                limit: _limit
              }
            }), config);
          },
          sort: function sort(_sort, direction) {
            return {
              get: function get(config) {
                return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
                  command: {
                    find: find,
                    limit: _limit,
                    sort: _sort,
                    direction: direction
                  }
                }), config);
              },
              listen: function listen(callback, error, config) {
                return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
                  command: {
                    find: find,
                    limit: _limit,
                    sort: _sort,
                    direction: direction
                  }
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
              command: {
                find: find,
                sort: _sort2,
                direction: direction
              }
            }), config);
          },
          listen: function listen(callback, error, config) {
            return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
              command: {
                find: find,
                sort: _sort2,
                direction: direction
              }
            }), config);
          },
          limit: function limit(_limit2) {
            return {
              get: function get(config) {
                return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
                  command: {
                    find: find,
                    sort: _sort2,
                    direction: direction,
                    limit: _limit2
                  }
                }), config);
              },
              listen: function listen(callback, error, config) {
                return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
                  command: {
                    find: find,
                    sort: _sort2,
                    direction: direction,
                    limit: _limit2
                  }
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
  _defineProperty(this, "count", function (config) {
    return countCollection(_objectSpread({}, _this.builder), config);
  });
  _defineProperty(this, "get", function (config) {
    return findObject(_objectSpread({}, _this.builder), config);
  });
  _defineProperty(this, "listen", function (callback, error, config) {
    return listenDocument(callback, error, _objectSpread({}, _this.builder), config);
  });
  _defineProperty(this, "findOne", function () {
    var findOne = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return {
      listen: function listen(callback, error, config) {
        return listenDocument(callback, error, _objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            findOne: findOne
          }
        }), config);
      },
      get: function get(config) {
        return findObject(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            findOne: findOne
          }
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
          command: {
            find: find
          }
        }), value, 'updateOne');
      },
      updateMany: function updateMany(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), value, 'updateMany');
      },
      mergeOne: function mergeOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), value, 'mergeOne');
      },
      mergeMany: function mergeMany(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), value, 'mergeMany');
      },
      deleteOne: function deleteOne(find) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), null, 'deleteOne');
      },
      deleteMany: function deleteMany(find) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), null, 'deleteMany');
      },
      replaceOne: function replaceOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), value, 'replaceOne');
      },
      putOne: function putOne(find, value) {
        return initOnDisconnectionTask(_objectSpread(_objectSpread({}, _this.builder), {}, {
          command: {
            find: find
          }
        }), value, 'putOne');
      }
    };
  });
  _defineProperty(this, "setOne", function (value, config) {
    return commitData(_this.builder, value, 'setOne', config);
  });
  _defineProperty(this, "setMany", function (value, config) {
    return commitData(_this.builder, value, 'setMany', config);
  });
  _defineProperty(this, "updateOne", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'updateOne', config);
  });
  _defineProperty(this, "updateMany", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'updateMany', config);
  });
  _defineProperty(this, "mergeOne", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'mergeOne', config);
  });
  _defineProperty(this, "mergeMany", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'mergeMany', config);
  });
  _defineProperty(this, "replaceOne", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'replaceOne', config);
  });
  _defineProperty(this, "putOne", function (find, value, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), value, 'putOne', config);
  });
  _defineProperty(this, "deleteOne", function (find, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), null, 'deleteOne', config);
  });
  _defineProperty(this, "deleteMany", function (find, config) {
    return commitData(_objectSpread(_objectSpread({}, _this.builder), {}, {
      find: find
    }), null, 'deleteMany', config);
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
    disableCache = builder.disableCache,
    command = builder.command,
    uglify = builder.uglify,
    find = command.find,
    findOne = command.findOne,
    sort = command.sort,
    direction = command.direction,
    limit = command.limit,
    _ref = config || {},
    disableAuth = _ref.disableAuth,
    accessId = (0, _accessor.generateRecordID)(builder, config),
    shouldCache = !disableCache,
    processId = "".concat(++_variables.Scoped.AnyProcessIte);
  (0, _validator.validateReadConfig)(config, ['retrieval', 'disableAuth']);
  (0, _validator.validateFilter)(findOne || find);
  (0, _validator.validateCollectionPath)(path);
  var hasCancelled,
    hasRespond,
    cacheListener,
    socket,
    wasDisconnected,
    lastToken = _variables.Scoped.AuthJWTToken[projectUrl] || null,
    lastInitRef = 0,
    connectedListener;
  if (shouldCache) {
    cacheListener = (0, _accessor.listenQueryEntry)(callback, {
      accessId: accessId,
      builder: builder,
      config: config,
      processId: processId
    });
    connectedListener = (0, _peripherals.listenReachableServer)( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(connected) {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              connectedListener();
              _context.next = 3;
              return (0, _utils.awaitStore)();
            case 3:
              if (!connected && !hasRespond && !hasCancelled) _listeners.DatabaseRecordsListener.dispatch(accessId, processId);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), projectUrl);
  }
  var init = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var _CacheStore$AuthStore, _CacheStore$AuthStore2;
      var processID, mtoken, authObj, _ref4, _ref4$encryptionKey, encryptionKey;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            processID = ++lastInitRef;
            if (disableAuth) {
              _context3.next = 4;
              break;
            }
            _context3.next = 4;
            return (0, _accessor2.awaitRefreshToken)(projectUrl);
          case 4:
            if (!(hasCancelled || processID !== lastInitRef)) {
              _context3.next = 6;
              break;
            }
            return _context3.abrupt("return");
          case 6:
            mtoken = disableAuth ? undefined : _variables.Scoped.AuthJWTToken[projectUrl], authObj = {
              commands: {
                config: config,
                path: path,
                find: findOne || find,
                sort: sort,
                direction: direction,
                limit: limit
              },
              dbName: dbName,
              dbUrl: dbUrl
            }, _ref4 = ((_CacheStore$AuthStore = _variables.CacheStore.AuthStore) === null || _CacheStore$AuthStore === void 0 ? void 0 : (_CacheStore$AuthStore2 = _CacheStore$AuthStore[projectUrl]) === null || _CacheStore$AuthStore2 === void 0 ? void 0 : _CacheStore$AuthStore2.tokenData) || {}, _ref4$encryptionKey = _ref4.encryptionKey, encryptionKey = _ref4$encryptionKey === void 0 ? accessKey : _ref4$encryptionKey;
            socket = (0, _socket2.io)("ws://".concat(projectUrl.split('://')[1]), {
              auth: _objectSpread(_objectSpread({}, mtoken ? {
                mtoken: mtoken
              } : {}), {}, {
                ugly: uglify,
                accessKey: (0, _peripherals.encryptString)(accessKey, accessKey, '_'),
                __: uglify ? (0, _peripherals.encryptString)(JSON.stringify(authObj), accessKey, disableAuth ? accessKey : encryptionKey) : authObj
              }),
              transports: ['websocket', 'polling', 'flashsocket']
            });
            socket.emit(findOne ? '_listenDocument' : '_listenCollection');
            socket.on('mSnapshot', /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_ref5) {
                var _ref7, err, snapshot;
                return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      _ref7 = _slicedToArray(_ref5, 2), err = _ref7[0], snapshot = _ref7[1];
                      hasRespond = true;
                      if (err) {
                        onError === null || onError === void 0 ? void 0 : onError((0, _peripherals.simplifyCaughtError)(err).simpleError);
                      } else callback === null || callback === void 0 ? void 0 : callback(snapshot);
                      if (shouldCache) (0, _accessor.insertRecord)(builder, accessId, {
                        sort: sort,
                        direction: direction,
                        limit: limit,
                        find: find,
                        findOne: findOne,
                        config: config
                      }, snapshot);
                    case 4:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              }));
              return function (_x2) {
                return _ref6.apply(this, arguments);
              };
            }());
            socket.on('connect', function () {
              if (wasDisconnected) socket.emit(findOne ? '_listenDocument' : '_listenCollection');
            });
            socket.on('disconnect', function () {
              wasDisconnected = true;
            });
          case 12:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
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
    var _connectedListener, _cacheListener;
    if (hasCancelled) return;
    hasCancelled = true;
    (_connectedListener = connectedListener) === null || _connectedListener === void 0 ? void 0 : _connectedListener();
    (_cacheListener = cacheListener) === null || _cacheListener === void 0 ? void 0 : _cacheListener();
    tokenListener === null || tokenListener === void 0 ? void 0 : tokenListener();
    if (socket) socket.close();
  };
};
var initOnDisconnectionTask = function initOnDisconnectionTask(builder, value, type) {
  var projectUrl = builder.projectUrl,
    dbUrl = builder.dbUrl,
    dbName = builder.dbName,
    accessKey = builder.accessKey,
    path = builder.path,
    command = builder.command,
    uglify = builder.uglify,
    _ref8 = command || {},
    find = _ref8.find,
    disableAuth = false;
  (0, _validator.validateCollectionPath)(path);
  var hasCancelled,
    socket,
    wasDisconnected,
    lastToken = _variables.Scoped.AuthJWTToken[projectUrl] || null,
    lastInitRef = 0;
  var init = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var _CacheStore$AuthStore3, _CacheStore$AuthStore4;
      var processID, mtoken, authObj, _ref10, _ref10$encryptionKey, encryptionKey;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            processID = ++lastInitRef;
            if (disableAuth) {
              _context4.next = 4;
              break;
            }
            _context4.next = 4;
            return (0, _accessor2.awaitRefreshToken)(projectUrl);
          case 4:
            if (!(hasCancelled || processID !== lastInitRef)) {
              _context4.next = 6;
              break;
            }
            return _context4.abrupt("return");
          case 6:
            mtoken = disableAuth ? undefined : _variables.Scoped.AuthJWTToken[projectUrl], authObj = {
              commands: {
                path: path,
                find: find,
                value: value,
                scope: type
              },
              dbName: dbName,
              dbUrl: dbUrl
            }, _ref10 = ((_CacheStore$AuthStore3 = _variables.CacheStore.AuthStore) === null || _CacheStore$AuthStore3 === void 0 ? void 0 : (_CacheStore$AuthStore4 = _CacheStore$AuthStore3[projectUrl]) === null || _CacheStore$AuthStore4 === void 0 ? void 0 : _CacheStore$AuthStore4.tokenData) || {}, _ref10$encryptionKey = _ref10.encryptionKey, encryptionKey = _ref10$encryptionKey === void 0 ? accessKey : _ref10$encryptionKey;
            socket = (0, _socket2.io)("ws://".concat(projectUrl.split('://')[1]), {
              auth: _objectSpread(_objectSpread({}, mtoken ? {
                mtoken: mtoken
              } : {}), {}, {
                accessKey: (0, _peripherals.encryptString)(accessKey, accessKey, '_'),
                ugly: uglify,
                __: uglify ? (0, _peripherals.encryptString)(JSON.stringify(authObj), accessKey, disableAuth ? accessKey : encryptionKey) : authObj
              }),
              transports: ['websocket', 'polling', 'flashsocket']
            });
            socket.emit('_startDisconnectWriteTask');
            socket.on('connect', function () {
              if (wasDisconnected) socket.emit('_startDisconnectWriteTask');
            });
            socket.on('disconnect', function () {
              wasDisconnected = true;
            });
          case 11:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return function init() {
      return _ref9.apply(this, arguments);
    };
  }();
  init();
  var tokenListener = (0, _accessor2.listenToken)( /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(t) {
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            if (!((t || null) !== lastToken)) {
              _context5.next = 7;
              break;
            }
            if (!socket) {
              _context5.next = 5;
              break;
            }
            _context5.next = 4;
            return (0, _peripherals.niceTry)(function () {
              return socket.timeout(10000).emitWithAck('_cancelDisconnectWriteTask');
            });
          case 4:
            socket.close();
          case 5:
            wasDisconnected = undefined;
            init();
          case 7:
            lastToken = t;
          case 8:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return function (_x3) {
      return _ref11.apply(this, arguments);
    };
  }(), projectUrl);
  return function () {
    if (hasCancelled) return;
    tokenListener();
    if (socket) _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _peripherals.niceTry)(function () {
              return socket.timeout(10000).emitWithAck('_cancelDisconnectWriteTask');
            });
          case 2:
            socket.close();
          case 3:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }))();
    hasCancelled = true;
  };
};
var countCollection = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(builder, config) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries, maxRetries, uglify, path, disableCache, _builder$command, command, find, _ref14, disableAuth, accessId, retries, readValue, g;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries = builder.maxRetries, maxRetries = _builder$maxRetries === void 0 ? 7 : _builder$maxRetries, uglify = builder.uglify, path = builder.path, disableCache = builder.disableCache, _builder$command = builder.command, command = _builder$command === void 0 ? {} : _builder$command, find = command.find, _ref14 = config || {}, disableAuth = _ref14.disableAuth, accessId = (0, _accessor.generateRecordID)(_objectSpread(_objectSpread({}, builder), {}, {
            countDoc: true
          }), config);
          _context8.next = 3;
          return (0, _utils.awaitStore)();
        case 3:
          (0, _validator.validateReadConfig)(config, ['excludeFields', 'returnOnly', 'extraction', 'episode', 'retrieval', 'disableMinimizer']);
          (0, _validator.validateFilter)(find || {});
          (0, _validator.validateCollectionPath)(path);
          retries = 0;
          readValue = function readValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(resolve, reject) {
                var finalize, _CacheStore$AuthStore5, _CacheStore$AuthStore6, _ref16, _ref16$encryptionKey, encryptionKey, r, f, b4Data, onlineListener;
                return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                  while (1) switch (_context7.prev = _context7.next) {
                    case 0:
                      ++retries;
                      finalize = function finalize(a, b) {
                        if (isNaN(a)) {
                          reject(b);
                        } else resolve(a);
                      };
                      _context7.prev = 2;
                      _context7.t0 = !disableAuth;
                      if (!_context7.t0) {
                        _context7.next = 8;
                        break;
                      }
                      _context7.next = 7;
                      return (0, _utils.getReachableServer)(projectUrl);
                    case 7:
                      _context7.t0 = _context7.sent;
                    case 8:
                      if (!_context7.t0) {
                        _context7.next = 11;
                        break;
                      }
                      _context7.next = 11;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 11:
                      _ref16 = ((_CacheStore$AuthStore5 = _variables.CacheStore.AuthStore) === null || _CacheStore$AuthStore5 === void 0 ? void 0 : (_CacheStore$AuthStore6 = _CacheStore$AuthStore5[projectUrl]) === null || _CacheStore$AuthStore6 === void 0 ? void 0 : _CacheStore$AuthStore6.tokenData) || {}, _ref16$encryptionKey = _ref16.encryptionKey, encryptionKey = _ref16$encryptionKey === void 0 ? accessKey : _ref16$encryptionKey;
                      _context7.next = 14;
                      return fetch(_EngineApi["default"]._documentCount(projectUrl, uglify), (0, _utils.buildFetchInterface)(_objectSpread(_objectSpread({
                        body: {
                          commands: {
                            path: path,
                            find: find
                          },
                          dbName: dbName,
                          dbUrl: dbUrl
                        },
                        accessKey: accessKey
                      }, disableAuth ? {} : {
                        authToken: _variables.Scoped.AuthJWTToken[projectUrl]
                      }), {}, {
                        projectUrl: projectUrl,
                        uglify: uglify
                      })));
                    case 14:
                      _context7.next = 16;
                      return _context7.sent.json();
                    case 16:
                      r = _context7.sent;
                      if (!r.simpleError) {
                        _context7.next = 19;
                        break;
                      }
                      throw r;
                    case 19:
                      f = uglify ? JSON.parse((0, _peripherals.decryptString)(r.__, accessKey, disableAuth ? accessKey : encryptionKey)) : r;
                      if (!disableCache) (0, _set["default"])(_variables.CacheStore.DatabaseCountResult, [projectUrl, dbUrl || _values.DEFAULT_DB_URL, dbName || _values.DEFAULT_DB_NAME, accessId], f.result);
                      finalize(f.result);
                      _context7.next = 28;
                      break;
                    case 24:
                      _context7.prev = 24;
                      _context7.t1 = _context7["catch"](2);
                      b4Data = (0, _set["default"])(_variables.CacheStore.DatabaseCountResult, [projectUrl, dbUrl || _values.DEFAULT_DB_URL, dbName || _values.DEFAULT_DB_NAME, accessId]);
                      if (_context7.t1 !== null && _context7.t1 !== void 0 && _context7.t1.simpleError) {
                        finalize(undefined, _context7.t1 === null || _context7.t1 === void 0 ? void 0 : _context7.t1.simpleError);
                      } else if (!disableCache && !isNaN(b4Data)) {
                        finalize(b4Data);
                      } else if (retries > maxRetries) {
                        finalize(undefined, {
                          error: 'retry_limit_exceeded',
                          message: "retry exceed limit(".concat(maxRetries, ")")
                        });
                      } else {
                        onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                          if (connected) {
                            onlineListener();
                            readValue().then(function (e) {
                              finalize(e);
                            }, function (e) {
                              finalize(undefined, e);
                            });
                          }
                        }, projectUrl);
                      }
                    case 28:
                    case "end":
                      return _context7.stop();
                  }
                }, _callee7, null, [[2, 24]]);
              }));
              return function (_x6, _x7) {
                return _ref15.apply(this, arguments);
              };
            }());
          };
          _context8.next = 10;
          return readValue();
        case 10:
          g = _context8.sent;
          return _context8.abrupt("return", g);
        case 12:
        case "end":
          return _context8.stop();
      }
    }, _callee8);
  }));
  return function countCollection(_x4, _x5) {
    return _ref13.apply(this, arguments);
  };
}();
var findObject = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(builder, config) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries2, maxRetries, path, disableCache, uglify, command, find, findOne, sort, direction, limit, random, _ref18, _ref18$retrieval, retrieval, _ref18$episode, episode, disableAuth, disableMinimizer, enableMinimizer, accessId, processAccessId, getRecordData, shouldCache, retries, hasFinalize, readValue, g;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries2 = builder.maxRetries, maxRetries = _builder$maxRetries2 === void 0 ? 7 : _builder$maxRetries2, path = builder.path, disableCache = builder.disableCache, uglify = builder.uglify, command = builder.command, find = command.find, findOne = command.findOne, sort = command.sort, direction = command.direction, limit = command.limit, random = command.random, _ref18 = config || {}, _ref18$retrieval = _ref18.retrieval, retrieval = _ref18$retrieval === void 0 ? _values.RETRIEVAL.DEFAULT : _ref18$retrieval, _ref18$episode = _ref18.episode, episode = _ref18$episode === void 0 ? 0 : _ref18$episode, disableAuth = _ref18.disableAuth, disableMinimizer = _ref18.disableMinimizer, enableMinimizer = !disableMinimizer, accessId = (0, _accessor.generateRecordID)(builder, config), processAccessId = "".concat(accessId).concat(projectUrl).concat(dbUrl).concat(dbName).concat(retrieval), getRecordData = function getRecordData() {
            return (0, _accessor.getRecord)(builder, accessId);
          }, shouldCache = (retrieval === _values.RETRIEVAL.DEFAULT ? !disableCache : true) && retrieval !== _values.RETRIEVAL.NO_CACHE_NO_AWAIT;
          _context10.next = 3;
          return (0, _utils.awaitStore)();
        case 3:
          if (!shouldCache) {
            _context10.next = 9;
            break;
          }
          (0, _validator.validateReadConfig)(config);
          (0, _validator.validateCollectionPath)(path);
          (0, _validator.validateFilter)(findOne || find);
          if (!(typeof limit === 'number' && (!(0, _peripherals.IS_WHOLE_NUMBER)(limit) || limit <= 0))) {
            _context10.next = 9;
            break;
          }
          throw "limit() has an invalid argument for \"".concat(path, "\", expected a positive whole number but got ").concat(limit);
        case 9:
          retries = 0;
          readValue = function readValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(resolve, reject) {
                var retryProcess, instantProcess, finalize, _CacheStore$AuthStore7, _CacheStore$AuthStore8, _ref20, _ref20$encryptionKey, encryptionKey, r, f, onlineListener;
                return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                  while (1) switch (_context9.prev = _context9.next) {
                    case 0:
                      retryProcess = ++retries, instantProcess = retryProcess === 1;
                      finalize = function finalize(a, b) {
                        var res = instantProcess && a ? a.liveResult || a.liveResult === null ? a.liveResult || undefined : a.episode[episode] : a;
                        if (a) {
                          resolve(instantProcess ? res : a);
                        } else reject(b);
                        if (hasFinalize || !instantProcess) return;
                        hasFinalize = true;
                        if (enableMinimizer) {
                          (_variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId] || []).forEach(function (e) {
                            e(a ? {
                              result: (0, _peripherals.cloneInstance)(res)
                            } : undefined, b);
                          });
                          if (_variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId]) delete _variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId];
                          if (_variables.Scoped.PendingDbReadCollective.pendingProcess[processAccessId]) delete _variables.Scoped.PendingDbReadCollective.pendingProcess[processAccessId];
                        }
                      };
                      _context9.prev = 2;
                      if (!instantProcess) {
                        _context9.next = 24;
                        break;
                      }
                      if (!enableMinimizer) {
                        _context9.next = 10;
                        break;
                      }
                      if (!_variables.Scoped.PendingDbReadCollective.pendingProcess[processAccessId]) {
                        _context9.next = 9;
                        break;
                      }
                      if (!_variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId]) _variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId] = [];
                      _variables.Scoped.PendingDbReadCollective.pendingResolution[processAccessId].push(function (a, b) {
                        if (a) resolve(a.result);else reject(b);
                      });
                      return _context9.abrupt("return");
                    case 9:
                      _variables.Scoped.PendingDbReadCollective.pendingProcess[processAccessId] = true;
                    case 10:
                      _context9.t0 = retrieval.startsWith('sticky');
                      if (!_context9.t0) {
                        _context9.next = 15;
                        break;
                      }
                      _context9.next = 14;
                      return getRecordData();
                    case 14:
                      _context9.t0 = _context9.sent;
                    case 15:
                      if (!_context9.t0) {
                        _context9.next = 24;
                        break;
                      }
                      _context9.t1 = finalize;
                      _context9.next = 19;
                      return getRecordData();
                    case 19:
                      _context9.t2 = _context9.sent;
                      _context9.t3 = {
                        episode: _context9.t2
                      };
                      (0, _context9.t1)(_context9.t3);
                      if (!(retrieval !== _values.RETRIEVAL.STICKY_RELOAD)) {
                        _context9.next = 24;
                        break;
                      }
                      return _context9.abrupt("return");
                    case 24:
                      _context9.t4 = !disableAuth;
                      if (!_context9.t4) {
                        _context9.next = 29;
                        break;
                      }
                      _context9.next = 28;
                      return (0, _utils.getReachableServer)(projectUrl);
                    case 28:
                      _context9.t4 = _context9.sent;
                    case 29:
                      if (!_context9.t4) {
                        _context9.next = 32;
                        break;
                      }
                      _context9.next = 32;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 32:
                      _ref20 = ((_CacheStore$AuthStore7 = _variables.CacheStore.AuthStore) === null || _CacheStore$AuthStore7 === void 0 ? void 0 : (_CacheStore$AuthStore8 = _CacheStore$AuthStore7[projectUrl]) === null || _CacheStore$AuthStore8 === void 0 ? void 0 : _CacheStore$AuthStore8.tokenData) || {}, _ref20$encryptionKey = _ref20.encryptionKey, encryptionKey = _ref20$encryptionKey === void 0 ? accessKey : _ref20$encryptionKey;
                      _context9.next = 35;
                      return fetch(_EngineApi["default"][findOne ? '_readDocument' : '_queryCollection'](projectUrl, uglify), (0, _utils.buildFetchInterface)({
                        body: {
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
                        },
                        accessKey: accessKey,
                        authToken: disableAuth ? undefined : _variables.Scoped.AuthJWTToken[projectUrl],
                        projectUrl: projectUrl,
                        uglify: uglify
                      }));
                    case 35:
                      _context9.next = 37;
                      return _context9.sent.json();
                    case 37:
                      r = _context9.sent;
                      if (!r.simpleError) {
                        _context9.next = 40;
                        break;
                      }
                      throw r;
                    case 40:
                      f = uglify ? JSON.parse((0, _peripherals.decryptString)(r.__, accessKey, disableAuth ? accessKey : encryptionKey)) : r;
                      if (shouldCache) (0, _accessor.insertRecord)(builder, accessId, _objectSpread(_objectSpread({}, command), {}, {
                        config: config
                      }), f.result);
                      finalize({
                        liveResult: f.result || null
                      });
                      _context9.next = 81;
                      break;
                    case 45:
                      _context9.prev = 45;
                      _context9.t5 = _context9["catch"](2);
                      if (!(_context9.t5 !== null && _context9.t5 !== void 0 && _context9.t5.simpleError)) {
                        _context9.next = 51;
                        break;
                      }
                      finalize(undefined, _context9.t5 === null || _context9.t5 === void 0 ? void 0 : _context9.t5.simpleError);
                      _context9.next = 81;
                      break;
                    case 51:
                      _context9.t8 = retrieval === _values.RETRIEVAL.CACHE_NO_AWAIT;
                      if (!_context9.t8) {
                        _context9.next = 56;
                        break;
                      }
                      _context9.next = 55;
                      return getRecordData();
                    case 55:
                      _context9.t8 = !_context9.sent;
                    case 56:
                      _context9.t7 = _context9.t8;
                      if (_context9.t7) {
                        _context9.next = 59;
                        break;
                      }
                      _context9.t7 = retrieval === _values.RETRIEVAL.STICKY_NO_AWAIT;
                    case 59:
                      _context9.t6 = _context9.t7;
                      if (_context9.t6) {
                        _context9.next = 62;
                        break;
                      }
                      _context9.t6 = retrieval === _values.RETRIEVAL.NO_CACHE_NO_AWAIT;
                    case 62:
                      if (!_context9.t6) {
                        _context9.next = 66;
                        break;
                      }
                      finalize(undefined, (0, _peripherals.simplifyCaughtError)(_context9.t5).simpleError);
                      _context9.next = 81;
                      break;
                    case 66:
                      _context9.t9 = shouldCache && (retrieval === _values.RETRIEVAL.DEFAULT || retrieval === _values.RETRIEVAL.CACHE_NO_AWAIT);
                      if (!_context9.t9) {
                        _context9.next = 71;
                        break;
                      }
                      _context9.next = 70;
                      return getRecordData();
                    case 70:
                      _context9.t9 = _context9.sent;
                    case 71:
                      if (!_context9.t9) {
                        _context9.next = 80;
                        break;
                      }
                      _context9.t10 = finalize;
                      _context9.next = 75;
                      return getRecordData();
                    case 75:
                      _context9.t11 = _context9.sent;
                      _context9.t12 = {
                        episode: _context9.t11
                      };
                      (0, _context9.t10)(_context9.t12);
                      _context9.next = 81;
                      break;
                    case 80:
                      if (retries > maxRetries) {
                        finalize(undefined, {
                          error: 'retry_limit_exceeded',
                          message: "retry exceed limit(".concat(maxRetries, ")")
                        });
                      } else {
                        onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                          if (connected) {
                            onlineListener();
                            readValue().then(function (e) {
                              finalize(e);
                            }, function (e) {
                              finalize(undefined, e);
                            });
                          }
                        }, projectUrl);
                      }
                    case 81:
                    case "end":
                      return _context9.stop();
                  }
                }, _callee9, null, [[2, 45]]);
              }));
              return function (_x10, _x11) {
                return _ref19.apply(this, arguments);
              };
            }());
          };
          _context10.next = 13;
          return readValue();
        case 13:
          g = _context10.sent;
          return _context10.abrupt("return", g);
        case 15:
        case "end":
          return _context10.stop();
      }
    }, _callee10);
  }));
  return function findObject(_x8, _x9) {
    return _ref17.apply(this, arguments);
  };
}();
var commitData = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(builder, value, type, config) {
    var projectUrl, dbUrl, dbName, accessKey, _builder$maxRetries3, maxRetries, path, find, disableCache, uglify, _ref22, disableAuth, _ref22$delivery, delivery, writeId, shouldCache, retries, hasFinalize, sendValue;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          projectUrl = builder.projectUrl, dbUrl = builder.dbUrl, dbName = builder.dbName, accessKey = builder.accessKey, _builder$maxRetries3 = builder.maxRetries, maxRetries = _builder$maxRetries3 === void 0 ? 7 : _builder$maxRetries3, path = builder.path, find = builder.find, disableCache = builder.disableCache, uglify = builder.uglify, _ref22 = config || {}, disableAuth = _ref22.disableAuth, _ref22$delivery = _ref22.delivery, delivery = _ref22$delivery === void 0 ? _values.DELIVERY.DEFAULT : _ref22$delivery, writeId = "".concat(Date.now() + ++_variables.Scoped.PendingIte), shouldCache = (delivery === _values.DELIVERY.DEFAULT ? !disableCache : true) && delivery !== _values.DELIVERY.NO_CACHE && delivery !== _values.DELIVERY.NO_AWAIT_NO_CACHE && delivery !== _values.DELIVERY.AWAIT_NO_CACHE;
          _context12.next = 3;
          return (0, _utils.awaitStore)();
        case 3:
          if (!shouldCache) {
            _context12.next = 8;
            break;
          }
          (0, _validator.validateCollectionPath)(path);
          (0, _validator.validateWriteValue)(value, builder.find, type);
          _context12.next = 8;
          return (0, _accessor.addPendingWrites)(builder, writeId, {
            value: value,
            type: type,
            find: find
          });
        case 8:
          retries = 0;
          sendValue = function sendValue() {
            return new Promise( /*#__PURE__*/function () {
              var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(resolve, reject) {
                var retryProcess, instantProcess, finalize, _CacheStore$AuthStore9, _CacheStore$AuthStore10, _ref25, _ref25$encryptionKey, encryptionKey, r, f, _e$simpleError, onlineListener;
                return _regeneratorRuntime().wrap(function _callee11$(_context11) {
                  while (1) switch (_context11.prev = _context11.next) {
                    case 0:
                      retryProcess = ++retries, instantProcess = retryProcess === 1;
                      finalize = function finalize(a, b, c) {
                        var _ref24 = c || {},
                          removeCache = _ref24.removeCache,
                          revertCache = _ref24.revertCache;
                        if (!instantProcess) {
                          if (a) a = {
                            a: a,
                            c: c
                          };
                          if (b) b = {
                            b: b,
                            c: c
                          };
                        }
                        if (a) {
                          resolve(a);
                        } else reject(b);
                        if (hasFinalize || !instantProcess) return;
                        hasFinalize = true;
                        if (removeCache && shouldCache) (0, _accessor.removePendingWrite)(builder, writeId, revertCache);
                      };
                      _context11.prev = 2;
                      _context11.t0 = !disableAuth;
                      if (!_context11.t0) {
                        _context11.next = 8;
                        break;
                      }
                      _context11.next = 7;
                      return (0, _utils.getReachableServer)(projectUrl);
                    case 7:
                      _context11.t0 = _context11.sent;
                    case 8:
                      if (!_context11.t0) {
                        _context11.next = 11;
                        break;
                      }
                      _context11.next = 11;
                      return (0, _accessor2.awaitRefreshToken)(projectUrl);
                    case 11:
                      _ref25 = ((_CacheStore$AuthStore9 = _variables.CacheStore.AuthStore) === null || _CacheStore$AuthStore9 === void 0 ? void 0 : (_CacheStore$AuthStore10 = _CacheStore$AuthStore9[projectUrl]) === null || _CacheStore$AuthStore10 === void 0 ? void 0 : _CacheStore$AuthStore10.tokenData) || {}, _ref25$encryptionKey = _ref25.encryptionKey, encryptionKey = _ref25$encryptionKey === void 0 ? accessKey : _ref25$encryptionKey;
                      _context11.next = 14;
                      return fetch(_EngineApi["default"]['_writeDocument'](projectUrl, uglify), (0, _utils.buildFetchInterface)({
                        body: {
                          commands: {
                            path: path,
                            scope: type,
                            value: value,
                            find: find
                          },
                          dbName: dbName,
                          dbUrl: dbUrl
                        },
                        accessKey: accessKey,
                        projectUrl: projectUrl,
                        authToken: disableAuth ? undefined : _variables.Scoped.AuthJWTToken[projectUrl],
                        uglify: uglify
                      }));
                    case 14:
                      _context11.next = 16;
                      return _context11.sent.json();
                    case 16:
                      r = _context11.sent;
                      if (!r.simpleError) {
                        _context11.next = 19;
                        break;
                      }
                      throw r;
                    case 19:
                      f = uglify ? JSON.parse((0, _peripherals.decryptString)(r.__, accessKey, disableAuth ? accessKey : encryptionKey)) : r;
                      finalize({
                        status: 'sent',
                        committed: f.committed
                      }, undefined, {
                        removeCache: true
                      });
                      _context11.next = 46;
                      break;
                    case 23:
                      _context11.prev = 23;
                      _context11.t1 = _context11["catch"](2);
                      if (!(_context11.t1 !== null && _context11.t1 !== void 0 && _context11.t1.simpleError)) {
                        _context11.next = 30;
                        break;
                      }
                      console.error("".concat(type, " error (").concat(path, "), ").concat((_e$simpleError = _context11.t1.simpleError) === null || _e$simpleError === void 0 ? void 0 : _e$simpleError.message));
                      finalize(undefined, _context11.t1 === null || _context11.t1 === void 0 ? void 0 : _context11.t1.simpleError, {
                        removeCache: true,
                        revertCache: true
                      });
                      _context11.next = 46;
                      break;
                    case 30:
                      if (!(delivery === _values.DELIVERY.NO_AWAIT || delivery === _values.DELIVERY.CACHE_NO_AWAIT || delivery === _values.DELIVERY.NO_AWAIT_NO_CACHE || delivery === _values.DELIVERY.NO_CACHE)) {
                        _context11.next = 45;
                        break;
                      }
                      _context11.t2 = finalize;
                      _context11.t3 = undefined;
                      _context11.t4 = (0, _peripherals.simplifyCaughtError)(_context11.t1).simpleError;
                      _context11.next = 36;
                      return (0, _utils.getReachableServer)(projectUrl);
                    case 36:
                      if (!_context11.sent) {
                        _context11.next = 40;
                        break;
                      }
                      _context11.t5 = {
                        removeCache: true
                      };
                      _context11.next = 41;
                      break;
                    case 40:
                      _context11.t5 = null;
                    case 41:
                      _context11.t6 = _context11.t5;
                      (0, _context11.t2)(_context11.t3, _context11.t4, _context11.t6);
                      _context11.next = 46;
                      break;
                    case 45:
                      if (retries > maxRetries) {
                        finalize(undefined, {
                          error: 'retry_limit_exceeded',
                          message: "retry exceed limit(".concat(maxRetries, ")")
                        });
                      } else {
                        if (delivery === _values.DELIVERY.AWAIT_NO_CACHE) {
                          onlineListener = (0, _peripherals.listenReachableServer)(function (connected) {
                            if (connected) {
                              onlineListener();
                              sendValue().then(function (e) {
                                finalize(e.a, undefined, e.c);
                              }, function (e) {
                                finalize(undefined, e.b, e.c);
                              });
                            }
                          }, projectUrl);
                        } else if (shouldCache) finalize({
                          status: 'pending'
                        });else finalize(undefined, (0, _peripherals.simplifyCaughtError)(_context11.t1).simpleError);
                      }
                    case 46:
                    case "end":
                      return _context11.stop();
                  }
                }, _callee11, null, [[2, 23]]);
              }));
              return function (_x16, _x17) {
                return _ref23.apply(this, arguments);
              };
            }());
          };
          _context12.next = 12;
          return sendValue();
        case 12:
          return _context12.abrupt("return", _context12.sent);
        case 13:
        case "end":
          return _context12.stop();
      }
    }, _callee12);
  }));
  return function commitData(_x12, _x13, _x14, _x15) {
    return _ref21.apply(this, arguments);
  };
}();