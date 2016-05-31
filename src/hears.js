/* jshint esversion:6 */
var logger = require('./logger/logger');
var gcalAuth = require('./gcal/gcal-auth');
var gCalendar = require('./gcal/gcalendar');
var moment = require('moment');
var _ = require('lodash');
var Store = require('jfs');
var fs = require('fs');

let bot;
let controller;
let config;
let db;
let usersInRG;
let learntConcepts;
let myName;
let hearsDir;
let hearsHelp = [];

module.exports = function(theBot, theController, theConfig, theDB, botName, hearDir) {
    myName = botName;
    bot = theBot;
    controller = theController;
    config = theConfig;
    db = theDB;
    hearsDir = hearDir;
    initOwnHears();
    loadExternalHears();
    return {
        setUsersInRG: setUsersInRG,
        setLearntConcepts: setLearntConcepts,
        addHear: addHear
    };
};

/**
 * Load hears declared as modules in hears/*.js
 * Call init on every module which includes it and add a hear using
 * the module exported properties/functions:
 *  - msg
 *  - env
 *  - responseCallback
 *  - init
 */
function loadExternalHears() {
    if (!_.isUndefined(hearsDir)) {
        var extHears = fs.readdirSync(hearsDir);
        _.forEach(extHears, function(hear) {
            logger.logSuccess("./hears/" + hear);
            var h = require("./hears/" + hear);
            logger.logSuccess(JSON.stringify(h));
            if (!_.isUndefined(h.usage) && !_.isUndefined(h.whatItDoes)) {
                addHearHelp(hear, h.usage, h.whatItDoes);
            }
            if (!_.isUndefined(h.init) && _.isFunction(h.init)) {
                try {
                    logger.logSuccess("Calling " + hear + " init");
                    h.init(controller, db);
                    logger.logSuccess(hear + " initiated.");
                    try {
                        controller.hears(h.msg, h.env, h.responseCallback);
                        logger.logSuccess(hear + " hear added.");
                    } catch (e) {
                        logger.logError("Executing hears for " + hear);
                    }
                } catch (e) {
                    logger.logError("Executing init for " + hear);
                }
            } else {
                controller.hears(h.msg, h.env, h.responseCallback);
            }
        });
    } else {
        logger.logError("hearsDir is not defined.");
    }
}

function addHearHelp(hearName, usage, whatItDoes) {
    if (!_.has(hearsHelp, hearName)) {
        hearsHelp[hearName] = {
            "usage": usage,
            "whatItDoes": whatItDoes
        };
    }
}

function initOwnHears() {
    var enteradoCount = 0;
    addHear(['('+myName+')*'+'estoy en rg'], config.HEAR_ENVS.MENTION_AND_DIRECT, estoyEnRG);
    addHear(['('+myName+')*'+'quien(.*)en rg'], config.HEAR_ENVS.MENTION_AND_DIRECT, quienEnRG);
    addHear(['('+myName+')*'+'reuniones(.*)semana'], config.HEAR_ENVS.MENTION_AND_DIRECT, reunionesSemana);
    addHear(['('+myName+')*'+'reuniones(.*)mes'], config.HEAR_ENVS.MENTION_AND_DIRECT, reunionesMes);
    addHear(['('+myName+')*'+'aprende (.*):(.*)'], config.HEAR_ENVS.MENTION_AND_DIRECT, aprende);
    addHear(['('+myName+')*'+'hola'], config.HEAR_ENVS.MENTION_AND_DIRECT, queSeYo);
    addHear(['('+myName+')*'+'me voy'], config.HEAR_ENVS.MENTION_AND_DIRECT, meVoy);
}

/**
 * Add a hear function to controller
 *
 * @param msg {Array} Array of messages to respond to.
 * @param env {String} Environments on to listen to.
 * @param responseCallback {function} Function to execute when msg is received.
 */
