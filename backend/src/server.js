var validate = require('validate.js');
var config = require('./configuration/database');
var mysql = require('mysql');
var pool = require('./lib/mysql-pool')(mysql, config);
var userDAO = require('./dao/user')();
var inventoryDAO = require('./dao/inventory')();
var userManager = require('./manager/user')(pool, validate, userDAO, inventoryDAO);
var user = { username: 'undefined', token: new Date().getTime() };



userManager.login(user)
.then(function(result) { console.log(result); })
.catch(function(err) { console.log(err); });
