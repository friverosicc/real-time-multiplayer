'use strict';

var User = function(pool, validate, userDAO) {
    var _constraint = {
        username: { presence: { message: 'is required' } },
        token: { presence: { message: 'is required' } }
    };

    function create(user) {
        return validate.async(user, _constraint)
        .then(pool.beginTransaction)
        .then(function(connection) {
            userDAO.create(connection, user)
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    return {
        create: create
    };
};

module.exports = User;
