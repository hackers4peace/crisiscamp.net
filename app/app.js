Zepto(function ($){

  var config = {
    map: {
      center: [30, 0]
    },
    search: {
      nominatim: {
        url: 'http://nominatim.openstreetmap.org/search'
      }
    }
  };

  // handlebars helpers
  Handlebars.registerHelper('day', function(date){
    return date.split('T')[0];
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

  var Person = Backbone.RelationalModel.extend({
    defaults: {
      '@type': 'schema:Person'
    },
    initialize: function(){
      _.bindAll(this, 'auth', 'join', 'leave', 'start');

      this.on('authenticated', this.auth); //FIXME check if not fail!
      this.on('change:email', function(){
        var avatarHash = md5(this.get('email'));
        this.set('image', 'http://www.gravatar.com/avatar/' + avatarHash);
      });
    },
    login: function(){
      navigator.id.request();
    },
    logout: function(){
      navigator.id.logout();
    },
    auth: function(persona){
        this.set('email', persona.email);
        this.authenticated = true;
        if(this._defer){ //FIXME use promisses
          this._defered();
        }
    },
    authenticated: false,
    join: function(camp){
      if(this.authenticated){
        console.log('Person.join()', camp);
        if(this.camp){
          this.leave();
        }
        this.camp = camp;
        this.camp.join(this);
      } else {
        this.login();
        this._defer = { method: this.join, arg: camp };
      }
    },
    leave: function(){
      if(this.authenticated){
        console.log('Person.leave()', this.camp);
        var camp = this.camp;
        this.camp = undefined; //! before remove for checks in vews!
        camp.leave(this);
      } else {
        //FIXME
      }
    },
    start: function(camp){
      if(this.authenticated){
        console.log('Person.start()', camp);
        new CampMarker({ model: camp });
        delete camp.attributes.stub; //! needed in view!
        this.join(camp);
      } else {
        this.login();
        this._defer = ({ method: this.start, arg: camp });
      }
    },
    _defered: function(){
      this._defer.method.call(this, this._defer.arg);
    }
  });

  var Team = Backbone.Collection.extend({
    model: Person
  });

  var Place = Backbone.RelationalModel.extend({
    defaults: {
      '@type': 'schema:Place'
    },
    latLng: function(){
      return {
        lat: this.get('geo').latitude,
        lng: this.get('geo').longitude
      };
    }
  });

  var Places = Backbone.Collection.extend({
    model: Place
  });

  var places = new Places();

  var Camp = Backbone.RelationalModel.extend({
    relations: [{
      type: Backbone.HasOne,
      key: 'location',
      relatedModel: Place,
      reverseRelation: {
        type: Backbone.HasMany,
        key: 'event'
      }
    },{
      type: Backbone.HasMany,
      key: 'attendee',
      relatedModel: Person,
      collectionType: Team
    }],
    defaults: {
      '@type': 'schema:Event'
    },
    join: function(person){
      this.get('attendee').add(person);
    },
    leave: function(person){
      this.get('attendee').remove(person);
    },
    latLng: function(){
      return {
        lat: this.get('location').get('geo').latitude,
        lng: this.get('location').get('geo').longitude
      };
    }
  });

  var Camps = Backbone.Collection.extend({
    model: Camp
  });

  var CityInfo = Backbone.View.extend({
    template: JST['app/templates/cityInfo.hbs'],
    events: {
      'click li': 'showCamp'
    },
    initialize: function(){
      this.render();
    },
    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      $('#sidebar').html(this.el);
      $('#sidebar').show();
      return this.el;
    },
    showCamp: function(e){
      var path = this.model.get('name').toLowerCase() + '/' + e.target.innerHTML;
      router.navigate(path , { trigger: true });
    }
  });

  var CampInfo = Backbone.View.extend({
    template: JST['app/templates/campInfo.hbs'],
    events: {
      'click .start': 'start',
      'click .join': 'join',
      'click .leave': 'leave'
    },
    initialize: function(){
      _.bindAll(this, 'render');
      this.model.on('change', this.render);
      this.model.on('add:attendee', this.render);
      this.model.on('remove:attendee', this.render);
      this.render();
    },
    render: function(){
      var data = this.model.toJSON();
      if(user.camp == this.model){
        data.current = true;
      }
      this.$el.html(this.template(data));
      console.log('CampInfo.render()', this.el);
      $('#sidebar').html(this.el);
      $('#sidebar').show();
      return this.el;
    },
    start: function(){
      user.start(this.model);
    },
    join: function(){
      user.join(this.model);
    },
    leave: function(){
      user.leave();
    }
  });

  var CampMarker = Backbone.View.extend({
    icon: new L.Icon({
      iconUrl: '/assets/images/markers/crisiscamp.png',
      iconSize: [16, 16]
    }),
    initialize: function(){
      this.render();
    },
    render: function(){
      var marker = new L.Marker(this.model.latLng(), { icon: this.icon });
      marker.on('click', this.goTo.bind(this.model));
      marker.addTo(map);
      return marker;
    },
    goTo: function(){
      router.navigate(this.get('name').toLowerCase(), { trigger: true });
    }
  });

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

  grazMarker = new CampMarker({ model: graz });

  var user = new Person();

  navigator.id.watch({
    loggedInUser: null,
    onlogin: function(assertion){
      user.assertion = assertion;
      $.post('http://localhost:9000/auth/login', { assertion: assertion }, function(response){
        var json = JSON.parse(response);
        console.log('Persona.onlogin()', json);
        user.trigger('authenticated', json);
      });
    },
    onlogout: function(){
      $.post('http://localhost:9000/auth/logout', { assertion: user.assertion }, function(response){
        console.log('Persona.onlogout()', response);
        user.authenticated = false;
      });
    }
  });

  var Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      ':cityName': 'city',
      ':cityName/:campDate': 'camp'
    },
    index: function(){
      $('#sidebar').html('');
      $('#sidebar').hide();
    },
    city: function(cityName){
      var place = places.findWhere({ name: cityName.charAt(0).toUpperCase() + cityName.slice(1) });
      if(place){
        new CityInfo({ model: place});
      } else {
        this.search(cityName);
      }
    },
    camp: function(cityName, campDate){
      this.city(cityName);
      var camp = camps.find(function(c){
        if(c.get('location').get('name').toLowerCase() != cityName.toLowerCase()){
          return false;
        }
        return c.get('startDate').split('T')[0] == campDate;
      });
      new CampInfo({ model: camp });
    },
    search: function(query){
      $.getJSON(config.search.nominatim.url, { q: query, format: 'jsonv2' }, function(response){
        var city = response[0];
        var name = city.display_name.split(',')[0];
        var center = new L.LatLng(city.lat, city.lon);

        var place = places.findWhere({ name: name });
        if(!place){
          place = new Place({
            name: name,
            geo: {
              latitude: city.lat,
              longitude: city.lon
            }
          });
          places.add(place);
        }
        this.city(place.get('name').toLowerCase());
      }.bind(this));
    }
  });

  var router = new Router();

  Backbone.history.start({ pushState: true });

  //debug
  window.app = {
    camps: camps,
    user: user,
    router: router,
    places: places
  };
});
