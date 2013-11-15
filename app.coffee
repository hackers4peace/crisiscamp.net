#https://gist.github.com/lagartoflojo/1821349
Backbone.Model::nestCollection = (attributeName, nestedCollection) ->
  #setup nested references
  for item, i in nestedCollection
    @attributes[attributeName][i] = nestedCollection.at(i).attributes

  #create empty arrays if none
  nestedCollection.on 'add', (initiative) =>
    if !@get(attributeName)
      @attributes[attributeName] = []
      @get(attributeName).push initiative.attributes

  nestedCollection.on 'remove', (initiative) =>
    updateObj = {}
    updateObj[attributeName] = _.without @get(attributeName), initiative.attributes
    @set updateObj

  nestedCollection

Backbone.Model::nestModel = (attributeName, nestedModel) ->
  @attributes[attributeName] = nestedModel.attributes
  nestedModel

Zepto ($) ->

  # map
  $('body').append '<div id="map"></div>'
  map = new L.Map 'map',
    center: [30, 0]
    zoom: 2
    zoomControl: false
    attributionControl: false

  basemap = new L.TileLayer 'http://c.tiles.mapbox.com/v3/mapbox.natural-earth-2/{z}/{x}/{y}.png',
    minZoom: 2
    maxZoom: 6
  basemap.addTo map

  zoom = new L.Control.Zoom position: 'bottomright'
  map.addControl zoom

  # geocoder
  geocoder = new L.Control.OSMGeocoder
    text: 'find / add'
    callback: (result) ->
      city = result[0]
      name = city.display_name.split(',')[0]
      console.log(city)
      center = new L.LatLng city.lat, city.lon
      @_map.setView center, 6
      camp = camps.findWhere name: name
      unless camp
        place = new Place
          geo:
            latitude: city.lat
            longitude: city.lon
        camp = new Camp name: name, location: place.toJSON(), stub: true
      campInfo = new CampInfo model: camp
      campInfo.render()
      #sidebar.show()

  map.addControl geocoder

  Backbone.$ = $

  class Sidebar extends Backbone.View
    id: 'sidebar'
    render: ->
      $('body').append @el
      @

  sidebar = new Sidebar
  sidebar.render()

  class Person extends Backbone.Model
    defaults:
      '@type': 'schema:Person'
    initialize: ->
      @on 'authenticated', @auth
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
      else
        @login()
        @_defer = method: @join, arg: camp
    start: (camp) =>
      if @authenticated
        console.log 'Person.start()', camp
      else
        @login()
        @_defer = method: @start, arg: camp
    _defered: () =>
      @_defer.method.call(@, @_defer.arg)


  class Team extends Backbone.Collection
    model: Person

  class Place extends Backbone.Model
    defaults:
      '@type': 'schema:Place'

  class Camp extends Backbone.Model
    defaults:
      '@type': 'schema:Event'

    initialize: ->
      @location = @nestModel 'location', new Place(@get 'location')
      @attendees = @nestCollection 'attendee', new Team(@get 'attendee')

    latLng: ->
      lat: @get('location').geo.latitude
      lng: @get('location').geo.longitude

  class Camps extends Backbone.Collection
    model: Camp

  class CampInfo extends Backbone.View
    template: JST['templates/campInfo.hbs']
    events:
      'click .join': 'join'
      'click .start': 'start'
    render: ->
      @$el.html @template @model.toJSON()
      $('#sidebar').html @el
      @
    join:  ->
      user.join @model
    start: ->
      user.start @model

  class CampMarker extends Backbone.View
    icon: new L.Icon
      iconUrl: '/assets/images/markers/crisiscamp.png'
      iconSize: [16, 16]

    render: ->
      marker = new L.Marker @model.latLng(), icon: @icon
      marker.addTo map

  camps = new Camps

  spektral = new Place
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
  graz.location.set spektral.toJSON()
  camps.add graz

  #pavlik = new Person
    #name: 'elf Pavlik'
    #url: 'https://wwelves.org/perpetual-tripper'
    #email: 'perpetual-tripper@wwelves.org'
  #graz.attendees.add pavlik


  grazMarker = new CampMarker model: graz
  grazMarker.render()

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
