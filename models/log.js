var async = require('async');

var mongodb = require('./db');

var LOGNAME = require('../settings').LOGNAME;

var Log = function () {};

Log.prototype.add = function (username, time, operation, book, link, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(LOGNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.insert({
                'username': username,
                'time': time,
                'operation': operation,
                'book': book,
                'link': link
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        mongodb.close();
        err ? callback(err) : callback(null);
    });
};

Log.prototype.getAll = function (option, callback) {
    if (!option) {
        option = {};
    }
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(LOGNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.find(option).sort({
                time: -1
            }).toArray(function (err, logs) {
                cb(err, logs);
            });
        }
    ], function (err, result) {
        mongodb.close();
        if (err) {
            return callback(err, {});
        }
        return callback(err, result);
    });
};

module.exports = Log;