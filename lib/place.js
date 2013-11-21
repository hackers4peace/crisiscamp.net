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
module.exports = Place;
