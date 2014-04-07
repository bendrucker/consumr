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
        key: 'target_id'
      });
  });

  it('can create a hasMany relation', function () {
    relations.hasMany.call(Model, Target);
    expect(Model.prototype.relations).to.have.property('targets')
      .that.deep.equals({
        type: 'hasMany',
        model: Target,
        key: null
      });
  });

  describe('#update', function () {

    var model;

    it('is a noop with no relations', function () {
      model = {relations: {}};
      expect(relations.update(model, {})).to.be.empty;
    });

    describe('With a related model', function () {

      beforeEach(function () {
        relations.belongsTo.call(Model, Target);
        model = new Model();
      });

      beforeEach(function () {
        Target.prototype.set = sinon.spy();
      });

      it('is a noop if no relation key or data is present', function () {
        relations.update(model, {});
        expect(model).to.not.have.property('target');
      });

      it('updates the related model if already present', function () {
        model.target = {
          set: sinon.spy()
        };
        relations.update(model, {
          target_id: 0
        });
        expect(model.target.set).to.have.been.calledWithMatch({id: 0});
      });

      it('creates a related model if missing', function () {
        relations.update(model, {
          target_id: 0
        });
        expect(model.target).to.be.an.instanceOf(Target);
        expect(model.target.set).to.have.been.calledWithMatch({id: 0});
      });

      it('merges in data from a related object', function () {
        relations.update(model, {
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
        relations.update(model, attrs);
        expect(model.targets.merge).to.have.been.calledWith(attrs.targets);
      });

      it('creates a related collection if missing', function () {
        sinon.spy(CollectionBase.prototype, 'merge');
        relations.update(model, attrs);
        expect(model.targets)
          .to.be.an.instanceOf(CollectionBase)
          .with.property('model', Target);
        expect(model.targets.merge).to.have.been.calledWith(attrs.targets);
        CollectionBase.prototype.merge.restore();
      });

    });

  });

  describe('#data', function () {

    it('omits related objects', function () {
      expect(relations.data({relations: {foo: {}}}, {foo: 'bar'}))
        .to.not.have.property('foo');
    });

  });

});