function addHear(msg, env, responseCallback) {
    controller.hears(msg, env, responseCallback);
}

function queSeYo(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        var iCan = "Darte las reuniones del mes si me decis 'reuniones mes' \n" +
            "Darte las reuniones de la semana si me decis 'reuniones semana' \n" +
            "Aprender cosas nuevas si me decis 'aprende pregunta:respuest' \n" +
            "Registrarte como presente en RG si me decis 'estoy en rg' \n" +
            "Decirte quien esta en RG ahora si me preguntas 'quien en rg' \n" +
            "Avisarme cuando te vas de RG diciendome 'me voy'";

        var title = (user && user.profile.first_name) ? "Hola " + user.profile.first_name + ". " : "Hola. ";
        title += "Puedo: ";
        answerAsAttachment(bot, message, title, iCan);
    });
}

function sugerencia(bot, message) {
    var keyword = "sugerencia:";
    var msg = message.text;
    msg = msg.substring(msg.indexOf(keyword) + keyword.length);

    logger.logSuccess(message.user + " esta sugiriendo que: " + msg);
    var suggestions = [];
    db.get('suggestions')
        .then(function(savedSuggestions) {
            suggestions = savedSuggestions;
        })
        .finally(function() {
            suggestions.push({
                "user":         message.user,
                "suggestion":   msg
            });
            db.save('suggestions', suggestions);
        });
}

function aprende(bot, message) {
    var keyword = "aprende";
    var msg = message.text;
    msg = msg.substring(msg.indexOf(keyword) + keyword.length);

    logger.logSuccess(message.user + " esta intentando enseñarme que: " + msg);

    var toLearn = msg.split(":");
    if (2 === toLearn.length) {
        addHear(toLearn[0].trim(), config.HEAR_ENVS.ALL, function(bot, message) {
            bot.reply(message, toLearn[1].trim());
        });
        saveNewConcept(toLearn[0], toLearn[1]);
        bot.reply(message, "Enterado! igual tengo un poco de perdida de memoria...");
    } else {
        bot.reply(message, "No, asi no te entiendo. Tiene que ser _aprende pregunta:respuesta_");
    }
}

function reunionesSemana(bot, message) {
    gcalAuth.authorizeAndCall(function(auth) {
        gCalendar.getWeekEvents(auth, getEventsSuccess);
    });

    function getEventsSuccess(events) {
        var response = '';
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            response +=
                event.summary + ' ' + moment(event.start.dateTime).format(config.DATE_FORMAT) + "\n";
        }
        answerAsAttachment(bot, message, "Reuniones de esta semana", response);
    }
}

function reunionesMes(bot, message) {
    gcalAuth.authorizeAndCall(function(auth) {
        gCalendar.getMonthEvents(auth, getEventsSuccess);
    });

    function getEventsSuccess(events) {
        var response = '';
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            response +=
                event.summary + ' ' + moment(event.start.dateTime).format(config.DATE_FORMAT) + "\n";
        }
        answerAsAttachment(bot, message, "Reuniones de este mes", response);
    }
}

function meVoy(bot, message) {
    _.remove(usersInRG, (u) => {
        return u == message.user;
    });
    logger.logSuccess(JSON.stringify(usersInRG));
    bot.reply(message, "Listo, trae alfajores.");
    db.save(usersInRG);
}

function estoyEnRG(bot, message) {
    usersInRG = usersInRG || [];
    usersInRG.push(message.user);
    usersInRG = _.uniq(usersInRG);
    db.save('usersInRG', usersInRG);
    controller.storage.users.get(message.user)
        .then(function(user) {
            bot.reply(message, "Enterado, " + user.real_name);
        })
        .catch(function(err) {
            bot.reply(message, "Encontre el error: " + err);
            logger.logError(err);
        });
}

