"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PatchResolver = PatchResolver;

var _parseMultipartHttp2 = require("./parseMultipartHttp");

function PatchResolver(_ref) {
  var onResponse = _ref.onResponse,
      boundary = _ref.boundary;
  this.boundary = boundary || '-';
  this.onResponse = onResponse;
  this.chunkBuffer = '';
  this.isPreamble = true;
}

PatchResolver.prototype.handleChunk = function (data) {
  this.chunkBuffer += data;

  var _parseMultipartHttp = (0, _parseMultipartHttp2.parseMultipartHttp)(this.chunkBuffer, this.boundary, [], this.isPreamble),
      newBuffer = _parseMultipartHttp.newBuffer,
      parts = _parseMultipartHttp.parts,
      isPreamble = _parseMultipartHttp.isPreamble;

  this.isPreamble = isPreamble;
  this.chunkBuffer = newBuffer;

  if (parts.length) {
    this.onResponse(parts);
  }
};