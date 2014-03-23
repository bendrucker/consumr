'use strict';

var eavesdrop = require('eavesdrop');
var clone     = require('lodash.clone');

exports.eavesdrop = function (request) {
  eavesdrop.call(this, request, {
    events: ['preRequest', 'postRequest', 'preResponse', 'postResponse'],
    method: 'emitThen'
  });
};

exports.scrub = function (object) {
  var data = clone(object);
  ['domain', '_events', '_maxListeners'].forEach(function (property) {
    delete data[property];
  });
  return data;
};