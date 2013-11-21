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
      new CampMarker({ model: camp }); //FIXME
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

module.exports = Person;
