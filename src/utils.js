'use strict';

var eavesdrop = require('eavesdrop');

exports.eavesdrop = function (request) {
  eavesdrop.call(this, request, {
    events: ['preRequest', 'postRequest', 'preResponse', 'postResponse'],
    method: 'emitThen'
  });
};