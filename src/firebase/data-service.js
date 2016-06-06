/* jshint esversion:6 */
const firebase = require('firebase');
const config = require('../config');
const logger = require('../logger/logger')


let db;
module.exports = init();

function init() {
    let fbConfig = {
        serviceAccount: config.FBCREDS,
        databaseURL: config.FBDBURL
    };
    firebase.initializeApp(fbConfig);
    db = firebase.database();
    
    return {
        update: update,
        save: save,
        get: get,
        remove: remove
    };
}

function getIdKey(ref) {
    
}

function remove(ref, id) {
    // FIXME where to specify id?
    return db.ref(ref).remove();
}

function update(ref, newData) {
    return db.ref(ref).update(newData);
}

function get(ref) {
    return db.ref(ref).once('value');
}

function save(ref, data) {
    return db.ref(ref).set(data);
}
