"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PatchResolver", {
  enumerable: true,
  get: function get() {
    return _PatchResolver.PatchResolver;
  }
});
exports.default = void 0;

var _getTransport = require("./getTransport");

var _PatchResolver = require("./PatchResolver");

var _default = (0, _getTransport.getTransport)();

exports.default = _default;