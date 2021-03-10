var x, y, latitude, longitude, latitude2, longitude2, laa, txt, marker;
var loop = 0;
var zooming = 10;
var mapclick = localStorage.getItem("mapclick");
var map, infoWindow;
var whereAreYou = "Din position";
var btnStart = document.getElementById("start");
var btnStop = document.getElementById("stop");
var btnDone = document.getElementById("done");
var retur = document.getElementById("retur");
var btns = document.getElementById("btns");
var resa = document.getElementById("resa");
var bottom = document.getElementById("bottom");
var topbar = document.getElementById("topbar");
var ts = document.getElementById("report_manual");
clearLs.disabled = true;
btnRedo.disabled = true;

if(localStorage.getItem("mapclick") == null){
  localStorage.setItem("mapclick", 0);
}else{
  mapclick = mapclick;
}

if(localStorage.getItem("onTheRoad") == 1){
  btnStart.disabled = true;
  btnStop.disabled = false;
}

if(bottom){
  bottom.style.display = "none";
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

function initMap() 
{
  if(loop == 0){
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: zooming,
    mapTypeId:google.maps.MapTypeId.ROADMAP,
  });

  const geocoder = new google.maps.Geocoder();

  const input1 = document.getElementById("input1");
  const input2 = document.getElementById("input2");
  const options = {
    componentRestrictions: { country: "se" },
    fields: ["formatted_address", "geometry", "name"],
    origin: map.getCenter(),
    strictBounds: false,
    types: ["address"],
  };

  map.addListener("click", (mapsMouseEvent) => {
    if(localStorage.getItem("mapclick") == 0){
      var laa = mapsMouseEvent.latLng;
      addMarker(laa.lat(), laa.lng());
      localStorage.setItem("LatStart", JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2));
      localStorage.setItem("LngStart", JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2));
      localStorage.setItem("onTheRoad", "1");
      
      geocodeLatLng(geocoder, map, JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2),JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2), true);
        
      input1.disabled = true;
      btnStart.disabled = true;
      btnStop.disabled = false;
    }else if (localStorage.getItem("mapclick") == 1){
      if(localStorage.getItem("on") != 1){
        marker.setMap(null);
      }
      
      localStorage.setItem("mapclick", mapclick);
      btnRedo.disabled = false;
      resa.style.display = "block";
      var lat = JSON.stringify(mapsMouseEvent.latLng.toJSON().lat, null, 2);
      var lng = JSON.stringify(mapsMouseEvent.latLng.toJSON().lng, null, 2);
      localStorage.setItem("LatStop", lat);
      localStorage.setItem("LngStop", lng);
      btnStart.disabled = true;
      btnStop.disabled = true;
      clearLs.disabled = false;
      submit_input.style.display = "none";
      
      let x = localStorage.getItem("LatStart");
      let y = localStorage.getItem("LngStart");
      
      calculateDistance(directionsService, directionsRenderer, x, y, lat, lng);
      geocodeLatLng(geocoder, map, lat, lng, false);
    }
    mapclick++;
    localStorage.setItem("mapclick", mapclick);

    if(localStorage.getItem("mapclick") == 3){
      localStorage.setItem("mapclick", mapclick);
    }
  });

