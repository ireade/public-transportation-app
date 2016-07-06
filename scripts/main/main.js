/* ----------------------------

	Table of Contents
	=================

	1. Global Functons

		1.1 Navigation
		1.2 Display Message Prototype
		1.3 Loading Animation

	2. Index Controller

	3. Journey Prototype

	4. Form Controller
	
---------------------------- */


var app_id = '1e55ad45';
var app_key = '40c230d6c65288e70be34a738dcc6b91';




/* ----------------------------

	1. Global Functions
	
---------------------------- */


/* 1.1 NAVIGATION ------------------- */


var fab = document.getElementsByClassName('fab')[0];
var newJourneySection = document.getElementsByClassName('new-journey')[0];

function toggleModal() {
	fab.classList.toggle('modalOpen');
	newJourneySection.classList.toggle('modalOpen');
}

fab.addEventListener('click', function() {
	toggleModal();
});


/* 1.2. DISPLAY MESSAGE ------------------- */

function DisplayMessage(type, message) {

	this.displayMessageEl = document.getElementsByClassName('display-message')[0];
	this.messageEl = document.getElementsByClassName('dm__message')[0];
	this.actionBTN = document.getElementsByClassName('dm__action')[0];
	this.dismissBTN = document.getElementsByClassName('dm__dismiss')[0];

	this._init(type, message);
}

DisplayMessage.prototype._toggle = function() {
	this.displayMessageEl.classList.toggle('open');
};

DisplayMessage.prototype._reset = function() {
	this.displayMessageEl.classList.remove('success', 'danger', 'open');
	this.messageEl.innerHTML = '';
	this.actionBTN.style.display = '';
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

	this._toggle();

	var prototype = this;
	this.dismissBTN.addEventListener('click', function() {
		prototype._toggle();
	});
};


/* 1.3 LOADING ANIMATION ------------------- */

function Loader(element) {
	this._target = element;

	this._loader = document.createElement('div');
	this._loader.classList.add('spinner');
	this._loader.innerHTML = '<div class="double-bounce1"></div>\
							<div class="double-bounce2"></div>';

	this._init();
}
Loader.prototype._init = function() {
	this._target.innerHTML = '';
	this._target.appendChild(this._loader);
};
Loader.prototype.remove = function() {
	this._target.removeChild(this._loader);
};





/* ----------------------------

	2. IndexController
	
---------------------------- */

function IndexController() {

	this._dbPromise = this._setupDB();
	this._registerServiceWorker();
	this.showDefaultJourney();

}


IndexController.prototype._setupDB = function() {
	if (!navigator.serviceWorker) { return Promise.resolve(); }

	return dbPromise = idb.open('tplanr', 1, function(upgradeDb) {
		var store = upgradeDb.createObjectStore('journeys', {
			keyPath: 'departure_time'
		});
	});
};

IndexController.prototype._registerServiceWorker = function() {

	if ( !('serviceWorker' in navigator) ) {

		new DisplayMessage('success', "Your browser doesn't support all the cool features this application offers (like offline capabilities). Why not try using this app in Chrome?")
			.setupAction('Get Chrome', function() {
				window.open('https://www.google.com/chrome/browser/mobile/index.html');
			});

		return;
	}



	navigator.serviceWorker
	.register('./service-worker.js', { scope: './' })
	.then(function(reg) {
		console.log('Service Worker Registered', reg);

		if (reg.waiting) {
			console.log('reg waiting');

			new DisplayMessage('success', "There's a new verion of TubePlanr available! Click refresh to update")
			.setupAction('Refresh', function() {
				reg.waiting.postMessage({ action: 'skipWaiting' });
			});

			return;
		}

	})
	.catch(function(err) {
		console.log('Service Worker Failed to Register', err);
	});


	navigator.serviceWorker.addEventListener('controllerchange', function() {
		window.location.reload();
	});


};



IndexController.prototype._handleEmptyState = function() {
	toggleModal();
};

IndexController.prototype.showDefaultJourney = function() {

	var prototype = this;

	this._dbPromise.then(function(db) {

		var tx = db.transaction('journeys', 'readwrite');
		var store = tx.objectStore('journeys');
		return store.getAll();

	}).then(function(response) {

		if ( response.length == 0 ) {
			prototype._handleEmptyState();
			return Promise.reject();
		} else {

			/* create new journey from database results */
			new Journey(null, response[0]);
			return Promise.resolve(response[0]);
		}
		

	}).then(function(lastJourney) {

		/* FETCH UPDATED DATA FOR LAST JOURNEY */

		var lastJourneyDeparturePoint = lastJourney.journeys[0].legs[0].departurePoint;
		var lastJourneyArrivalPoint = lastJourney.journeys[0].legs[ lastJourney.journeys[0].legs.length - 1 ].arrivalPoint;

		var fetchInformation = {
			fromCoordinates: lastJourneyDeparturePoint.lat +','+ lastJourneyDeparturePoint.lon,
			toCoordinates: lastJourneyArrivalPoint.lat +','+ lastJourneyArrivalPoint.lon,
			fromName: lastJourney.departure_location,
			toName: lastJourney.arrival_location
		};

		new Journey(fetchInformation, null, true);

	});
};



