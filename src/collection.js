'use strict';

var querystring  = require('querystring');
var Promise      = require('bluebird');
var Request      = require('request2');
var extend       = require('extend');
var EventEmitter = require('events').EventEmitter;
var emitThen     = require('emit-then');
var utils        = require('./utils');

var internals = {};

internals.querystring = function () {
  return Object.keys(this.attributes).length? '?' + querystring.stringify(this.attributes) : '';
};

internals.cast = function (attributes) {
  return new this(attributes);
};

internals.find = function (model) {
  return this.filter(function (model) {
    return model.id === this.id;
  }, model)[0];
};

internals.update = function (model) {
  var target = internals.find.call(this, model);
  if (target) return target.set(model.toJSON({shallow: true}));
};

var Collection = function (attributes) {
  Array.call(this);
  EventEmitter.call(this);
  this.attributes = attributes || {};
};

Collection.prototype = Object.create(Array.prototype);

extend(Collection.prototype, EventEmitter.prototype);

Collection.prototype.emitThen = emitThen;

Collection.prototype.reset = function () {
  while (this.length > 0) {
    this.pop();
  }
  this.attributes = {};
  return this;
};

Collection.prototype.merge = function (models) {
  if (!Array.isArray(models)) models = [models];
  models
    .map(internals.cast, this.model)
    .filter(function (model) {
      return !internals.update.call(this, model);
    }, this)
    .forEach(function (model) {
      this.push(model);
    }, this);

  return this;
};

Collection.prototype.fetch = function () {
  return Promise
    .bind(this)
    .then(function () {
      return this.model.prototype.url() + internals.querystring.call(this);
    })
    .then(function (url) {
      return new Request('GET', url, null, {
        errorProperty: this.model.prototype.errorProperty,
        dataProperty: this.model.prototype.dataProperty
      });
    })
    .tap(utils.eavesdrop)
    .call('send')
    .then(this.merge);
};

module.exports = Collection;