'use strict';

var UserDAO = function() {

    function save(connection, user) {
        var statement   = 'INSERT INTO user (username, balance, token) VALUES (?, ?, ?) '
                        + 'ON DUPLICATE KEY UPDATE token = ?';
        var values = [user.username, user.token, user.token];

        return connection.query(statement, values);
    }

    function findOne(connection, username) {
        var statement   = "SELECT username, balance, token "
                        + "FROM user "
                        + "WHERE username = ?";
        var values = [username];

        return connection.query(statement, values);
    }

    return {
        save: save,
        findOne: findOne
    }
}

module.exports = UserDAO;
