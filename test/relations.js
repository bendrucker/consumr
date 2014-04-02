'use strict';

var relations = require('../src/relations');

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
    expect(Model.prototype.relations).to.have.property('target')
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

    describe('With a related model', function () {

      var model;
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

    // describe('With a related collection');

  });

});