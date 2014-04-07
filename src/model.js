'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var relations    = require('./relations');

var internals = {};

internals.private = ['domain', '_events', '_maxListeners'];

internals.normalizeId = function (model) {
  if (model.idAttribute) {
    Object.defineProperty(model, 'id', {
      get: function () {
        return model[model.idAttribute];
      },
      set: function (id) {
        model[model.idAttribute] = id;
      }
    });
  }
};

var Model = function (attributes) {
  EventEmitter.call(this);
  if (this.initialize) this.initialize.apply(this, arguments);
  this.set(attributes);
  internals.normalizeId(this);
};

Model.extend = function (prototype, constructor) {
  prototype = prototype || {};
  constructor = constructor || {};

  var child = function () {
    Model.apply(this, arguments);
  };
  child.prototype = _.extend(Object.create(Model.prototype), prototype);
  _.extend(child, this);
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
  relations.update(this, attributes);
  _.extend(this, relations.data(this, attributes));
  return this;
};

Model.prototype.matches = function (data) {
  if (typeof this.id === 'undefined') return;
  if (this.id === data.id) return true;
  if (this.idAttribute && this.id === data[this.idAttribute]) return true;
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