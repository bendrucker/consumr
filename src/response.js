'use strict';

var pick        = require('lodash.pick');
var httpStatus  = require('http-status');
var createError = require('create-error');
var dot         = require('dot-component');

var internals = {};

internals.data = function (body) {
  return this.dataProperty ? dot.get(body, this.dataProperty) : body;
};

internals.error = function (response) {
  return new exports.ResponseError(
    internals.error.message.call(this, response),
    internals.error.properties.call(this, response)
  );
};

internals.error.message = function (response) {
  return this.errorProperty ? dot.get(response.body, this.errorProperty) : httpStatus[response.statusCode];
};

internals.error.properties = function (response) {
  return pick(response, 'body', 'statusCode');
};

internals.catch = function (response) {
  if (response.statusCode > 399) throw internals.error.call(this, response);
};

exports.ResponseError = createError('ResponseError');

exports.parse = function (response) {
  internals.catch.call(this, response);
  return internals.data.call(this, response.body);
};