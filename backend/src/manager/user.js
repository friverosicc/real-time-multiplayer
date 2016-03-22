'use strict';

var User = function(pool, validate, userDAO) {
    var _constraint = {
        username: { presence: { message: 'is required' } },
        token: { presence: { message: 'is required' } }
    };

    const _INITIAL_BALANCE = 1000;

    function save(user) {
        user.balance = _INITIAL_BALANCE;
        
        return validate.async(user, _constraint)
        .then(pool.beginTransaction)
        .then(function(connection) {
            userDAO.save(connection, user)
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    return {
        save: save
    };
};

module.exports = User;
