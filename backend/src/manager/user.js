'use strict';

var UserManager = function(pool, validate, userDAO, inventoryDAO) {
    var _constraint = {
        username: { presence: { message: 'is required' } },
        token: { presence: { message: 'is required' } }
    };

    const _INITIAL_BALANCE = 1000;

    function login(user) {
        var _firstLogin = false;
        user.balance = _INITIAL_BALANCE;

        return validate.async(user, _constraint)
        .then(pool.beginTransaction)
        .then(function(connection) {
            return userDAO.findOne(connection, user.username)
            .then(function(data) {
                if(validate.isEmpty(data))
                    _firstLogin = true;
                else
                    user.balance = data[0].balance;

                return userDAO.save(connection, user);
            })
            .then(function() {
                if(_firstLogin)
                    return _saveInitialInventory(connection, user.username);
                else
                    return Promise.resolve();
            })
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    function _saveInitialInventory(connection, username) {
        var promises = [];

        promises.push(inventoryDAO.save(connection, username, { name: 'breads', quantity: 30 }));
        promises.push(inventoryDAO.save(connection, username, { name: 'carrots', quantity: 18 }));
        promises.push(inventoryDAO.save(connection, username, { name: 'diamonds', quantity: 1 }));

        return Promise.all(promises);
    }

    function findOne(username) {
        return pool.getConnection()
        .then(function(connection) {
            return userDAO.findOne(connection, username);
        });
    }

    function findInventory(username) {
        return pool.getConnection()
        .then(function(connection) {
            return inventoryDAO.find(connection, username);
        });
    }

    return {
        login: login,
        findOne: findOne,
        findInventory: findInventory
    };
};

module.exports = UserManager;
