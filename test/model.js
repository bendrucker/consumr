'use strict';

var ModelBase      = require('../').Model;
var CollectionBase = require('../').Collection;

describe('Model', function () {

  var Model, model;
  beforeEach(function () {
    Model = ModelBase.extend();
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

  var data, options;
  beforeEach(function () {
    data = {foo: 'bar'};
    options = {};
  });

  describe('Constructor', function () {

    beforeEach(function () {
      sinon.stub(Model.prototype, 'set');
    });

    afterEach(function () {
      Model.prototype.set.restore();
    });

    it('sets up attributes', function () {
      expect(new Model(data, options).set).to.have.been.calledWith(data, options);
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

    var relationFactory, relatedModel; 
    beforeEach(function () {
      relatedModel = {
        set: sinon.spy()
      };
      relationFactory = sinon.stub().returns(relatedModel);
      sinon.stub(model, 'related').returns(relationFactory);
    });

    it('copies the input data', function () {
      expect(model.set(data)).to.have.property('foo', 'bar');
    });

    it('casts relational data', function () {
      model.set(data, {withRelated: ['foo']});
      expect(model.related).to.have.been.calledWith('foo');
      expect(model.foo).to.equal(relationFactory.firstCall.returnValue);
      expect(relatedModel.set).to.have.been.calledWith(data.foo);
    });

    it('updates existing relations', function () {
      model.foo = {
        set: sinon.spy()
      };
      model.set(data, {withRelated: ['foo']});
      expect(model.foo.set).to.have.been.calledWith(data.foo);
    });

  });

  describe('#matches', function () {

    beforeEach(function () {
      model.id = 0;
    });

    it('is always falsy if there is no id', function () {
      model.id = undefined;
      expect(model.matches({id: 0})).to.not.be.ok;
    });

    it('matches the ids match', function () {
      expect(model.matches({id: 0})).to.be.true;
    });

    it('matches when the model id matches the data idAttribute value', function () {
      model.idAttribute = 'foo_id';
      expect(model.matches({foo_id: 0})).to.be.true;
    });

    it('does not match if IDs are mismatched', function () {
      expect(model.matches({id: 1})).to.not.be.ok;
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

    it('omits relations', function () {
      model.relations = {
        foo: function () {}
      };
      model.foo = 'bar';
      expect(model.toJSON()).to.not.have.a.property('foo');
    });

  });

  describe('Relations', function () {

    var Target;
    beforeEach(function () {
      Target = ModelBase.extend({
        name: 'target'
      });
    });

    describe('#related', function () {

      it('calls the named relation method', function () {
        Model.prototype.relations = {
          target: sinon.spy()
        };
        model.related('target');
        expect(model.relations.target)
          .to.have.been.calledOnce
          .and.calledOn(model);
      });
      
    });

    describe('#belongsTo', function () {

      it('returns the related model', function () {
        model.target_id = 0;
        model.target = function () {
          return this.belongsTo(Target);
        };
        expect(model.target())
          .to.be.an.instanceOf(Target)
          .and.have.property('id', 0);
      });

      it('can use a custom key', function () {
        model.tid = 0;
        model.target = function () {
          return this.belongsTo(Target, 'tid');
        };
        expect(model.target())
          .to.be.an.instanceOf(Target)
          .and.have.property('id', 0);
      });

    });

    describe('#hasMany', function () {

      beforeEach(function () {
        model.name = 'foo';
        model.id = 0;
      });

      it('returns the related collection', function () {
        model.targets = function () {
          return this.hasMany(Target);
        };
        var targets = model.targets();
        expect(targets).to.be.an.instanceOf(CollectionBase);
        expect(targets.attributes).to.have.property('foo_id', 0);
        expect(targets.model).to.equal(Target);
      });

      it('can use a custom foreignKey', function () {
        model.targets = function () {
          return this.hasMany(Target, 'bar_id');
        };
        expect(model.targets().attributes).to.have.property('bar_id', 0);
      });

    });

  });
  
});