"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTransport = getTransport;

var _xhr = require("./xhr");

var _fetch = require("./fetch");

function getTransport() {
  if ( // supports fetch and ReadableStream on fetch response
  typeof Response !== 'undefined' && Response.prototype.hasOwnProperty('body') && typeof Headers === 'function') {
    return _fetch.fetchImpl;
  }

  return _xhr.xhrImpl;
}