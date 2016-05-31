let config = require('../config');

module.exports = {
    init: init,
    msg: 'test*'+'(.*)',
    env: config.HEAR_ENVS.MENTION_AND_DIRECT,
    responseCallback: responseCallback
};

var enteradoCount = 0;

function init(controller, db) {
    
}

function responseCallback(bot, message) {
    if (enteradoCount > 2) {
        bot.reply(message, "Hay, creo que le habla a Ud.!");
        enteradoCount = 0;
    } else {
        bot.reply(message, "Enterado!");
        enteradoCount++;
    }
}
