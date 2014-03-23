'use strict';

var Request    = require('request2');
var Model      = require('../../src/model');
var Collection = require('../../src/collection');

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new Model();
  });

  it('is an EventEmitter', function () {
    expect(model).to.respondTo('emit');
  });

  it('uses emitThen', function () {
    expect(model).to.respondTo('emitThen');
  });

  describe('Constructor', function () {

    it('sets up attributes', function () {
      expect(new Model({foo: 'bar'})).to.have.property('foo', 'bar');
    });

  });

  describe('Model#collection', function () {

    it('instantiates a new collection with the model', function () {
      expect(Model.collection()).to.be.an.instanceOf(Collection)
        .and.to.have.property('model', Model);
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

  describe('#set', function () {

    it('copies an object to the model', function () {
      expect(model.set({
        foo: 'bar'
      }))
      .to.have.property('foo', 'bar');
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

  describe('REST Methods', function () {

    beforeEach(function () {
      model.id = 0;
    });

    var send;
    beforeEach(function () {
      send = sinon.stub(Request.prototype, 'send').resolves({
        foo: 'bar'
      });
    });

    afterEach(function () {
      send.restore();
    });

    describe('#fetch', function () {

      it('cannot be fetched when isNew', function () {
        model.id = undefined;
        return expect(model.fetch()).to.be.rejectedWith(/Cannot fetch/);
      });

      it('GETs the model url', function  () {
        return model.fetch().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('url', model.url()));
        });
      });

      it('populates the model with the response body', function () {
        return model.fetch().then(function (model) {
          expect(model).to.have.property('foo', 'bar');
        });
      });

    });

    describe('#save', function () {

      it('runs a POST when isNew', function () {
        model.id = undefined;
        return model.save().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('method', 'POST'));
        });
      });

      it('runs a PUT when !isNew', function () {
        return model.save().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('method', 'PUT'));
        });
      });

      it('sends the model as the request data', function () {
        return model.save().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('data', sinon.match.has('id')));
        });
      });

      it('strips internal properties before sending', function () {
        return model
          .on('preRequest', function (request) {
            expect(request.data).to.not.have.property('_events');
          })
          .save();
      });

      it('populates the model with the response body', function () {
        return model.save().finally(function () {
          expect(model).to.have.property('foo', 'bar');
        });
      });

    });

    describe('#destroy', function () {

      it('cannot be destroyed when isNew', function () {
        model.id = undefined;
        return expect(model.destroy()).to.be.rejectedWith(/Cannot destroy/);
      });

      it('DELETEs the model url', function  () {
        var url = model.url();
        return model.destroy().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('url', sinon.match(/\/0$/)));
        });
      });

      it('resets the model', function  () {
        return model.destroy().finally(function () {
          expect(model).to.not.have.property('id');
        });
      });

    });

  });
  
});