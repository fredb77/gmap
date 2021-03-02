
var x,y;
var zooming = 8;
var whereAreYou = "Du startar här";
var btnStart = document.getElementById("start");
var btnStop = document.getElementById("stop");
var btnDone = document.getElementById("done");
var retur = document.getElementById("retur");
var map, infoWindow;

if (localStorage.getItem("onTheRoad") == 1){
  btnStart.disabled = true;
}

/****** SKRIVER UT KARTAN *********/


function initMap() {    
  map = new google.maps.Map(document.getElementById("map"), {
    //center: { lat: -34.397, lng: 150.644 },
    zoom: zooming,
  });
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

  if(end){
    end.addEventListener("click", function() 
    {
      var k = document.getElementById("end").value;
      var lati = k.substr(0, k.indexOf(','));
      var long = k.substring(k.indexOf(',') + 1);
      //document.getElementById("km-info").innerHTML = "lat: " + lati + " " + "lng: " + long;
    });
  }

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
      //calculateAndDisplayRoute(directionsService, directionsRenderer);
      calculateDistance(directionsService, directionsRenderer, x, y, lati, long);
      
    });
  }
  
  if(btnDone){
    btnDone.addEventListener("click", function() 
    {
      //localStorage.setItem("onTheRoad", "0");
      localStorage.clear();
      location.reload();
      //calculateAndDisplayRoute(directionsService, directionsRenderer);
      //getTotalKmFromTrip();
    }
    );
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

function calculateDistance(directionsService, directionsRenderer, latStart,lngStart,latStop,lngStop)
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
  let a = localStorage.getItem("LatStart");
  let b = localStorage.getItem("LngStart");
  let arr = [a, b];
  let startLocation = arr.toString();
  //let endLocation = document.getElementById("end").value;

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
        directionsRenderer.setDirections(response); // Add route to the map
        var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
        if (!directionsData) {
          window.alert('Directions request failed');
          return;
        }
        else {
          var returResa = directionsData.distance.text;
          returResa = returResa.substring(0,returResa.length-2);

          if(retur.checked){
            var sum = parseFloat(returResa) * 2;
            //document.getElementById('msg').innerHTML += "Sträckan med bil tur och retur: " + sum + " km";
          }else{
            var sum = parseFloat(returResa);
            //document.getElementById('msg').innerHTML += "Sträckan med bil: " + 
            //sum + " (" + directionsData.duration.text + ").";
          }
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
  let lat = localStorage.getItem("LatStart");
  let lng = localStorage.getItem("LngStart");
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
  //console.log(dataInLs);
  if (!dataInLs) return [];
  
  let bird = 0, car = 0;

  for(let i = 0; i < dataInLs.length; i++){
    bird = bird + Number(dataInLs[i].birdPath);
    car = car + Number(dataInLs[i].carPath);
  }
  if(retur.checked){
    txt = "Tur och retur";
  }else{
    txt = "Enkel resa";
  }
  document.getElementById("resa").innerText = txt + "\nResa med bil: " + car + " km " + "\nFågelvägen: " + bird + " km"; 
}