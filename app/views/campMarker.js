var CampMarker = Backbone.View.extend({
  icon: new L.Icon({
    iconUrl: '/assets/images/markers/crisiscamp.png',
    iconSize: [16, 16]
  }),
  initialize: function(options){
    _.bindAll(this, 'goTo');

    this.map = options.map;
    this.router = options.router;

    this.render();
  },
  render: function(){
    var marker = new L.Marker(this.model.latLng(), { icon: this.icon });
    marker.on('click', this.goTo);
    marker.addTo(this.map);
    return marker;
  },
  goTo: function(){
    this.router.navigate(this.model.get('name').toLowerCase(), { trigger: true });
  }
});

module.exports = CampMarker;
