var async = require('async');
var markdown = require('markdown').markdown;

var mongodb = require('./db');

var BOOKNAME = require('../settings').BOOKNAME;

function Book () {}

Book.prototype.get = function (name, author, username, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(BOOKNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.findOne({
                'name': name,
                'author': author,
                'username': username
            }, function (err, user) {
                cb(err, user);
            });
        }
    ], function (err, result) {
        mongodb.close();
        if(err) {
            return callback(err);
        }
        callback(null, result);
    });
};

Book.prototype.add = function (name, author, username, callback) {
    var book = {
        'name': name.trim().split(/\s+/).join(''),
        'author': author.trim().split(/\s+/).join(''),
        'username': username,
        'comments': [],
        'time': new Date()
    };

    if (!book['name'] || !book['author']) {
        return callback(new Error('无效的书名或作者名'));
    }

    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(BOOKNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.insert(book, {
                save: true
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

Book.prototype.getAll = function (username, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(BOOKNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.find({
                'username': username
            }).sort({
                time: -1
            }).toArray(function (err, books) {
                cb(err, books);
            });
        }
    ], function (err, result) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        return callback(err, result);
    });
};

Book.prototype.remove = function (name, author, username, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(BOOKNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.remove({
                'name': name,
                'author': author,
                'username': username
            }, {
                w: 1
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

Book.prototype.update = function (name, author, comment, username, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(BOOKNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.update({
                'name': name,
                'author': author,
                'username': username
            }, {
                $push: {
                    'comments': comment
                }
            }, function (err) {
                cb(err);
            });
        }
    ], function (err) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

module.exports = Book;