module.exports = {
  Model: require('./model'),
  Collection: require('./collection'),
  use: function (plugin, options) {
    plugin(this, options || {});
    return this;
  }
};