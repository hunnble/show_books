var async = require('async');
var markdown = require('markdown').markdown;

var mongodb = require('./db');
var url = require('../settings').url;
var BOOKNAME = require('../settings').BOOKNAME;

function Book () {
    this.perPage = 5;
}

Book.prototype.get = function (name, author, username, callback) {
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
            collection.findOne({
                'name': name,
                'author': author,
                'username': username
            }, function (err, user) {
                cb(err, user, db);
            });
        }
    ], function (err, result, db) {
        db.close();
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
        db.close();
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
        db.close();
        if (err) {
            return callback(err);
        }
        return callback(err, result[0], result[1]);
    });
};

Book.prototype.remove = function (name, author, username, callback) {
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
            collection.remove({
                'name': name,
                'author': author,
                'username': username
            }, {
                w: 1
            }, function (err) {
                cb(err, db);
            });
        }
    ], function (err, db) {
        db.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

Book.prototype.addComment = function (name, author, comment, username, callback) {
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
                'name': name,
                'author': author,
                'username': username
            }, {
                $push: {
                    'comments': {
                        '_id': (new Date()).getTime(),
                        'comment': comment
                    }
                }
            }, function (err) {
                cb(err, db);
            });
        }
    ], function (err, db) {
        db.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

Book.prototype.removeComment = function (name, author, commentId, username, callback) {
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
                'name': name,
                'author': author,
                'username': username
            }, {
                $pull: {
                    'comments': {
                        '_id': Number(commentId)
                    }
                }
            }, function (err) {
                cb(err, db);
            });
        }
    ], function (err, db) {
        db.close();
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};

module.exports = Book;