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
      expect(new Request('method', 'url', 'data', 'options'))
        .to.contain({
          method: 'method',
          url: 'url',
          data: 'data',
          options: 'options'
        });
    });

    it('defaults to json: true for options', function () {
      expect(new Request().options).to.contain({json: true});
    });

  });

  var request;
  beforeEach(function () {
    request = new Request('method', 'url', 'data');
  });

  var spy;
  beforeEach(function () {
    spy = sinon.spy();
  });

  describe('#send', function () {

    var res;
    beforeEach(function () {
      res = {
        statusCode: 200,
        body: {}
      };
      sinon.stub(needle, 'requestAsync').resolves(res);
    });

    afterEach(function () {
      needle.requestAsync.restore();
    });

    it('emits a request event with the request and options', function () {
      return request
        .on('request', spy)
        .send()
        .finally(function () {
          expect(spy).to.have.been.calledWith(request, request.options);
        });
    });

    it('calls needle.requestAsync', function () {
      return request.send().finally(function () {
        expect(needle.requestAsync).to.have.been.calledWith('method', 'url', 'data');
      });
    });

    it('excludes unneeded options from needle', function () {
      request.options.foo = 'bar';
      return request.send().finally(function () {
        expect(needle.requestAsync.firstCall.args[3]).to.not.contain.keys('foo');
      });
    });

    it('emits a response event with the needle response', function () {
      return request
        .on('response', spy)
        .send()
        .finally(function () {
          expect(spy).to.have.been.calledWith(res);
        });
    });

    it('parses the response', function () {
      sinon.stub(response, 'parse');
      return request
        .send()
        .finally(function () {
          expect(response.parse).to.have.been.calledWith(request.response);
          response.parse.restore();
        });
    });

  });

});