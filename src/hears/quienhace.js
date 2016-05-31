/* jshint esversion:6 */
let config = require('../config');

module.exports = {
    init: init,
    msg: '('+config.myName+')*quien( )(va a)(.*)',
    env: config.HEAR_ENVS.MENTION_AND_DIRECT,
    responseCallback: responseCallback
};

function init(controller, db) {
    
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
        if (err) {
        }
    });
}
