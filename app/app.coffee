Zepto ($) ->

  config =
    map:
      center: [30, 0]

  # map
  $('body').append '<div id="map"></div>'
  map = new L.Map 'map',
    center: config.map.center
    zoom: 2
    zoomControl: false
    attributionControl: false

  basemap = new L.TileLayer 'http://c.tiles.mapbox.com/v3/mapbox.natural-earth-2/{z}/{x}/{y}.png',
    minZoom: 2
    maxZoom: 6
  basemap.addTo map

  zoom = new L.Control.Zoom position: 'bottomright'
  map.addControl zoom

  # sidebar
  $('body').append '<div id="sidebar"></div>'

  # geocoder
  geocoder = new L.Control.OSMGeocoder
    text: 'find / add'
    callback: (result) ->
      city = result[0]
      name = city.display_name.split(',')[0]
      center = new L.LatLng city.lat, city.lon

      place = places.findWhere name: name
      unless place
        place = new Place
          name: name
          geo:
            latitude: city.lat
            longitude: city.lon
        places.add place
      router.navigate place.get('name').toLowerCase(), trigger: true

  map.addControl geocoder

  Backbone.$ = $

  class Person extends Backbone.RelationalModel
    defaults:
      '@type': 'schema:Person'
    initialize: ->
      @on 'authenticated', @auth #FIXME check if not fail!
      @on 'change:email', =>
        avatarHash = md5 @get('email')
        @set 'image', 'http://www.gravatar.com/avatar/' + avatarHash
    login: ->
      navigator.id.request()
    logout: ->
      navigator.id.logout()
    auth: (persona) =>
        @set 'email', persona.email
        @authenticated = true
        @_defered() if @_defer #FIXME use promisses
    authenticated: false
    join: (camp) =>
      if @authenticated
        console.log 'Person.join()', camp
        @leave() if @camp
        @camp = camp
        @camp.join @
      else
        @login()
        @_defer = method: @join, arg: camp
    leave: =>
      if @authenticated
        console.log 'Person.leave()', @camp
        camp = @camp            #
        @camp = undefined      ## before remove for checks in vews!
        camp.leave @ #
    start: (camp) =>
      if @authenticated
        console.log 'Person.start()', camp
        new CampMarker model: camp
        delete camp.attributes.stub
        @join camp
      else
        @login()
        @_defer = method: @start, arg: camp
    _defered: () =>
      @_defer.method.call(@, @_defer.arg)

  class Team extends Backbone.Collection
    model: Person

  class Place extends Backbone.RelationalModel
    defaults:
      '@type': 'schema:Place'

  class Places extends Backbone.Collection
    model: Place

  places = new Places

  class Camp extends Backbone.RelationalModel
    relations: [{
      type: Backbone.HasOne
      key: 'location'
      relatedModel: Place
    },{
      type: Backbone.HasMany
      key: 'attendee'
      relatedModel: Person
      collectionType: Team
    }]
    defaults:
      '@type': 'schema:Event'

    join: (person) ->
      @get('attendee').add person

    leave: (person) ->
      @get('attendee').remove person

    latLng: ->
      lat: @get('location').get('geo').latitude
      lng: @get('location').get('geo').longitude

  class Camps extends Backbone.Collection
    model: Camp

  class CampInfo extends Backbone.View
    template: JST['app/templates/campInfo.hbs']
    events:
      'click .start': 'start'
      'click .join': 'join'
      'click .leave': 'leave'
    initialize: ->
      @model.on 'change', @render
      @model.on 'add:attendee', @render
      @model.on 'remove:attendee', @render
      @render()
    render: =>
      data = @model.toJSON()
      data.current = true if user.camp == @model
      @$el.html @template data
      $('#sidebar').html @el
      @
    start: ->
      user.start @model
    join:  ->
      user.join @model
    leave:  ->
      user.leave()

  class CampMarker extends Backbone.View
    icon: new L.Icon
      iconUrl: '/assets/images/markers/crisiscamp.png'
      iconSize: [16, 16]
    initialize: ->
      @render()
    render: =>
      marker = new L.Marker @model.latLng(), icon: @icon
      marker.on 'click', @goTo.bind(@model)
      marker.addTo map
      marker
    goTo: ->
      router.navigate @get('name').toLowerCase(), trigger: true

  camps = new Camps

  spektral =
    name: 'Spektral'
    url: 'http://spektral.at'
    address:
      '@type': 'schema:PostalAddress'
      addressLocality: 'Graz'
      streetAddress: 'Lendkai 45'
    geo:
      '@type': 'schema:GeoCoordinates'
      latitude: 47.0708101
      longitude: 15.4382918

  graz = new Camp
    name: 'Graz'
    url: 'http://tiny.cc/CrisisCampGraz'
    startDate: '2013-11-16T12:00+01:00'
    endDate: '2013-11-16T19:00+01:00'

  graz.set 'location', spektral
  camps.add graz


  grazMarker = new CampMarker model: graz

  user = new Person

  # debug
  window.camps = camps
  window.user = user

  navigator.id.watch
    loggedInUser: null
    onlogin: (assertion) ->
      user.assertion = assertion
      $.post 'http://localhost:9000/auth/login', { assertion: assertion }, (response) ->
        json = JSON.parse(response)
        console.log json
        user.trigger 'authenticated', json
    onlogout: ->
      $.post 'http://localhost:9000/auth/logout', { assertion: user.assertion }, (response) ->
        console.log response
        user.authenticated = false

  class Router extends Backbone.Router
    routes:
      '': 'index'
      ':city': 'show'
    index: ->
      $('#sidebar').html ''
      $('#sidebar').hide()
    show: (city) ->
      camp = camps.findWhere name: city.charAt(0).toUpperCase() + city.slice(1)
      unless camp
        place = places.findWhere name: city.charAt(0).toUpperCase() + city.slice(1)
        camp = new Camp name: name, location: place.toJSON(), stub: true
        camps.add camp
      campInfo = new CampInfo model: camp
      $('#sidebar').show()

  router = new Router

  Backbone.history.start pushState: true
