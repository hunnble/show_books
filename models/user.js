var async = require('async');
var crypto = require('crypto');

var mongodb = require('./db');

var USERNAME = require('../settings').USERNAME;

function User () {}

User.prototype.get = function (name, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(USERNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.findOne({
                'name': name
            }, function (err, user) {
                cb(err, user);
            });
        }
    ], function (err, result) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        callback(err, result);
    });
};

User.prototype.add = function (name, password, email, callback) {
    var email_md5 = crypto.createHash('md5').update(email.toLowerCase()).digest('hex'),
        head = 'http://www.gravatar.com/avatar/' + email_md5 + '?s=48',
        user = {
            'name': name.trim(),
            'password': crypto.createHash('md5').update(password).digest('hex'),
            'email': email_md5,
            'head': head
        };

    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(USERNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                cb(err, user);
            });
        }
    ], function (err, result) {
        mongodb.close();
        if (err) {
            return callback(err);
        }
        callback(err, result[0]);
    });
};

User.prototype.remove = function (name, password, email, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(USERNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.remove({
                'name': name,
                'password': crypto.createHash('md5').update(password).digest('hex'),
                'email': email
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
        callback(null);
    });
};

User.prototype.update = function (name, password, email, callback) {
    async.waterfall([
        function (cb) {
            mongodb.open(function (err, db) {
                cb(err, db);
            });
        },
        function (db, cb) {
            db.collection(USERNAME, function (err, collection) {
                cb(err, collection);
            });
        },
        function (collection, cb) {
            collection.update({
                'name': name,
                'email': email
            }, {
                $set: {
                    'password': crypto.createHash('md5').update(password).digest('hex')
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
        callback(null);
    });
};

module.exports = User;