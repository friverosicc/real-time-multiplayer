'use strict';

var UserDAO = function() {

    function create(connection, user) {
        var statement = 'INSERT INTO user (username) VALUES (?)';
        var values = [user.username];
        
        return connection.query(statement, values);
    }

    function remove(username) {
        var values = [username];
        var statement = userStatementBuilder.getRemoveStatement();

        return pool.executeQuery(statement, values);
    }

    function update(user) {
        var values = [];

        if(user.password)
            values.push(user.password);

        values = values.concat([user.role, user.expected_calories_per_day, user.username]);

        var statement = userStatementBuilder.getUpdateStatement(user.password);
        return pool.executeQuery(statement, values);
    }

    function findOne(username) {
        var values = [username];
        var statement = userStatementBuilder.getFindOneStatement();

        return pool.executeQuery(statement, values);
    }

    function find(paginator) {
        var values = [paginator.start, paginator.length];
        var statement = userStatementBuilder.getFindStatement();

        return pool.executeQuery(statement, values);
    }

    function findAmountOfUsers() {
        var statement = userStatementBuilder.getFindAmountOfUsersStatement();

        return pool.executeQuery(statement, []);
    }

    return {
        create: create,
        remove: remove,
        update: update,
        findOne: findOne,
        find: find,
        findAmountOfUsers: findAmountOfUsers
    }
}

module.exports = UserDAO;
