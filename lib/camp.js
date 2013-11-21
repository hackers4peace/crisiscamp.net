var Person = require('./person');
var Team = require('./team');
var Place = require('./place');
var Camps = require('./camps');

var Camp = Backbone.RelationalModel.extend({
  relations: [{
    type: Backbone.HasOne,
    key: 'location',
    relatedModel: Place,
    reverseRelation: {
      type: Backbone.HasMany,
      key: 'event',
      collectionType: Camps
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
module.exports = Camp;
