/* ----------------------------

	Navigation
	
---------------------------- */

var fab = document.getElementsByClassName('fab')[0];
var newJourneySection = document.getElementsByClassName('new-journey')[0];

fab.addEventListener('click', function() {

	fab.classList.toggle('modalOpen');
	newJourneySection.classList.toggle('modalOpen');

});



/* ----------------------------

	
	
---------------------------- */

Handlebars.registerHelper("inc", function(value, options) {
    return parseInt(value) + 1;
});

Handlebars.registerHelper('ifvalue', function (conditional, options) {
  if (options.hash.value === conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this);
  }
});


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



/* ----------------------------

	
	
---------------------------- */


var journey_from_coordinates = '51.5151846554,-0.17553880792';
var journey_to_coordinates = '51.52989409,-0.185888819';

var journey_from_name = 'Paddington' || '';
var journey_to_name = 'Maida Vale' || '';

var app_id = '1e55ad45';
var app_key = '40c230d6c65288e70be34a738dcc6b91';


var url = 'https://api.tfl.gov.uk/Journey/JourneyResults/'+journey_from_coordinates+'/to/'+journey_to_coordinates+'?fromName='+journey_from_name+'&toName='+journey_to_name+'&nationalSearch=False&timeIs=Departing&journeyPreference=LeastTime&mode=tube&walkingSpeed=Average&cyclePreference=None&alternativeCycle=False&alternativeWalking=False&applyHtmlMarkup=False&useMultiModalCall=False&walkingOptimization=False&app_id='+app_id+'&app_key='+app_key;

fetch(url).then(function(response) {
	return response.json();
}).then(function(result) {
	
	console.log(result);


	var data = {
		departure_location: result.journeys[0].legs[0].departurePoint.commonName,
		arrival_location: result.journeys[0].legs[ result.journeys[0].legs.length - 1 ].arrivalPoint.commonName,
		departure_time: result.journeys[0].startDateTime,
		journeys: result.journeys
	};

	for ( var i = 0; i < result.journeys.length; i++ ) {
		data.journeys[i].points = [];
		data.journeys[i].departure_location;
		data.journeys[i].arrival_location;

		for ( var j = 0; j < result.journeys[i].legs.length; j++ ) {
			if ( j != 0 ) { data.journeys[i].points.push(true) }

			if ( j == 0 ) {
				data.journeys[i].departure_location = result.journeys[i].legs[j].departurePoint.commonName;
			}

			if ( j == (result.journeys[i].legs.length - 1) ) {
				data.journeys[i].arrival_location = result.journeys[i].legs[j].arrivalPoint.commonName;
			}

		}
	}


	var html = MyApp.templates.journeys(data);

	document.getElementById('journeys').innerHTML = html;

});




/* ----------------------------

	
	
---------------------------- */


var newJourneyForm = document.getElementById('new-journey-form')







