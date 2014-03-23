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

  describe('Model', function () {

    var user;
    beforeEach(function () {
      user = new User({id: 0});
    });

    var requestEvents = ['preRequest', 'postRequest', 'preResponse', 'postResponse'];

    var verifyRequestEvents = function (action) {
      var spy = sinon.spy();
      requestEvents.forEach(function (event) {
        user.on(event, spy);
      });
      return user[action].call(user).then(function () {
        expect(spy.callCount).to.equal(requestEvents.length);
      });
    };

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
        return verifyRequestEvents('fetch');
      });

    });

  });

});

