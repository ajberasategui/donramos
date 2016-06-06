/* jshint esversion:6 */
const logger = require('../logger/logger');
const db = require('../firebase/data-service');
const q = require('q');

module.exports = {
    recall: recall,
    rememberThat: rememberThat,
    forget: forget
};

let memory = {};

function recall(memoryName) {
    var deferred = q.defer();
    if (memory[memoryName]) {
        deferred.resolve(memory[memoryName]);
    } else {
        db.get(memoryName)
            .then((result) => {
                memory[memoryName] = result.val();
                deferred.resolve(memory[memoryName]);
            });
    }
    
    return deferred.promise;
}

function rememberThat(memoryName, toRemember) {
    logger.log("About to remember: " + memoryName);
    return db.save(memoryName, toRemember);
}



function forget(memoryName) {
    throw "Not yet implemented";
}

// The following is for my father to remember...
// obj = { func : func };
// obj['func']();
