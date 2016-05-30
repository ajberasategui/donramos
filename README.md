### How to add your Hear.

Create under src/hears a js file. You can use src/hears as example. Your module MUST
export 3 properties:

- msg: The string to react to.
- env: Envs to hear on. See https://github.com/howdyai/botkit/blob/master/readme-slack.md#message-received-events for environments/events.
- responseCallback: The function to execute when msg is received. It MUST accept the params bot and message and send its reply as ``` bot.reply(message, <yourReplyHere>).
