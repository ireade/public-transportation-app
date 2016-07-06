function toggleModal(){fab.classList.toggle("modalOpen"),newJourneySection.classList.toggle("modalOpen")}function DisplayMessage(e,t){this.displayMessageEl=document.getElementsByClassName("display-message")[0],this.messageEl=document.getElementsByClassName("dm__message")[0],this.actionBTN=document.getElementsByClassName("dm__action")[0],this.dismissBTN=document.getElementsByClassName("dm__dismiss")[0],this._init(e,t)}function Loader(e){this._target=e,this._loader=document.createElement("div"),this._loader.classList.add("spinner"),this._loader.innerHTML='<div class="double-bounce1"></div>\t\t\t\t\t\t\t<div class="double-bounce2"></div>',this._init()}function IndexController(){this._dbPromise=this._setupDB(),this._registerServiceWorker(),this.showDefaultJourney()}function Journey(e,t,o){this._savedJourney=!1,this._shouldHideLoader=o,t?this._savedJourney=t:e&&(this._fromCoordinates=e.fromCoordinates,this._toCoordinates=e.toCoordinates,this._fromName=e.fromName?"&fromName="+e.fromName:"",this._toName=e.toName?"&toName="+e.toName:"",this._fetchUrl="https://api.tfl.gov.uk/Journey/JourneyResults/"+this._fromCoordinates+"/to/"+this._toCoordinates+"?nationalSearch=True&timeIs=Departing&journeyPreference=LeastTime&mode=tube&walkingSpeed=Average&cyclePreference=None&alternativeCycle=False&alternativeWalking=False&applyHtmlMarkup=False&useMultiModalCall=False&walkingOptimization=False"+this._fromName+this._toName+"&app_id="+app_id+"&app_key="+app_key),this._init()}function FormController(e){this._form=e,this._setupForm(),this._form.addEventListener("submit",this._handleSubmit)}var app_id="1e55ad45",app_key="40c230d6c65288e70be34a738dcc6b91",fab=document.getElementsByClassName("fab")[0],newJourneySection=document.getElementsByClassName("new-journey")[0];fab.addEventListener("click",function(){toggleModal()}),DisplayMessage.prototype._toggle=function(){this.displayMessageEl.classList.toggle("open")},DisplayMessage.prototype._reset=function(){this.displayMessageEl.classList.remove("success","danger","open"),this.messageEl.innerHTML="",this.actionBTN.style.display=""},DisplayMessage.prototype.setupAction=function(e,t){!e|!t&&(this.actionBTN.style.display="none"),this.actionBTN.innerHTML=e,this.actionBTN.addEventListener("click",t)},DisplayMessage.prototype._init=function(e,t){this._reset(),this.displayMessageEl.classList.add(e),this.messageEl.innerHTML=t,this._toggle();var o=this;this.dismissBTN.addEventListener("click",function(){o._toggle()})},Loader.prototype._init=function(){this._target.innerHTML="",this._target.appendChild(this._loader)},Loader.prototype.remove=function(){this._target.removeChild(this._loader)},IndexController.prototype._setupDB=function(){return navigator.serviceWorker?dbPromise=idb.open("tplanr",1,function(e){e.createObjectStore("journeys",{keyPath:"departure_time"})}):Promise.resolve()},IndexController.prototype._registerServiceWorker=function(){return"serviceWorker"in navigator?(navigator.serviceWorker.register("./service-worker.js",{scope:"./"}).then(function(e){if(console.log("Service Worker Registered",e),e.waiting)return console.log("reg waiting"),void new DisplayMessage("success","There's a new verion of TubePlanr available! Click refresh to update").setupAction("Refresh",function(){e.waiting.postMessage({action:"skipWaiting"})})})["catch"](function(e){console.log("Service Worker Failed to Register",e)}),void navigator.serviceWorker.addEventListener("controllerchange",function(){window.location.reload()})):void new DisplayMessage("success","Your browser doesn't support all the cool features this application offers (like offline capabilities). Why not try using this app in Chrome?").setupAction("Get Chrome",function(){window.open("https://www.google.com/chrome/browser/mobile/index.html")})},IndexController.prototype._handleEmptyState=function(){toggleModal()},IndexController.prototype.showDefaultJourney=function(){var e=this;this._dbPromise.then(function(e){var t=e.transaction("journeys","readwrite"),o=t.objectStore("journeys");return o.getAll()}).then(function(t){return 0==t.length?(e._handleEmptyState(),Promise.reject()):(new Journey(null,t[0]),Promise.resolve(t[0]))}).then(function(e){var t=e.journeys[0].legs[0].departurePoint,o=e.journeys[0].legs[e.journeys[0].legs.length-1].arrivalPoint,n={fromCoordinates:t.lat+","+t.lon,toCoordinates:o.lat+","+o.lon,fromName:e.departure_location,toName:e.arrival_location};new Journey(n,null,(!0))})};var Controller=new IndexController;Journey.prototype._setupData=function(e){for(var t={departure_location:e.journeys[0].legs[0].departurePoint.commonName,arrival_location:e.journeys[0].legs[e.journeys[0].legs.length-1].arrivalPoint.commonName,departure_time:e.journeys[0].startDateTime,journeys:e.journeys},o=0;o<e.journeys.length;o++){var n=e.journeys[o];t.journeys[o].points=[],t.journeys[o].departure_location,t.journeys[o].arrival_location;for(var r=0;r<n.legs.length;r++){var i=n.legs[r];0!=r&&t.journeys[o].points.push(!0),0==r&&(t.journeys[o].departure_location=i.departurePoint.commonName),r==n.legs.length-1&&(t.journeys[o].arrival_location=i.arrivalPoint.commonName),"tube"===i.mode.id?t.journeys[o].legs[r].instruction.custom='Take the <span class="instruction__line">'+i.routeOptions[0].name+' Line</span> (in the direction of <span class="instruction__direction">'+i.routeOptions[0].directions[0]+'</span>) and get off at <span class="instruction__dest">'+i.arrivalPoint.commonName+"</span>":"walking"==i.mode.id&&(t.journeys[o].legs[r].instruction.custom='Walk to <span class="instruction__dest">'+i.arrivalPoint.commonName+"</span>")}}return t},Journey.prototype._fetchData=function(){return fetch(this._fetchUrl).then(function(e){return e.json()})["catch"](function(e){return Promise.reject(e)})},Journey.prototype._clearDB=function(){return Controller._dbPromise.then(function(e){var t=e.transaction("journeys","readwrite"),o=t.objectStore("journeys");return o.openCursor()}).then(function e(t){if(t)return t["delete"](),t["continue"]().then(e)}).then(function(){return Promise.resolve()})},Journey.prototype._addToDB=function(e,t){return t._clearDB().then(function(){return Controller._dbPromise.then(function(t){var o=t.transaction("journeys","readwrite"),n=o.objectStore("journeys");return n.put(e),o.complete})})},Journey.prototype._displayJourney=function(e){var t=MyApp.templates.journeys(e);return document.getElementById("journeys").innerHTML=t,Promise.resolve(e)},Journey.prototype._init=function(){var e=this;this._savedJourney?e._displayJourney(this._savedJourney):(this._shouldHideLoader||new Loader(document.getElementById("journeys")),this._fetchData().then(e._setupData).then(e._displayJourney).then(function(t){return e._addToDB(t,e)})["catch"](function(e){new DisplayMessage("danger","Oops! Looks like we were unable to get your new route. Here is your last searched journey instead").setupAction(!1),Controller.showDefaultJourney()}))},FormController.prototype._setupForm=function(){var e=this;fetch("./assets/data/stations.json").then(function(e){return e.json()}).then(function(e){var t={stations:e},o=MyApp.templates.stations(t),n='<option value="">Search for a station...</option>',r='<option value="geolocation">* Use current location</option>';return document.getElementById("location_from").innerHTML=n+r+o,document.getElementById("location_to").innerHTML=n+o,Promise.resolve()}).then(function(){$("#location_from").selectize({sortField:{field:"text",direction:"asc"},onChange:e._getGeolocation}),$("#location_to").selectize({sortField:{field:"text",direction:"asc"}})})},FormController.prototype._validateGeolocation=function(e){var t=e.coords.latitude,o=e.coords.longitude,n=[51.703462,-.461611],r=[51.706866,.274473],i=[51.397752,-.419039],s=[51.383184,.15637],a=t<n[0]&&t>i[0]&&t<r[0]&&t>r[0],l=o>n[1]&&o<r[1]&&o<i[1]&&o>s[1];return a&&l},FormController.prototype._getGeolocation=function(e){if("geolocation"===e){if(!("geolocation"in navigator))return document.querySelector('.selectize-dropdown-content div[data-value="geolocation"]').style.display="none",void new DisplayMessage("danger","We can't get your current position because your browser doesn't support this feature :(").setupAction(!1);var t=document.querySelector('.selectize-input .item[data-value="geolocation"]');t.innerHTML="Fetching yout current location...",navigator.geolocation.getCurrentPosition(function(e){newJourneyProtype._validateGeolocation(e)?(t.innerHTML="Using current location",document.querySelector("#location_from option[selected]").value=e.coords.latitude+","+e.coords.longitude):(t.innerHTML="Location invalid",document.querySelector('.selectize-dropdown-content div[data-value="geolocation"]').style.display="none",new DisplayMessage("danger","Looks like you are outside London! Try searching for a station instead of using your location").setupAction(!1))},function(e){t.innerHTML="Location not found",new DisplayMessage("danger","There was a problem getting your current location. Try again or select a train station").setupAction(!1)})}},FormController.prototype._handleSubmit=function(e){e.preventDefault();var t=document.getElementById("location_from"),o=document.getElementById("location_to"),n=t.value,r=o.value,i=t.options[t.selectedIndex].text,s=o.options[o.selectedIndex].text;if(!n|!r)return void new DisplayMessage("danger","You need to select both a departure and arrival station").setupAction(!1);var a={fromCoordinates:n,toCoordinates:r,fromName:i,toName:s};new Journey(a),toggleModal()};var newJourneyForm=document.getElementById("new-journey-form"),newJourneyProtype=new FormController(newJourneyForm);