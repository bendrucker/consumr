'use strict';

var Promise  = require('bluebird');
var needle   = Promise.promisifyAll(require('needle'));
var extend   = require('extend');
var response = require('./response');

var internals = {};

internals.save = function () {
  var method = this.isNew() ? 'POST' : 'PUT';
  return [method, this.url(), this, {
    json: true
  }];
};

internals.disallowNew = function (method) {
  if (this.isNew()) throw new Error('Cannot ' + method + ' a new model');
};

var Model = function (attributes) {
  this.set(attributes);
};

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

Model.prototype.url = function () {
  return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id);
};

Model.prototype.set = function (attributes) {
  extend(this, attributes);
  return this;
};

Model.prototype.reset = function () {
  Object.keys(this)
    .forEach(function (key) {
      this[key] = undefined;
    }, this);
  return this;
};

Model.prototype.fetch = Promise.method(function () {
  internals.disallowNew.call(this, 'fetch');
  return needle
    .getAsync(this.url())
    .then(response.catch)
    .bind(this)
    .get('body')
    .then(this.set);
});

Model.prototype.save = function () {
  return Promise
    .bind(this)
    .then(internals.save)
    .spread(needle.requestAsync)
    .then(response.catch)
    .get('body')
    .then(this.set);
};

Model.prototype.destroy = Promise.method(function () {
  internals.disallowNew.call(this, 'destroy');
  return needle
    .deleteAsync(this.url())
    .bind(this)
    .then(response.catch)
    .then(this.reset);
});

module.exports = Model;