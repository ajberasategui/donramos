/// <reference path="../../typings/tsd.d.ts"/>
/* jshint esversion:6 */
const _ = require('lodash');

module.exports = {
    unamesToIds: unamesToIds
};

function unamesToIds(unames, allUsers) {
    let usersWithIds = [];
    _.forEach(unames, (uname) => {
        const u = _.find(allUsers, {"name": uname});
        usersWithIds.push({
            "id": u.id,
            "name": u.name
        });
    });
    return usersWithIds;
}
