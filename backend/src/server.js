var validate = require('validate.js');
var config = require('./configuration/database');
var mysql = require('mysql');
var pool = require('./lib/mysql-pool')(mysql, config);

var userDAO = require('./dao/user')();
var inventoryDAO = require('./dao/inventory')();
var auctionDAO = require('./dao/auction')();

var userManager = require('./manager/user')(pool, validate, userDAO, inventoryDAO);
var auctionManager = require('./manager/auction')(pool, validate, userDAO, inventoryDAO, auctionDAO);

var user = { username: 'undefined', token: new Date().getTime() };
var auction = {
    seller: user.username,
    item: 'carrots',
    quantity: 10,
    minimum_bid: 1000,
    state: 1,
    created_at: new Date(),
    updated_at: new Date()
};

/*userManager.login(user)
.then(function(result) { console.log(result); })
.catch(function(err) { console.log(err); });*/

auctionManager.create(auction)
.then(function(result) { console.log(result); })
.catch(function(err) { console.log(err); });
