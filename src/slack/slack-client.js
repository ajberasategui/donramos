var Slack = require('slack-node');
var slack = new Slack(process.env.token);
var promisify = require('promisify-node');

module.exports = {
    getUsers: promisify(getUsers) 
};

function getUsers(callback) {
    slack.api("users.list", callback);
}
