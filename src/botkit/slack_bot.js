module.exports = {
    init: init,
    getController: getController,
    getBot: getBot
};

let controller;
let bot;

/**
 * 
 */
function init(config, token) {
    var Botkit = require('./lib/Botkit.js');
    var os = require('os');

    controller = Botkit.slackbot({
        debug: true,
        json_file_store: config.STORAGE_FILE
    });

    bot = controller.spawn({
        token: token,
    }).startRTM(); 
}

/**
 * Returns the bot controller
 */
function getController() {
    return controller;
}
/**
 * Returns the botkit slack bot
 */
function getBot() {
    return bot;
}

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
