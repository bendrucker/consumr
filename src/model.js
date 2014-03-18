'use strict';

var needle = require('needle');
var extend = require('extend');

var Model = function (attributes) {
  extend(this, attributes);
};

module.exports = Model;