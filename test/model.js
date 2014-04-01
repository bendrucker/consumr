'use strict';

var Model = require('../').Model;

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
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

    var Source, Target;
    beforeEach(function () {
      Source = Model.extend();
      Target = Model.extend({
        name: 'target'
      });
    });

    ['belongsTo', 'hasOne', 'hasMany']
      .forEach(function (type) {
        it('can register a ' + type + ' relation', function () {
          expect(Model[type](Target))
            .to.have.a.deep.property('prototype.relations.target')
            .that.deep.equals({
              type: type,
              model: Target
            });
        });
      });

  });  

  describe('Constructor', function () {

    it('sets up attributes', function () {
      expect(new Model({foo: 'bar'})).to.have.property('foo', 'bar');
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

    it('copies an object to the model', function () {
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