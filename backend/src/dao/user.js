'use strict';

var UserDAO = function() {

    function save(connection, user) {
        var statement   = 'INSERT INTO user (username, balance, token) VALUES (?, ?, ?) '
                        + 'ON DUPLICATE KEY UPDATE token = ?';
        var values = [user.username, user.token, user.token];

        return connection.query(statement, values);
    }

    return {
        save: save
    }
}

module.exports = UserDAO;
