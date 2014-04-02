'use strict';

var relations = require('../src/relations');

describe('Relations', function () {

  var Model, Target;
  beforeEach(function () {
    Model = function () {};
    Target = function () {};
    Target.prototype.name = 'target';
  });

  describe('#belongsTo / #hasOne / #hasMany', function () {

    it('can create a belongsTo relation', function () {
      relations.belongsTo.call(Model, Target);
      expect(Model.prototype.relations).to.have.property('target')
        .that.deep.equals({
          type: 'belongsTo',
          model: Target,
          key: 'target_id'
        });
    });

    it('can create a hasOne relation', function () {
      relations.hasOne.call(Model, Target);
      expect(Model.prototype.relations).to.have.property('target')
        .that.deep.equals({
          type: 'hasOne',
          model: Target,
          key: 'target_id'
        });
    });

    it('can create a hasMany relation', function () {
      relations.hasMany.call(Model, Target);
      expect(Model.prototype.relations).to.have.property('target')
        .that.deep.equals({
          type: 'hasMany',
          model: Target,
          key: null
        });
    });

  });

});