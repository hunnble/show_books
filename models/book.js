var async = require('async');
var markdown = require('markdown').markdown;

var mongodb = require('./db');
var url = require('../settings').url;
var BOOKNAME = require('../settings').BOOKNAME;

function Book () {
  this.perPage = 100;
}

Book.prototype.get = function (op, callback) {
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.findOne(op, function (err, result) {
        cb(err, result, db);
      });
    }
  ], function (err, result, db) {
    db && db.close();
    if(err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Book.prototype.add = function (op, callback) {
  var book = {
    'bookId': op.bookId,
    'isbn10': op.isbn10,
    'isbn13': op.isbn13,
    'name': op.name.trim().split(/\s+/).join(''),
    'author': op.author.trim().split(/\s+/).join(''),
    'username': op.username,
    'img': op.img,
    'comments': [],
    'time': new Date()
  };

  if (!book.name || !book.author) {
    return callback(new Error('无效的书名或作者名'));
  }

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.insert(book, {
        save: true
      }, function (err) {
        cb(err, db);
      });
    }
  ], function (err, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

Book.prototype.getAll = function (username, page, callback) {
  var self = this;

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.count({
        'username': username
      }, function (err, total) {
        collection.find({
          'username': username
        },{
          'skip': (page - 1) * self.perPage,
          'limit': self.perPage
        }).sort({
          'time': -1
        }).toArray(function (err, books) {
          books.forEach(function (book) {
            book.comments.forEach(function (comment, index) {
              book.comments[index].comment = markdown.toHTML(comment.comment);
            });
          });
          cb(err, [books, total], db);
        });
      });
    }
  ], function (err, result, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    return callback(err, result[0], result[1]);
  });
};

Book.prototype.remove = function (op, callback) {
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.remove(op, {
        w: 1
      }, function (err) {
        cb(err, db);
      });
    }
  ], function (err, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

Book.prototype.addComment = function (op, comment, callback) {
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.update(op, {
        $push: {
          'comments': {
            '_id': (new Date()).getTime(),
            'comment': comment,
            'isPrivate': op.isPrivate || false
          }
        }
      }, function (err, result) {
        cb(err, result, db);
      });
    }
  ], function (err, result, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};

Book.prototype.removeComment = function (op, callback) {
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.update({
        'name': op.name,
        'username': op.username
      }, {
        $pull: {
          'comments': {
            '_id': Number(op.commentId)
          }
        }
      }, function (err) {
        cb(err, db);
      });
    }
  ], function (err, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};

module.exports = Book;