function quienEnRG(bot, message) {
    if (usersInRG && _.isArray(usersInRG) && 0 < usersInRG.length) {
        var users = '';
        for (var i = 0; i < usersInRG.length; i++) {
            controller.storage.users.get(usersInRG[i], function(err, user) {
                if (err) {
                    console.log('ERROR: ', err);
                } else {
                    users += " " + user.real_name;
                    if (i === usersInRG.length - 1) {
                        bot.reply(message, 'Estan: ' + users);
                    }
                }
            });
        }
    } else {
        bot.reply(message, "Que yo sepa, _naides_");
    }
}

function setUsersInRG(users) {
    usersInRG = users;
}

function answerAsAttachment(bot, message, title, answer) {
    bot.reply(message, {'text': title, 'attachments': [{'text': answer}]});
}

function setLearntConcepts(concepts) {
    _.forEach(concepts, (concept) => {
        var question = Object.keys(concept)[0];
        var answer = concept[question];
        logger.logSuccess("Recordando que " + question + " => " + answer);
        addHear(question, config.HEAR_ENVS.ALL, function(bot, message) {
            bot.reply(message, answer);
        });
    });
}

function saveNewConcept(question, answer) {
    db.get('learnt', (err, concepts) => {
        if (err) {
            logger.logError("No puedo recordar lo aprendido. " + err);
            concepts = [];
        }
        var concept = {};
        concept[question.trim()] = answer.trim();
        concepts.push(concept);
        db.save('learnt', concepts);
    });
}
// controller.on('user_typing', function(bot, args) {
//     console.log("IS TYPING", args);
// });


// controller.hears(['estoy en rg'], config.HEAR_ENVS.MENTION_AND_DIRECT, function(bot, message) {
//     controller.storage.users.get(message.user, function(err, user) {
//         usersInRG.push(user.id);
//         db.save('usersInRG', usersInRG, function(err) {
//             if (err) {
//                 bot.reply(message, "No te pude anotar, " + user.real_name);
//             } else {
//                 bot.reply(message, "Enterado, " + user.real_name);
//             }
//         });

//     });
// });

// controller.hears(['quien(.*)en rg'], config.HEAR_ENVS.ALL, function(bot, message) {
//     var users = '';
//     console.log(usersInRG);
//     for (var i = 0; i < usersInRG.length; i++) {
//         controller.storage.users.get(usersInRG[i], function(err, user) {
//             if (err) {
//                 console.log('ERROR: ', err);
//             } else {
//                 users += " " + user.real_name;
//                 if (i === usersInRG.length - 1) {
//                     bot.reply(message, 'Estan: ' + users);
//                 }
//             }
//         });
//     }
// });

// controller.hears(['hola'], config.HEAR_ENVS.ALL, function(bot, message) {

//     bot.api.reactions.add({
//         timestamp: message.ts,
//         channel: message.channel,
//         name: 'robot_face',
//     }, function(err, res) {
//         if (err) {
//             bot.botkit.log('Failed to add emoji reaction :(', err);
//         }
//     });


//     controller.storage.users.get(message.user, function(err, user) {
//         if (user && user.name) {
//             bot.reply(message, 'Hola ' + user.name + '!!');
//         } else {
//             bot.reply(message, 'Hola, yo estoy siempre.');
//         }
//     });
// });

// controller.hears(['reuniones(.*)semana'], config.HEAR_ENVS.ALL, function(bot, message) {
    // gcalAuth.authorizeAndCall(function(auth) {
    //     gCalendar.getWeekEvents(auth, getEventsSuccess);
    // });

    // function getEventsSuccess(events) {
    //     var response = '';
    //     for (var i = 0; i < events.length; i++) {
    //         var event = events[i];
    //         response +=
    //             event.summary + ' ' + moment(event.start.dateTime).format(config.DATE_FORMAT) + "\n";
    //     }
    //     bot.reply(message, {'text': 'Reuniones de esta semana', 'attachments': [{'text': response}]});
    // }
// });

