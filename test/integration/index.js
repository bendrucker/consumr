'use strict';

var ModelBase = require('../../src/model');
var nock      = require('nock');

describe('Integration', function () {

  var User;
  beforeEach(function () {
    User = function (attributes) {
      ModelBase.call(this, attributes);
    };
    User.collection = ModelBase.collection;
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

  describe('Collection', function () {

    var users, user;
    beforeEach(function () {
      users = User.collection();
      user = new User({id: 0});
      users.push(user);
    });

    it('is an array of models', function () {
      expect(users).to.have.length(1).and.property('0', user);
    });

    describe('#fetch', function () {

      beforeEach(function () {
        api
          .get('/users')
          .reply(200, [
            {
              id: 0,
              name: 'Ben'
            },
            {
              id: 1,
              name: 'Drucker'
            }
          ]);
      });

      it('updates the array with the response', function () {
        return users.fetch().finally(function () {
          expect(users).to.have.length(2);
        });
      });

      it('updates existing models in place', function () {
        return users.fetch().finally(function () {
          expect(users[0]).to.equal(user).and.to.have.property('name', 'Ben');
        });
      });

      it('adds new models', function () {
        return users.fetch().finally(function () {
          expect(users[1]).to.contain({id: 1, name: 'Drucker'});
        });
      });

      it('triggers request lifecycle events', function () {
        return verifyRequestEvents(users, 'fetch');
      });

    });

  });

});