'use strict';

var needle = require('needle');
var url    = require('url');
var extend = require('extend');

var Model = function (attributes) {
  extend(this, attributes);
};

Model.prototype.isNew = function () {
  return (typeof this.id === 'undefined' || this.id === null);
};

Model.prototype.url = function () {
  return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id); 
};

module.exports = Model;