'use strict';

var AuctionManager = function(pool, validate, userDAO, inventoryDAO, auctionDAO) {
    const _MAX_TIME_TO_PLACE_BID = 90;
    const _MAX_EXTRA_TIME_TO_PLACE_BID = 10;
    const _AUCTION_STATES = { ACTIVE: 1, CLOSED: 2 };

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
            auction.state = _AUCTION_STATES.ACTIVE;
            auction.created_at = new Date(auction.created_at);
            auction.updated_at = new Date(auction.updated_at);

            return auctionDAO.findActive(connection)
            .then(function(data) {
                if(!validate.isEmpty(data))
                    return Promise.reject('sorry, an auction is already active');
                else
                    return inventoryDAO.find(connection, auction.seller);
            })
            .then(function(inventory) {
                if(_enoughQuantityOfItems(auction, inventory))
                    return auctionDAO.save(connection, auction);
                else
                    return Promise.reject('sorry, quantity is greater than the inventory, you do not have enough items');
            })
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    function find() {
        return pool.getConnection()
        .then(function(connection) {
            return auctionDAO.findActive(connection)
            .then(connection.release);
        });
    }

    function placeBid(bid) {
        var auction;

        return validate.async(bid, _constraintForBid)
        .then(pool.beginTransaction)
        .then(function(connection) {
            bid.time = new Date(bid.time);

            return auctionDAO.findActive(connection)
            .then(function(data) {
                auction = data[0];

                if(validate.isEmpty(auction))
                    return Promise.reject('sorry, currently there is not auction to place bid');

                if(_bidOutOfTime(auction, bid))
                    return Promise.reject('sorry, your bid is out of time');

                if(validate.isDefined(auction.buyer) && _bidIsLessOrEqualToWinning(bid.bid, auction.winning_bid))
                    return Promise.reject('sorry, your bid is less than the current winning bid');

                if(_enoughCoinsToPlaceBid(auction.minimum_bid, bid.bid))
                    return userDAO.findOne(connection, bid.buyer);
                else
                    return Promise.reject('sorry, your bid is less than the minimun bid');

            })
            .then(function(data) {
                var buyer = data[0];
                auction.winning_bid = bid.bid;
                auction.updated_at = bid.time;
                auction.buyer = bid.buyer;

                if(_enoughCoinsToPlaceBid(bid.bid, buyer.balance))
                    return auctionDAO.save(connection, auction);
                else
                    return Promise.reject('sorry, you do not have enough coins to place bid');

            })
            .then(connection.commit)
            .catch(connection.rollback);
        });
    }

    function close() {
        var auction;

        return pool.beginTransaction()
        .then(function(connection) {
            return auctionDAO.findActive(connection)
            .then(function(data) {
                auction = data[0];

                if(validate.isEmpty(auction))
                    return Promise.resolve();

                auction.state = _AUCTION_STATES.CLOSED;
                return auctionDAO.save(connection, auction);
            })
            .then(function() {
                if(validate.isDefined(auction.buyer)) {
                    var promises = [];
                    promises.push(userDAO.findOne(connection, auction.seller));
                    promises.push(userDAO.findOne(connection, auction.buyer));
                    promises.push(inventoryDAO.findOne(connection, auction.seller, auction.item));
                    promises.push(inventoryDAO.findOne(connection, auction.buyer, auction.item));

                    return Promise.all(promises);
                } else {
                    return Promise.resolve();
                }
            })
            .then(function(values) {
                if(validate.isEmpty(values))
                    return Promise.resolve();

                var seller = values[0][0];
                var buyer = values[1][0];
                var itemSeller = values[2][0];
                var itemBuyer = values[3][0];

                seller.balance += auction.winning_bid;
                buyer.balance -= auction.winning_bid;

                itemSeller.quantity -= auction.quantity;
                itemBuyer.quantity += auction.quantity;

                var promises = [];
                promises.push(userDAO.save(connection, seller));
                promises.push(userDAO.save(connection, buyer));
                promises.push(inventoryDAO.save(connection, seller.username, itemSeller));
                promises.push(inventoryDAO.save(connection, buyer.username, itemBuyer));

                return Promise.all(promises);
            })
            .then(connection.commit)
            .catch(function(err) {                
                connection.rollback(err);
            });
        });
    }

    function _enoughQuantityOfItems(auction, inventory) {
        var item = _findItem(auction.item, inventory);

        return (item.quantity >= auction.quantity);
    }

    function _bidOutOfTime(auction, bid) {
        var outOfTime = false;

        var timeFromCreation = (bid.time.getTime() - auction.created_at.getTime()) / 1000;
        var timeFromLastBind = (bid.time.getTime() - auction.updated_at.getTime()) / 1000;

        if(timeFromCreation > _MAX_TIME_TO_PLACE_BID && timeFromLastBind > _MAX_EXTRA_TIME_TO_PLACE_BID)
            outOfTime = true;

        return outOfTime;
    }

    function _bidIsLessOrEqualToWinning(newBid, winningBid) {
        return newBid <= winningBid;
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
        placeBid: placeBid,
        close: close
    };
};

module.exports = AuctionManager;
