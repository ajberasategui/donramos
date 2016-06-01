var Slack = require('slack-node');
var slack = new Slack(process.env.token);

module.exports = {
    getUsers: getUsers 
};

function getUsers(callback) {
    slack.api("users.list", callback);
}
