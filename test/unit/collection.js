'use strict';

var Collection = require('../../src/collection');
var needle     = require('needle');

describe('Collection', function () {

  var collection;
  beforeEach(function () {
    collection = new Collection();
  });

  describe('Constructor', function () {

    it('inherits from Array', function () {
      expect(collection).to.be.an.instanceOf(Array);
    });

    it('copies the provided attributes', function () {
      expect(new Collection({foo: 'bar'}))
        .to.have.deep.property('attributes.foo', 'bar');
    });

  });

  describe('#reset', function () {

    it('empties the array', function () {
      collection.push('foo', 'bar');
      collection.reset();
      expect(collection).to.have.length(0);
    });

    it('clears the attributes', function () {
      collection.attributes = {foo: 'bar'};
      collection.reset();
      expect(collection.attributes).to.not.have.property('foo');
    });

  });

});