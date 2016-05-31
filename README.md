### How to add your Hear.

Create under src/hears a js file. You can use src/hears/test.js as example. 

##### Your module MUST export 2 properties and 1 function and MAY export the extra function (init):

- msg: The string to react to.
- env: Envs to hear on. See https://github.com/howdyai/botkit/blob/master/readme-slack.md#message-received-events for environments/events.
- responseCallback: The function to execute when msg is received. It MUST accept the params bot and message and send its reply as 
``` bot.reply(message, <yourReplyHere>). ```
- init: (optional) This function will be called with controlle (botkit bot controller for donramos) and db 
(jfs module storage object). This function is called before registering the hear, so you may you use to interact
with the controller and the data storage to retrieve data needed for your hear callback.

##### Example

```
let config = require('../config');

module.exports = {
    init: init,
    msg: '(test)*'+'(.*)',
    env: config.HEAR_ENVS.MENTION_AND_DIRECT,
    responseCallback: responseCallback
};

let enteradoCount = 0;
let usersInRG = [];

function init(controller, db) {
    db.get('usersInRG')
        .then(function(users){
            usersInRG = users;
        });
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
``` 

