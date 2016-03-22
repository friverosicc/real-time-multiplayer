'use strict';

var UserManager = require('../../src/manager/user');
var validate = require('validate.js');

describe('User manager', function() {
    var userManager;
    var _userDAOMock, _poolMock, _connectionMock;
    var _promiseBeginTransaction, _promiseCreate;

    beforeEach(function() {
        _userDAOMock = require('../../src/dao/user')();
        spyOn(_userDAOMock, 'create').and.callThrough();

        _connectionMock = require('../lib/connection-mock')();
        spyOn(_connectionMock, 'query').and.callThrough();
        spyOn(_connectionMock, 'commit').and.callThrough();
        spyOn(_connectionMock, 'rollback').and.callThrough();

        _poolMock = require('../lib/pool-mock')(_connectionMock);
        spyOn(_poolMock, 'beginTransaction').and.callThrough();

        userManager = UserManager(_poolMock, validate, _userDAOMock);
    });

    it('should create new user successfully', function(done) {
        var user = { username: 'newUsername', token: '1234abc' };

        userManager.create(user)
        .then(function() {
            expect(_poolMock.beginTransaction).toHaveBeenCalled();
            expect(_userDAOMock.create).toHaveBeenCalledWith(_connectionMock, user);
            expect(_connectionMock.commit).toHaveBeenCalled();

            done();
        });
    });

    it('should reject the action when try to create user without username or token', function(done) {
        var invalidUser = {};

        userManager.create(invalidUser)
        .then(function() {
            fail('the promise must be rejected');

            done();
        })
        .catch(function() {
            expect(_poolMock.beginTransaction.calls.count()).toEqual(0);
            done();
        });
    });

    it('should rollback transaction when appears any problem in the user creation process', function(done) {
        _connectionMock.setThrowAnError(true);
        var user = { username: 'username', token: 'uniqueToken' };

        userManager.create(user)

        setTimeout(function() {
            expect(_connectionMock.commit.calls.count()).toEqual(0);
            expect(_connectionMock.rollback).toHaveBeenCalled();

            done();
        }, 0);

    });

    xit('should login user successfully', function() {});
    xit('should login user and logout the same one from other browsers or tabs', function() {});
    xit('should get user coins', function() {});
    xit('should get user inventory', function() {});
});
