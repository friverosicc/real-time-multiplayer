'use strict';

var AuctionManager = require('../../src/manager/auction');
var validate = require('validate.js');

describe('Auction manager', function() {
    var _userDAOMock, _inventoryDAOMock, _auctionDAOMock, _connectionMock, _poolMock;
    var _seller, _buyer, _sellerInventory, _buyerInventory, _auction, _alreadyExistsAnAuction;
    var auctionManager;

    beforeEach(function() {
        _alreadyExistsAnAuction = false;

        _seller = { username: 'seller', token: new Date().getTime(), balance: 1000 };
        _buyer = { username: 'buyer', token: new Date().getTime(), balance: 1000 };

        _sellerInventory = [{ name: 'breads', quantity: 30 },
                            { name: 'carrots', quantity: 18 },
                            { name: 'diamonds', quantity: 1 }];

        _buyerInventory = [ { name: 'breads', quantity: 30 },
                            { name: 'carrots', quantity: 18 },
                            { name: 'diamonds', quantity: 1 }];
        _auction = {
            seller: _seller.username,
            item: 'carrots',
            minimum_bid: 100,
            quantity: 5,
            winning_bid: 0,
            state: 1,
            created_at: new Date(),
            updated_at: new Date()
        };

        _userDAOMock = require('../../src/dao/user')();
        spyOn(_userDAOMock, 'save').and.callThrough();
        spyOn(_userDAOMock, 'findOne').and.callFake(function(connection, username) {
            if(username === _seller.username)
                return Promise.resolve([_seller]);
            else
                return Promise.resolve([_buyer]);
        });

        _inventoryDAOMock = require('../../src/dao/inventory')();
        spyOn(_inventoryDAOMock, 'save').and.callThrough();
        spyOn(_inventoryDAOMock, 'find').and.callFake(function(connection, username) {
            if(username === _seller.username)
                return Promise.resolve(_sellerInventory);
            else
                return Promise.resolve(_buyerInventory);
        });
        spyOn(_inventoryDAOMock, 'findOne').and.callFake(function(connection, username) {
            if(username === _seller.username)
                return Promise.resolve([_sellerInventory[1]]);
            else
                return Promise.resolve([_buyerInventory[1]]);
        });

        _auctionDAOMock = require('../../src/dao/auction')();
        spyOn(_auctionDAOMock, 'save').and.callThrough();
        spyOn(_auctionDAOMock, 'findActive').and.callFake(function() {
            if(_alreadyExistsAnAuction)
                return Promise.resolve([_auction]);
            else
                return Promise.resolve([]);
        });

        _connectionMock = require('../lib/connection-mock')();
        spyOn(_connectionMock, 'query').and.callThrough();
        spyOn(_connectionMock, 'commit').and.callThrough();
        spyOn(_connectionMock, 'rollback').and.callThrough();

        _poolMock = require('../lib/pool-mock')(_connectionMock);
        spyOn(_poolMock, 'beginTransaction').and.callThrough();
    });

    it('should reject the auction when does not have some field or are invalid', function(done) {
        _createManager();
        var auction = {};

        auctionManager.create(auction)
        .catch(function(error) {
            expect(error).toBeDefined();
            done();
        });
    });

    it('should reject the auction when another exists', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        auctionManager.create(_auction)
        .catch(function(error) {
            expect(error).toEqual('sorry, an auction is already active');
            done();
        });
    });

    it('should reject the auction when the quantity is greater than inventory', function(done) {
        _createManager();

        _auction.quantity = 19;

        auctionManager.create(_auction)
        .catch(function(error) {
            expect(error).toEqual('sorry, quantity is greater than the inventory, you do not have enough items');
            done();
        });
    });

    it('should create an auction successfully', function(done) {
        _createManager();

        auctionManager.create(_auction);

        setTimeout(function() {
            expect(_poolMock.beginTransaction).toHaveBeenCalled();
            expect(_auctionDAOMock.save).toHaveBeenCalledWith(_connectionMock, _auction);
            expect(_connectionMock.commit).toHaveBeenCalled();

            done();
        }, 0);
    });

    it('should rollback transaction when appears any problem in the process of creation of auctions', function(done) {
        _connectionMock.setThrowAnError(true);
        _createManager();

        auctionManager.create(_auction);

        setTimeout(function() {
            expect(_connectionMock.commit.calls.count()).toEqual(0);
            expect(_connectionMock.rollback).toHaveBeenCalled();

            done();
        }, 0);

    });

    it('should find the active auction', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        auctionManager.find()
        .then(function(data) {
            expect(_auctionDAOMock.findActive).toHaveBeenCalledWith(_connectionMock);
            expect(data[0]).toBeDefined();
            done();
        });
    });

    it('should be rejected a bid when there is not auction actived', function(done) {
        _createManager();
        var bid = {
            buyer: _buyer.username,
            bid: _auction.minimum_bid,
            time: new Date()
        };

        auctionManager.placeBid(bid)
        .catch(function(error) {
            expect(error).toEqual('sorry, currently there is not auction to place bid');
            done();
        });
    });

    it('should be rejected a bid because the buyer does not have enough coins', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        var bid = {
            buyer: _buyer.username,
            bid: 1100,
            time: new Date()
        };

        auctionManager.placeBid(bid)
        .catch(function(error) {
            expect(error).toEqual('sorry, you do not have enough coins to place bid');
            done();
        });
    });

    it('should be rejected a bid because is less than the minimun bid', function(done) {
        _alreadyExistsAnAuction = true;

        _createManager();

        var bid = {
            buyer: _buyer.username,
            bid: 90,
            time: new Date()
        };

        auctionManager.placeBid(bid)
        .catch(function(error) {
            expect(error).toEqual('sorry, your bid is less than the minimun bid');
            done();
        });
    });

    it('should be rejected a bid because is less than the current winning bid', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        _auction.buyer = 'anoherUser';
        _auction.winning_bid = 150;
        _auction.updated_at = new Date();

        var bid = {
            buyer: _buyer.username,
            bid: 120,
            time: new Date()
        };

        auctionManager.placeBid(bid)
        .catch(function(error) {
            expect(error).toEqual('sorry, your bid is less than the current winning bid');
            done();
        });
    });

    it('should be rejected a bid because is out of time', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        var time = new Date(_auction.updated_at.getTime());
        var bid = {
            buyer: _buyer.username,
            bid: 120,
            time: new Date(time.setSeconds(_auction.updated_at.getSeconds() + 91))
        };

        auctionManager.placeBid(bid)
        .catch(function(error) {
            expect(error).toEqual('sorry, your bid is out of time');
            done();
        });
    });

    it('should save the new bid successfully', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        var bid = {
            buyer: _buyer.username,
            bid: 100,
            time: new Date()
        };

        var auctionExpected = {
            seller: _auction.seller,
            item: _auction.item,
            minimum_bid: _auction.minimum_bid,
            quantity: _auction.quantity,
            buyer: bid.buyer,
            winning_bid: bid.bid,
            state: 1,
            created_at: _auction.created_at,
            updated_at: bid.time
        };

        auctionManager.placeBid(bid);

        setTimeout(function() {
            expect(_auctionDAOMock.save).toHaveBeenCalledWith(_connectionMock, auctionExpected);
            expect(_connectionMock.commit).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should save the new bid successfully, in the 10 seconds extra time', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        var auctionTime = new Date(_auction.created_at.getTime());

        _auction.buyer = 'anoherUser';
        _auction.winning_bid = 150;
        _auction.updated_at = new Date(auctionTime.setSeconds(auctionTime.getSeconds() + 88));

        var bid = {
            buyer: _buyer.username,
            bid: 160,
            time: new Date(auctionTime.setSeconds(auctionTime.getSeconds() + 9))
        };

        var auctionExpected = {
            seller: _auction.seller,
            item: _auction.item,
            minimum_bid: _auction.minimum_bid,
            quantity: _auction.quantity,
            buyer: bid.buyer,
            winning_bid: bid.bid,
            state: 1,
            created_at: _auction.created_at,
            updated_at: bid.time
        };

        auctionManager.placeBid(bid);

        setTimeout(function() {
            expect(_auctionDAOMock.save).toHaveBeenCalledWith(_connectionMock, auctionExpected);
            expect(_connectionMock.commit).toHaveBeenCalled();
            done();
        }, 0);
    });

    it('should rollback transaction when appears any problem in the process of place bids', function(done) {
        _alreadyExistsAnAuction = true;
        _connectionMock.setThrowAnError(true);
        _createManager();

        var bid = {
            buyer: _buyer.username,
            bid: 100,
            time: new Date()
        };

        auctionManager.placeBid(bid);

        setTimeout(function() {
            expect(_connectionMock.commit.calls.count()).toEqual(0);
            expect(_connectionMock.rollback).toHaveBeenCalled();

            done();
        }, 0);

    });

    it('should close the auction successfully, when exists a buyer', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        _auction.buyer = _buyer.username;
        _auction.winning_bid = 150;
        _auction.updated_at = new Date();

        var auctionExpected = {
            seller: _auction.seller,
            item: _auction.item,
            minimum_bid: _auction.minimum_bid,
            quantity: _auction.quantity,
            buyer: _auction.buyer,
            winning_bid: _auction.winning_bid,
            state: 2,
            created_at: _auction.created_at,
            updated_at: _auction.updated_at
        };

        var sellerExpected = {
            username: _seller.username,
            token: _seller.token,
            balance: 1150
        };

        var buyerExpected = {
            username: _buyer.username,
            token: _buyer.token,
            balance: 850
        };

        var itemSellerExpected = { name: 'carrots', quantity: 13 };
        var itemBuyerExpected = { name: 'carrots', quantity: 23 };

        auctionManager.close();

        setTimeout(function() {            
            expect(_auctionDAOMock.save).toHaveBeenCalledWith(_connectionMock, auctionExpected);
            expect(_userDAOMock.save.calls.argsFor(0)).toEqual([_connectionMock, sellerExpected]);
            expect(_userDAOMock.save.calls.argsFor(1)).toEqual([_connectionMock, buyerExpected]);
            expect(_inventoryDAOMock.save.calls.argsFor(0)).toEqual([_connectionMock, _auction.seller, itemSellerExpected]);
            expect(_inventoryDAOMock.save.calls.argsFor(1)).toEqual([_connectionMock, _auction.buyer, itemBuyerExpected]);

            done();
        }, 0);
    });

    it('should close the auction successfully, when does not exist a buyer', function(done) {
        _alreadyExistsAnAuction = true;
        _createManager();

        var auctionExpected = {
            seller: _auction.seller,
            item: _auction.item,
            minimum_bid: _auction.minimum_bid,
            quantity: _auction.quantity,
            winning_bid: _auction.winning_bid,
            state: 2,
            created_at: _auction.created_at,
            updated_at: _auction.updated_at
        };

        auctionManager.close();

        setTimeout(function() {
            expect(_auctionDAOMock.save).toHaveBeenCalledWith(_connectionMock, auctionExpected);
            expect(_userDAOMock.save.calls.count()).toEqual(0);
            expect(_userDAOMock.save.calls.count()).toEqual(0);
            expect(_inventoryDAOMock.save.calls.count()).toEqual(0);
            expect(_inventoryDAOMock.save.calls.count()).toEqual(0);
            expect(_connectionMock.commit).toHaveBeenCalled();
            done();
        }, 0);
    });

    function _createManager() {
        auctionManager = AuctionManager(_poolMock, validate, _userDAOMock, _inventoryDAOMock, _auctionDAOMock);
    }
});
