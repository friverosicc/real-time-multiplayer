'use strict';

var UserManager = require('../../src/manager/user');
var validate = require('validate.js');

describe('User manager', function() {
    var userManager;
    var _userDAOMock, _inventoryDAOMock, _poolMock, _connectionMock;
    var _user, _inventory;


    beforeEach(function() {
        _user = { username: 'userAlreadyExists', token: new Date().getTime(), balance: 1200 };
        _inventory = [{ name: 'breads', quantity: 30 },
                      { name: 'carrots', quantity: 18 },
                      { name: 'diamonds', quantity: 1 }];

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
                resolve(_inventory);
            });
        });

        _connectionMock = require('../lib/connection-mock')();
        spyOn(_connectionMock, 'query').and.callThrough();
        spyOn(_connectionMock, 'commit').and.callThrough();
        spyOn(_connectionMock, 'rollback').and.callThrough();
        spyOn(_connectionMock, 'release').and.callThrough();

        _poolMock = require('../lib/pool-mock')(_connectionMock);
        spyOn(_poolMock, 'beginTransaction').and.callThrough();

        userManager = UserManager(_poolMock, validate, _userDAOMock, _inventoryDAOMock);
    });

    it('should login user successfully for first time', function(done) {
        var user = { username: 'newUsername', token: new Date().getTime() };
        var userExpected = {
            username: user.username,
            token: user.token,
            balance: 1000
        };

        userManager.login(user);

        setTimeout(function() {
            expect(_poolMock.beginTransaction).toHaveBeenCalled();
            expect(_userDAOMock.save).toHaveBeenCalledWith(_connectionMock, userExpected);
            expect(_connectionMock.commit).toHaveBeenCalled();

            for(var i=0; i < _inventory.length; i++) {
                expect(_inventoryDAOMock.save.calls.argsFor(i)).toEqual([_connectionMock, user.username, _inventory[i]]);
            }

            done();
        }, 0);
    });

    it('should login user, just updating the token, when is not the first login', function(done) {
        var user = { username: 'userAlreadyExists', token: new Date().getTime() };
        var userExpected = { username: user.username, token: user.token, balance: _user.balance };

        userManager.login(user);

        setTimeout(function() {
            expect(_userDAOMock.save).toHaveBeenCalledWith(_connectionMock, userExpected);
            expect(_inventoryDAOMock.save.calls.count()).toEqual(0);
            done();
        }, 0);
    });

    it('should reject the action when try to login an user without username or token', function(done) {
        var invalidUser = {};

        userManager.login(invalidUser);

        setTimeout(function() {
            expect(_poolMock.beginTransaction.calls.count()).toEqual(0);

            done();
        }, 0);
    });

    it('should rollback transaction when appears any problem in the login user process', function(done) {
        _connectionMock.setThrowAnError(true);
        var user = { username: 'username', token: 'uniqueToken' };

        userManager.login(user)

        setTimeout(function() {
            expect(_connectionMock.commit.calls.count()).toEqual(0);
            expect(_connectionMock.rollback).toHaveBeenCalled();

            done();
        }, 0);

    });

    it('should get the user information', function(done) {

        userManager.findOne(_user.username)
        .then(function(data) {
            expect(data[0]).toBe(_user);
            done();
        });
    });

    it('should get the user inventory', function(done) {
        userManager.findInventory(_user.username)
        .then(function(data) {
            expect(data).toBe(_inventory);
            done();
        });
    });
});