var Controller = new IndexController();






/* ----------------------------

	3. Journey Prototype
	
---------------------------- */


function Journey(newJourney, savedJourney, shouldHideLoader) {

	this._savedJourney = false;

	this._shouldHideLoader = shouldHideLoader;

	if ( savedJourney ) {

		this._savedJourney = savedJourney;
		
	} else if ( newJourney ) {

		this._fromCoordinates = newJourney.fromCoordinates;
		this._toCoordinates = newJourney.toCoordinates;
		this._fromName = newJourney.fromName ? '&fromName='+newJourney.fromName : '';
		this._toName = newJourney.toName ? '&toName='+newJourney.toName : '';

		this._fetchUrl = 'https://api.tfl.gov.uk/Journey/JourneyResults/'+this._fromCoordinates+'/to/'+this._toCoordinates+'?nationalSearch=True&timeIs=Departing&journeyPreference=LeastTime&mode=tube&walkingSpeed=Average&cyclePreference=None&alternativeCycle=False&alternativeWalking=False&applyHtmlMarkup=False&useMultiModalCall=False&walkingOptimization=False'+this._fromName+this._toName+'&app_id='+app_id+'&app_key='+app_key;

	}

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

		var journey = result.journeys[i];

		data.journeys[i].points = []; /* Number of stops between dep and arr */
		data.journeys[i].departure_location;
		data.journeys[i].arrival_location;

		for ( var j = 0; j < journey.legs.length; j++ ) {

			var leg = journey.legs[j];

			if ( j != 0 ) { 
				data.journeys[i].points.push(true);
			}

			if ( j == 0 ) {
				data.journeys[i].departure_location = leg.departurePoint.commonName;
			}

			if ( j == (journey.legs.length - 1) ) {
				data.journeys[i].arrival_location = leg.arrivalPoint.commonName;
			}

			if ( leg.mode.id === 'tube' ) {

				data.journeys[i].legs[j].instruction.custom = 'Take the <span class="instruction__line">'+leg.routeOptions[0].name+' Line</span> (in the direction of <span class="instruction__direction">'+leg.routeOptions[0].directions[0]+'</span>) and get off at <span class="instruction__dest">'+leg.arrivalPoint.commonName+'</span>';

			} else if ( leg.mode.id == 'walking' ) {

				data.journeys[i].legs[j].instruction.custom = 'Walk to <span class="instruction__dest">'+leg.arrivalPoint.commonName+'</span>';

			}

		} // end loop through journey legs
	} // end loop through different journey options

	return data;
};


Journey.prototype._fetchData = function() {
	return fetch(this._fetchUrl).then(function(response) {
		return response.json();
	}).catch(function(err) {
		return Promise.reject(err);
	});
};


Journey.prototype._clearDB = function() {

	return Controller._dbPromise.then(function(db) {
		var tx = db.transaction('journeys', 'readwrite');
		var store = tx.objectStore('journeys');
		return store.openCursor();
	}).then(function deleteCursor(cursor) {
		if (!cursor) return;
		cursor.delete();
		return cursor.continue().then(deleteCursor);
	}).then(function() {
		return Promise.resolve();
	});

};


Journey.prototype._addToDB = function(data, prototype) {

	return prototype._clearDB().then(function() {

		return Controller._dbPromise.then(function(db) {
			var tx = db.transaction('journeys', 'readwrite');
			var store = tx.objectStore('journeys');
			store.put(data);
			return tx.complete;
		});
		// .then(function() {
		// 	console.log('Added to db');
		// }).catch(function(err) {
		// 	console.log('Error adding to db', err);
		// });

	});
	
};


Journey.prototype._displayJourney = function(data) {
	var html = MyApp.templates.journeys(data);
	document.getElementById('journeys').innerHTML = html;
	return Promise.resolve(data);
};


