'use strict';

var consumr    = require('../');
var Model      = consumr.Model;
var Collection = consumr.Collection;
var relations  = require('../src/relations');

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

  it('inherits from Array', function () {
    expect(collection).to.be.an.instanceOf(Array);
  });

  describe('Constructor', function () {

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

    beforeEach(function () {
      sinon.stub(relations, 'update').returnsArg(0);
    });

    afterEach(function () {
      relations.update.restore();
    });

    var model;
    beforeEach(function () {
      model = new Model({
        id: 1
      });
      sinon.spy(model, 'set');
    });

    beforeEach(function () {
      collection.model = Model;
    });

    it('updates existing models in the collection in place by ID', function () {
      collection.push(model);
      collection.merge({id: 1, name: 'Ben'});
      expect(model.set).to.have.been.calledWith(sinon.match.has('name', 'Ben'));
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
        .and.is.an.instanceOf(Model);
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
      expect(collection).to.have.length(2);
    });

    it('merges existing models with the new data', function () {
      collection.push(model);
      collection.merge(model);
      expect(model.set).to.have.been.calledWith(model);
    });

  });

});