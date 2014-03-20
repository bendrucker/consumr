'use strict';

var Collection = require('../../src/collection');
var ModelBase  = require('../../src/model');
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

  describe('#fetch', function () {

    beforeEach(function () {
      sinon.stub(needle, 'getAsync').resolves({
        statusCode: 200,
        body: []
      });
    });

    afterEach(function () {
      needle.getAsync.restore();
    });

    var Model;
    beforeEach(function () {
      Model = function () {
        ModelBase.apply(this, arguments);
      };
      Model.prototype = Object.create(ModelBase.prototype);
      Model.prototype.url = function () {
        return 'http://url';
      };
      collection.model = Model;
    });

    it('fetches the base URL if no attributes are defined', function () {
      return collection.fetch().finally(function () {
        expect(needle.getAsync).to.have.been.calledWith('http://url');
      });
    });

    it('adds attributes to the query string', function () {
      collection.attributes = {
        foo: 'bar',
        baz: 'qux'
      };
      return collection.fetch().finally(function () {
        expect(needle.getAsync).to.have.been.calledWith('http://url?foo=bar&baz=qux');
      });
    });

    it('updates existing models in the collection in place by ID', function () {
      var model = new Model({
        id: 1
      });
      collection.push(model);
      needle.getAsync.resolves({
        statusCode: 200,
        body: [{
          id: 1,
          foo: 'bar'
        }]
      });
      return collection.fetch().finally(function () {
        expect(collection).to.have.length(1);
        expect(collection[0])
          .to.equal(model)
          .and.to.have.property('foo', 'bar');
      });
    });

    it('adds new models to the collection', function () {
      needle.getAsync.resolves({
        statusCode: 200,
        body: [{
          id: 1,
        }]
      });
      return collection.fetch().finally(function () {
        expect(collection).to.have.length(1);
        expect(collection[0])
          .to.be.an.instanceOf(Model)
          .and.to.have.property('id', 1);
      });
    });

    it('uses the model dataProperty', function () {
      Model.prototype.dataProperty = 'data';
      needle.getAsync.resolves({
        statusCode: 200,
        body: {
          data: [{
            id: 1,
          }]
        }
      });
      return collection.fetch().finally(function () {
        expect(collection).to.have.length(1);
      });
    });

  });

});