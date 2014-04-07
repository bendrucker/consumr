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

    it('references the Model constructor', function () {
      expect(new Collection(Model).model).to.equal(Model);
      expect(new Collection().propertyIsEnumerable('model')).to.be.false;
    });

    it('copies the provided attributes', function () {
      var attrs = {foo: 'bar'};
      expect(new Collection(null, attrs).attributes).to.deep.equal(attrs);
      expect(new Collection().propertyIsEnumerable('attributes')).to.be.false;
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
      expect(collection.attributes).to.be.empty;
    });

  });

  describe('#merge', function () {

    beforeEach(function () {
      sinon.stub(relations, 'update').returnsArg(0);
    });

    afterEach(function () {
      relations.update.restore();
    });

    var model, data;
    beforeEach(function () {
      model = new Model({
        id: 1
      });
      data = {id: 1, name: 'Ben'};
      sinon.stub(model, 'set');
    });

    beforeEach(function () {
      collection.model = Model;
    });

    it('updates existing models in the collection in place by ID', function () {
      collection.push(model);
      model.matches = sinon.stub().withArgs(data).returns(true);
      collection.merge(data);
      expect(model.matches).to.have.been.calledWith(data);
      expect(model.set).to.have.been.calledWith(data);
    });

    it('adds new models to the collection', function () {
      collection.push(model);
      model.matches = sinon.stub().withArgs(data).returns(false);
      collection.merge(data);
      expect(model.set).to.not.have.been.called;
      expect(collection)
        .to.have.length(2)
        .and.have.property(1)
        .and.contain(data)
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

  });

});