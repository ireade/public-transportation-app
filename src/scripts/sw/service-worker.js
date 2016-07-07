var appPrefix = 'tplanr-';
var currentCacheName = appPrefix+'static-v5';

/* ------------------------------

    Install SW

------------------------------ */

self.addEventListener('install', function(event) {
 
	var filesToCache = [
		'./',
		'./index.html',

		'./assets/js/lib/jquery.min.js',
		'./assets/js/lib/moment.min.js',
		'./assets/js/lib/handlebars.min.js',
		'./assets/js/lib/selectize.min.js',
		'./assets/js/lib/idb.min.js',
		'./assets/js/lib/polyfill.min.js',

		'./assets/js/main.js',
		'./assets/js/handlebars-helpers.js',
		'./assets/js/templates.js',

		'./assets/data/stations.json',

		'./assets/css/main.css'
	];

	event.waitUntil(
		caches.open(currentCacheName).then(function(cache) {
			return cache.addAll(filesToCache);
		})
	);

});



/* ------------------------------

    Activate SW

------------------------------ */

self.addEventListener('activate', function(event) {
	event.waitUntil(
		// Get all cache keys (cacheNames)
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					// Return all the caches that start with the appPrefix
					// AND are not the current static cache name
					return cacheName.startsWith(appPrefix) &&
					cacheName != currentCacheName;
				}).map(function(cacheName) {
					// Delete all them
					return caches.delete(cacheName);
				})
			); // end Promise.all
		}) // end caches.keys()
	); // end event.waitUntil
});






/* ------------------------------

    Fetch Events

------------------------------ */

self.addEventListener('fetch', function(event) {

	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);

});





/* ------------------------------

    Messages from DOM 

------------------------------ */

self.addEventListener('message', function(event) {
	if (!event.data.action) { return; }

	switch(event.data.action) {
		case 'skipWaiting':
			self.skipWaiting();
		default:
			return;
	} // end switch
});