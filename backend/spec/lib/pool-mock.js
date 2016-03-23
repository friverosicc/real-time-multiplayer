'use strict';

var PoolMock = function(connectionMock) {

    function beginTransaction() {
        return getConnection();
    }

    function getConnection() {
        return new Promise(function(resolve, reject) {
            resolve(connectionMock);
        });
    }

    return {
        beginTransaction: beginTransaction,
        getConnection: getConnection
    };
};


module.exports = PoolMock;
