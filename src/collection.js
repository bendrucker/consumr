'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var internals = {};

var Collection = function (attributes) {
  Array.call(this);
  EventEmitter.call(this);
  this.attributes = attributes || {};
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

internals.cast = function (attributes) {
  return new this(attributes);
};

internals.find = function (model) {
  return _.find(this, {id: model.id});
};

internals.update = function (model) {
  var target = internals.find.call(this, model);
  if (target) return target.set(model);
};

Collection.prototype.merge = function (models) {
  if (!Array.isArray(models)) models = [models];
  models
    .filter(function (model) {
      return !internals.update.call(this, model);
    }, this)
    .forEach(function (model) {
      this.push(internals.cast.call(this.model, model));
    }, this);

  return this;
};

module.exports = Collection;