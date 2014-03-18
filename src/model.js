var http   = require('http');
var extend = require('node-extend');

var Model = function (attributes) {
  extend(this, attributes);
};

module.exports = Model;