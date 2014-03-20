'use strict';

var response = require('../../src/response');

describe('Response', function () {

  describe('#parse', function () {

    describe('response.statusCode < 400', function () {

      it('returns the response body', function () {
        var res = {
          statusCode: 200,
          body: {
            foo: 'bar'
          }
        };
        expect(response.parse(res)).to.equal(res.body);
      });

    });


    describe('response.statusCode > 399', function () {

      var context;
      beforeEach(function () {
        context = {};
      });

      it('throws a ResponseError', function () {
        expect(response.parse.bind(context, {
          statusCode: 400
        })).to.throw(response.ResponseError);
      });

      it('appends the statusCode to the error', function () {
        expect(response.parse.bind(context, {
          statusCode: 400
        })).to.throw(sinon.match.has('statusCode', 400));
      });

      it('appends the body to the error', function () {
        expect(response.parse.bind(context, {
          statusCode: 400,
          body: {}
        })).to.throw(sinon.match.has('body'));
      });

      describe('errorProperty', function () {

        it('uses extracts the error message based on model.errorProperty', function () {
          context = {
            errorProperty: 'error'
          };
          expect(response.parse.bind(context, {
            statusCode: 400,
            body: {
              error: 'err'
            }
          })).to.throw('err');
        });

        it('can deep extract using dot notation', function () {
          context = {
            errorProperty: 'error.message'
          };
          expect(response.parse.bind(context, {
            statusCode: 400,
            body: {
              error: {
                message: 'err'
              }
            }
          })).to.throw('err');
        });

      });

      it('falls back to a statusCode dictionary name', function () {
        expect(response.parse.bind(context, {
          statusCode: 500,
        })).to.throw('Internal Server Error');
      });

    });

  });

});