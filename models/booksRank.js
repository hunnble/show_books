var async = require('async');
var mongodb = require('./db');
var url = require('../settings').url;
var BOOKSRANK = require('../settings').BOOKSRANK;

function BooksRank () {}

BooksRank.prototype.getAll = function (op, callback) {
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
      collection.find({}, function (err, result) {
        cb(err, result, db);
      });
    }
  ], function (err, result, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    result = result.sort(function (v1, v2) {
      return v2[op.key] - v1[op.key];
    });
    callback(err, result);
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
        console.log(err);
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
