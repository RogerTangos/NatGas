// initializes the map on the "mapid" div centered on Boston
var mymap = L.map('mapid').setView([42.2968, -71.2924], 12);

// Mapbox Streets tile layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    minZoom: 9,
    id: 'faetea.0ma5dgpm',
    accessToken: 'pk.eyJ1IjoiZmFldGVhIiwiYSI6ImNpcXBremdoNzAyY3Zmb25uOWVyancxMXoifQ.dVNhYaHx4DjeHPH1QqUPXQ'
}).addTo(mymap);

var currentYear = new Date().getFullYear();
// leaks is the array of dataPoints
for (var i = 0; i < leaks.length; i++) {
  var leak = leaks[i];

  // radius by age
  var shortDate = leak['record_date'].substr(0, 4);
  var numDate = parseInt(shortDate, 10);
  var yearDiff = currentYear-numDate;
  var radius = (yearDiff*10)+10;  // a number 10-27

  // color by grade
  var options = { fillOpacity: 0.5 };

  if(leak['grade'] === '1') {
    options.color = '#e6002e';
    options.fillColor = '#ff0033';
  }
  if(leak['grade'] === '2') {
    options.color = '#e64500';
    options.fillColor = '#FF4D00';
  }
  if (leak['grade'] === '3') {
    options.color = '#e600a1';
    options.fillColor = '#FF00B3';
  }

  // Instantiates a circle object given a geographical point, a radius in meters and optionally an options object.
  var circle = L.circle([leak['lat'], leak['lng']], radius, options).addTo(mymap);
  circle.bindPopup('Grade: ' + leak['grade'] + '<br>' + 'Address: ' + leak['formatted_address'] + '<br>' + 'Record Date: ' + leak['record_date'] + '<br>' + 'ID: ' + leak['id']);
}
