'use strict';

var EventEmitter = require('events').EventEmitter;
var emitThen     = require('emit-then');
var Promise      = require('bluebird');
var pick         = require('lodash.pick');
var defaults     = require('lodash.defaults');
var needle       = Promise.promisifyAll(require('needle'));
var response     = require('./response');

var internals = {};

internals.options = function (options) {
  return defaults(options || {}, {
    json: true
  });
};

internals.needle = function () {
  return needle.requestAsync(
    this.method,
    this.url,
    this.data,
    pick(this.options, 'timeout', 'follow', 'proxy', 'agent', 'headers', 'auth', 'json')
  );
};

var Request = function (method, url, data, options) {
  this.method = method;
  this.url = url;
  this.data = data;
  this.options = internals.options(options);
  EventEmitter.call(this);
};

Request.prototype = Object.create(EventEmitter.prototype);

Request.prototype.emitThen = emitThen;

Request.prototype.send = Promise.method(function () {
  return this
    .emitThen('request', this, this.options)
    .bind(this)
    .then(internals.needle)
    .tap(function (response) {
      this.response = response;
      return this.emitThen('response', response);
    })
    .then(response.parse);
});

module.exports = Request;