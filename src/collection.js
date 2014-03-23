'use strict';

var querystring  = require('querystring');
var Promise      = require('bluebird');
var Request      = require('request2');
var eavesdrop    = require('eavesdrop');
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
    .bind(this.model)
    .map(internals.cast)
    .bind(this)
    .reduce(function (newModels, model) {
      var existing = internals.find.call(this, model);
      if (existing) {
        existing.set(model);
      } else {
        newModels.push(model);
      }
      return newModels;
    }, [])
    .then(function (models) {
      this.push.apply(this, models);
    });
};

module.exports = Collection;