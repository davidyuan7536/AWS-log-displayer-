var IPMapper = {
	map: null,
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	latlngbound: null,
	infowindow: null,
	baseUrl: "http://freegeoip.net/json/",
	initializeMap: function(mapId){
		IPMapper.latlngbound = new google.maps.LatLngBounds();
		var latlng = new google.maps.LatLng(0, 0);
		//set Map options
		var mapOptions = {
			center: latlng,
			mapTypeId: IPMapper.mapTypeId,
      minZoom: 2
		}
		//init Map
		IPMapper.map = new google.maps.Map(document.getElementById(mapId), mapOptions);
		//init info window
		IPMapper.infowindow = new google.maps.InfoWindow();
		//info window close event
		google.maps.event.addListener(IPMapper.infowindow, 'closeclick', function() {
			IPMapper.map.fitBounds(IPMapper.latlngbound);
			IPMapper.map.panToBounds(IPMapper.latlngbound);
		});
	},
	addIPArray: function(ipArray, ipArrayInfo){
		ipArray = IPMapper.uniqueArray(ipArray); //get unique array elements
		//add Map Marker for each IP
		for (var i = 0; i < ipArray.length; i++){
			IPMapper.addIPMarker(ipArray[i], ipArrayInfo[i]);
		}
	},
	addIPMarker: function(ip, ipInfo){
		ipRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
		if($.trim(ip) != '' && ipRegex.test(ip)){ //validate IP Address format
			var url = encodeURI(IPMapper.baseUrl + ip + "?callback=?"); //geocoding url
			$.getJSON(url, function(data) { //get Geocoded JSONP data
				if($.trim(data.latitude) != '' && data.latitude != '0' && !isNaN(data.latitude)){ //Geocoding successfull
					var latitude = data.latitude;
					var longitude = data.longitude;
					var contentString = "";
					$.each(data, function(key, val) {
						contentString += '<b>' + key.toUpperCase().replace("_", " ") + ':</b> ' + val + '<br />';
					});
          contentString += '<b>TOTAL: </b>' + ipInfo + '<br />';
					var latlng = new google.maps.LatLng(latitude, longitude);
					var marker = new google.maps.Marker({ //create Map Marker
						map: IPMapper.map,
						draggable: false,
            animation: google.maps.Animation.DROP,
						position: latlng
					});
					IPMapper.placeIPMarker(marker, latlng, contentString); //place Marker on Map
				} else {
					IPMapper.logError('IP Address geocoding failed!');
          console.log(ip);
					$.error('IP Address geocoding failed!');
				}
			});
		} else {
			IPMapper.logError('Invalid IP Address!');
			$.error('Invalid IP Address!');
		}
	},
	placeIPMarker: function(marker, latlng, contentString){ //place Marker on Map
		marker.setPosition(latlng);
		google.maps.event.addListener(marker, 'click', function() {
      IPMapper.toggleBounce(marker);
			IPMapper.getIPInfoWindowEvent(marker, contentString);
      setTimeout(function(){ IPMapper.toggleBounce(marker); }, 1400);
		});
		IPMapper.latlngbound.extend(latlng);
		IPMapper.map.setCenter(IPMapper.latlngbound.getCenter());
		IPMapper.map.fitBounds(IPMapper.latlngbound);
	},
	getIPInfoWindowEvent: function(marker, contentString){ //open Marker Info Window
		IPMapper.infowindow.close()
		IPMapper.infowindow.setContent(contentString);
		IPMapper.infowindow.open(IPMapper.map, marker);
	},
	uniqueArray: function(inputArray){ //return unique elements from Array
		var a = [];
		for(var i=0; i<inputArray.length; i++) {
			for(var j=i+1; j<inputArray.length; j++) {
				if (inputArray[i] === inputArray[j]) j = ++i;
			}
			a.push(inputArray[i]);
		}
		return a;
	},
	logError: function(error){
		if (typeof console == 'object') { console.error(error); }
	},
  toggleBounce: function(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
  }
}
