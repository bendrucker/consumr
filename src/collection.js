'use strict';
var querystring = require('querystring');
var Promise     = require('bluebird');
var Request     = require('./request');

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
  this.attributes = attributes || {};
};

Collection.prototype = Object.create(Array.prototype);

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
      }).send();
    })
    .bind(this)
    .reduce(function (newModels, modelData) {
      var existing = internals.find.call(this, modelData);
      if (existing) {
        existing.set(modelData);
      } else {
        newModels.push(modelData);
      }
      return newModels;
    }, [])
    .bind(this.model)
    .map(internals.cast)
    .bind(this)
    .then(function (models) {
      this.push.apply(this, models);
    });
};

module.exports = Collection;