'use strict';
var querystring = require('querystring');
var Promise     = require('bluebird');
var Model       = require('./model');
var needle      = Promise.promisifyAll(require('needle'));

var internals = {};

internals.querystring = function () {
  return Object.keys(this.attributes).length? '?' + querystring.stringify(this.attributes) : '';
};

var Collection = function (attributes) {
  Array.call(this);
  this.attributes = attributes || {};
};

Collection.prototype = Object.create(Array.prototype);

Collection.prototype.reset = function () {
  while (this.length > 0) {
    this.pop();
  }
  this.attributes = {};
  return this;
};

Collection.prototype.fetch = function () {
  Promise
    .bind(this)
    .then(function () {
      return this.model.prototype.url() + internals.querystring.call(this);
    })
    .then(needle.getAsync)
    .then
};

module.exports = Collection;