/* jshint esversion:6 */
const config = require('../config');
const _ = require('lodash');
const logger = require('../logger/logger'); 

module.exports = {
    init: init,
    msg: 'What to hear',
    env: config.HEAR_ENVS.ALL,
    usage: 'How to call it',
    whatItDoes: '',
    responseCallback: responseCallback
};

let controller;
let usersInRG;

function init(theController, db) {
    controller = theController;
    
    db.get('usersInRG')
        .then(function(users) {
            usersInRG = users;
        });
}

function responseCallback(bot, message) {
    
}
