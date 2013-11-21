var template = require('../templates/campInfo.hbs');

var CampInfo = Backbone.View.extend({
  template: template,
  events: {
    'click .start': 'start',
    'click .join': 'join',
    'click .leave': 'leave'
  },
  initialize: function(options){
    _.bindAll(this, 'render');

    this.user = options.user;

    this.model.on('change', this.render);
    this.model.on('add:attendee', this.render);
    this.model.on('remove:attendee', this.render);
    this.render();
  },
  render: function(){
    var data = this.model.toJSON();
    if(this.user.camp == this.model){
      data.current = true;
    }
    this.$el.html(this.template(data));
    console.log('CampInfo.render()', this.el);
    $('#sidebar').html(this.el);
    $('#sidebar').show();
    return this.el;
  },
  start: function(){
    this.user.start(this.model);
  },
  join: function(){
    this.user.join(this.model);
  },
  leave: function(){
    this.user.leave();
  }
});

module.exports = CampInfo;
