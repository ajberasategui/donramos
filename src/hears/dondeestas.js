/* jshint esversion:6 */
const config = require('../config');
const _ = require('lodash');
const logger = require('../logger/logger'); 

module.exports = {
    msg: 'donde estas(?)*',
    env: config.HEAR_ENVS.ALL,
    usage: 'donde estas',
    whatItDoes: 'Te digo donde estoy viviendo ahorita mismo.',
    responseCallback: responseCallback
};

function responseCallback(bot, message) {
    bot.reply(message, "En lo de " + process.env.USER);
}
