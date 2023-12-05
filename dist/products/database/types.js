"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIMESTAMP = exports.IS_TIMESTAMP = exports.GEO_JSON = exports.FIND_GEO_JSON = exports.DOCUMENT_EXTRACTION = void 0;
var TIMESTAMP = {
  $timestamp: "now"
};
exports.TIMESTAMP = TIMESTAMP;
var IS_TIMESTAMP = function IS_TIMESTAMP(t) {
  return t && (typeof t.$timestamp === 'number' || t.$timestamp === 'now') && Object.keys(t).length === 1;
};
exports.IS_TIMESTAMP = IS_TIMESTAMP;
var DOCUMENT_EXTRACTION = function DOCUMENT_EXTRACTION(path) {
  return {
    $dynamicValue: path
  };
};
exports.DOCUMENT_EXTRACTION = DOCUMENT_EXTRACTION;
var GEO_JSON = function GEO_JSON(lat, lng) {
  return {
    type: "Point",
    coordinates: [lng, lat]
  };
};
exports.GEO_JSON = GEO_JSON;
var FIND_GEO_JSON = function FIND_GEO_JSON(location, offSetMeters, centerMeters) {
  return {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: location.reverse()
      },
      $minDistance: centerMeters || 0,
      $maxDistance: offSetMeters
    }
  };
};
exports.FIND_GEO_JSON = FIND_GEO_JSON;