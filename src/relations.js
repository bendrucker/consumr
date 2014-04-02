'use strict';

var _ = require('lodash');

var internals = {};

internals.key = function (Model) {
  return Model.prototype.name + '_id';
};

internals.relation = function (type, Target) {
  this.prototype.relations = this.prototype.relations || {};
  this.prototype.relations[Target.prototype.name] = {
    type: type,
    model: Target,
    key: internals.isSingle(type) ? internals.key(Target) : null
  };
  return this;
};

internals.isSingle = function (type) {
  return type !== 'hasMany';
};

exports.belongsTo = function (Target) {
  return internals.relation.call(this, 'belongsTo', Target);
};

exports.hasOne = function (Target) {
  return internals.relation.call(this, 'hasOne', Target);
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

    if (internals.isDefined(id)) {
      if (related && related.id === id) {
        related.set({id: id});
      } else {
        related = new relation.model({id: id});
        this[name] = related;
      }

      if (relatedObj) {
        related.set(relatedObj);
      }
    }

  });

  return _.omit(attributes, Object.keys(this.relations));
};