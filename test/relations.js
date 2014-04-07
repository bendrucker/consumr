'use strict';

var relations      = require('../src/relations');
var CollectionBase = require('../src/collection');

describe('Relations', function () {

  var Model, Target;
  beforeEach(function () {
    Model = sinon.spy();
    Target = sinon.spy();
    Target.prototype.name = 'target';
  });

  it('can create a belongsTo relation', function () {
    relations.belongsTo.call(Model, Target);
    expect(Model.prototype.relations).to.have.property('target')
      .that.deep.equals({
        type: 'belongsTo',
        model: Target,
        key: 'target_id',
        single: true
      });
  });

  it('can create a hasMany relation', function () {
    relations.hasMany.call(Model, Target);
    expect(Model.prototype.relations).to.have.property('targets')
      .that.deep.equals({
        type: 'hasMany',
        model: Target,
        key: null,
        single: false
      });
  });

  describe('#update', function () {

    it('is a noop with no relations', function () {
      expect(relations.update.call({relations: {}}, {foo: 'bar'}))
        .to.deep.equal({foo: 'bar'});
    });

    beforeEach(function () {
      Target.prototype.set = sinon.spy();
    });

    var model;

    describe('With a related model', function () {

      beforeEach(function () {
        relations.belongsTo.call(Model, Target);
        model = new Model();
      });

      it('is a noop if the related key is not present', function () {
        relations.update.call(model, {});
        expect(model).to.not.have.property('target');
      });

      it('updates the related model if already present', function () {
        model.target = new Target();
        relations.update.call(model, {
          target_id: 0
        });
        expect(model.target.set).to.have.been.calledWithMatch({id: 0});
      });

      it('creates a related model if missing', function () {
        relations.update.call(model, {
          target_id: 0
        });
        expect(model.target).to.equal(Target.firstCall.returnValue);
        expect(Target).to.have.been.calledWithMatch({id: 0});
      });

      it('merges in data from a related object', function () {
        relations.update.call(model, {
          target_id: 0,
          target: {
            foo: 'bar'
          }
        });
        expect(model.target.set).to.have.been.calledWithMatch({foo: 'bar'});
      });

    });

    describe('With a related collection', function () {

      var Collection, attrs;
      beforeEach(function () {
        Collection = sinon.spy();
        Collection.prototype.model = Target;
        Collection.prototype.merge = sinon.spy();
        relations.hasMany.call(Model, Target);
        model = new Model();
        attrs = {targets: []};
      });

      it('is is a noop if the related key is not present', function () {
        relations.update.call(model, {});
        expect(model).to.not.have.property('targets');
      });

      it('merges into the related collection if present', function () {
        model.targets = new Collection();
        relations.update.call(model, attrs);
        expect(model.targets.merge).to.have.been.calledWith(attrs.targets);
      });

      it('creates a related collection if missing', function () {
        relations.update.call(model, attrs);
        console.log(model);
        expect(model.targets)
          .to.be.an.instanceOf(CollectionBase)
          .with.property('model', Target);
      });

    });

  });

});