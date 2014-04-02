'use strict';

var Model     = require('../').Model;
var relations = require('../src/relations');

describe('Model', function () {

  var model;
  beforeEach(function () {
    sinon.stub(relations, 'update').returns({});
    model = new Model();
  });

  afterEach(function () {
    relations.update.restore();
  });

  it('is an EventEmitter', function () {
    expect(model).to.respondTo('emit');
  });

  it('uses emitThen', function () {
    expect(model).to.respondTo('emitThen');
  });

  describe('Model#extend', function () {
    
    it('subclasses the Model', function () {
      expect(new (Model.extend())()).to.be.an.instanceOf(Model);
    });

    it('copies new prototype properties', function () {
      expect(Model.extend({foo: 'bar'})).to.have.deep.property('prototype.foo', 'bar');
    });

    it('copies new constructor properties', function () {
      expect(Model.extend(null, {foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });

  describe('Relations', function () {

    it('can create a belongsTo relation', function () {
      expect(Model).to.itself.respondTo('belongsTo');
    });

    it('can create a hasOne relation', function () {
      expect(Model).to.itself.respondTo('hasOne');
    });

    it('can create a hasMany relation', function () {
      expect(Model).to.itself.respondTo('hasMany');
    });

  });

  describe('Constructor', function () {

    it('sets up attributes', function () {
      sinon.spy(Model.prototype, 'set');
      expect(new Model({foo: 'bar'}).set).to.have.been.calledWithMatch({foo: 'bar'});
      Model.prototype.set.restore();
    });

    it('calls the `initialize` function if defined', function () {
      Model.prototype.initialize = sinon.spy();
      var arg = {};
      var model = new Model(arg);
      expect(model.initialize)
        .to.have.been.calledWith(arg)
        .and.calledOn(model);
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

    it('copies the attributes and excludes related objects', function () {
      relations.update.returns({
        foo: 'bar'
      });
      expect(model.set({
        foo: 'bar'
      }))
      .to.have.property('foo', 'bar');
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
  
});