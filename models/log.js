var async = require('async');

var mongodb = require('./db');
var url = require('../settings').url;
var LOGNAME = require('../settings').LOGNAME;

var Log = function () {
    this.perPage = 15;
    this.maxPage = 3;
};

Log.prototype.add = function (username, time, operation, book, link, callback) {
    async.waterfall([
        function (cb) {
            mongodb.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(LOGNAME, function (err, collection) {
                cb(err, collection, db);
            });
        },
        function (collection, db, cb) {
            collection.insert({
                'username': username,
                'time': time,
                'operation': operation,
                'book': book,
                'link': link
            }, function (err) {
                cb(err, db);
            });
        }
    ], function (err, db) {
        db && db.close();
        err ? callback(err) : callback(null);
    });
};

Log.prototype.getAll = function (option, page, callback) {
    var self = this;

    if (page > self.maxPage) {
        page = self.maxPage;
    }

    if (!option) {
        option = {};
    }
    async.waterfall([
        function (cb) {
            mongodb.connect(url, function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(LOGNAME, function (err, collection) {
                cb(err, collection, db);
            });
        },
        function (collection, db, cb) {
            collection.count(option, function (err, total) {
                collection.find(option, {
                    'skip': (page - 1) * self.perPage,
                    'limit': self.perPage
                }).sort({
                    'time': -1
                }).toArray(function (err, logs) {
                    cb(err, [logs, Math.min(total, self.perPage * self.maxPage), page], db);
                });
            });
        }
    ], function (err, result, db) {
        db && db.close();
        if (err) {
            return callback(err, {});
        }
        return callback(err, result[0], result[1], result[2]);
    });
};

module.exports = Log;