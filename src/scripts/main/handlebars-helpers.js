
/* INCREMENT VALUE BY ONE */
Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});


/* PRETTY TIME USING MOMENT.JS */
Handlebars.registerHelper('time', function (value, options) {

	var rawTime = value.split('T')[1];

	var hours = parseInt(rawTime.split(':')[0]);
	var minutes = parseInt(rawTime.split(':')[1]);
	var seconds = parseInt(rawTime.split(':')[2]);

	var m = moment().hours(hours).minutes(minutes);
	m = m.format('h:mma');
  
	return m;
});

/* PRETTY DATETIME USING MOMENT.JS */
Handlebars.registerHelper('datetime', function (value, options) {

	var rawDate = value.split('T')[0];
	var year = parseInt(rawDate.split('-')[0]);
	var month = parseInt(rawDate.split('-')[1]) - 1;
	var day = parseInt(rawDate.split('-')[2]);

	var rawTime = value.split('T')[1];
	var hours = parseInt(rawTime.split(':')[0]);
	var minutes = parseInt(rawTime.split(':')[1]);
	var seconds = parseInt(rawTime.split(':')[2]);

	var m = moment().year(year).month(month).date(day).hours(hours).minutes(minutes);
	m = m.calendar(null, {
		sameDay: '[Today at] h:mma',
		nextDay: '[Tomorrow at] h:mma',
		nextWeek: '[Next] dddd [at] h:mma',
		lastDay: '[Yesterday at] h:mma',
		lastWeek: '[Last] dddd [at] h:mma',
		sameElse: '[on] dddd Do MMMM [at] h:mma'
	});
  
	return m;
});



/* PRETTY DATETIME USING MOMENT.JS */
Handlebars.registerHelper('escape_html', function (value, options) {

	return value;

});
