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

  # sidebar
  $('body').append '<div id="sidebar"></div>'
  sidebar = new L.Control.Sidebar 'sidebar',
    position: 'left'

  map.addControl sidebar

  # geocoder
  geocoder = new L.Control.OSMGeocoder
    text: 'find / add'
    callback: (result) ->
      city = result[0]
      name = city.display_name.split(',')[0]
      console.log(city)
      center = new L.LatLng city.lat, city.lon
      @_map.setView center, 6
      sidebar.setContent '<h3>' + name + '</h3>'
      sidebar.show()

  map.addControl geocoder

  Backbone.$ = $

  class Camp extends Backbone.Model
    defaults:
      '@type': 'schema:Event'
      performer: []
      attendee: []

    latLng: ->
      lat: @get('location').geo.latitude
      lng: @get('location').geo.longitude

  class CampInfo extends Backbone.View
    render: ->
      template = $('#infoTemplate').html()
      sidebar.setContent _.template(template)(@model.toJSON())

  class CampMarker extends Backbone.View
    icon: new L.Icon
      iconUrl: '/assets/images/markers/crisiscamp.png'
      iconSize: [16, 16]

    render: ->
      marker = new L.Marker @model.latLng(), icon: @icon
      marker.addTo map


  class Place extends Backbone.Model
    defaults:
      '@type': 'schema:Place'

  class Person extends Backbone.Model
    defaults:
      '@type': 'schema:Person'
    initialize: ->
      avatarHash = md5 @get('email')
      @set 'image', 'http://www.gravatar.com/avatar/' + avatarHash

  class Camps extends Backbone.Collection
    model: Camp

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
    location: spektral.toJSON()

  pavlik = new Person
    name: 'elf Pavlik'
    url: 'https://wwelves.org/perpetual-tripper'
    email: 'perpetual-tripper@wwelves.org'

  graz.get('performer').push pavlik.toJSON()
  camps.add graz

  grazMarker = new CampMarker model: graz
  grazMarker.render()

  grazInfo = new CampInfo model: graz
  grazInfo.render()

  sidebar.show()

  # debug
  window.camps = camps
