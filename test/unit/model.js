'use strict';

var Model = require('../../src/model');

describe('Model', function () {

  describe('Constructor', function () {

    it('sets up attributes', function () {
      expect(new Model({foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });
  
});