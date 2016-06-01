/// <reference path="logger/logger.js"/>
/* jshint esversion:6 */


// Vendor libs
const moment = require('moment');
const slackClient = require('./slack/slack-client');
const lodash = require('lodash');
const Store = require('jfs');
const colors = require('colors');
const Q = require('q');
const promisify = require('promisify-node');
const readline = require('readline');
const fs = require('fs');

// Own libs
const gcalAuth = require('./gcal/gcal-auth');
const gCalendar = require('./gcal/gcalendar');
const config = require('./config');
const logger = require('./logger/logger');
const slackBot = require('./botkit/slack_bot');
const hears = require('./hears');

let db;
let controller;
let bot;
const myName = config.myName; 

if (!process.env.token) {
    logger.logError('Error: Specify token in environment');
    process.exit(1);
} else {
    init();
}

function init() {
    var log = fs.createWriteStream('./all.log');
    process.stdout.write = log.write.bind(log);
    var errorLog = fs.createWriteStream('./error.log');
    process.stderr.write = errorLog.write.bind(errorLog);
    
    db = new Store('storage');
    db.get = promisify(db.get);
    
    var load = Q.all([
        db.get("usersInRG"),
        db.get("learnt"),
    ]);
    load.then((results) => {
        try {
            logger.logSuccess("Pariendo...");
            
            usersInRG = (results && results[0]) ? results[0] : [];
            concepts = (results && results[1]) ? results[1] : [];
            
            slackBot.init(config, process.env.token);
            controller = slackBot.getController();
            controller.storage.users.get = promisify(controller.storage.users.get);
            controller.storage.users.all = promisify(controller.storage.users.all);
            
            fetchTeamMembers()
                .then(function() {
                    bot = slackBot.getBot();
                    listener = hears(bot, controller, config, db, myName, config.HEARS_DIR);
                    listener.setUsersInRG(usersInRG);
                    listener.setLearntConcepts(concepts);
                    logger.logSuccess("Don Ramos ha nacido");
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    rl.setPrompt("DonRamos>");
                    rl.prompt();
                    rl.on('line', (line) => {
                        promptHandler(line);
                        rl.prompt();
                    });
                })
                .catch(function(err) {
                    throw "Can't get team members: " + err;
                });
        } catch (e) {
            logger.logError(JSON.stringify(e));
            process.exit(1);
        }
    });
    load.catch((errors) => {
        logger.logError("Loading from storage: ", errors);
        process.exit(1);
    });
}

function promptHandler(option) {
    switch (option) {
        case 'help':
            logger.logPrompt("Not ready to help you...");
            break;
        case 'exit':
            logger.logSuccess("Bai!!!");
            process.exit(1);
            break;
        default:
            logger.logPrompt("No entendi.");
    }
}

function fetchTeamMembers() {
    logger.log("Fetching team members from slack");
    var p = new Promise(function(resolve, reject) {
        slackClient.getUsers(function(err, response) {
            if (err) {
                logger.logError("Loading team members: " + err);
                reject(err);
                process.exit(1);
            } else {
                logger.log("Got members");
                var users = response.members;
                for (var i = 0; i < users.length; i++) {
                    var user =  users[i];
                    controller.storage.users.save(user);
                }
                resolve();
            }
        });
    });
    return p;
}
// TODO Use Q
