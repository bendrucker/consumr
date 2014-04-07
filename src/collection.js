'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var internals = {};

internals.private = ['domain', '_events', '_maxListeners'];

var Collection = function (Model, attributes) {
  Array.call(this);
  EventEmitter.call(this);

  Object.defineProperties(this, {
    model: {
      value: Model,
      enumerable: false,
      writable: true
    },
    attributes: {
      value: attributes || {},
      enumerable: false,
      writable: true
    }
  });
};

Collection.prototype = Object.create(Array.prototype);
_.extend(Collection.prototype, EventEmitter.prototype);

Collection.prototype.emitThen = emitThen;

Collection.prototype.reset = function () {
  while (this.length > 0) {
    this.pop();
  }
  this.attributes = {};
  return this;
};

internals.cast = function (Model, attributes) {
  return new Model(attributes);
};

internals.find = function (collection, modelData) {
  return _.find(collection, function (model) {
    return model.matches(modelData);
  });
};

Collection.prototype.merge = function (models) {
  if (!Array.isArray(models)) models = [models];
  models
    .filter(function (model) {
      var existing = internals.find(this, model);
      if (existing) {
        existing.set(model);
        return;
      } else {
        return true;
      }
    }, this)
    .forEach(function (model) {
      this.push(internals.cast(this.model, model));
    }, this);

  return this;
};

Collection.prototype.toJSON = function () {
  return _.omit(this, internals.private);
};

module.exports = Collection;