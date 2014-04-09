'use strict';

var _          = require('lodash');
var Collection = require('./collection');

var Relation = function (type, Target, options) {
  this.type = type;
  this.target = Target;
  _.extend(this, options);
};

Relation.prototype.initialize = function (parent) {
  if (this.isSingle()) {
    return new this.target({
      id: this.key ? parent[this.key] : parent[this.target.prototype.name + '_id']
    });
  } else {
    var attributes = {};
    attributes[this.foreignKey || parent.name + '_id'] = parent.id;
    return new Collection(this.target, attributes);
  }
};

Relation.prototype.isSingle = function () {
  return this.type === 'belongsTo';
};

module.exports = Relation;