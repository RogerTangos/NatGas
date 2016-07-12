// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR-API-KEY&libraries=visualization">

var map, heatmap;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 42.3587772, lng: -71.0659988 },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });

    heatmap.set('radius', heatmap.get('radius') ? null : 20);
    heatmap.set('opacity', heatmap.get('opacity') ? null : 1);
}

function toggleOptions(){
  heatmap.setOptions('dissapating', true);

}

function togglePoints() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

// Heatmap data: 500 Points
function getPoints() {
    var mapPoints = []


    for (var i = 0; i < leaks.length; i++) {
        var leak = leaks[i];
        var weight = (1 - (leak['grade'] / 3)) * 9;
        var point = { location: new google.maps.LatLng(leak['lat'], leak['lng']), weight: weight }
        mapPoints.push(point);
    }

    return mapPoints;

}
