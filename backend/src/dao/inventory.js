'use strict';

var InventoryDAO = function() {

    function save(connection, username, item) {
        var statement   = 'INSERT INTO inventory (username, item, quantity) VALUES (?, ?, ?) '
                        + 'ON DUPLICATE KEY UPDATE quantity = ?';
        var values = [username, item.name, item.quantity, item.quantity];

        return connection.query(statement, values);
    }

    function find(connection, username) {
        var statement   = 'SELECT item AS name, quantity '
                        + 'FROM inventory '
                        + 'WHERE username = ? '
                        + 'ORDER BY item ASC';
        var values = [username];

        return connection.query(statement, values);
    }

    return {
        save: save,
        find: find
    };
};

module.exports = InventoryDAO;
