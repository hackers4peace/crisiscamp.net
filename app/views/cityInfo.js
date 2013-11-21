var template = require('../templates/cityInfo.hbs');
var CityInfo = Backbone.View.extend({
  template: template,
  events: {
    'click li em': 'showCamp'
  },
  initialize: function(options){
    this.router = options.router;
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
    this.router.navigate(path , { trigger: true });
  }
});
module.exports = CityInfo;
