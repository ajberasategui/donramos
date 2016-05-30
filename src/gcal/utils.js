module.exports = {
    currentWeek: function() {
        var current = new Date();     // get current date    
        var weekstart = current.getDate() - current.getDay() +1;    
        var weekend = weekstart + 6;       // end day is the first day + 6 
        var monday = new Date(current.setDate(weekstart));  
        var sunday = new Date(current.setDate(weekend));
        return {start: monday, end: sunday};
    },
    currentMonth: function() {
        var current = new Date();
        var monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        var lastDayOfMonth = new Date(current.getFullYear(), current.getMonth()+1, 0);
        return {
            start: monthStart,
            end: lastDayOfMonth
        };
    }
};
