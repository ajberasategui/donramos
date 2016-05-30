// Uses gcal-auth.js services.
var google = require('googleapis');
var utils = require('./utils');
// Current app specific configs
var config = require('./config');

module.exports = {
    getWeekEvents: getThisWeekCalendarEvents,
    getMonthEvents: getThisMonthCalendarEvents,
    listCalendars: listCalendars
};

/**
 * Get Events calendar RAMOS GENERALES this month events.
 * 
 */
function getThisMonthCalendarEvents(auth, successCallback, errorCallback) {
    getRangeEvents(auth, 'month', successCallback, errorCallback);
}

/**
 * Get Events calendar RAMOS GENERALES this week events.
 * 
 */
function getThisWeekCalendarEvents(auth, successCallback, errorCallback) {
    getRangeEvents(auth, 'week', successCallback, errorCallback);
}

function getRangeEvents(auth, range, successCallback, errorCallback) {
    var calendar = google.calendar('v3');
    var dateRange;
    switch(range) {
        case 'month':
            dateRange = utils.currentMonth();
            break;
        case 'week':
        default:
            dateRange = utils.currentWeek();
    }
    dateRange = { start: dateRange.start.toISOString(), end: dateRange.end.toISOString() };
    
    if (config.debug.gcalendar) {
        console.log("Buscando eventos entre %s y %s", dateRange.start, dateRange.end);
    }
    
    calendar.events.list({
        auth: auth,
        calendarId: config.RG_CAL,
        timeMin: dateRange.start,
        timeMax: dateRange.end
    }, function(err, response) {
        if (err) {
            errorCallback(err);
        } else {
            successCallback(response.items);
        }
    });
}

/** 
 * Lists all calendars for current connected user
 * 
 * @param {Object} auth authentication object 
 */
function listCalendars(auth) {
    var calendar = google.calendar('v3');
    calendar.calendarList.list({
        auth: auth
    }, function(err, response) {
        if (err) {
            console.log("There was an error...", err);
            return;
        } else {
            var calendars = response.items;
            for (var i = 0; i < calendars.length; i++) {
                var cal = calendars[i];
                console.log('%s, %s', cal.summary, cal.id);
            }
        }
    });
}
