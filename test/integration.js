'use strict';

var Consumr = require('..');

describe('Integration', function () {

  var Author, Post, Comment;
  beforeEach(function () {
    Author = Consumr.Model.extend({
      name: 'author',
      relations: {
        posts: function () {
          return this.hasMany(Post);
        }
      }
    });
    Post = Consumr.Model.extend({
      name: 'post',
      relations: {
        author: function () {
          return this.belongsTo(Author);
        },
        comments: function () {
          return this.hasMany(Comment);
        }
      }
    });
    Comment = Consumr.Model.extend({
      name: 'comment',
      relations: {
        post: function () {
          return this.belongsTo(Post);
        }
      }
    });
  });

  it('can handle basic data', function () {
    expect(new Author({name: 'Ben'})).to.have.property('name', 'Ben');
  });

  it('treats relational keys as data unless specified', function () {
    expect(new Post({author_id: 0})).to.not.have.a.property('author');
  });

  it('can create simple local key relations', function () {
    expect(new Post({author_id: 0}, {withRelated: ['author']}))
      .to.have.property('author')
      .that.is.an.instanceOf(Author)
      .with.property('id', 0);
  });

  it('can instantiate a related model without a reference on the creator', function () {
    var post = new Post({author_id: 0});
    var author = post.related('author');
    expect(author)
      .to.be.an.instanceOf(Author)
      .with.property('id', 0);
    expect(post).to.not.have.property('author');
  });

  it('can parse relations that have keys and associated objects', function () {
    expect(new Post({
      author_id: 0,
      author: {
        name: 'Ben'
      }
    }, {
      withRelated: ['author']
    }))
    .to.have.property('author')
    .and.contain({
      id: 0,
      name: 'Ben'
    });
  });

  it('can parse relations with only an associated object', function () {
    expect(new Post({
      author: {
        id: 0,
        name: 'Ben'
      }
    }, {
      withRelated: ['author']
    }).author)
    .to.contain({
      id: 0,
      name: 'Ben'
    });
  });

});