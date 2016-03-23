'use strict';

var ConnectionMock = function() {
    var _throwAnError = false;

    function query(statement, values) {
        return new Promise(function(resolve, reject) {
            if(_throwAnError)
                reject('error');
            else
                resolve();
        });
    }

    function commit() {
        return new Promise(function(resolve) { resolve(); });
    }

    function rollback(error) {
        return new Promise(function(resolve, reject) { reject(error); });
    }

    function release() {
        return new Promise(function(resolve) { resolve(); });
    }

    function setThrowAnError(throwAnError) {
        _throwAnError = throwAnError;
    }

    return {
        query: query,
        commit: commit,
        rollback: rollback,
        release: release,
        setThrowAnError: setThrowAnError
    };

};

module.exports = ConnectionMock;
