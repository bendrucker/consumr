'use strict';

var EventEmitter = require('events').EventEmitter;
var _            = require('lodash');
var emitThen     = require('emit-then');

var internals = {};

internals.private = ['domain', '_events', '_maxListeners'];

var Model = function (attributes) {
  this.set(attributes);
  EventEmitter.call(this);
};

Model.prototype = Object.create(EventEmitter.prototype);

Model.prototype.emitThen = emitThen;

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

Model.prototype.set = function (attributes) {
  _.extend(this, attributes);
  return this;
};

Model.prototype.reset = function () {
  Object.keys(this)
    .forEach(function (key) {
      delete this[key];
    }, this);
  return this;
};

Model.prototype.toJSON = function () {
  return _.omit(this, internals.private);
};

module.exports = Model;