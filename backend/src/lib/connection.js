'use strict';

var Connection = function(connection) {
    var _connection = connection;

    function beginTransaction() {
        var promise = new Promise(function(resolve, reject) {
            _connection.beginTransaction(function(err) {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });

        return promise;
    }

    function commit() {
        var promise = new Promise(function(resolve, reject) {
            _connection.commit(function(err) {
                if(err) {
                    reject(err);
                } else {
                    _connection.release();
                    resolve();
                }
            });
        });

        return promise;
    }

    function rollback(error) {
        var promise = new Promise(function(resolve, reject) {
            _connection.rollback(function() {
                _connection.release();
                reject(error);
            });
        });

        return promise;
    }

    function query(statement, values) {
        var promise = new Promise(function(resolve, reject) {
            _connection.query(statement, values, function(error, result) {
                if(error)
                    reject(error);
                else
                    resolve(result);
            });
        });

        return promise;
    }

    function release(data) {
        _connection.release();
        return Promise.resolve(data);
    }

    return {
        beginTransaction: beginTransaction,
        commit: commit,
        rollback: rollback,
        query: query,
        release: release
    };

};

module.exports = Connection;
