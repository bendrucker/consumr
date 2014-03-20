'use strict';

var pick        = require('lodash.pick');
var httpStatus  = require('http-status');
var createError = require('create-error');
var dot         = require('dot-component');

var internals = {};

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

exports.ResponseError = createError('ResponseError');

exports.catch = function (response) {
  if (response.statusCode > 399) throw internals.error.call(this, response);
  return response;
};