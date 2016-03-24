'use strict';

var ConnectionMock = function() {
    var _throwAnError = false;

    function query(statement, values) {
        if(_throwAnError)
            return Promise.reject('error');
        else
            return Promise.resolve();
    }

    function commit() {
        return Promise.resolve();
    }

    function rollback(error) {
        return Promise.reject(error);
    }

    function release(data) {
        return Promise.resolve(data);
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
