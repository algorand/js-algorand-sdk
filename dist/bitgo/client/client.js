"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var request = require("superagent");

function HTTPClient(requestHeaders, baseServer, port) {
  // Do not need colon if port is empty
  if (port != '') {
    baseServer += ":" + port.toString();
  }

  this.address = baseServer;

  this.get =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* (path, query) {
      try {
        return yield request.get(this.address + path).set(requestHeaders).set('Accept', 'application/json').query(query);
      } catch (e) {
        throw e;
      }
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  this.post =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(function* (path, data) {
      try {
        return yield request.post(this.address + path).set(requestHeaders).send(data);
      } catch (e) {
        throw e.response;
      }
    });

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.delete =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(function* (path, data) {
      try {
        return yield request.delete(this.address + path).set(requestHeaders).send(data);
      } catch (e) {
        throw e.response;
      }
    });

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();
}

module.exports = {
  HTTPClient
};