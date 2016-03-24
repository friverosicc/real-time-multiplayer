'use strict';

var PoolMock = function(connectionMock) {

    function beginTransaction() {
        return getConnection();
    }

    function getConnection() {
        return Promise.resolve(connectionMock);
    }

    return {
        beginTransaction: beginTransaction,
        getConnection: getConnection
    };
};


module.exports = PoolMock;
