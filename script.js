var x, y, latitude, longitude, latitude2, longitude2;
var zooming = 10;
var whereAreYou = "Du befinner dig här";
var btnStart = document.getElementById("start");
var btnStop = document.getElementById("stop");
var btnDone = document.getElementById("done");
var retur = document.getElementById("retur");
var btns = document.getElementById("btns");
var map, infoWindow;
var ts = document.getElementById("report_manual");
ts.style.display = "none";

if(st){
  st.addEventListener("click", function() 
  {
    if (ts.style.display === 'none') {
      btns.style.display = "none";
      ts.style.display = 'block';
    } else {
      btns.style.display = "block";
      ts.style.display = 'none';
    }
  });
}

/****** RÄNSAR LOCALSTORAGE *********/

if(clearLs){
  clearLs.addEventListener("click", function() 
  {
    localStorage.clear();
    location.reload();
  });
}

/****** SKRIVER UT KARTAN *********/

function initMap() {    
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: zooming,
  });

  const input1 = document.getElementById("input1");
  const input2 = document.getElementById("input2");
  const options = {
    componentRestrictions: { country: "se" },
    fields: ["formatted_address", "geometry", "name"],
    origin: map.getCenter(),
    strictBounds: false,
    types: ["address"],
  };
  
  infoWindow = new google.maps.InfoWindow();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        x = pos.lat;
        y = pos.lng;
          
        new google.maps.Marker(
          {
            position: { lat: x, lng: y },
            map,
            title: whereAreYou,
          }
        );
        
        map.setCenter(pos);
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  if(btnStart){
      btnStart.addEventListener("click", function() 
      {
        let latlngarray = [x,y];
        localStorage["latlngarray"] = JSON.stringify(latlngarray);
        localStorage.setItem("LatStart", x);
        localStorage.setItem("LngStart", y);
        localStorage.setItem("onTheRoad", "1");
        btnStart.disabled = true;
        btnStop.disabled = false;
        btnDone.disabled = true;
      }
    );
  }
  
  if(btnStop){
    btnStop.addEventListener("click", function() 
    {
      var k = document.getElementById("end").value;
      var lati = k.substr(0, k.indexOf(','));
      var long = k.substring(k.indexOf(',') + 1);
      localStorage.setItem("LatStop", lati);
      localStorage.setItem("LngStop", long);
      btnStart.disabled = true;
      btnStop.disabled = true;
      btnDone.disabled = false;
      let x = localStorage.getItem("LatStart");
      let y = localStorage.getItem("LngStart");
      calculateDistance(directionsService, directionsRenderer, x, y, lati, long);
    });
  }
  
  if(btnDone){
    btnDone.addEventListener("click", function() 
    {
      localStorage.clear();
      location.reload();
    });
  }

  const autocomplete = new google.maps.places.Autocomplete(
    input1,
    options
  );

  const autocomplete2 = new google.maps.places.Autocomplete(
    input2,
    options
  );

  autocomplete.bindTo("bounds", map);
  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      window.alert(
        "No details available for input: '" + place.name + "'"
      );
      return;
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    latitude = place.geometry.location.lat();
    longitude = place.geometry.location.lng();
  });

  autocomplete2.bindTo("bounds", map);
  const infowindowContent2 = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent2);
  const marker2 = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete2.addListener("place_changed", () => {
    infowindow.close();
    marker2.setVisible(false);
    const place2 = autocomplete2.getPlace();

    if (!place2.geometry || !place2.geometry.location) {
      window.alert(
        "No details available for input: '" + place2.name + "'"
      );
      return;
    }
    
    marker.setPosition(place2.geometry.location);
    marker.setVisible(true);

    latitude2 = place2.geometry.location.lat();
    longitude2 = place2.geometry.location.lng();
  });


  if(submit_input){
    submit_input.addEventListener("click", function() 
    {
      localStorage.setItem("LatStart", latitude);
      localStorage.setItem("LngStart", longitude);
      localStorage.setItem("manual", "1");
      calculateDistance(directionsService, directionsRenderer, latitude, longitude, latitude2, longitude2);
    });
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

/******** RÄKNAR UT KILOMETER MELLAN DESTINATIONERNA (FÅGELVÄGEN) ********/

function calculateDistance(directionsService, directionsRenderer, latStart, lngStart, latStop, lngStop)
{
    var R = 6378.137; // Radien på jorden i km
    var dLat = latStop * Math.PI / 180 - latStart * Math.PI / 180;
    var dLon = lngStop * Math.PI / 180 - lngStart * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(latStart * Math.PI / 180) * Math.cos(latStop * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    var bird = d.toFixed(0);
    if(retur.checked){
      bird = bird * 2;
      bird = bird.toString();
    }
    calculateAndDisplayRoute(directionsService, directionsRenderer, latStop, lngStop, bird);
}

/******** SKRIVER UT RUTTEN PÅ KARTAN **********/

function calculateAndDisplayRoute(directionsService, directionsRenderer, latStop, lngStop, birdPath) 
{
  let arr = [
    localStorage.getItem("LatStart"), 
    localStorage.getItem("LngStart")
  ];
  var startLocation = arr.toString();
  
  let arr2 = [latStop, lngStop];
  let endLocation = arr2.toString();

  const route = {
    origin: startLocation,
    destination: endLocation,
    travelMode: "DRIVING"
  }

  directionsService.route(route,
    function(response, status) 
    {
      if (status !== 'OK') {
        window.alert('Directions request failed due to ' + status);
        return;
      } else {
        directionsRenderer.setDirections(response); // SKAPAR RUTT PÅ KARTAN
        var directionsData = response.routes[0].legs[0];
        if (!directionsData) {
          window.alert('Directions request failed');
          return;
        }
        else {
          var returResa = directionsData.distance.text;
          returResa = returResa.substring(0,returResa.length-2);
          var sum = parseFloat(returResa);

          if(retur.checked)
            var sum = parseFloat(returResa) * 2;
            
          let car = sum;
          car = car.toString();
          storeInLocalstorage(latStop, lngStop, birdPath, car);
        }
      }
    });
    
}

/******* HÄMTA STAD FRÅN LATITUDE OCH LONGITUDE *****/

function geocodeLatLng(geocoder, map, infowindow, x, y) 
{
  var input = [x, y]
  const lat_lng = {
      lat: parseFloat(input[0]),
      lng: parseFloat(input[1]),
  };
  geocoder.geocode({ location: lat_lng }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        map.setZoom(10);
        const marker = new google.maps.Marker({
          position: lat_lng,
          map: map,
        });
        infowindow.setContent(results[8].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert("Hittade ingenting");
      }
    } else {
      window.alert("Error: " + status);
    }
    storeInLocalstorage(x, y);
  });
}

