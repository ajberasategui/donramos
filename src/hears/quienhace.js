/* jshint esversion:6 */
const config = require('../config');
const _ = require('lodash');
const logger = require('../logger/logger'); 

module.exports = {
    init: init,
    msg: 'quien( )(va a)(.*)',
    env: config.HEAR_ENVS.MENTION_AND_DIRECT,
    usage: '@donramos quien va a [tu accion]',
    whatItDoes: 'Elige un presente en RG aleatoriamiente para hacer lo que indiques',
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
  var keyword = "quien";
  var msg = message.text;
  var userId = _.sample(usersInRG);
  controller.storage.users.get(userId)
    .then(function(user) {
        if (usersInRG.length > 1) {
            var reply = _.replace(msg, keyword, user.real_name);
            bot.reply(message, _.replace(reply, '?', ''));
        }
        else if (usersInRG.length == 1){
            bot.reply(message, "Estas solo cabeza!!");
        }
        else {
            bot.reply(message, '_naides_');
        }
    })
    .catch(function(err) {
        logger.logError(err);
    });
}
