colors = require('colors');

module.exports = {
    logError: logError,
    logSuccess: logSuccess,
    log: log,
    logPrompt: logPrompt
};

/**
 * Log a message using red color
 * 
 * @param {String} msg message to log
 */
function logError(msg) {
    console.log(("ERROR: " + msg).red);
}

/**
 * Log a message using green color
 * 
 * @param {String} msg message to log
 */
function logSuccess(msg) {
    console.log(("SUCCESS: " + msg).green);
}

/**
 * Log a message using white color
 * 
 * @param {String} msg message to log
 */
function log(msg) {
    console.log(msg.white);
}

function logPrompt(msg) {
    console.log(msg.blue);
}
