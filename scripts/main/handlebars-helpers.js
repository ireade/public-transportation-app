
/* INCREMENT VALUE BY ONE */
Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});


/* PRETTY TIME USING MOMENT.JS */
Handlebars.registerHelper('time', function (value, options) {

	'2016-07-03T18:51:00';

	var rawTime = value.split('T')[1];

	var hours = parseInt(rawTime.split(':')[0]);
	var minutes = parseInt(rawTime.split(':')[1]);
	var seconds = parseInt(rawTime.split(':')[2]);

	var m = moment().hours(hours).minutes(minutes);
		m = m.format('h:mma');
  
	return m;
});
