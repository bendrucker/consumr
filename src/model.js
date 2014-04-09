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

var Model = function (attributes, options) {
  EventEmitter.call(this);
  if (this.initialize) this.initialize.apply(this, arguments, options);
  this.set(attributes, options);
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

internals.options = function (options) {
  options = options || {};
  if (options.withRelated && !Array.isArray(options.withRelated)) {
    options.withRelated = [options.withRelated];
  }
  return _.defaults(options, {
    withRelated: []
  });
};

internals.data = function (attributes, options) {
  return _.omit(attributes, options.withRelated);
};

internals.relations = function (model, attributes, options) {
  options.withRelated
    .forEach(function (name) {
      if (!model[name]) model[name] = model.related(name);
      if (model[name].set) {
        model[name].set(attributes[name]);
      } else {
        model[name].merge(attributes[name]);
      }
    });
};

Model.prototype.set = function (attributes, options) {
  options = internals.options(options);
  attributes = attributes || {};
  _.extend(this, internals.data(attributes, options));
  internals.relations(this, attributes, options);
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
  return _.omit(this, internals.private.concat(Object.keys(this.relations || {})));
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