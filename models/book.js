var async = require('async');
var markdown = require('markdown').markdown;

var mongodb = require('./db');
var url = require('../settings').url;
var BOOKNAME = require('../settings').BOOKNAME;

function Book () {
  this.perPage = 30;
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

Book.prototype.getAll = function (op, con, callback) {
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
      collection.count(op, function (err, total) {
        cb(err, collection, db, total);
      });
    },
    function (collection, db, total, cb) {
      collection.find(op, {
        'skip': self.perPage * (con.page - 1),
        'limit': self.perPage
      }).sort({
        'time': -1
      }).toArray(function (err, books) {
        books.forEach(function (book) {
          book.comments && book.comments.forEach(function (comment, index) {
            book.comments[index].comment = markdown.toHTML(comment.comment);
          });
          if (!book.img) {
            delete book.img;
          }
        });
        cb(err, books, total, db);
      });
    }
  ], function (err, result, total, db) {
    db && db.close();
    if(err) {
      return callback(err);
    }
    callback(null, result, total);
  });
};

Book.prototype.add = function (op, callback) {
  var book = op;

  book.time = new Date();
  book.comments = [];

  if (!book.name || !book.author) {
    return callback(new Error('无效的书名'));
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

Book.prototype.getUserAll = function (op, page, callback) {
  var self = this;
  var username = op.username;
  var con = {};
  con.skip = op.limit ? 0 : self.perPage * (page - 1);
  if (op.limit) {
    con.limit = op.limit;
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
      collection.count({
        'username': username
      }, function (err, total) {
        cb(err, collection, db, total);
      });
    },
    function (collection, db, total, cb) {
      collection.find({
        'username': username
      }, con).sort({
        'time': -1
      }).toArray(function (err, books) {
        books.forEach(function (book) {
          book.comments && book.comments.forEach(function (comment, index) {
            book.comments[index].comment = markdown.toHTML(comment.comment);
          });
          if (!book.img) {
            delete book.img;
          }
        });
        cb(err, [books, total], db);
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

Book.prototype.addComment = function (op, data, callback) {
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
            'comment': data.comment,
            'isPrivate': data.isPrivate || false
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
