var gcalAuth = require('./gcal-auth');
var gCalendar = require('./gcalendar');

gcalAuth.authorizeAndCall(function(auth) {
    gCalendar.getWeekEvents(auth, getWeekEventsSuccess);
});

function getWeekEventsSuccess(events) {
    var eventsAndDates = [];
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        eventsAndDates.push({
            'title': event.summary, 
            'date': new Date(event.start.dateTime)
        });
    }
    return eventsAndDates;
}
