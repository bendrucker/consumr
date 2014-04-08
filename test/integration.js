var Consumr = require('..');

describe('Integration', function () {

  var Author, Post, Comment;
  beforeEach(function () {
    Author = Consumr.Model.extend({
      name: 'author'
    });
    Post = Consumr.Model.extend({
      name: 'post'
    });
    Comment = Consumr.Model.extend({
      name: 'comment'
    });
    Post.belongsTo(Author);
    Post.hasMany(Comment);
    Author.hasMany(Post);
    Comment.belongsTo(Post);
  });
});