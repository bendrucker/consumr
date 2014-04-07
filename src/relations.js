'use strict';

var _          = require('lodash');
var inflection = require('inflection');
var Collection = require('./collection');

var internals = {};

internals.key = function (Model) {
  return Model.prototype.name + '_id';
};

internals.name = function (Target, single) {
  return single ? Target.prototype.name : inflection.pluralize(Target.prototype.name);
};

internals.relation = function (type, Target) {
  this.prototype.relations = this.prototype.relations || {};
  var single = internals.isSingle(type);
  this.prototype.relations[internals.name(Target, single)] = {
    type: type,
    model: Target,
    key: single ? internals.key(Target) : null,
    single: single
  };
  return this;
};

internals.isSingle = function (type) {
  return type !== 'hasMany';
};

exports.belongsTo = function (Target) {
  return internals.relation.call(this, 'belongsTo', Target);
};

exports.hasMany = function (Target) {
  return internals.relation.call(this, 'hasMany', Target);
};

internals.forEachRelation = function (callback) {
  for (var relation in this.relations) {
    callback.call(this, relation, this.relations[relation], this[relation]);
  }
};

internals.isDefined = function (value) {
  return typeof value !== 'undefined' && value !== null;
};

exports.update = function (attributes) {
  internals.forEachRelation.call(this, function (name, relation, related) {
    var id = attributes[relation.key];
    var relatedObj = attributes[name];

    if (relation.single && internals.isDefined(id)) {
      if (related) {
        related.set({id: id});
      } else {
        related = new relation.model({id: id});
        this[name] = related;
      }

      if (relatedObj) {
        related.set(relatedObj);
      }
    }

    if (!relation.single && relatedObj) {
      if (related) {
        related.merge(relatedObj);
      } else if (relatedObj) {
        var collection = new Collection();
        collection.model = relation.model;
        collection.merge(relatedObj);
        this[name] = collection;
      }
    }

  });

  return _.omit(attributes, Object.keys(this.relations));
};