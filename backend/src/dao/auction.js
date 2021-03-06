'use strict';

var AuctionDAO = function() {
    function save(connection, auction) {
        var statement   = 'INSERT INTO auction '
                        + '(seller, created_at, item, minimum_bid, quantity, buyer, winning_bid, state, updated_at) '
                        + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) '
                        + 'ON DUPLICATE KEY UPDATE '
                        + 'buyer = ?, winning_bid = ?, state = ?, updated_at = ?';
        var values = [  auction.seller, auction.created_at, auction.item,
                        auction.minimum_bid, auction.quantity, auction.buyer,
                        auction.winning_bid, auction.state, auction.updated_at,
                        auction.buyer, auction.winning_bid, auction.state, auction.updated_at
                     ];        
        return connection.query(statement, values);
    }

    function remove(connection) {
        var statement = 'DELETE FROM auction';
        var values = [];

        return connection.query(statement, values);
    }

    function findActive(connection) {
        var statement   = 'SELECT seller, created_at, item, minimum_bid, quantity, buyer, winning_bid, state, updated_at '
                        + 'FROM auction '
                        + 'WHERE state = 1';

        return connection.query(statement, []);
    }

    return {
        save: save,
        remove: remove,
        findActive: findActive
    };
};

module.exports = AuctionDAO;
