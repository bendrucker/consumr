'use strict';

var ModelBase = require('../').Model;
var relations = require('../src/relations');

describe('Model', function () {

  var Model, model;
  beforeEach(function () {
    sinon.stub(relations, 'update');
    sinon.stub(relations, 'data');
    Model = ModelBase.extend();
    model = new Model();
  });

  afterEach(function () {
    relations.update.restore();
    relations.data.restore();
  });

  it('is an EventEmitter', function () {
    expect(model).to.respondTo('emit');
  });

  it('uses emitThen', function () {
    expect(model).to.respondTo('emitThen');
  });

  describe('Model#extend', function () {
    
    it('subclasses the Model', function () {
      expect(new (Model.extend())()).to.be.an.instanceOf(ModelBase);
    });

    it('copies new prototype properties', function () {
      expect(Model.extend({foo: 'bar'})).to.have.deep.property('prototype.foo', 'bar');
    });

    it('copies the parent constructor', function () {
      expect(Model.extend()).to.itself.respondTo('extend');
    });

    it('copies new constructor properties', function () {
      expect(Model.extend(null, {foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });

  describe('Relations', function () {

    it('can create a belongsTo relation', function () {
      expect(Model).to.itself.respondTo('belongsTo');
    });

    it('can create a hasMany relation', function () {
      expect(Model).to.itself.respondTo('hasMany');
    });

  });

  var data;
  beforeEach(function () {
    data = {foo: 'bar'};
  });

  describe('Constructor', function () {

    it('sets up attributes', function () {
      sinon.spy(Model.prototype, 'set');
      expect(new Model(data).set).to.have.been.calledWith(data);
      Model.prototype.set.restore();
    });

    it('calls the `initialize` function if defined', function () {
      Model.prototype.initialize = sinon.spy();
      model = new Model(data);
      expect(model.initialize)
        .to.have.been.calledWith(data)
        .and.calledOn(model);
    });

    it('proxies the id with a getter/setter if idAttribute is set', function () {
      var SubModel = Model.extend({
        idAttribute: 'foo_id'
      });
      model = new SubModel();
      model.id = 0;
      expect(model.foo_id).to.equal(0);
      model.foo_id = 1;
      expect(model.id).to.equal(1);
    });

  });

  describe('#isNew', function () {

    it('is not new if the model has an id', function () {
      model.id = 0;
      expect(model.isNew()).to.be.false;
    });

    it('is new if the id is undefined', function () {
      model.id = undefined;
      expect(model.isNew()).to.be.true;
    });

    it('is new if the id is null', function () {
      model.id = null;
      expect(model.isNew()).to.be.true;
    });

  });

  describe('#set', function () {

    it('copies the non-related data', function () {
      relations.data.withArgs(model, data).returns(data);
      expect(model.set(data)).to.have.property('foo', 'bar');
    });

  });

  describe('#reset', function () {

    it('removes properties from the model', function () {
      model.foo = 'bar';
      model.reset();
      expect(model).to.not.have.property('foo');
    });

    it('does not touch prototype methods', function () {
      model.reset();
      expect(model).to.respondTo('emit');
    });

    it('does not touch private properties', function () {
      model.reset();
      expect(model).to.have.property('_events');
    });

  });

  describe('#toJSON', function () {

    it('returns a an object without the private properties', function () {
      expect(model.toJSON()).to.not.have.a.property('_events');
    });

  });
  
});