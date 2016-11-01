var async = require('async');
var crypto = require('crypto');
var mongodb = require('./db');
var url = require('../settings').url;
var USERNAME = require('../settings').USERNAME;

function User () {}

User.prototype.get = function (name, callback) {
  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(USERNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.findOne({
        'name': name
      }, function (err, user) {
        cb(err, user, db);
      });
    }
  ], function (err, user, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    callback(err, user);
  });
};

User.prototype.add = function (op, callback) {
  var email_md5 = crypto.createHash('md5').update(op.email.toLowerCase()).digest('hex');

  op.img = 'http://www.gravatar.com/avatar/' + email_md5 + '?s=80';
  op.password = crypto.createHash('md5').update(op.password).digest('hex');

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(USERNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.insert(op, {
        safe: true
      }, function (err, user) {
        cb(err, user, db);
      });
    }
  ], function (err, result, db) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    callback(err, result[0]);
  });
};

User.prototype.remove = function (op, callback) {
  op.password = crypto.createHash('md5').update(op.password).digest('hex');

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(USERNAME, function (err, collection) {
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
  ], function (err) {
    db && db.close();
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

User.prototype.update = function (op, callback) {
  if (op.password) {
    op.password = crypto.createHash('md5').update(op.password).digest('hex');
  }

  async.waterfall([
    function (cb) {
      mongodb.connect(url, function (err, db) {
        cb(err, db);
      });
    },
    function (db, cb) {
      db.collection(USERNAME, function (err, collection) {
        cb(err, collection, db);
      });
    },
    function (collection, db, cb) {
      collection.update({
        'name': op.name
      }, {
        $set: op
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

module.exports = User;
