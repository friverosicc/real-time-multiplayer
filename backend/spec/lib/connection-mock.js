'use strict';

var ConnectionMock = function() {
    var _throwAnError = false;
    var _promiseRollback, _promiseQuery;

    function query(statement, values) {
        _promiseQuery = new Promise(function(resolve, reject) {
            if(_throwAnError)
                reject('error');
            else
                resolve();
        });

        return _promiseQuery;
    }

    function commit() {
        var promise = new Promise(function(resolve, reject) { resolve(); });

        return promise;
    }

    function rollback(error) {        
        _promiseRollback = new Promise(function(resolve, reject) { reject(error); });
        return _promiseRollback;
    }

    function setThrowAnError(throwAnError) {
        _throwAnError = throwAnError;
    }

    function getPromiseRollback() {
        return _promiseRollback;
    }

    function getPromiseQuery() {
        return _promiseQuery;
    }

    return {
        query: query,
        commit: commit,
        rollback: rollback,
        setThrowAnError: setThrowAnError,
        getPromiseRollback: getPromiseRollback,
        getPromiseQuery: getPromiseQuery
    };

};

module.exports = ConnectionMock;
