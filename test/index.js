'use strict';

var Consumr = require('../src');

describe('Consumr', function () {

  it('exposes the Model', function () {
    expect(Consumr).to.respondTo('Model');
  });

  it('exposes the Collection', function () {
    expect(Consumr).to.respondTo('Collection');
  });

  describe('#use', function () {

    var plugin, options;
    beforeEach(function () {
      plugin = sinon.stub();
      options = {};
    });

    it('calls the plugin with Consumr and options', function () {
      Consumr.use(plugin);
      expect(plugin).to.have.been.calledWith(Consumr, options);
    });

    it('returns Consumr for chaining', function () {
      expect(Consumr.use(plugin)).to.equal(Consumr);
    });

    it('passes empty options if none are defined', function () {
      Consumr.use(plugin);
      expect(plugin.firstCall.args[1]).to.be.empty;
    });

  });

});