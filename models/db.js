var settings = require('../settings'),
    mongodb = require('mongodb'),
    Db = mongodb.Db;

// module.exports = new Db(settings.db, new mongodb.Server(settings.host, settings.port), {safe: true});
module.exports = mongodb.MongoClient;
