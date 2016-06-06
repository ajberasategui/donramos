/* jshint esversion:6 */
const config = require("../config");
const _ = require("lodash");
const logger = require("../logger/logger");
const utils = require("../core/utils"); 

module.exports = {
    init: init,
    msg: "estan en rg(:) (.*)",
    env: config.HEAR_ENVS.ALL,
    usage: "estan en rg: [username1, username2, ..., usernamen]",
    whatItDoes: "",
    responseCallback: responseCallback
};

let controller;
let usersInRG;
let drMemory;

function init(theController, memory) {
    drMemory = memory;
    controller = theController;
    drMemory.recall("usersInRG")
        .then(function(users) {
            usersInRG = users;
        });
}

function responseCallback(bot, message) {
    let usersStr = message.text.substring(message.text.indexOf("[")+1, message.text.indexOf("]"));
    let estan = usersStr.split(", ");
    controller.storage.users.all().then((allUsers) => {
        const usersWithIds = utils.unamesToIds(estan, allUsers);
        let inRG = [];
        
        _.forEach(usersWithIds, (user) => {
            inRG.push(user.id);
        });
        
        drMemory.rememberThat("usersInRG", inRG)
            .then(() => {
                bot.reply(message, "Gracias por avisar!");
            })
            .catch((err) => {
                logger.logError("Cant save rememberThat");
            });
    });
}
