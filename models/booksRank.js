var async = require('async');
var mongodb = require('./db');
var url = require('../settings').url;
var BOOKSRANK = require('../settings').BOOKSRANK;

function BooksRank () {}

BooksRank.prototype.getAll = function (op, callback) {
  op.key = op.key || 'collectTimes';
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKSRANK, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.find({}).toArray(function (err, books) {
        cb(err, books, db);
      });
    },
    function (books, db, cb) {
      books = books.map(function (book) {
        if (!book[op.key]) {
          book[op.key] = 0;
        }
        return book;
      }).sort(function (book1, book2) {
        return book2[op.key] - book1[op.key];
      }).slice(0, Math.min(10, books.length));
      cb(null, books, db);
    }
  ], function (err, books, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }

    callback(err, books);
  });
};

BooksRank.prototype.update = function (op, callback) {
  var incObj = {};

  if (op.searchTimes) {
    incObj.searchTimes = 1;
  }
  if (op.collectTimes) {
    incObj.collectTimes = 1;
  }

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(BOOKSRANK, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.updateOne({
        'name': op.name
      }, {
        $inc: incObj
      }, {
        upsert: true,
        safe: false
      }, function (err) {
        cb(err, db);
      });
    }
  ], function (err, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

module.exports = BooksRank;
