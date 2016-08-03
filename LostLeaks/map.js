'use strict';
// Instantiates the map object on the "mapid" div element.  scrollWheelZoom false, disables Whether the map can be zoomed by using the mouse wheel/trackpad, so that the map will not zoom while scrolling the webpage.
var mymap = L.map('mapid', {scrollWheelZoom : false}).setView([42.3736, -71.1097], 12);

// Mapbox Streets tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    minZoom: 9,
    id: 'faetea.0ma5dgpm',
    accessToken: 'pk.eyJ1IjoiZmFldGVhIiwiYSI6ImNpcXBremdoNzAyY3Zmb25uOWVyancxMXoifQ.dVNhYaHx4DjeHPH1QqUPXQ'
}).addTo(mymap);

var grade1Layer = L.layerGroup();
var grade2Layer = L.layerGroup();
var grade3Layer = L.layerGroup();

var currentYear = new Date().getFullYear();

// eversourceLeaks is the array of dataPoints
// ../data/eversource/eversource_repairs_100.json
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
    options.opacity = 0.7;
    options.fillOpacity = 0.7;
  }
  if (esLeak['grade'] === '3') {
    options.color = '#ff6600';  // Pure (or mostly pure) orange, a websafe color
    options.fillColor = '#ff9933';  // deepSaffron, Vivid orange, a websafe color
    options.opacity = 0.5;
    options.fillOpacity = 0.5;
  }

  // trim address quotes
  var addressString = esLeak['formatted_address'];  // has quotes
  var trim = addressString.replace( /\"/g, '');  // trims \" from begining and end of addressString

  // Instantiates a circle object given a geographical point, a radius in meters and optionally an options object.
  var circle = L.circle([esLeak['lat'], esLeak['lng']], radius, options);
  circle.bindPopup('Company: ' + 'Eversource' + '<br>' + 'Grade: ' + esLeak['grade'] + '<br>' + 'Address: ' + trim + '<br>' + 'Record Date: ' + esLeak['record_date'] + '<br>' + 'ID: ' +
  '<a href="https://datahub.csail.mit.edu/browse/al_carter/natural_gas/query?q=select+*+from+natural_gas.eversource_unrepaired_2014+where+id%3D+'+ esLeak['id'] +'%3B" target="_blank">' + esLeak['id'] + '</a>');

  if(esLeak['grade'] === '1') {
    grade1Layer.addLayer(circle);
  }
  if(esLeak['grade'] === '2') {
    grade2Layer.addLayer(circle);
  }
  if(esLeak['grade'] === '3') {
    grade3Layer.addLayer(circle);
  }
}

// ngridLeaks is the array of dataPoints
// ../data/ngrid/ngrid_repairs_100.json
for (var i = 0; i < ngridLeaks.length; i++) {
  var ngLeak = ngridLeaks[i];

  // radius by age
  var shortDate = ngLeak['record_date'].substr(0, 4);
  var numDate = parseInt(shortDate, 10);
  var yearDiff = currentYear-numDate;
  var radius = (yearDiff*5)+5;

  // color by grade
  var options = { fillOpacity: 0.5 };
  if(ngLeak['grade'] === '1') {
    options.color = '#ff0099';  // Pure (or mostly pure) pink, a websafe color
    options.fillColor = '#ff3399';  // Vivid pink, a websafe color
    options.opacity = 0.9;
    options.fillOpacity = 0.9;
  }
  if(ngLeak['grade'] === '2') {
    options.color = '#cc0000';  // BU-red, Strong red, a websafe color
    options.fillColor = '#ff0000';  // Red, Pure (or mostly pure) red, a websafe color
    options.opacity = 0.7;
    options.fillOpacity = 0.7;
  }
  if (ngLeak['grade'] === '3') {
    options.color = '#ff6600';  // Pure (or mostly pure) orange, a websafe color
    options.fillColor = '#ff9933';  // deepSaffron, Vivid orange, a websafe color
    options.opacity = 0.5;
    options.fillOpacity = 0.5;
  }

  // trim address quotes
  var addressString = ngLeak['formatted_address'];  // has quotes
  var trim = addressString.replace( /\"/g, '');  // trims \" from begining and end of addressString

  // Instantiates a circle object given a geographical point, a radius in meters and optionally an options object.
  var circle = L.circle([ngLeak['lat'], ngLeak['lng']], radius, options);
  circle.bindPopup('Company: ' + 'nationalgrid' + '<br>' + 'Grade: ' + ngLeak['grade'] + '<br>' + 'Address: ' + trim + '<br>' + 'Record Date: ' + ngLeak['record_date'] + '<br>' + 'ID: ' +
  '<a href="https://datahub.csail.mit.edu/browse/al_carter/natural_gas/query?q=select+*+from+natural_gas.ngrid_unrepaired_2014+where+id%3D+' + ngLeak['id'] + '" target="_blank">' + ngLeak['id'] + '</a>' );

  if(ngLeak['grade'] === '1') {
    grade1Layer.addLayer(circle);
  }
  if(ngLeak['grade'] === '2') {
    grade2Layer.addLayer(circle);
  }
  if(ngLeak['grade'] === '3') {
    grade3Layer.addLayer(circle);
  }
}

grade1Layer.addTo(mymap);
grade2Layer.addTo(mymap);
grade3Layer.addTo(mymap);

var sortControl = {
  "Grade 1: Severe": grade1Layer,
  "Grade 2: Moderate": grade2Layer,
  "Grade 3: Mild": grade3Layer,
};
var legend = L.control.layers(null, sortControl, {position: 'topleft', collapsed: false}).addTo(mymap);
