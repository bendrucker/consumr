'use strict';

var Promise  = require('bluebird');
var needle   = Promise.promisifyAll(require('needle'));
var response = require('./response');

var internals = {};

var Request = function (options) {
  this.options = options;
};

Request.prototype.send = Promise.method(function () {
  internals.options(this.options);
  return this
    .emitThen(request, options)
    .bind(this)
    .then(function () {
      return neddle.requestAsync(
        options.method,
        options.url,
        options.data,
        internals.needleOptions(options)
      );
    })
    .then(function (response) {
      this.response = response;
      return response;
    })
    .then(function (response) {
      return this.emitThen('response', response)
        .return(response);
    })
    .then(response.parse);

});

module.exports = Request;