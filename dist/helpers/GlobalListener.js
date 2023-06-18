"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var GlobalListener = /*#__PURE__*/function () {
  function GlobalListener(initialValue) {
    _classCallCheck(this, GlobalListener);
    this.listener = {};
    this.listenerMap = {};
    this.lastTriggerValue = initialValue || null;
    this.lastTriggerValueMap = {};
    this.lastListenerKey = 1;
  }
  _createClass(GlobalListener, [{
    key: "startListener",
    value: function startListener(callback) {
      var _this = this;
      var useLastTriggerValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var key = "".concat(++this.lastListenerKey);
      var hasCancelled;
      if (callback && typeof callback !== 'function' || typeof useLastTriggerValue !== 'boolean') throw 'Invalid param was parsed to startListener';
      this.listener[key] = callback;
      if (useLastTriggerValue) setTimeout(function () {
        if (!hasCancelled) callback === null || callback === void 0 ? void 0 : callback.apply(void 0, _toConsumableArray(_this.lastTriggerValue || []));
      }, 1);
      return function () {
        if (!hasCancelled) delete _this.listener[key];
        hasCancelled = true;
      };
    }
  }, {
    key: "startKeyListener",
    value: function startKeyListener(key, callback) {
      var _this2 = this;
      var useLastTriggerValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (callback && typeof callback !== 'function' || typeof useLastTriggerValue !== 'boolean') throw 'Invalid param was parsed to startListener';
      if (!this.listenerMap[key]) this.listenerMap[key] = {
        ite: 0,
        triggers: {}
      };
      var node = "".concat(++this.listenerMap[key].ite);
      var hasCancelled;
      this.listenerMap[key].triggers[node] = callback;
      if (useLastTriggerValue) setTimeout(function () {
        if (!hasCancelled) callback === null || callback === void 0 ? void 0 : callback.apply(void 0, _toConsumableArray(_this2.lastTriggerValueMap[key] || []));
      }, 1);
      return function () {
        if (!hasCancelled) {
          delete _this2.listenerMap[key].triggers[node];
          if (!Object.keys(_this2.listenerMap[key].triggers).length) delete _this2.listenerMap[key];
        }
        hasCancelled = true;
      };
    }
  }, {
    key: "triggerListener",
    value: function triggerListener() {
      var _this3 = this;
      var param = _toConsumableArray(arguments || []);
      Object.keys(this.listener || {}).forEach(function (key) {
        var _this3$listener$key, _this3$listener;
        (_this3$listener$key = (_this3$listener = _this3.listener)[key]) === null || _this3$listener$key === void 0 ? void 0 : _this3$listener$key.call.apply(_this3$listener$key, [_this3$listener].concat(_toConsumableArray(param)));
      });
      this.lastTriggerValue = param;
    }
  }, {
    key: "triggerKeyListener",
    value: function triggerKeyListener() {
      var _this$listenerMap$key,
        _this4 = this;
      var param = _toConsumableArray(arguments || []),
        key = param[0],
        value = param.filter(function (_, i) {
          return i;
        });
      if (!key) throw 'expected a key in triggerKeyListener() first argument';
      Object.keys(((_this$listenerMap$key = this.listenerMap[key]) === null || _this$listenerMap$key === void 0 ? void 0 : _this$listenerMap$key.triggers) || {}).forEach(function (e) {
        var _this4$listenerMap$ke, _this4$listenerMap$ke2, _this4$listenerMap$ke3;
        (_this4$listenerMap$ke = _this4.listenerMap[key]) === null || _this4$listenerMap$ke === void 0 ? void 0 : (_this4$listenerMap$ke2 = (_this4$listenerMap$ke3 = _this4$listenerMap$ke.triggers)[e]) === null || _this4$listenerMap$ke2 === void 0 ? void 0 : _this4$listenerMap$ke2.call.apply(_this4$listenerMap$ke2, [_this4$listenerMap$ke3].concat(_toConsumableArray(value)));
      });
      this.lastTriggerValueMap[key] = value;
    }
  }]);
  return GlobalListener;
}();
exports["default"] = GlobalListener;