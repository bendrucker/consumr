'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var internals = {};


// This might explode but it's worth a try
var isArray = Array.isArray;
Array.isArray = function (array) {
  if (array instanceof Collection) return true;
  return isArray(array);
};

internals.private = ['domain', '_events', '_maxListeners', 'model', 'attributes'];

var Collection = function (Model, attributes) {
  Array.call(this);
  EventEmitter.call(this);

  this.model = Model;
  this.attributes = attributes || {};
};

Collection.prototype = Object.create(Array.prototype);
_.extend(Collection.prototype, EventEmitter.prototype);

Collection.prototype.toString = function () {
  return '[object Array]';
};

Collection.prototype.emitThen = emitThen;

Collection.prototype.reset = function () {
  while (this.length > 0) {
    this.pop();
  }
  this.attributes = {};
  return this;
};

internals.cast = function (Model, attributes, options) {
  return new Model(attributes, options);
};

internals.find = function (collection, modelData) {
  return _.find(collection, function (model) {
    return model.matches(modelData);
  });
};

Collection.prototype.merge = function (models, options) {
  if (!models) return this;
  if (!Array.isArray(models)) models = [models];
  models
    .filter(function (model) {
      var existing = internals.find(this, model);
      if (existing) {
        existing.set(model, options);
        return;
      } else {
        return true;
      }
    }, this)
    .forEach(function (model) {
      this.push(internals.cast(this.model, model, options));
    }, this);

  return this;
};

Collection.prototype.toJSON = function () {
  return _.omit(this, internals.private);
};

module.exports = Collection;