/****** VISAR ALLA STOP PÅ RESAN **********/

function showTrip()
{
  let trip = localStorage.getItem("rutt");
  let ex = trip.replace(",", "<br/>");
  document.getElementById("resa").innerHTML = ex;
}

/******* LÄGGA IN OLIKA STOPP I LOCALSTORAGE *******/

function storeInLocalstorage(x, y, birdPath, carPath)
{
  if(localStorage.getItem("manual") == 1){
    var lat = 59.3222974;
    var lng = 14.5169702;
  }else{
    var lat = localStorage.getItem("LatStart");
    var lng = localStorage.getItem("LngStart");
  }
  
  let dataInLs = JSON.parse(localStorage.getItem("Rutt"));

  if(dataInLs == null) dataInLs = [];
  
  let entry = 
  { 
    latStart: lat, 
    lngStart: lng,
    latStop: x,
    lngStop: y,
    birdPath: birdPath,
    carPath: carPath
  };

  dataInLs.push(entry);
  localStorage.setItem("Rutt", JSON.stringify(dataInLs));
  getTotalKmFromTrip();
}

function getTotalKmFromTrip()
{
  var dataInLs = JSON.parse(localStorage.getItem("Rutt"));
  if (!dataInLs) return [];
  
  let bird = 0, car = 0;

  for(let i = 0; i < dataInLs.length; i++){
    bird = bird + Number(dataInLs[i].birdPath); // FÅGELVÄGEN
    car = car + Number(dataInLs[i].carPath);    // BILVÄGEN
  }
  if(retur.checked){
    txt = "Tur och retur";
  }else{
    txt = "Enkel resa";
  }
  document.getElementById("resa").innerText = txt + "\nResa med bil: " + car + " km " + "\nFågelvägen: " + bird + " km"; 
}