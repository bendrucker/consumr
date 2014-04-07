'use strict';

var _          = require('lodash');
var inflection = require('inflection');
var Collection = require('./collection');

var internals = {};

internals.key = function (Model) {
  return Model.prototype.idAttribute || Model.prototype.name + '_id';
};

internals.name = function (Target, single) {
  return single ? Target.prototype.name : inflection.pluralize(Target.prototype.name);
};

internals.relation = function (Model, type, Target) {
  var relations = Model.prototype.relations = Model.prototype.relations || {};
  var single = internals.isSingle(type);
  relations[internals.name(Target, single)] = {
    type: type,
    model: Target,
    key: single ? internals.key(Target) : null
  };
  return Model;
};

internals.isSingle = function (type) {
  return type !== 'hasMany';
};

exports.belongsTo = function (Target) {
  return internals.relation(this, 'belongsTo', Target);
};

exports.hasMany = function (Target) {
  return internals.relation(this, 'hasMany', Target);
};

internals.forEachRelation = function (model, callback) {
  for (var relation in model.relations) {
    callback.call(model, relation, model.relations[relation], model[relation]);
  }
};

internals.isDefined = function (value) {
  return typeof value !== 'undefined' && value !== null;
};

exports.update = function (model, data) {
  internals.forEachRelation(model, function (name, relation) {

    var relatedId = data[relation.key];
    var relatedData = data[name];
    var related = model[name];

    if (internals.isSingle(relation.type)) {
      if (!related && (internals.isDefined(relatedId) || relatedData)) {
        related = model[name] = new relation.model();
      }
      if (internals.isDefined(relatedId)) related.set({id: relatedId});
      if (relatedData) related.set(relatedData);
    }

    if (!internals.isSingle(relation.type) && relatedData) {
      if (related) {
        related.merge(relatedData);
      } else {
        related = model[name] = new Collection(relation.model).merge(relatedData);
      }
    }

  });
};

exports.data = function (model, data) {
  return _.omit(data, Object.keys(model.relations || {}));
};