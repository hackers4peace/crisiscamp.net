var Person = require('./person');

var Team = Backbone.Collection.extend({
  model: Person
});

module.exports = Team;
