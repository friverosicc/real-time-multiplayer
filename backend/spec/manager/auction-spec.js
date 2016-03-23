'use strict';

var AuctionManager = require('../../src/manager/auction');
var validate = require('validate.js');

describe('Auction manager', function() {
    var _userDAOMock, _inventoryDAOMock, _auctionDAOMock, _connectionMock, _poolMock;
    var _seller, _sellerInventory, _auction, _alreadyExistsAnAuction;
    var auctionManager;

    beforeEach(function() {
        _alreadyExistsAnAuction = false;
        _seller = { username: 'username', token: new Date().getTime(), balance: 1200 };
        _sellerInventory = [{ name: 'breads', quantity: 30 },
                      { name: 'carrots', quantity: 18 },
                      { name: 'diamonds', quantity: 1 }];
        _auction = {
            seller: _seller.username,
            item: 'carrots',
            minimum_bid: 100,
            quantity: 5,
            wining_bid: 0,
            state: 1,
            created_at: new Date(),
            updated_at: new Date()
        };

        _userDAOMock = require('../../src/dao/user')();
        spyOn(_userDAOMock, 'save').and.callThrough();
        spyOn(_userDAOMock, 'findOne').and.callFake(function(connection, username) {
            return new Promise(function(resolve) {
                if(username === 'userAlreadyExists')
                    resolve([_user]);
                else
                    resolve([]);
            });
        });

        _inventoryDAOMock = require('../../src/dao/inventory')();
        spyOn(_inventoryDAOMock, 'save').and.callThrough();
        spyOn(_inventoryDAOMock, 'find').and.callFake(function(connection, username) {
            return new Promise(function(resolve) {
                resolve(_sellerInventory);
            });
        });

        _auctionDAOMock = require('../../src/dao/auction')();
        spyOn(_auctionDAOMock, 'save').and.callThrough();
        spyOn(_auctionDAOMock, 'find').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                if(_alreadyExistsAnAuction)
                    resolve([{}]);
                else
                    resolve([]);
            });
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
            expect(error).toEqual('sorry, quantity is greater then the inventory');
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

    xit('', function() {});
    xit('', function() {});
    xit('', function() {});


    function _createManager() {
        auctionManager = AuctionManager(_poolMock, validate, _userDAOMock, _inventoryDAOMock, _auctionDAOMock);
    }
});
