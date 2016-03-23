'use strict';

var AuctionManager = function(pool, validate, userDAO, inventoryDAO, auctionDAO) {
    const _MAX_TIME_TO_PLACE_BID = 90;
    var _constraintForNewAuction = {
        seller: { presence: { message: 'is required' } },
        item: { presence: { message: 'is required' } },
        minimum_bid: {
            numericality: {
                onlyInteger: true,
                greaterThan: 0
            },
            presence: { message: 'is required' }
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

    var _constraintForBid = {
        buyer: { presence: { message: 'is required' } },
        bid: {
            numericality: {
                onlyInteger: true,
                greaterThan: 0
            },
            presence: { message: 'is required' }
        },
        time: { presence: { message: 'is required' } }
    };

    function create(auction) {
        return validate.async(auction, _constraintForNewAuction)
        .then(pool.beginTransaction)
        .then(function(connection) {
            return auctionDAO.find(connection)
            .then(function(data) {
                if(!validate.isEmpty(data))
                    return _reject('sorry, an auction is already active');
                else
                    return inventoryDAO.find(connection, auction.seller);
            })
            .then(function(inventory) {
                if(_enoughQuantityOfItems(auction, inventory))
                    return auctionDAO.save(connection, auction);
                else
                    return _reject('sorry, quantity is greater than the inventory, you do not have enough items');
            })
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    function find() {
        return pool.getConnection()
        .then(auctionDAO.find);
    }

    function placeBid(bid) {
        var auction;

        return validate.async(bid, _constraintForBid)
        .then(pool.beginTransaction)
        .then(function(connection) {
            return auctionDAO.find(connection)
            .then(function(data) {
                auction = data[0];

                if(validate.isEmpty(auction))
                    return _reject('sorry, currently there is not auction to place bid');

                if(_bidOutOfTime(auction, bid))
                    return _reject('sorry, your bid is out of time');

                if(validate.isDefined(auction.buyer) && _bidIsLessOrEqualToWinning(bid.bid, auction.winning_bid))
                    return _reject('sorry, your bid is less than the current winning bid');

                if(_enoughCoinsToPlaceBid(auction.minimum_bid, bid.bid))
                    return userDAO.findOne(connection, bid.buyer);
                else
                    return _reject('sorry, your bid is less than the minimun bid');

            })
            .then(function(data) {
                var buyer = data[0];
                auction.winning_bid = bid.bid;
                auction.updated_at = bid.time;
                auction.buyer = bid.buyer;

                if(_enoughCoinsToPlaceBid(bid.bid, buyer.balance))
                    return auctionDAO.save(connection, auction);
                else
                    return _reject('sorry, you do not have enough coins to place bid');

            })
            .then(connection.commit)
            .catch(connection.rollback);
        });
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

    function _bidOutOfTime(auction, bid) {
        var diff = (bid.time.getTime() - auction.updated_at.getTime()) / 1000;

        return diff > _MAX_TIME_TO_PLACE_BID;
    }

    function _bidIsLessOrEqualToWinning(newBid, winningBid) {
        return winningBid <= winningBid;
    }

    function _enoughCoinsToPlaceBid(theLess, theGreater) {
        return theLess <= theGreater;
    }

    function _findItem(name, inventory) {
        var item;

        for(var i=0; i < inventory.length; i++)
            if(inventory[i].name === name)
                return inventory[i];
    }

    return {
        create: create,
        find: find,
        placeBid: placeBid
    };
};

module.exports = AuctionManager;
