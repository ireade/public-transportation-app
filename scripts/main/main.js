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


/* DISPLAY MESSAGE ------------------- */

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
	this.displayMessageEl.classList.remove('success', 'danger');
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


/* LOADER ------------------- */

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

	IndexController
	
---------------------------- */

function IndexController() {

	this._dbPromise = this._setupDB();
	this._registerServiceWorker();
	this._showDefaultJourney();
}


IndexController.prototype._setupDB = function() {

	if (!navigator.serviceWorker) {
		return Promise.resolve();
	}

	return dbPromise = idb.open('tplanr', 1, function(upgradeDb) {
		var store = upgradeDb.createObjectStore('journeys', {
			keyPath: 'departure_time'
		});
	});

};

IndexController.prototype._registerServiceWorker = function() {
	if ('serviceWorker' in navigator) {

		navigator.serviceWorker
		.register('./service-worker.js', { scope: './' })
		.then(function(reg) {
			// console.log('Service Worker Registered', reg);

			if (reg.waiting) {
				console.log('reg waiting still');

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


	}
};



IndexController.prototype._handleEmptyState = function() {
	toggleModal();
};

IndexController.prototype._showDefaultJourney = function() {

	var prototype = this;

	this._dbPromise.then(function(db) {

		var tx = db.transaction('journeys', 'readwrite');
		var store = tx.objectStore('journeys');
		return store.getAll();

	}).then(function(response) {

		if ( response.length == 0 ) {
			prototype._handleEmptyState();
		} else {
			new Journey(null, response[0]);
		}

	});
};


var Controller = new IndexController;






/* ----------------------------

	
	
---------------------------- */


var app_id = '1e55ad45';
var app_key = '40c230d6c65288e70be34a738dcc6b91';


/* ----------------------------

	Journey Prototype
	
---------------------------- */


function Journey(newJourney, savedJourney) {

	this._savedJourney = false;

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

		} // end loop through journey legs
	} // end loop through different journey options

	return data;
};


Journey.prototype._fetchData = function() {
	return fetch(this._fetchUrl).then(function(response) {
		return response.json();
	}).catch(function(err) {
		console.log(err);
		new DisplayMessage('danger', 'Fetch error').setupAction(false);
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
		}).then(function() {
			console.log('Added to db');
		}).catch(function(err) {
			console.log('Error adding to db', err);
		});

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

		new Loader( document.getElementById('journeys') );

		this._fetchData()
		.then(prototype._setupData)
		.then(prototype._displayJourney)
		.catch(function(err) {
			console.log("caught!", err);
			new DisplayMessage('danger', 'Looks like there was an error getting your journey. Please try a different route').setupAction(false);
			return Promise.reject();
		})
		.then(function(data) {
			return prototype._addToDB(data, prototype);
		});

	}
	

};


  



/* ----------------------------

	Setup stations dropdown
	
---------------------------- */


fetch('/assets/data/stations.json')
.then(function(response) {
	return response.json();
})
.then(function(json) {
	var data = { stations: json };
	var html = MyApp.templates.stations(data);
	document.getElementById('location_from').innerHTML = html;
	document.getElementById('location_to').innerHTML = html;

	return Promise.resolve();
	
})
.then(function() {

	var options = {
		sortField: {
			field: 'text',
			direction: 'asc'
		}
	};

	$('#location_from').selectize(options);
	$('#location_to').selectize(options);
});




/* ----------------------------

	
	
---------------------------- */


var newJourneyForm = document.getElementById('new-journey-form');


newJourneyForm.addEventListener('submit', function(e) {

	e.preventDefault();

	var location_from_coordinates = document.getElementById('location_from').value;
	var location_to_coordinates = document.getElementById('location_to').value;
	var location_from_name = document.querySelector('#location_from option[selected="selected"]').innerHTML;
	var location_to_name = document.querySelector('#location_to option[selected="selected"]').innerHTML;


	var fetchInformation = {
		fromCoordinates: location_from_coordinates,
		toCoordinates: location_to_coordinates,
		fromName: location_from_name,
		toName: location_to_name
	};


	new Journey(fetchInformation);

	toggleModal();


});



/* */


/* ----------------------------

	Default
	
---------------------------- */






/* ----------------------------

	ServiceWorker
	
---------------------------- */


































