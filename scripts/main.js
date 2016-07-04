/* ----------------------------

	Navigation
	
---------------------------- */

var fab = document.getElementsByClassName('fab')[0];
var newJourneySection = document.getElementsByClassName('new-journey')[0];

function toggleModal() {
	fab.classList.toggle('modalOpen');
	newJourneySection.classList.toggle('modalOpen');
}

fab.addEventListener('click', function() {
	toggleModal();
});



/* ----------------------------

	Global
	
---------------------------- */

function DisplayMessage(type, message) {

	this.displayMessageEl = document.getElementsByClassName('display-message')[0];
	this.messageEl = document.getElementsByClassName('dm__message')[0];
	this.actionBTN = document.getElementsByClassName('dm__action')[0];
	this.dismissBTN = document.getElementsByClassName('dm__dismiss')[0];

	this._init(type, message);
}

DisplayMessage.prototype._open = function() {
	this.displayMessageEl.classList.add('open');
};

DisplayMessage.prototype._close = function() {
	this.displayMessageEl.classList.remove('open');
};

DisplayMessage.prototype._reset = function() {
	this.displayMessageEl.classList.remove('success');
	this.displayMessageEl.classList.remove('danger');
	this.messageEl.innerHTML = '';
	this.actionBTN.style.display = 'flex';
};

DisplayMessage.prototype.setupAction = function(buttonText, buttonFunction) {
	if ( !buttonText | !buttonFunction ) {
		this.actionBTN.style.display = 'none';
	}

	this.actionBTN.innerHTML = buttonText;
	this.actionBTN.addEventListener('click', buttonFunction);
};

DisplayMessage.prototype._init = function(type, message) {

	this._reset();

	this.displayMessageEl.classList.add(type);
	this.messageEl.innerHTML = message;

	this._open();

	var prototype = this;
	this.dismissBTN.addEventListener('click', function() {
		prototype._close();
	});

};

// var foo = new DisplayMessage('success', 'stuff');

// foo.setupAction('consoe', function() {
// 	console.log("hello");
// });



/* ----------------------------

	
	
---------------------------- */


var app_id = '1e55ad45';
var app_key = '40c230d6c65288e70be34a738dcc6b91';


/* ----------------------------

	Journey Prototype
	
---------------------------- */


function Journey(fromCoordinates, toCoordinates, fromName, toName) {

	this._fromCoordinates = fromCoordinates || '51.5151846554,-0.17553880792';
	this._toCoordinates = toCoordinates || '51.52989409,-0.185888819';

	this._fromName = fromName ? '&fromName='+fromName : '';
	this._toName = toName ? '&toName='+toName : '';

	this._url = 'https://api.tfl.gov.uk/Journey/JourneyResults/'+this._fromCoordinates+'/to/'+this._toCoordinates+'?nationalSearch=False&timeIs=Departing&journeyPreference=LeastTime&mode=tube&walkingSpeed=Average&cyclePreference=None&alternativeCycle=False&alternativeWalking=False&applyHtmlMarkup=False&useMultiModalCall=False&walkingOptimization=False'+this._fromName+this._toName+'&app_id='+app_id+'&app_key='+app_key;

	this._init();

}

Journey.prototype._setupData = function(result) {

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

			if ( j != 0 ) { 
				data.journeys[i].points.push(true);
			}

			if ( j == 0 ) {
				data.journeys[i].departure_location = result.journeys[i].legs[j].departurePoint.commonName;
			}

			if ( j == (result.journeys[i].legs.length - 1) ) {
				data.journeys[i].arrival_location = result.journeys[i].legs[j].arrivalPoint.commonName;
			}

		}
	}

	return data;

};


Journey.prototype._fetchData = function() {
	return fetch(this._url).then(function(response) {
		return response.json();
	}).catch(function(err) {
		console.log("there was an error here");
	});
};



Journey.prototype._init = function() {

	var prototype = this;

	this._fetchData()
	.then(function(result) {
		return prototype._setupData(result);
	})
	.then(function(data) {

		var html = MyApp.templates.journeys(data);
		document.getElementById('journeys').innerHTML = html;
	})
	.catch(function(err) {
		console.log("caught!", err);
		var foo = new DisplayMessage('danger', 'Looks like there was an error getting your journey. Please try a different route');
		foo.setupAction(false);
	});

};
  



/* ----------------------------

	
	
---------------------------- */

new Journey();




/* ----------------------------

	
	
---------------------------- */


var newJourneyForm = document.getElementById('new-journey-form');


newJourneyForm.addEventListener('submit', function(e) {

	e.preventDefault();

	var location_from = document.getElementById('location_from').value;
	var location_to = document.getElementById('location_to').value;

	var journey = new Journey(location_from, location_to);

	toggleModal();


});







