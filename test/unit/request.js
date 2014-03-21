var Request  = require('../../src/request');
var needle   = require('needle');
var response = require('../../src/response');

describe('Request', function () {

  it('is an event emitter', function () {
    expect(Request).to.respondTo('emit');
  });

  it('mixes in emitThen', function () {
    expect(Request).to.respondTo('emitThen');
  });

  describe('Constructor', function () {

    it('accepts the method, URL, data, and options', function () {
      expect(new Request('m', 'u', 'd', 'o'))
        .to.contain({
          method: 'm',
          url: 'u',
          data: 'd',
          options: 'o'
        });
    });

    it('can be instantiated without options', function () {
      expect(new Request()).to.have.property('options').that.is.empty;
    });

  });

  var request;
  beforeEach(function () {
    request = new Request();
  });

  var spy;
  beforeEach(function () {
    spy = sinon.spy();
  });

  describe('#send', function () {

    beforeEach(function () {
      sinon.stub(needle, 'requestAsync').resolves({
        statusCode: 200,
        body: {}
      });
    });

    it('emits a request event with the request and options', function () {
      return request
        .on('request', spy)
        .send()
        .finally(function () {
          expect(spy).to.have.been.calledWith(request, request.options);
        });
    });

  });

});