// controller.hears(['reuniones(.*)mes'], config.HEAR_ENVS.ALL, function(bot, message) {
//     gcalAuth.authorizeAndCall(function(auth) {
//         gCalendar.getMonthEvents(auth, getEventsSuccess);
//     });

//     function getEventsSuccess(events) {
//         var response = '';
//         for (var i = 0; i < events.length; i++) {
//             var event = events[i];
//             response +=
//                 event.summary + " " +
//                 moment(event.start.dateTime).format(config.DATE_FORMAT) + "\n";
//         }
//         bot.reply(message, {'text': 'Reuniones del mes', 'attachments': [{'text': response}]});
//     }
// });

// controller.hears(['(d|D)on( )(r|R)amos (.*) maestro'], HEAR_ENVS.ALL, function(bot, message) {
//    bot.reply(message, "Ya se.");
// });



// controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
//     var name = message.match[1];
//     controller.storage.users.get(message.user, function(err, user) {
//         if (!user) {
//             user = {
//                 id: message.user,
//             };
//         }
//         user.name = name;
//         controller.storage.users.save(user, function(err, id) {
//             bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
//         });
//     });
// });

// controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

//     controller.storage.users.get(message.user, function(err, user) {
//         if (user && user.name) {
//             bot.reply(message, 'Your name is ' + user.name);
//         } else {
//             bot.startConversation(message, function(err, convo) {
//                 if (!err) {
//                     convo.say('I do not know your name yet!');
//                     convo.ask('What should I call you?', function(response, convo) {
//                         convo.ask('You want me to call you `' + response.text + '`?', [
//                             {
//                                 pattern: 'yes',
//                                 callback: function(response, convo) {
//                                     // since no further messages are queued after this,
//                                     // the conversation will end naturally with status == 'completed'
//                                     convo.next();
//                                 }
//                             },
//                             {
//                                 pattern: 'no',
//                                 callback: function(response, convo) {
//                                     // stop the conversation. this will cause it to end with status == 'stopped'
//                                     convo.stop();
//                                 }
//                             },
//                             {
//                                 default: true,
//                                 callback: function(response, convo) {
//                                     convo.repeat();
//                                     convo.next();
//                                 }
//                             }
//                         ]);

//                         convo.next();

//                     }, {'key': 'nickname'}); // store the results in a field called nickname

//                     convo.on('end', function(convo) {
//                         if (convo.status == 'completed') {
//                             bot.reply(message, 'OK! I will update my dossier...');

//                             controller.storage.users.get(message.user, function(err, user) {
//                                 if (!user) {
//                                     user = {
//                                         id: message.user,
//                                     };
//                                 }
//                                 user.name = convo.extractResponse('nickname');
//                                 controller.storage.users.save(user, function(err, id) {
//                                     bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
//                                 });
//                             });



//                         } else {
//                             // this happens if the conversation ended prematurely for some reason
//                             bot.reply(message, 'OK, nevermind!');
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });


// controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

//     bot.startConversation(message, function(err, convo) {

//         convo.ask('Are you sure you want me to shutdown?', [
//             {
//                 pattern: bot.utterances.yes,
//                 callback: function(response, convo) {
//                     convo.say('Bye!');
//                     convo.next();
//                     setTimeout(function() {
//                         process.exit();
//                     }, 3000);
//                 }
//             },
//         {
//             pattern: bot.utterances.no,
//             default: true,
//             callback: function(response, convo) {
//                 convo.say('*Phew!*');
//                 convo.next();
//             }
//         }
//         ]);
//     });
// });


// controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
//     'direct_message,direct_mention,mention', function(bot, message) {

//         var hostname = os.hostname();
//         var uptime = formatUptime(process.uptime());

//         bot.reply(message,
//             ':robot_face: I am a bot named <@' + bot.identity.name +
//              '>. I have been running for ' + uptime + ' on ' + hostname + '.');

//     });
