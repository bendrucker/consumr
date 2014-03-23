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
  before(function () {
    api = nock('http://testendpoint.api');
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

      beforeEach(function () {
        api
          .get('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
      });

      it('fetches the model data from the server', function () {
        return user
          .fetch()
          .bind(user)
          .then(function (user) {
            expect(user).to.equal(this)
              .and.to.have.property('name', 'Ben');
          });
      });

      it('triggers lifecycle events', function () {
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

  });

});