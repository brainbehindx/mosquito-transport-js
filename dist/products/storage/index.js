"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MosquitoDbStorage = void 0;
var _EngineApi = _interopRequireDefault(require("../../helpers/EngineApi"));
var _variables = require("../../helpers/variables");
var _utils = require("../../helpers/utils");
var _accessor = require("../auth/accessor");
var _buffer = require("buffer");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MosquitoDbStorage = /*#__PURE__*/_createClass(function MosquitoDbStorage(config) {
  var _this = this;
  _classCallCheck(this, MosquitoDbStorage);
  _defineProperty(this, "uploadFile", function (file, destination, onComplete, onProgress, reqOptions) {
    var hasCancelled = false,
      hasFinished = false,
      xhr;
    _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var _destination;
      var base64, buffer, destErr, _this$builder, projectUrl, accessKey, _ref2, awaitServer;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!_buffer.Buffer.isBuffer(file)) {
              _context.next = 4;
              break;
            }
            buffer = file;
            _context.next = 23;
            break;
          case 4:
            if (!(file instanceof Blob)) {
              _context.next = 17;
              break;
            }
            _context.prev = 5;
            _context.next = 8;
            return file.arrayBuffer();
          case 8:
            buffer = _context.sent;
            _context.next = 15;
            break;
          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](5);
            onComplete === null || onComplete === void 0 ? void 0 : onComplete({
              error: 'invalid_blob',
              message: "uploadFile() first argument has an invalid blob ".concat(_context.t0)
            });
            return _context.abrupt("return");
          case 15:
            _context.next = 23;
            break;
          case 17:
            if (!(typeof file === 'string' && file !== null && file !== void 0 && file.trim())) {
              _context.next = 21;
              break;
            }
            base64 = file.replace(/^data:\w+\/\w+;base64,/, '');
            _context.next = 23;
            break;
          case 21:
            onComplete === null || onComplete === void 0 ? void 0 : onComplete({
              error: 'file_path_invalid',
              message: "uploadFile() first argument must either be a blob, buffer or base64 string"
            });
            return _context.abrupt("return");
          case 23:
            if (!hasCancelled) {
              _context.next = 25;
              break;
            }
            return _context.abrupt("return");
          case 25:
            destination = (_destination = destination) === null || _destination === void 0 ? void 0 : _destination.trim();
            destErr = validateDestination(destination);
            if (!destErr) {
              _context.next = 30;
              break;
            }
            onComplete === null || onComplete === void 0 ? void 0 : onComplete({
              error: 'destination_invalid',
              message: destErr
            });
            return _context.abrupt("return");
          case 30:
            _this$builder = _this.builder, projectUrl = _this$builder.projectUrl, accessKey = _this$builder.accessKey;
            xhr = new XMLHttpRequest();
            _ref2 = reqOptions || {}, awaitServer = _ref2.awaitServer;
            if (!awaitServer) {
              _context.next = 36;
              break;
            }
            _context.next = 36;
            return (0, _utils.awaitReachableServer)(projectUrl);
          case 36:
            _context.next = 38;
            return (0, _accessor.awaitRefreshToken)(projectUrl);
          case 38:
            xhr.open('POST', _EngineApi["default"]._uploadFile(projectUrl), true);
            xhr.upload.addEventListener('progress', function (e) {
              onProgress === null || onProgress === void 0 ? void 0 : onProgress({
                sentBtyes: e.loaded,
                totalBytes: e.total
              });
            });
            xhr.addEventListener('load', function () {
              if (hasFinished || hasCancelled) return;
              hasFinished = true;
              try {
                var result = JSON.parse(xhr.responseText);
                if (result.status === 'success' && result.downloadUrl) {
                  onComplete === null || onComplete === void 0 ? void 0 : onComplete(undefined, result.downloadUrl);
                } else throw result.simpleError || {
                  error: 'unexpected_error',
                  message: "An unexpected error occurred"
                };
              } catch (e) {
                onComplete === null || onComplete === void 0 ? void 0 : onComplete(e);
              }
            });
            xhr.addEventListener('error', function () {
              if (hasFinished || hasCancelled) return;
              hasFinished = true;
              onComplete === null || onComplete === void 0 ? void 0 : onComplete({
                error: 'unexpected_error',
                message: 'An unexpected error occurred'
              });
            });
            xhr.addEventListener('abort', function () {
              if (hasFinished || hasCancelled) return;
              hasFinished = true;
              onComplete === null || onComplete === void 0 ? void 0 : onComplete({
                error: 'upload_aborted',
                message: 'The upload process was aborted'
              });
            });
            xhr.setRequestHeader('Authorization', "Bearer ".concat(btoa(accessKey)));
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', buffer ? 'buffer/upload' : 'text/plain');
            if (_variables.Scoped.AuthJWTToken[projectUrl]) xhr.setRequestHeader('Mosquitodb-Token', _variables.Scoped.AuthJWTToken[projectUrl]);
            xhr.setRequestHeader('Mosquitodb-Destination', destination);
            if (base64) xhr.setRequestHeader('Mosquitodb-Encoding', 'base64');
            xhr.send(base64 || buffer);
          case 50:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[5, 11]]);
    }))();
    return function () {
      if (hasCancelled) return;
      hasCancelled = true;
      if (xhr) xhr.abort();
      setTimeout(function () {
        onComplete === null || onComplete === void 0 ? void 0 : onComplete({
          error: 'upload_aborted',
          message: 'The upload process was aborted'
        });
      }, 1);
    };
  });
  _defineProperty(this, "deleteFile", function (path) {
    return deleteContent(_this.builder, path);
  });
  _defineProperty(this, "deleteFolder", function (path) {
    return deleteContent(_this.builder, path, true);
  });
  this.builder = _objectSpread({}, config);
});
exports.MosquitoDbStorage = MosquitoDbStorage;
var deleteContent = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(builder, path, isFolder) {
    var projectUrl, accessKey, r;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          projectUrl = builder.projectUrl, accessKey = builder.accessKey;
          _context2.prev = 1;
          _context2.next = 4;
          return fetch(_EngineApi["default"][isFolder ? '_deleteFolder' : '_deleteFile'](projectUrl), (0, _utils.buildFetchInterface)({
            path: path
          }, accessKey, _variables.Scoped.AuthJWTToken[projectUrl], 'DELETE'));
        case 4:
          _context2.next = 6;
          return _context2.sent.json();
        case 6:
          r = _context2.sent;
          if (!r.simpleError) {
            _context2.next = 9;
            break;
          }
          throw r;
        case 9:
          if (!(r.status !== 'success')) {
            _context2.next = 11;
            break;
          }
          throw 'operation not successful';
        case 11:
          _context2.next = 18;
          break;
        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](1);
          if (!(_context2.t0 !== null && _context2.t0 !== void 0 && _context2.t0.simpleError)) {
            _context2.next = 17;
            break;
          }
          throw _context2.t0.simpleError;
        case 17:
          throw (0, _utils.simplifyError)('unexpected_error', "".concat(_context2.t0)).simpleError;
        case 18:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[1, 13]]);
  }));
  return function deleteContent(_x, _x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();
var validateDestination = function validateDestination() {
  var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  t = t.trim();
  if (!t || typeof t !== 'string') return "destination is required";
  if (t.startsWith('/') || t.endsWith('/')) return 'destination must neither start with "/" nor end with "/"';
  var l = '',
    r;
  t.split('').forEach(function (e) {
    if (e === '/' && l === '/') r = 'invalid destination path, "/" cannot be side by side';
    l = e;
  });
  return r;
};