/// <reference path="logger/logger.js"/>
/* jshint esversion:6 */


// Vendor libs
var moment = require('moment');
var slackClient = require('./slack/slack-client');
var lodash = require('lodash');
var Store = require('jfs');
var colors = require('colors');
var Q = require('q');
var promisify = require('promisify-node');

// Own libs
var gcalAuth = require('./gcal/gcal-auth');
var gCalendar = require('./gcal/gcalendar');
var config = require('./config');
var logger = require('./logger/logger');
var slackBot = require('./botkit/slack_bot');
var hears = require('./hears');

var db;
var controller;
const myName = "/don(.*)ramos/i"; 

if (!process.env.token) {
    logger.logError('Error: Specify token in environment');
    process.exit(1);
} else {
    init();
}

function init() {
    db = new Store('storage');
    
    slackBot.init(config, process.env.token);
    controller = slackBot.getController();
    
    let bot = slackBot.getBot();
    
    promisifyAll();
    
    var load = Q.all([
        db.get("usersInRG"),
        db.get("learnt"),
        fetchTeamMembers()
    ]);
    load.then((results) => {
        try {
            usersInRG = results[0];
            concepts = results[1];
            allMembers = results[2];
            logger.logSuccess("Pariendo...");
            listener = hears(bot, controller, config, db, myName);
            
            listener.setAllMembers(allMembers);
            listener.setUsersInRG(usersInRG);
            listener.setLearntConcepts(concepts);
            logger.logSuccess("Don Ramos ha nacido");
        } catch (e) {
            logger.logError(JSON.stringify(e));
            process.exit(1);
        }
    });
    load.catch((errors) => {
        logger.logError(JSON.stringify(errors));
        process.exit(1);
    });
}

function promisifyAll() {
    db.get = promisify(db.get);
    controller.storage.users.get = promisify(controller.storage.users.get);
}

function fetchTeamMembers() {
    var promise = slackClient.getUsers();
    promise.then(function(response) {
        if (err) {
            logger.logError(err);
        } else {
            var users = response.members;
            for (var i = 0; i < users.length; i++) {
                var user =  users[i];
                controller.storage.users.save(user);
            }
        }    
    });
    return promise;
}
// TODO Use Q
