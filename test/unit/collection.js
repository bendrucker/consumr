'use strict';

var Request    = require('request2');
var Collection = require('../../src/collection');
var ModelBase  = require('../../src/model');

describe('Collection', function () {

  var collection;
  beforeEach(function () {
    collection = new Collection();
  });

  it('is an EventEmitter', function () {
    expect(collection).to.respondTo('emit');
  });

  it('uses emitThen', function () {
    expect(collection).to.respondTo('emitThen');
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

  describe('#merge', function () {

    var model;
    beforeEach(function () {
      model = new ModelBase({
        id: 1
      });
    });

    beforeEach(function () {
      collection.model = ModelBase;
    });

    it('updates existing models in the collection in place by ID', function () {
      collection.push(model);
      collection.merge({id: 1, name: 'Ben'});
      expect(collection)
        .to.have.length(1)
        .and.have.deep.property('[0].name', 'Ben');
    });

    it('adds new models to the collection', function () {
      collection.merge({id: 1, name: 'Ben'});
      expect(collection)
        .to.have.length(1)
        .and.have.property('0')
        .and.contain({
          id: 1,
          name: 'Ben'
        })
        .and.is.an.instanceOf(ModelBase);
    });

    it('can merge many models', function () {
      collection.merge([
        {id: 1, name: 'Ben'},
        {id: 2, name: 'Drucker'}
      ]);
      expect(collection)
        .to.have.length(2);
    });

    it('can merge many models', function () {
      collection.merge([
        {id: 1, name: 'Ben'},
        {id: 2, name: 'Drucker'}
      ]);
      expect(collection)
        .to.have.length(2);
    });

    it('merges existing models with model.toJSON (shallow:true)', function () {
      collection.push(model);
      sinon.stub(model, 'toJSON');
      collection.merge(model);
      expect(model.toJSON).to.have.been.calledWithMatch({shallow: true});
    });

  });


  describe('#fetch', function () {

    var send;
    beforeEach(function () {
      send = sinon.stub(Request.prototype, 'send').resolves([]);
    });

    afterEach(function () {
      send.restore();
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
        expect(send).to.have.been.calledOn(sinon.match.has('url', 'http://url'));
      });
    });

    it('adds attributes to the query string', function () {
      collection.attributes = {
        foo: 'bar',
        baz: 'qux'
      };
      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has(
          'url', 'http://url?foo=bar&baz=qux'));
      });
    });

    it('uses the errorProperty and dataProperty from the model', function () {
      Model.prototype.errorProperty = 'error';
      Model.prototype.dataProperty = 'data';

      return collection.fetch().finally(function () {
        expect(send.getCall(0).thisValue.options).to.contain({
          errorProperty: 'error',
          dataProperty: 'data'
        });
      });
    });

  });

});