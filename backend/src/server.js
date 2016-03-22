var validate = require('validate.js');
var config = require('./configuration/database');
var mysql = require('mysql');
var pool = require('./lib/mysql-pool')(mysql, config);
var userDAO = require('./dao/user')(pool);
var userManager = require('./manager/user')(pool, validate, userDAO);
var user = { username: 'undefined', token: '123acs' };

var validationResult = validate(user, { username: { presence: true } });


userManager.save(user)
.then(function(result) { console.log(result); })
.catch(function(err) { console.log(err); });
