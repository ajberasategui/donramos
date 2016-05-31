let teamMembersListeners = [];
let learntConceptsListeners = [];
let usersInRGListeners = [];

let tmLoaded = false;
let conceptsLoaded = false;
let usersInRGLoaded = false;

module.exports = {
    onTeamMembersLoaded: function(listener) {
        addListener("TEAM_MEMBERS_LOADED", listener);
    },
    onLearntConceptsLoaded: function(listener) {
        addListener("CONCEPTS_LOADED", listener);
    },
    onUsersInRGLoaded: function(listener) {
        addListener("USERS_IN_RG_LOADED", listener);
    }
};

/**
 * Add a load listener for event.
 * 
 * @param {String} event Collection load event name.
 * @param {function} listener callback function to execute when 
 * collection is loaded.
 * 
 * @returns True if listener was added. False if collection was already 
 * loaded and there won't be any notificacion.
 */
function addListener(event, listener) {
    switch(event) {
        case "TEAM_MEMBERS_LOADED":
            if (!tmLoaded) {
                teamMembersListeners.push(listener);
            } else {
                return false;
            }
            break;
        case "CONCEPTS_LOADED":
            if (!conceptsLoaded) {
                learntConceptsListeners.push(listener);
            } else {
                return false;
            }
            break;
        case "USERS_IN_RG_LOADED":
            if (!usersInRGLoaded) {
                usersInRGListeners.push(listener);
            } else {
                return false;
            }
            break;
        default:
    }
    return true;
}

function loadTeamMembers() {
    tmLoaded = true;
    // actually load
}

function loadUsersInRG() {
    usersInRGLoaded = true;
    // actually load
}

function loadLearntConcepts() {
    conceptsLoaded = true;
    // actually load
}
