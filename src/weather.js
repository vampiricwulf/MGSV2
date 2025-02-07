var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function locationSuccess(pos) {
  // Construct URL
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=" +
      pos.coords.latitude + "&lon=" + pos.coords.longitude + "&APPID=f367ed89f1ce4abf011df37b82633adc";
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);
      var condtext;
      // Temperature in Kelvin requires adjustment to f
      var temperature_f = Math.round(json.main.temp * 9/5 - 459.67);
      console.log("Temperature f is " + temperature_f);

      // Conditions
      var conditions = json.weather[0].id; 
      //convert id into readable
      if (conditions >= 200 && conditions < 300) {
        condtext = "TNDR";
      } else if (conditions < 400) {
        condtext = "DRZL";
      } else if (conditions >= 500 && conditions < 600) {
        condtext = "RAIN";
      } else if (conditions < 700) {
        condtext = "SNOW";
      } else if (conditions < 800) {
        condtext = "FOG";
      } else if (conditions == 800) {
        condtext = "CLR";
      } else if (conditions < 805) {
        condtext = "CLDY";
      } else if (conditions >= 900 && conditions <= 906) {
        condtext = "EXTM";
      } else {
        condtext = "UNKN";
      }
      console.log("Conditions are " + conditions + ": " + condtext);
      
      // Assemble dictionary using our keys
      var dictionary = {
        "KEY_CONDITIONS": condtext,
        "KEY_TEMPERATURE_F": temperature_f,
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log("Weather info sent to Pebble successfully!");
        },
        function(e) {
          console.log("Error sending weather info to Pebble!");
        }
      );
    }      
  );
}

function locationError(err) {
  console.log("Error requesting location!");
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log("PebbleKit JS ready!");

    // Get the initial weather
    getWeather();
  }
);


// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("AppMessage received!");
    getWeather();
  }                     
);


Pebble.addEventListener('showConfiguration', function() {
  var url = 'http://www.sfu.ca/~zya31/mgsv_watchface_config/';
  console.log('Showing configuration page: ' + url);

  Pebble.openURL(url);
});
