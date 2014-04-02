'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var relations    = require('./relations');

var internals = {};

internals.private = ['domain', '_events', '_maxListeners'];

var Model = function (attributes) {
  this.set(attributes);
  EventEmitter.call(this);
  if (typeof this.initialize === 'function') this.initialize.apply(this, arguments);
};

Model.extend = function (prototype, constructor) {
  prototype = prototype || {};
  constructor = constructor || {};

  var child = function () {
    Model.apply(this, arguments);
  };
  child.prototype = _.extend(Object.create(Model.prototype), prototype);
  _.extend(child, constructor);
  return child;
};

Model.belongsTo = relations.belongsTo;
Model.hasMany = relations.hasMany;

Model.prototype = Object.create(EventEmitter.prototype);

Model.prototype.emitThen = emitThen;

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

Model.prototype.set = function (attributes) {
  _.extend(this, relations.update.call(this, attributes));
  return this;
};

Model.prototype.reset = function () {
  _(this)
    .keys()
    .difference(internals.private)
    .forEach(function (property) {
      delete this[property];
    }, this);

  return this;
};

Model.prototype.toJSON = function () {
  return _.omit(this, internals.private);
};

module.exports = Model;