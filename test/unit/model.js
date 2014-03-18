'use strict';

var Model = require('../../src/model');

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
  });

  describe('Constructor', function () {

    it('sets up attributes', function () {
      expect(new Model({foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });

  describe('#isNew', function () {

    it('is not new if the model has an id', function () {
      model.id = 0;
      expect(model.isNew()).to.be.false;
    });

    it('is new if the id is undefined', function () {
      model.id = undefined;
      expect(model.isNew()).to.be.true;
    });

    it('is new if the id is null', function () {
      model.id = null;
      expect(model.isNew()).to.be.true;
    });

  });

  describe('#url', function () {

    beforeEach(function () {
      model.base = 'http://base';
      model.path = 'model';
    });

    it('is the collection endpoint for new models', function () {
      expect(model.url()).to.equal('http://base/model');
    });

    it('is the model endpoint for persisted models', function () {
      model.id = 0;
      expect(model.url()).to.equal('http://base/model/0');
    });

  });
  
});