Journey.prototype._init = function() {

	var prototype = this;

	if ( this._savedJourney ) {

		prototype._displayJourney(this._savedJourney);

	} else {

		if ( !this._shouldHideLoader ) {
			new Loader( document.getElementById('journeys') );
		}

		this._fetchData()
		.then(prototype._setupData)
		.then(prototype._displayJourney)
		.catch(function(err) {

			if ( !this._shouldHideLoader ) {
				new DisplayMessage('danger', 'Oops! Looks like we were unable to get your new route. Here is your last searched journey instead').setupAction(false);
				Controller.showDefaultJourney();
			}
			
		})
		.then(function(data) {
			return prototype._addToDB(data, prototype);
		});

	}

};


  






/* ----------------------------

	4. Form Controller
	
---------------------------- */

function FormController(form) {

	this._form = form;

	this._setupForm();
	this._form.addEventListener('submit', this._handleSubmit);
}


FormController.prototype._setupForm = function() {

	var prototype = this;

	fetch('./assets/data/stations.json')
	.then(function(response) {
		return response.json();
	})
	.then(function(json) {

		var data = { stations: json };
		var html = MyApp.templates.stations(data);

		var placeholder_option = '<option value="">Search for a station...</option>';
		var geolocation_option = '<option value="geolocation">* Use current location</option>';

		document.getElementById('location_from').innerHTML = placeholder_option + geolocation_option + html;
		document.getElementById('location_to').innerHTML = placeholder_option + html;

		return Promise.resolve();
		
	})
	.then(function() {

		$('#location_from').selectize({
			sortField: {
				field: 'text',
				direction: 'asc'
			},
			onChange: prototype._getGeolocation
		});

		$('#location_to').selectize({
			sortField: {
				field: 'text',
				direction: 'asc'
			}
		});
	});

};



FormController.prototype._validateGeolocation = function(position) {

	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	var boundary_top_left = [51.703462, -0.461611]; var boundary_top_right = [51.706866, 0.274473];   

	var boundary_bottom_left = [51.397752, -0.419039]; var boundary_bottom_right = [51.383184, 0.156370];


	var lat_is_within = ( lat < boundary_top_left[0] && lat > boundary_bottom_left[0]) &&
						( lat < boundary_top_right[0] && lat > boundary_top_right[0]);


	var lon_is_within = ( lon > boundary_top_left[1] && lon < boundary_top_right[1]) &&
						( lon < boundary_bottom_left[1] && lon > boundary_bottom_right[1]);
	
	
	return lat_is_within && lon_is_within;

};

FormController.prototype._getGeolocation = function(e) {

	if ( e !== 'geolocation' ) { return; }

	if ( !('geolocation' in navigator) ) {
		document.querySelector('.selectize-dropdown-content div[data-value="geolocation"]').style.display = 'none';
		new DisplayMessage('danger', "We can't get your current position because your browser doesn't support this feature :(").setupAction(false);
		return;
	}

	var geolocationSelectizeInput = document.querySelector('.selectize-input .item[data-value="geolocation"]');
	geolocationSelectizeInput.innerHTML = 'Fetching yout current location...';



	navigator.geolocation.getCurrentPosition(function(position) {

		if ( newJourneyProtype._validateGeolocation(position) ) {

			geolocationSelectizeInput.innerHTML = 'Using current location';
			document.querySelector('#location_from option[selected]').value = position.coords.latitude + ',' + position.coords.longitude;

		} else {

			geolocationSelectizeInput.innerHTML = 'Location invalid';
			document.querySelector('.selectize-dropdown-content div[data-value="geolocation"]').style.display = 'none';
			new DisplayMessage('danger', "Looks like you are outside London! Try searching for a station instead of using your location").setupAction(false);
		}


	}, function(err) {

		geolocationSelectizeInput.innerHTML = 'Location not found';
		new DisplayMessage('danger', "There was a problem getting your current location. Try again or select a train station").setupAction(false);

	});

};


FormController.prototype._handleSubmit = function(e) {

	e.preventDefault();

	var location_from = document.getElementById('location_from');
	var location_to = document.getElementById('location_to');

	var location_from_coordinates = location_from.value;
	var location_to_coordinates = location_to.value;
	var location_from_name = location_from.options[location_from.selectedIndex].text;
	var location_to_name = location_to.options[location_to.selectedIndex].text;


	if ( !location_from_coordinates | !location_to_coordinates ) {
		new DisplayMessage('danger', 'You need to select both a departure and arrival station').setupAction(false);
		return;
	}

	var fetchInformation = {
		fromCoordinates: location_from_coordinates,
		toCoordinates: location_to_coordinates,
		fromName: location_from_name,
		toName: location_to_name
	};

	new Journey(fetchInformation);
	toggleModal();
	
};


var newJourneyForm = document.getElementById('new-journey-form');
var newJourneyProtype = new FormController( newJourneyForm );












