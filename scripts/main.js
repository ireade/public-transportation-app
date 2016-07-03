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

	Navigation
	
---------------------------- */

var url = 'https://api.tfl.gov.uk/Journey/JourneyResults/51.519261,%20-0.176085/to/51.514667,%20-0.146952?nationalSearch=False&timeIs=Departing&journeyPreference=LeastTime&mode=tube&walkingSpeed=Average&cyclePreference=None&alternativeCycle=False&alternativeWalking=True&applyHtmlMarkup=False&useMultiModalCall=False&walkingOptimization=False&app_id=1e55ad45&app_key=40c230d6c65288e70be34a738dcc6b91';

fetch(url).then(function(response) {
	console.log( response )
});


var data = {title: "My New Post", body: "This is my first post!"};

var source = document.getElementById('journeys-template').innerHTML;
var template = Handlebars.compile(source);
var output = template( data );

document.getElementById('journeys').innerHTML = output;
