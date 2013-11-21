var config = require('./config');
var Place = require('../lib/place');
var CityInfo = require('./views/cityInfo');
var CampInfo = require('./views/campInfo');

var Router = Backbone.Router.extend({
  initialize: function(options){
    this.user = options.user;
    this.places = options.places;
    this.camps = options.camps;
  },
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
    var place = this.places.findWhere({ name: cityName.charAt(0).toUpperCase() + cityName.slice(1) });
    if(place){
      new CityInfo({
        model: place,
        router: this
      });
    } else {
      this.search(cityName);
    }
  },
  camp: function(cityName, campDate){
    this.city(cityName);
    var camp = this.camps.find(function(c){
      if(c.get('location').get('name').toLowerCase() != cityName.toLowerCase()){
        return false;
      }
      return c.get('startDate').split('T')[0] == campDate;
    });
    new CampInfo({
      model: camp,
      user: this.user
    });
  },
  search: function(query){
    $.getJSON(config.search.nominatim.url, { q: query, format: 'jsonv2' }, function(response){
      var city = response[0];
      var name = city.display_name.split(',')[0];
      var center = new L.LatLng(city.lat, city.lon);

      var place = this.places.findWhere({ name: name });
      if(!place){
        place = new Place({
          name: name,
          geo: {
            latitude: city.lat,
            longitude: city.lon
          }
        });
        this.places.add(place);
      }
      this.city(place.get('name').toLowerCase());
    }.bind(this));
  }
});

module.exports = Router;
