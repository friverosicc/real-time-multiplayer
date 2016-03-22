'use strict';
var Connection = require('./connection');

var MySQLPool = function(mysql, configDatabase) {
    var _pool = mysql.createPool(configDatabase);

    function getConnection() {
        var promise = new Promise(function(resolve, rejec) {
            _pool.getConnection(function(err, connection) {
                if(err)
                    reject(err);
                else
                    resolve(Connection(connection));
            });
        });

        return promise;
    }

    function beginTransaction() {
        return getConnection()
        .then(function(connection) {
            var promise = new Promise(function(resolve, reject) {
                connection.beginTransaction()
                .then(function() {
                    resolve(connection);
                })
                .catch(function(err) {
                    reject(err);
                });
            });

            return promise;
        });
    }

    return {
        getConnection: getConnection,
        beginTransaction: beginTransaction
    };
};

module.exports = MySQLPool;
