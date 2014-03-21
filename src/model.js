'use strict';

var Promise    = require('bluebird');
var extend     = require('extend');
var Request    = require('./request');
var Collection = require('./collection');

var internals = {};

internals.save = function () {
  return this.isNew() ? 'POST' : 'PUT';
};

internals.disallowNew = function (method) {
  if (this.isNew()) throw new Error('Cannot ' + method + ' a new model');
};

var Model = function (attributes) {
  this.set(attributes);
};

Model.collection = function (attributes) {
  var collection = new Collection(attributes);
  collection.model = this;
  return collection;
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
      delete this[key];
    }, this);
  return this;
};

Model.prototype.fetch = Promise.method(function () {
  internals.disallowNew.call(this, 'fetch');
  return new Request('GET', this.url())
    .send()
    .bind(this)
    .then(this.set);
});

Model.prototype.save = function () {
  return Promise
    .bind(this)
    .then(internals.save)
    .then(function (method) {
      return new Request(method, this.url(), this).send();
    })
    .then(this.set);
};

Model.prototype.destroy = Promise.method(function () {
  internals.disallowNew.call(this, 'destroy');
  return new Request('DELETE', this.url())
    .send()
    .bind(this)
    .then(this.reset);
});

module.exports = Model;