'use strict';

var PoolMock = function(connectionMock) {

    function beginTransaction() {
        return new Promise(function(resolve, reject) {
            resolve(connectionMock);
        });
    }

    return {
        beginTransaction: beginTransaction
    };
};


module.exports = PoolMock;
