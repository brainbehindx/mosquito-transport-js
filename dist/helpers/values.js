"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WRITE_OPS_LIST = exports.WRITE_OPS = exports.RETRIEVAL = exports.READ_OPS_LIST = exports.READ_OPS = exports.DELIVERY = exports.DEFAULT_ENCRYPT_IV = exports.DEFAULT_DB_URL = exports.DEFAULT_DB_NAME = exports.DEFAULT_CACHE_PASSWORD = exports.CACHE_STORAGE_PATH = exports.CACHE_PROTOCOL = void 0;
var CACHE_STORAGE_PATH = btoa('mosquitoDbFreezer:__'),
  DEFAULT_CACHE_PASSWORD = btoa('mosquitoCachePassword:__'),
  DEFAULT_DB_NAME = 'DEFAULT_DB',
  DEFAULT_DB_URL = 'mongodb://127.0.0.1:27017',
  DEFAULT_ENCRYPT_IV = '****';
exports.DEFAULT_ENCRYPT_IV = DEFAULT_ENCRYPT_IV;
exports.DEFAULT_DB_URL = DEFAULT_DB_URL;
exports.DEFAULT_DB_NAME = DEFAULT_DB_NAME;
exports.DEFAULT_CACHE_PASSWORD = DEFAULT_CACHE_PASSWORD;
exports.CACHE_STORAGE_PATH = CACHE_STORAGE_PATH;
var CACHE_PROTOCOL = {
  LOCAL_STORAGE: 'local-storage'
};
exports.CACHE_PROTOCOL = CACHE_PROTOCOL;
var RETRIEVAL = {
  STICKY: 'sticky',
  STICKY_NO_AWAIT: 'sticky-no-await',
  STICKY_RELOAD: 'sticky-reload',
  DEFAULT: 'default',
  CACHE_NO_AWAIT: 'cache-no-await',
  NO_CACHE_NO_AWAIT: 'no-cache-no-await'
};
exports.RETRIEVAL = RETRIEVAL;
var DELIVERY = {
  DEFAULT: 'default',
  NO_CACHE: 'no-cache',
  NO_AWAIT: 'no-await',
  NO_AWAIT_NO_CACHE: 'no-await-no-cache',
  AWAIT_NO_CACHE: 'await-no-cache',
  CACHE_NO_AWAIT: 'cache-no-await'
};
exports.DELIVERY = DELIVERY;
var WRITE_OPS = {
    $SET: '$set',
    $PUSH: '$push',
    $PULL: '$pull',
    $UNSET: '$unset',
    $INC: '$inc',
    $MAX: '$max',
    $MIN: '$min',
    $MUL: '$mul',
    $RENAME: '$rename'
    // $SET_ON_INSERT: '$setOnInsert'
  },
  WRITE_OPS_LIST = Object.values(WRITE_OPS);
exports.WRITE_OPS_LIST = WRITE_OPS_LIST;
exports.WRITE_OPS = WRITE_OPS;
var READ_OPS = {
    $IN: '$in',
    $ALL: '$all',
    $NIN: '$nin',
    $GT: '$gt',
    $GTE: '$gte',
    $LT: '$lt',
    $LTE: '$lte',
    $TEXT: '$text',
    // $EQ: '$eq',
    // $REGEX: '$regex',
    // $EXISTS: '$exists',
    $NEAR: '$near',
    $TYPE: '$type',
    $SIZE: '$size'
    // $NE: '$ne'
  },
  READ_OPS_LIST = Object.values(READ_OPS);
exports.READ_OPS_LIST = READ_OPS_LIST;
exports.READ_OPS = READ_OPS;