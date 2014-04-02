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

  // describe('#update', function () {

  //   beforeEach(function () {
  //     Model.prototype.set = sinon.spy();
  //   });

  //   describe('With a related model', function () {

  //     beforeEach(function () {
  //       relations.belongsTo()
  //     });

  //   });

  //   // describe('With a related collection');

  // });

});