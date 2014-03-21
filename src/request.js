'use strict';

var EventEmitter = require('events').EventEmitter;
var emitThen     = require('emit-then');
var Promise      = require('bluebird');
var needle       = Promise.promisifyAll(require('needle'));
var response     = require('./response');

var internals = {};

internals.options = function (options) {
  return options;
};
internals.needle = function () {
  return needle.requestAsync(
    this.method,
    this.url,
    this.data,
    {}
  );
};

var Request = function (method, url, data, options) {
  this.method = method;
  this.url = url;
  this.data = data;
  this.options = options || {};
  EventEmitter.call(this);
};

Request.prototype = Object.create(EventEmitter.prototype);

Request.prototype.emitThen = emitThen;

Request.prototype.send = Promise.method(function () {
  var options = internals.options(this.options);
  return this
    .emitThen('request', this, options)
    .bind(this)
    .then(internals.needle)
    .then(function (response) {
      this.response = response;
      return response;
    })
    .then(function (response) {
      return this.emitThen('response', response)
        .return(response);
    })
    .then(response.parse);

});

module.exports = Request;