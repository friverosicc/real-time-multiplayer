'use strict';

var ConnectionMock = function() {
    var _throwAnError = false;

    function query(statement, values) {
        var promise = new Promise(function(resolve, reject) {
            if(_throwAnError)
                reject('error');
            else
                resolve();
        });

        return promise;
    }

    function commit() {
        var promise = new Promise(function(resolve, reject) { resolve(); });

        return promise;
    }

    function rollback(error) {
        var promise = new Promise(function(resolve, reject) { reject(error); });
        return promise;
    }

    function setThrowAnError(throwAnError) {
        _throwAnError = throwAnError;
    }

    return {
        query: query,
        commit: commit,
        rollback: rollback,
        setThrowAnError: setThrowAnError
    };

};

module.exports = ConnectionMock;
