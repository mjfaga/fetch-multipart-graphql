"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.xhrImpl = xhrImpl;

var _getBoundary = require("./getBoundary");

var _PatchResolver = require("./PatchResolver");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function supportsXhrResponseType(type) {
  try {
    var tmpXhr = new XMLHttpRequest();
    tmpXhr.responseType = type;
    return tmpXhr.responseType === type;
  } catch (e) {
    /* IE throws on setting responseType to an unsupported value */
  }

  return false;
}

function xhrImpl(url, _ref) {
  var method = _ref.method,
      headers = _ref.headers,
      credentials = _ref.credentials,
      body = _ref.body,
      onNext = _ref.onNext,
      onError = _ref.onError,
      onComplete = _ref.onComplete;
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = credentials === 'include'; // follow behavior of fetch credentials param https://github.com/github/fetch#sending-cookies

  var index = 0;
  var isDeferred = false;
  var boundary;
  var patchResolver;

  function onReadyStateChange() {
    // The request failed, do nothing and let the error event fire
    if (this.readyState === this.DONE && this.status === 0) {
      return;
    }

    if (this.readyState === this.HEADERS_RECEIVED) {
      var contentType = xhr.getResponseHeader('Content-Type');

      if (contentType.indexOf('multipart/mixed') >= 0) {
        isDeferred = true;
        boundary = (0, _getBoundary.getBoundary)(contentType);
        patchResolver = new _PatchResolver.PatchResolver({
          onResponse: function onResponse(r) {
            return onNext(r, {});
          },
          boundary: boundary
        });
      }
    } else if ((this.readyState === this.LOADING || this.readyState === this.DONE) && isDeferred) {
      var chunk = xhr.response.substr(index);
      patchResolver.handleChunk(chunk);
      index = xhr.responseText.length;
    } else if (this.readyState === this.DONE && !isDeferred) {
      onNext([JSON.parse(xhr.response)], {});
      onComplete();
    }
  }

  function onLoadEvent() {
    onComplete();
  }

  function onErrorEvent(err) {
    onError(err);
  }

  xhr.open(method, url);

  for (var _i = 0, _Object$entries = Object.entries(headers); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        header = _Object$entries$_i[0],
        value = _Object$entries$_i[1];

    if (header !== 'referer') {
      xhr.setRequestHeader(header, value);
    }
  }

  if (supportsXhrResponseType('moz-chunked-text')) {
    xhr.responseType = 'moz-chunked-text';
  }

  xhr.addEventListener('readystatechange', onReadyStateChange);
  xhr.addEventListener('loaded', onLoadEvent);
  xhr.addEventListener('error', onErrorEvent);
  xhr.send(body);
}