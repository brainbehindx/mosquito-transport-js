"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIMESTAMP = exports.IS_TIMESTAMP = exports.INCREMENT = exports.FIELD_DELETION = void 0;
var TIMESTAMP = {
  $timestamp: "now"
};
exports.TIMESTAMP = TIMESTAMP;
var IS_TIMESTAMP = function IS_TIMESTAMP(t) {
  return t && (typeof t.$timestamp === 'number' || t.$timestamp === 'now') && Object.keys(t).length === 1;
};
exports.IS_TIMESTAMP = IS_TIMESTAMP;
var INCREMENT = function INCREMENT(t) {
  return {
    $increment: t || 1
  };
};
exports.INCREMENT = INCREMENT;
var FIELD_DELETION = {
  $deletion: true
};
exports.FIELD_DELETION = FIELD_DELETION;