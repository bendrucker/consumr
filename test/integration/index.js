'use strict';

var ModelBase = require('../../src/model');
var nock      = require('nock');

describe('Integration', function () {

  var User;
  beforeEach(function () {
    User = function (attributes) {
      ModelBase.call(this, attributes);
    };
    User.prototype = Object.create(ModelBase.prototype);
  });

  beforeEach(function () {
    User.prototype.base = 'http://testendpoint.api';
    User.prototype.path = 'users';
  });

  var api;
  beforeEach(function () {
    api = nock('http://testendpoint.api');
  });

  afterEach(function () {
    api.done();
  });

  after(function () {
    nock.cleanAll();
    nock.restore();
  });

  var requestEvents = ['preRequest', 'postRequest', 'preResponse', 'postResponse'];
  var verifyRequestEvents = function (target, action) {
    var spy = sinon.spy();
    requestEvents.forEach(function (event) {
      target.on(event, spy);
    });
    return target[action]().then(function () {
      expect(spy.callCount).to.equal(requestEvents.length);
    });
  };

  describe('Model', function () {

    var user;
    beforeEach(function () {
      user = new User({id: 0});
    });

    describe('#fetch', function () {

      var mockFetch = function () {
        api
          .get('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
      };

      it('fetches the model data from the server', function () {
        mockFetch();
        return user
          .fetch()
          .bind(user)
          .then(function (user) {
            expect(user).to.equal(this)
              .and.to.have.property('name', 'Ben');
          });
      });

      it('triggers lifecycle events', function () {
        mockFetch();
        return verifyRequestEvents(user, 'fetch');
      });

      it('can halt the request during a lifecycle event', function () {
        var err = new Error('stop');
        return expect(user
          .on('preRequest', function () {
            throw err;
          })
          .fetch())
          .to.be.rejectedWith(err);
      });

    });

    describe('#save', function () {

      it('triggers a POST for new models', function () {
        api
          .post('/users')
          .reply(201, {
            id: 1
          });
        user.id = null;
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('POST');
          })
          .save()
          .then(function (user) {
            expect(user).to.have.property('id', 1);
          });
      });

      it('triggers a PUT for new models', function () {
        api
          .put('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('PUT');
          })
          .save()
          .then(function (user) {
            expect(user).to.have.property('name', 'Ben');
          });
      });

      it('triggers lifecycle events', function () {
        api
          .put('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
        return verifyRequestEvents(user, 'save');
      });

    });

    describe('#destroy', function () {

      beforeEach(function () {
        api
          .delete('/users/0')
          .reply(200, '');
        });

      it('triggers a DELETE', function () {
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('DELETE');
          })
          .destroy()
          .then(function (user) {
            expect(user).to.not.have.property('id');
          });
      });

      it('triggers lifecycle events', function () {
        return verifyRequestEvents(user, 'destroy');
      });

    });

  });

});