/*!
 * Google Maps customization v1.0
 * Created by Ciprian Lazar.
 * Working on Untitled theme
 */
if ($("#gmap_canvas").length > 0)
    {
        //** JavaScript for Google Maps **//
    var ourLocation = new google.maps.LatLng(document.getElementById("ourLocationX").innerHTML, document.getElementById("ourLocationY").innerHTML, 0); //new google.maps.LatLng(41.447390, -72.843868);
        var mapStyleLight = [{ stylers: [{ lightness: 30 }] }, { elementType: 'labels', stylers: [{ lightness: 30 }] }];
        var mapStyleNormal = [{ stylers: [{ lightness: 0 }] }, { elementType: 'labels', stylers: [{ lightness: 0 }] }];
        var directionsDisplay;
        var directionsService = new google.maps.DirectionsService();
        var map;
        var isMobile = (window.orientation !== undefined);
        var markerIcon = function () {
            if ((' ' + document.body.className + ' ').indexOf(' style2 ') > -1)
                return 'images/gmapMarker2.png';
            else
                return 'images/gmapMarker.png';
        };
        var routingColor = function () {
            try { //** Get color with jQery
                return $('.menu_trigger').css("background-color");
            }
            catch(err){ //** Get color without jQuery
                if ((' ' + document.body.className + ' ').indexOf(' style2 ') > -1)
                    return '#009edb';
                else
                    return '#ed2437';
            }
    
        };
        function init_map() {
            //** Set the options for the map
            var myOptions = {
                zoom: 17,
                center: ourLocation,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                noClear: true,
                scrollwheel: false,
                mapTypeControl: false,
                streetViewControl: false,
                panControl: isMobile,
                panControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
                draggable: !isMobile,
                scaleControl: false,
                overviewMapControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.LEFT_CENTER
                },
                //** Make the map lighter
                styles: mapStyleLight
            };
            //** Define the map
            map = new google.maps.Map(document.getElementById("gmap_canvas"), myOptions);
            directionsDisplay = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: routingColor() } });//({ suppressMarkers: true });
            //** Add the marker with our location
            marker = new google.maps.Marker({
                map: map,
                position: ourLocation,
                icon: markerIcon(),
                animation: google.maps.Animation.BOUNCE
            });
            //** Set the info window on click
            infowindow = new google.maps.InfoWindow({
                content: document.getElementById('gMapPopup').innerHTML
            });
            //** Set event listeners for the click on the marker and info window
            google.maps.event.addListener(infowindow, "closeclick", function () { map.setOptions({ styles: mapStyleLight }); });
            google.maps.event.addListener(marker, "click", function () { infowindow.open(map, marker); map.setOptions({ styles: mapStyleNormal }); });
        }
        //** Load the map
        google.maps.event.addDomListener(window, 'load', init_map);

        //** Calculate route based on the address
        function calcRoute() {
            var start = document.getElementById('startLocation').value;
            var end = ourLocation;
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    //** Apply some styling classes
                    document.getElementById('startLocation').classList.remove('startLocationInvalid');
                    document.getElementById('visitUsContainer').classList.add('startLocationNotEmpty');
                    //** Show directions on the map and zoom to their bounding box
                    directionsDisplay.polylineOptions.strokeColor = routingColor(); //** Calculate again color because maybe it's changed by config panel
                    directionsDisplay.setMap(map);
                    directionsDisplay.setDirections(response);
                    //** Supress the destination marker
                    //directionsDisplay.b.markers[1].setMap(null);
                }
                else {
                    //** Style the input box
                    document.getElementById('visitUsContainer').classList.add('startLocationNotEmpty');
                    document.getElementById('startLocation').classList.add('startLocationInvalid');
                }
            });
        }

        function removeRoute() {
            //** Remove the directions from the map and zoom back to our office
            directionsDisplay.setMap(null);
            map.setCenter(ourLocation);
            map.setZoom(17);
            document.getElementById('startLocation').value = '';
            document.getElementById('startLocation').classList.remove('startLocationInvalid');
            document.getElementById('visitUsContainer').classList.remove('startLocationNotEmpty');
        }
    };