if(localStorage.getItem("LatStart")){
  document.getElementById("input1").value = geocodeLatLng(geocoder, map, localStorage.getItem("LatStart"), localStorage.getItem("LngStart"), true);
  input1.disabled = true;
}
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
            icon: {           
              //url: "http://labs.google.com/ridefinder/images/mm_20_blue.png"                           
              url: "img/yellow.png"
            },
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

  if(localStorage.getItem("redo") == 1){
    let x = parseFloat(localStorage.getItem('LatStart'));
    let y = parseFloat(localStorage.getItem('LngStart'));
    let arr = {
      lat: x,
      lng: y 
    }
    marker = new google.maps.Marker(
    {
      position: arr,
      map,
      title: "Start!",  
    });
    marker.setMap(map);
  }

  if(btnStart){
      btnStart.addEventListener("click", function() 
      {
        bottom.style.display = "none";
        localStorage.clear();
        localStorage.setItem("on", 1);
        localStorage.setItem("LatStart", x);
        localStorage.setItem("LngStart", y);
        localStorage.setItem("onTheRoad", "1");
        localStorage.setItem("mapclick", 1);
        geocodeLatLng(geocoder, map, x, y, true);
        input1.disabled = true;
        btnStart.disabled = true;
        btnStop.disabled = false;
        clearLs.disabled = true;
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
      btnRedo.disabled = false;
      clearLs.disabled = false;
      submit_input.style.display = "none";
      let x = localStorage.getItem("LatStart");
      let y = localStorage.getItem("LngStart");
      geocodeLatLng(geocoder, map, lati, long, false);
      calculateDistance(directionsService, directionsRenderer, x, y, lati, long);
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
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      window.alert(
        "No details available for input: '" + place.name + "'"
      );
      return;
    }

    if(localStorage.getItem("mapclick") == 0){
      localStorage.setItem("LatStart", place.geometry.location.lat());
      localStorage.setItem("LngStart", place.geometry.location.lng());
      localStorage.setItem("mapclick", 1);
      input1.disabled = true;
      btnStart.disabled = true;
      btnStop.disabled = false;
    }
    latitude = place.geometry.location.lat();
    longitude = place.geometry.location.lng();
  });

  autocomplete2.bindTo("bounds", map);
  autocomplete2.addListener("place_changed", () => {
    const place2 = autocomplete2.getPlace();

    if (!place2.geometry || !place2.geometry.location) {
      window.alert(
        "No details available for input: '" + place2.name + "'"
      );
      return;
    }

    latitude2 = place2.geometry.location.lat();
    longitude2 = place2.geometry.location.lng();
  });

  if(submit_input){
    submit_input.addEventListener("click", function() 
    {  
      if(document.getElementById("input1").value.length == 0 || document.getElementById("input2").value.length == 0){
        alert("Du måste fylla i adress!");
      }else{
        if(localStorage.getItem("onTheRoad") == 1){
          latitude = localStorage.getItem("LatStart");
          longitude = localStorage.getItem("LngStart");
        }else{
          localStorage.setItem("LatStart", latitude);
          localStorage.setItem("LngStart", longitude);
        }
        clearLs.disabled = false;
        btnStart.disabled = true;
        btnStop.disabled = true;
        btnRedo.disabled = false;
        submit_input.style.display = "none";
        
        localStorage.setItem("manual", "1");
        input1.disabled = true;
        input2.disabled = true;
        calculateDistance(directionsService, directionsRenderer, latitude, longitude, latitude2, longitude2);
      }
    });
  }
}
loop++;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) 
{
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
        window.alert('Hittar inte rutten! prova igen skriv in rutten igen.');
        return;
      } else {
        directionsRenderer.setDirections(response); // SKAPAR RUTT PÅ KARTAN
        var directionsData = response.routes[0].legs[0];
        if (!directionsData) {
          window.alert('Hittar inte rutten! prova igen.');
          return;
        }
        else {
          var returResa = directionsData.distance.text;
          returResa = returResa.substring(0,returResa.length-2);
          let z = returResa.replace(/\s/g, '');
          let car = parseFloat(z);
          if(retur.checked)
            car = car * 2;
          storeInLocalstorage(latStop, lngStop, birdPath, car);
        }
      }
    }); 
  }

/******* HÄMTA STAD FRÅN LATITUDE OCH LONGITUDE *****/

function geocodeLatLng(geocoder, map, x, y, z) 
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
      } else {
        window.alert("Hittade ingenting");
      }
    } else {
      window.alert("Error: " + status);
    }
    if(z){
      document.getElementById("input1").value = results[0].formatted_address;
    }else{
      input2.disabled = true;
      document.getElementById("input2").value = results[0].formatted_address;
    }
  });
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
  bottom.style.display = "block";
  document.getElementById("resa").innerHTML += `
    <b>Info:</b><br/>
    Resa med bil ` + car + ` km, 
    fågelvägen ` + bird + ` km
    <i>(`+ txt + `)</i>
  `;
}

function displayRoute(origin, destination, service, display) {
  service.route(
    {
      origin: origin,
      destination: destination,
      
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK" && result) {
        display.setDirections(result);
      } else {
        alert("Could not display directions due to: " + status);
      }
    }
  );
}

function computeTotalDistance(result) {
  let total = 0;
  const myroute = result.routes[0];

  if (!myroute) {
    return;
  }

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;
  document.getElementById("total").innerHTML = total + " km";
}

function redo()
{
  location.reload(); 
  localStorage.setItem("redo", 1);
  localStorage.setItem("mapclick", 1);
  localStorage.removeItem("LatStop");
  localStorage.removeItem("LngStop");
  localStorage.removeItem("Rutt");
  
  var myLatlng = new google.maps.LatLng(parseFloat(localStorage.getItem('LatStart')),parseFloat(parseFloat(localStorage.getItem('LngStart'))));
  addMarker(myLatlng);
}

function addMarker(x,y)
{
  let arr = {
    lat: x,
    lng: y 
  } 
  marker = new google.maps.Marker(
  {
    position: arr,
    map,
    title: "Start!",  
  });
}