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

