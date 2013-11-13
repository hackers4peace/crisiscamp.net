Zepto ($) ->
  $('body').append('<div id="map"></div>')
  map = new L.Map 'map',
    center: [0, 0]
    zoom: 3

  basemap = new L.TileLayer 'http://c.tiles.mapbox.com/v3/dennisl.map-dfbkqsr2/{z}/{x}/{y}.png',
    maxZoom: 19
  basemap.addTo map


