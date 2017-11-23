var myNickName;
var deviceID;
var visible = false;
var myLat;
var myLon;
var map;
var lastZoom;
var lastLat;
var lastLon;
var markers = [];
var mapInitialized = false;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
//    $("#online").attr('disabled', true);
    var name = localStorage.getItem("Nickname");
    if (name != null) {
        $("#nickname").val(name);
//        $("online").prop("disabled", false);
        myNickName = name;
    }
    deviceID = device.uuid;
    console.log("device ready: " + deviceID);
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    getPosition();
}

$(document).on("tap", ".user", function (event) {
    getUser(this.id);
    $('[href="#mappage"]').click();
});

function getPosition() {
    getUsers();
    if (visible == true) {
        updateMyLocation(deviceID, myNickName, myLat, myLon, visible);
    }
    setTimeout(getPosition, 15000);
}

function onSuccess(position) {
    myLat = position.coords.latitude;
    myLon = position.coords.longitude;
}

function onError(error) {
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}


$("#saveBut").on("tap", function () {
    var name = $("#nickname").val();
    vibrate();
    localStorage.setItem("Nickname", name);
    myNickName = name;
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    updateMyLocation(deviceID, myNickName, myLat, myLon, visible);
});


$(document).on("change", "#online", function (event) {
    var state = $('#online')[0].checked;
    if (state == true) {
        visible = true;
        updateMyLocation(deviceID, myNickName, myLat, myLon, visible);
        getUsers();
    } else {
        visible = false;
        updateMyLocation(deviceID, myNickName, myLat, myLon, visible);
        deleteMarkers();
        getUsers();
    }
    vibrate();
});


function updateMyLocation(id, name, lat, lon, visibility) {
    if (id != null && id != "") {
        var request = JSON.stringify({ "deviceid": id, "nickname": name, "loc_lat": lat, "loc_lon": lon, "visibility": visibility });
        $.ajax
            ({
                type: "POST",
                url: '/api.php',
                dataType: 'json',
                async: false,
                data: request,
                success: function () {
                    console.log("Success");
                }
            })

        getUsers();
    } else {
        alert("Laite ID puuttuu!");
    }
}

function getUser(id) {
    if (id != null && id != "") {
        $.ajax({
            url: "/api.php",
            type: "get",
            data: {
                id: id
            },
            success: function (response) {
                var obj = response.data;
                if (typeof (obj) != "undefined") {
                    for (var i = 0; i < obj.length; i++) {
                        addMarker(obj[i].deviceId, obj[i].nickname, obj[i].loc_lat, obj[i].loc_lon);
                    }
                }
            },
            error: function (xhr) {
                console.log("Error getting user data");
            }
        });
    } else {
        alert("Laite ID puuttuu!");
    }
}


function getUsers() {
    deleteMarkers();
    $.get("/api.php", function (data) {
        var obj = data.data;
        $("#onlineUsers").html('');
        if (typeof (obj) != "undefined") {
            for (var i = 0; i < obj.length; i++) {
                addMarkers(obj[i].id, obj[i].nickname, obj[i].loc_lat, obj[i].loc_lon);
                if (document.getElementsByClassName(obj[i].nickname).length < 1) {
                    $("#onlineUsers").append("<a class=\"user " + obj[i].nickname + "\" href=\"#\" id=\"" + obj[i].deviceId + "\" role=\"tab\">" + obj[i].nickname + "</a><br>");
                }
            }
        }
    });
}

function settingsPage() {
    vibrate();
    resetMap();
    getUsers();
}

function mapPage() {
    if (mapInitialized != true) {
        initMap();
        mapInitialized = true;
    }
    vibrate();
    resetMap();
    getUsers();
}


function vibrate() {
    navigator.vibrate(100);
}

function addMarker(id, name, lat, lon) {
    deleteMarkers();
    var userPosition = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({
        position: userPosition,
        label: name,
        map: map
    });
    map.panTo(marker.position);
    map.setZoom(15);
}

function addMarkers(id, name, lat, lon) {
    var userPosition = new google.maps.LatLng(lat, lon);
    var marker = new google.maps.Marker({
        position: userPosition,
        map: map,
        label: name
    });
    markers.push(marker);

    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}


function resetMap() {
    lastLat = 60.190422;
    lastLng = 24.923859;
    lastZoom = 10;
    var start = new google.maps.LatLng(lastLat, lastLng);
    map.panTo(start);
    map.setZoom(10);
}

function deleteMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function initMap() {
    console.log("initializing map");
    if (lastLat != null && lastLon != null) {
        var position = { lat: lastLat, lng: lastLon };
    } else {
        var position = { lat: 60.190422, lng: 24.923859 };
    }
    if (lastZoom != null) {
        zoom = lastZoom;
    } else {
        zoom = 10;
    }

    map = new google.maps.Map(document.getElementById("kartta"), {
        center: position,
        zoom: zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
        styles: [
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "hue": "#7fc8ed"
                    },
                    {
                        "saturation": 55
                    },
                    {
                        "lightness": -6
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    {
                        "hue": "#7fc8ed"
                    },
                    {
                        "saturation": 55
                    },
                    {
                        "lightness": -6
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#83cead"
                    },
                    {
                        "saturation": 1
                    },
                    {
                        "lightness": -15
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#f3f4f4"
                    },
                    {
                        "saturation": -84
                    },
                    {
                        "lightness": 59
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "labels",
                "stylers": [
                    {
                        "hue": "#ffffff"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 100
                    },
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ffffff"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 100
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "labels",
                "stylers": [
                    {
                        "hue": "#bbbbbb"
                    },
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 26
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ffcc00"
                    },
                    {
                        "saturation": 100
                    },
                    {
                        "lightness": -35
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ffcc00"
                    },
                    {
                        "saturation": 100
                    },
                    {
                        "lightness": -22
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "poi.school",
                "elementType": "all",
                "stylers": [
                    {
                        "hue": "#d7e4e4"
                    },
                    {
                        "saturation": -60
                    },
                    {
                        "lightness": 23
                    },
                    {
                        "visibility": "on"
                    }
                ]
            }
        ]
    });


    google.maps.event.addListener(map, 'zoom_changed', function () {
        lastZoom = map.getZoom();
    });

    map.addListener('center_changed', function () {
        lastLat = map.getCenter().lat();
        lastLon = map.getCenter().lng();
    });
}
