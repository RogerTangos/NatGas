'use strict';
// Instantiates the map object on the "mapid" div element.  scrollWheelZoom false, disables Whether the map can be zoomed by using the mouse wheel/trackpad, so that the map will not zoom while scrolling the webpage.
var mymap = L.map('mapid', {scrollWheelZoom : false}).setView([42.3736, -71.1097], 13);

// Mapbox Streets tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    minZoom: 9,
    id: 'faetea.0ma5dgpm',
    accessToken: 'pk.eyJ1IjoiZmFldGVhIiwiYSI6ImNpcXBremdoNzAyY3Zmb25uOWVyancxMXoifQ.dVNhYaHx4DjeHPH1QqUPXQ'
}).addTo(mymap);

var currentYear = new Date().getFullYear();

// eversourcesLeaks is the array of dataPoints
// ../data/eversource/eversource_lostleaks_combined_2014_100.json
for (var i = 0; i < eversourceLeaks.length; i++) {
  var esLeak = eversourceLeaks[i];

  // radius by age
  var shortDate = esLeak['record_date'].substr(0, 4);
  var numDate = parseInt(shortDate, 10);
  var yearDiff = currentYear-numDate;
  var radius = (yearDiff*5)+5;

  // color by grade
  var options = { fillOpacity: 0.5 };
  if(esLeak['grade'] === '1') {
    options.color = '#ff0099';  // Pure (or mostly pure) pink, a websafe color
    options.fillColor = '#ff3399';  // Vivid pink, a websafe color
    options.opacity = 0.9;
    options.fillOpacity = 0.9;
  }
  if(esLeak['grade'] === '2') {
    options.color = '#cc0000';  // BU-red, Strong red, a websafe color
    options.fillColor = '#ff0000';  // Red, Pure (or mostly pure) red, a websafe color
    options.opacity = 0.6;
    options.fillOpacity = 0.6;
  }
  if (esLeak['grade'] === '3') {
    options.color = '#ff6600';  // Pure (or mostly pure) orange, a websafe color
    options.fillColor = '#ff9933';  // deepSaffron, Vivid orange, a websafe color
    options.opacity = 0.3;
    options.fillOpacity = 0.3;
  }

  // trim address quotes
  var addressString = esLeak['formatted_address'];  // has quotes
  var trim = addressString.replace( /\"/g, '');  // trims \" from begining and end of addressString

  // Instantiates a circle object given a geographical point, a radius in meters and optionally an options object.
  var circle = L.circle([esLeak['lat'], esLeak['lng']], radius, options).addTo(mymap);
  circle.bindPopup('Company: ' + 'Eversource' + '<br>' + 'Grade: ' + esLeak['grade'] + '<br>' + 'Address: ' + trim + '<br>' + 'Record Date: ' + esLeak['record_date'] + '<br>' + 'ID: ' + esLeak['id']);
}

// ngridLeaks is the array of dataPoints
// ../data/ngrid/ngrid_lostleaks_combined_2014_100.json
for (var i = 0; i < ngridLeaks.length; i++) {
  var ngLeak = ngridLeaks[i];

  // radius by age
  var shortDate = ngLeak['record_date'].substr(0, 4);
  var numDate = parseInt(shortDate, 10);
  var yearDiff = currentYear-numDate;
  var radius = (yearDiff*5)+5;

  // color by grade
  var options = { fillOpacity: 0.5 };
  if(esLeak['grade'] === '1') {
    options.color = '#ff0099';  // Pure (or mostly pure) pink, a websafe color
    options.fillColor = '#ff3399';  // Vivid pink, a websafe color
    options.opacity = 0.9;
    options.fillOpacity = 0.9;
  }
  if(esLeak['grade'] === '2') {
    options.color = '#cc0000';  // BU-red, Strong red, a websafe color
    options.fillColor = '#ff0000';  // Red, Pure (or mostly pure) red, a websafe color
    options.opacity = 0.6;
    options.fillOpacity = 0.6;
  }
  if (esLeak['grade'] === '3') {
    options.color = '#ff6600';  // Pure (or mostly pure) orange, a websafe color
    options.fillColor = '#ff9933';  // deepSaffron, Vivid orange, a websafe color
    options.opacity = 0.3;
    options.fillOpacity = 0.3;
  }

  // trim address quotes
  var addressString = ngLeak['formatted_address'];  // has quotes
  var trim = addressString.replace( /\"/g, '');  // trims \" from begining and end of addressString

  // Instantiates a circle object given a geographical point, a radius in meters and optionally an options object.
  var circle = L.circle([ngLeak['lat'], ngLeak['lng']], radius, options).addTo(mymap);
  circle.bindPopup('Company: ' + 'nationalgrid' + '<br>' + 'Grade: ' + ngLeak['grade'] + '<br>' + 'Address: ' + trim + '<br>' + 'Record Date: ' + ngLeak['record_date'] + '<br>' + 'ID: ' + ngLeak['id']);
}
