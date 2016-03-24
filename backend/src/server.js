var validate = require('validate.js');
var config = require('./configuration/database');
var mysql = require('mysql');
var pool = require('./lib/mysql-pool')(mysql, config);

var userDAO = require('./dao/user')();
var inventoryDAO = require('./dao/inventory')();
var auctionDAO = require('./dao/auction')();

var userManager = require('./manager/user')(pool, validate, userDAO, inventoryDAO);
var auctionManager = require('./manager/auction')(pool, validate, userDAO, inventoryDAO, auctionDAO);

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket) {
    socket.on('login', _login);
    socket.on('find user', _findUser);
    socket.on('find inventory', _findInventory);
    socket.on('find auction', _findAuction);
    socket.on('create auction', _createAuction);
    socket.on('close auction', _closeAuction);
    socket.on('place bid', _placeBid);

    function _login(user) {
        userManager.login(user)
        .then(function() {
            socket.emit('login success', 'ok');
            io.emit('logout user', user);
        });
    }

    function _findUser(username) {
        userManager.findOne(username)
        .then(function(data) {
            socket.emit('find user success', data[0]);
        });
    }

    function _findInventory(username) {
        userManager.findInventory(username)
        .then(function(inventory) {
            socket.emit('find inventory success', inventory);
        });
    }

    function _findAuction() {
        auctionManager.find()
        .then(function(data) {
            io.emit('find auction success', data[0]);
        });
    }

    function _createAuction(auction) {
        auctionManager.create(auction)
        .then(function() {
            socket.emit('create auction success', 'ok');
            _findAuction();
        })
        .catch(function(err) {
            socket.emit('create auction error', err);
        });
    }

    function _closeAuction() {
        io.emit('close auction success', 'ok');
        auctionManager.close()
        .then(_findAuction);
    }

    function _placeBid(bid) {
        auctionManager.placeBid(bid)
        .then(function() {
            socket.emit('place bid success', 'ok');
        })
        .catch(function(err) {
            socket.emit('place bid error', err);
        });
    }
});

http.listen(8080, function() {
    console.log("Running in port 8080");
});
