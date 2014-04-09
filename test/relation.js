'use strict';

var Relation       = require('../src/relation');
var CollectionBase = require('../src/collection');

describe('Relation', function () {

  describe('Constructor', function () {

    it('accepts a type', function () {
      expect(new Relation('type').type).to.equal('type');
    });

    it('accepts a target model', function () {
      expect(new Relation(null, 'Target').target).to.equal('Target');
    });

    it('applies a set of options', function () {
      expect(new Relation(null, null, {
        foo: 'bar'
      })).to.have.property('foo', 'bar');
    });

  });

  var relation;
  beforeEach(function () {
    relation = new Relation();
  });

  describe('#initialize', function () {

    beforeEach(function () {
      relation.target = sinon.spy();
      relation.target.prototype.name = 'target';
    });

    describe('isSingle', function () {

      beforeEach(function () {
        sinon.stub(relation, 'isSingle').returns(true);
      });

      it('creates a target model', function () {
        expect(relation.initialize({target_id: 0})).to.be.an.instanceOf(relation.target);
        expect(relation.target).to.have.been.calledWithNew;
        expect(relation.target).to.have.been.calledWithMatch({id: 0});
      });

      it('can use a custom key', function () {
        relation.key = 'foo_id';
        relation.initialize({foo_id: 0});
        expect(relation.target).to.have.been.calledWithMatch({id: 0});
      });

    });

    describe('!isSingle', function () {

      beforeEach(function () {
        sinon.stub(relation, 'isSingle').returns(false);
      });

      it('creates a target collection', function () {
        var collection = relation.initialize({name: 'foo', id: 0});
        expect(collection).to.be.an.instanceOf(CollectionBase);
        expect(collection.model).to.equal(relation.target);
        expect(collection.attributes).to.contain({
          foo_id: 0
        });
      });

      it('can use a custom foreign key', function () {
        relation.foreignKey = 'bar_id';
        expect(relation.initialize({name: 'foo', id: 0}).attributes)
          .to.have.property('bar_id', 0);
      });

    });

  });

  describe('#isSingle', function () {

    it('is truthy for belongsTo', function () {
      expect(new Relation('belongsTo').isSingle()).to.be.ok;
    });

    it('is falsy for hasMany', function () {
      expect(new Relation('hasMany').isSingle()).to.not.be.ok;
    });

  });

});