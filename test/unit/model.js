'use strict';

var Model  = require('../../src/model');
var needle = require('needle');

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

  describe('#reset', function () {

    it('removes properties from the model', function () {
      model.foo = 'bar';
      model.reset();
      expect(model).to.not.have.property('foo');
    });

    it('does not touch prototype methods', function () {
      model.reset();
      expect(model).to.respondTo('fetch');
    });

  });

  describe('#fetch', function () {

    beforeEach(function () {
      model.id = 0;
    });

    beforeEach(function () {
      sinon.stub(needle, 'getAsync').resolves({
        body: {
          foo: 'bar'
        }
      });
    });

    afterEach(function () {
      needle.getAsync.restore();
    });

    it('cannot be fetched when isNew', function () {
      model.id = undefined;
      return expect(model.fetch()).to.be.rejectedWith(/Cannot fetch/);
    });

    it('GETs the model url', function  () {
      return model.fetch().finally(function () {
        expect(needle.getAsync).to.have.been.calledWith(model.url());
      });
    });

    it('populates the model with the response body', function () {
      return model.fetch().then(function (model) {
        expect(model).to.have.property('foo', 'bar');
      });
    });

  });

  describe('#save', function () {

    beforeEach(function () {
      model.id = 0;
    });

    beforeEach(function () {
      sinon.stub(needle, 'requestAsync').resolves({
        body: {
          id: 0,
          foo: 'bar'
        }
      });
    });

    afterEach(function () {
      needle.requestAsync.restore();
    });

    it('runs a POST when isNew', function () {
      model.id = undefined;
      return model.save().finally(function () {
        expect(needle.requestAsync).to.have.been.calledWith('POST');
      });
    });

    it('runs a PUT when !isNew', function () {
      return model.save().finally(function () {
        expect(needle.requestAsync).to.have.been.calledWith('PUT');
      });
    });

    it('sends the model as JSON to the url', function () {
      return model.save().finally(function () {
        expect(needle.requestAsync).to.have.been.calledWith('PUT', model.url(), model, sinon.match.has('json', true));
      });
    });

    it('populates the model with the response body', function () {
      return model.save().finally(function () {
        expect(model).to.have.property('foo', 'bar');
      });
    });

  });
  
});