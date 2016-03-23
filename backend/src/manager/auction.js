'use strict';

var AuctionManager = function(pool, validate, userDAO, inventoryDAO, auctionDAO) {
    var _constraintForNew = {
        seller: { presence: { message: 'is required' } },
        item: { presence: { message: 'is required' } },
        minimum_bid: {
            numericality: {
                onlyInteger: true,
                greaterThan: 0
            }
        },
        quantity: {
            numericality: {
                onlyInteger: true,
                greaterThan: 0
            }
        },
        state: { presence: { message: 'is required' } },
        created_at: { presence: { message: 'is required' } },
        updated_at: { presence: { message: 'is required' } }
    };

    function create(auction) {
        return validate.async(auction, _constraintForNew)
        .then(pool.beginTransaction)
        .then(function(connection) {
            return auctionDAO.find()
            .then(function(data) {
                if(!validate.isEmpty(data))
                    return _reject('sorry, an auction is already active');
                else
                    return inventoryDAO.find(auction.seller);
            })
            .then(function(inventory) {
                if(_enoughQuantityOfItems(auction, inventory))
                    return auctionDAO.save(connection, auction);
                else
                    return _reject('sorry, quantity is greater then the inventory');
            })
            .then(connection.commit)
            .catch(function(err) {
                console.log(err);
                return connection.rollback(err);
            });
        });
    }

    function update() {

    }

    function _reject(error) {
        return new Promise(function(resolve, reject) {
            reject(error);
        });
    }

    function _enoughQuantityOfItems(auction, inventory) {
        var item = _findItem(auction.item, inventory);

        return (item.quantity >= auction.quantity);
    }

    function _findItem(name, inventory) {
        var item;

        for(var i=0; i < inventory.length; i++)
            if(inventory[i].name === name)
                return inventory[i];
    }

    return {
        create: create,
        update: update
    };
};

module.exports = AuctionManager;
