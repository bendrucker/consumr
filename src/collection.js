'use strict';

var Promise = require('bluebird');
var needle  = Promise.promisifyAll(require('needle'));

var internals = {};

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

module.exports = Collection;