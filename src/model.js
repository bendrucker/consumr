'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var Relation    = require('./relation');

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

Model.prototype = Object.create(EventEmitter.prototype);

Model.prototype.emitThen = emitThen;

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

internals.setRelations = function (model, attributes, relations) {

};

internals.setData = function (model, attributes) {
  _.extend(model, attributes);
};

Model.prototype.set = function (attributes, options) {
  options = options || {};
  internals.setRelations(this, attributes, options.withRelated);
  internals.setData(this, attributes);
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

Model.prototype.related = function (name) {
  return this.relations[name].call(this);
};

Model.prototype.belongsTo = function (Target, key) {
  return new Relation('belongsTo', Target, {key: key}).initialize(this);
};

Model.prototype.hasMany = function (Target, fKey) {
  return new Relation('hasMany', Target, {foreignKey: fKey}).initialize(this);
};

module.exports = Model;