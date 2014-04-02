'use strict';

var internals = {};

internals.relation = function (type, Target) {
  this.prototype.relations = this.prototype.relations || {};
  this.prototype.relations[Target.prototype.name] = {
    type: type,
    model: Target
  };
  return this;
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