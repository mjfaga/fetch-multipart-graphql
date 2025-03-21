"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMultipartHttp = parseMultipartHttp;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function getDelimiter(boundary) {
  return "\r\n--".concat(boundary, "\r\n");
}

function getClosingDelimiter(boundary) {
  return "\r\n--".concat(boundary, "--");
}

function splitWithRest(string, delim) {
  var index = string.indexOf(delim);

  if (index < 0) {
    return [undefined, string];
  }

  return [string.substring(0, index), string.substring(index + delim.length)];
}

function parseMultipartHttp(buffer, boundary) {
  var previousParts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var isPreamble = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var delimiter = getDelimiter(boundary);

  var _splitWithRest = splitWithRest(buffer, delimiter),
      _splitWithRest2 = _slicedToArray(_splitWithRest, 2),
      region = _splitWithRest2[0],
      next = _splitWithRest2[1];

  if (region !== undefined && (region.length || region.trim() === '') && isPreamble) {
    if (next && next.length) {
      // if we have stuff after the boundary; and we're in preamble—we recurse
      return parseMultipartHttp(next, boundary, previousParts, false);
    } else {
      return {
        newBuffer: '',
        parts: previousParts,
        isPreamble: false
      };
    }
  }

  if (!region) {
    var closingDelimiter = getClosingDelimiter(boundary);

    var _splitWithRest3 = splitWithRest(buffer, closingDelimiter);

    var _splitWithRest4 = _slicedToArray(_splitWithRest3, 2);

    region = _splitWithRest4[0];
    next = _splitWithRest4[1];

    if (!region) {
      // we need more things
      return {
        newBuffer: buffer,
        parts: previousParts,
        isPreamble: isPreamble
      };
    }
  }

  var _splitWithRest5 = splitWithRest(region, '\r\n\r\n'),
      _splitWithRest6 = _slicedToArray(_splitWithRest5, 2),
      _headers = _splitWithRest6[0],
      body = _splitWithRest6[1]; // remove trailing boundary things


  body = body.replace(delimiter + '\r\n', '').replace(delimiter + '--\r\n', '');
  var payload = JSON.parse(body);
  if (payload.incremental) payload = payload.incremental[0];
  var parts = [].concat(_toConsumableArray(previousParts), [payload]);

  if (next && next.length) {
    // we have more parts
    return parseMultipartHttp(next, boundary, parts, isPreamble);
  }

  return {
    parts: parts,
    newBuffer: '',
    isPreamble: isPreamble
  };
}