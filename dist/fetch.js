"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchImpl = fetchImpl;

var _PatchResolver = require("./PatchResolver");

var _getBoundary = require("./getBoundary");

var _excluded = ["onNext", "onComplete", "onError"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function fetchImpl(url, _ref) {
  var onNext = _ref.onNext,
      onComplete = _ref.onComplete,
      onError = _ref.onError,
      fetchOptions = _objectWithoutProperties(_ref, _excluded);

  return fetch(url, fetchOptions).then(function (response) {
    var contentType = !!response.headers && response.headers.get('Content-Type') || ''; // @defer uses multipart responses to stream patches over HTTP

    if (response.status < 300 && contentType.indexOf('multipart/mixed') >= 0) {
      var boundary = (0, _getBoundary.getBoundary)(contentType); // For the majority of browsers with support for ReadableStream and TextDecoder

      var reader = response.body.getReader();
      var textDecoder = new TextDecoder();
      var patchResolver = new _PatchResolver.PatchResolver({
        onResponse: function onResponse(r) {
          return onNext(r, {
            responseHeaders: response.headers,
            status: response.status
          });
        },
        boundary: boundary
      });
      return reader.read().then(function sendNext(_ref2) {
        var value = _ref2.value,
            done = _ref2.done;

        if (!done) {
          var plaintext;

          try {
            plaintext = textDecoder.decode(value); // Read the header to get the Content-Length

            patchResolver.handleChunk(plaintext);
          } catch (err) {
            var parseError = err;
            parseError.response = response;
            parseError.statusCode = response.status;
            parseError.bodyText = plaintext;
            onError(parseError);
          }

          reader.read().then(sendNext);
        } else {
          onComplete();
        }
      });
    } else {
      return response.json().then(function (json) {
        onNext([json], {
          responseHeaders: response.headers,
          status: response.status
        });
        onComplete();
      }, function (err) {
        var parseError = err;
        parseError.response = response;
        parseError.statusCode = response.status;
        onError(parseError);
      });
    }
  }).catch(onError);
}