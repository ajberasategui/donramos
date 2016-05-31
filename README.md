### How to add your Hear.

Create under src/hears a js file. You can use src/hears/test.js as example. 

##### Your module MUST export 3 properties and MAY export an extra function:

- msg: The string to react to.
- env: Envs to hear on. See https://github.com/howdyai/botkit/blob/master/readme-slack.md#message-received-events for environments/events.
- responseCallback: The function to execute when msg is received. It MUST accept the params bot and message and send its reply as 
``` bot.reply(message, <yourReplyHere>). ```
- init: (optional) This function will be called with controlle (botkit bot controller for donramos) and db 
(jfs module storage object). This function is called before registering the hear, so you may you use to interact
with the controller and the data storage to retrieve data needed for your hear callback. 

