Zepto(function ($){

  var config = require('./config');

  // handlebars helpers
  var Handlebars = require('hbsfy/runtime');

  Handlebars.registerHelper('day', function(date){
    return date.split('T')[0];
  });

  Handlebars.registerHelper('size', function(array){
    return array.length;
  });

  // map
  $('body').append('<div id="map"></div>');
  var map = new L.Map('map', {
    center: config.map.center,
    zoom: 2,
    zoomControl: false,
    attributionControl: false
  });

  var basemap = new L.TileLayer('http://c.tiles.mapbox.com/v3/mapbox.natural-earth-2/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 6
  }).addTo(map);

  var zoom = new L.Control.Zoom({ position: 'bottomright' });
  map.addControl(zoom);

  // sidebar
  $('body').append('<div id="sidebar"></div>');

  Backbone.$ = $;

  var Person = require('../lib/person');
  var Team = require('../lib/team');
  var Place = require('../lib/place');
  var Places = require('../lib/places');
  var Camp = require('../lib/camp');
  var Camps = require('../lib/camps');

  var Router = require('./router');

  var CityInfo = require('./views/cityInfo');
  var CampInfo = require('./views/campInfo');
  var CampMarker = require('./views/campMarker');

  var user = new Person();
  var places = new Places();
  var camps = new Camps();


  var spektral = {
    name: 'Spektral',
    url: 'http://spektral.at',
    address: {
      '@type': 'schema:PostalAddress',
      addressLocality: 'Graz',
      streetAddress: 'Lendkai 45'
    },
    geo: {
      '@type': 'schema:GeoCoordinates',
      latitude: 47.0708101,
      longitude: 15.4382918
    }
  };

  var graz = new Place({
    name: 'Graz',
    geo: {
      latitude: 47.0708101,
      longitude: 15.4382918
    }
  });

  places.add(graz);

  var first = new Camp({
    name: 'Graz',
    url: 'http://tiny.cc/CrisisCampGraz',
    startDate: '2013-11-16T12:00+01:00',
    endDate: '2013-11-16T19:00+01:00'
  });

  first.set('location', spektral);
  camps.add(first);
  graz.get('event').add(first);

  var router = new Router({
    user: user,
    places: places,
    camps: camps
  });

  grazMarker = new CampMarker({
    model: graz,
    map: map,
    router: router
  });

  Backbone.history.start({ pushState: true });
  var login = function(assertion){
    user.assertion = assertion;
    $.post('http://localhost:9000/auth/login', { assertion: assertion }, function(response){
      var json = JSON.parse(response);
      console.log('Persona.onlogin()', json);
      user.trigger('authenticated', json);
    });
  };

  var logout =  function(){
    $.post('http://localhost:9000/auth/logout', { assertion: user.assertion }, function(response){
      console.log('Persona.onlogout()', response);
      user.authenticated = false;
    });
  };

  // mozilla persona
  navigator.id.watch({
    loggedInUser: null,
    onlogin: login,
    onlogout: logout
  });

  //debug
  window.app = {
    camps: camps,
    user: user,
    router: router,
    places: places
  };
});
