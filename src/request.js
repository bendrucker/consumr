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
    .emitThen('preRequest', this)
    .bind(this)
    .then(function () {
      var request = internals.needle.call(this);
      try {
        this.emit('postRequest', this);
      } catch (e) {}
      return request;
    })
    .tap(function (response) {
      this.response = response;
      return this.emitThen('preResponse', response);
    })
    .then(function () {
      return response.parse.call(this.response, this.options);
    })
    .tap(function (body) {
      return this.emitThen('postResponse', body);
    });
});

module.exports = Request;