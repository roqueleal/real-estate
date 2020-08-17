mapboxgl.accessToken =
  "pk.eyJ1IjoidmlzdGNvbXVuaWNhY2lvbiIsImEiOiJja2Nyc3ZiYzQxaTJ4MnFzNXBpMG5iZno2In0.9bPy87fQMJpOmV2sJ_AYWQ";

var map = new mapboxgl.Map({
  container: "mapid",
  zoomControl:false, maxZoom:25, minZoom:3,
  center: [-79.904594,-2.166194], 
  style: "mapbox://styles/vistcomunicacion/ckcrt0pw30gaa1inbcbr05h5l",
  zoom: 8,  
});
//wind
const color = {
    temp: [[203,[115,70,105,255]],
      [218,[202,172,195,255]],
      [233,[162,70,145,255]],
      [248,[143,89,169,255]],
      [258,[157,219,217,255]],
      [265,[106,191,181,255]],
      [269,[100,166,189,255]],
      [273.15,[93,133,198,255]],
      [274,[68,125,99,255]],
      [283,[128,147,24,255]],
      [294,[243,183,4,255]],
      [303,[232,83,25,255]],
      [320,[71,14,0,255]]],
    wind: [
      
    ],
  };

  map.on('load', function () {
    fetch('https://sakitam-fdd.github.io/wind-layer/data/wind.json')
    //https://raw.githubusercontent.com/cambecc/earth/master/public/data/weather/current/current-wind-surface-level-gfs-1.0.json
    //https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json
      // fetch('./data/wind.json')
      .then(res => res.json())
      .then(data => {
        console.log(data);

        // data = data.map((item, idx) => {
        //   item.header = Object.assign(item.header, {
        //     parameterCategory: 1,
        //     parameterNumber: idx === 0 ? 2 : 3,
        //   });
        //   return item;
        // });

        const windInterpolateColor = color.wind.reduce((result, item, key) => result.concat(item[0], 'rgba(' + item[1].join(',') + ')'), []);

        const fillLayer = new mapboxWind.ScalarFill('wind', {
          "type": "jsonArray",
          "data": data,
          // "type": "image",
          // "url": "./data/var_tmp.png",
          "extent": [
            [-180, 85.051129],
            [-180, -85.051129],
            [180, 85.051129],
            [180, -85.051129],
          ],
          "width": data[0]['header']['nx'],
          "height": data[0]['header']['ny'] - 1,
          // max: 42.25002441406252,
          // min: -50.84996643066404,
          "uMin": data[0]['header']['min'],
          "uMax": data[0]['header']['max'],
          "vMin": data[1]['header']['min'],
          "vMax": data[1]['header']['max'],
        }, {
          styleSpec: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              ...windInterpolateColor
            ],
            'opacity': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              5,
              1,
              8,
              1
            ],
          },
          renderForm: 'rg',
        });

        map.addLayer(fillLayer);

        window.windLayer = new mapboxWind.WindLayer('wind', data, {
          windOptions: {
            // colorScale: (m) => {
            //   // console.log(m);
            //   return '#fff';
            // },
            // colorScale: [
            //   "rgb(36,104, 180)",
            //   "rgb(60,157, 194)",
            //   "rgb(128,205,193 )",
            //   "rgb(151,218,168 )",
            //   "rgb(198,231,181)",
            //   "rgb(238,247,217)",
            //   "rgb(255,238,159)",
            //   "rgb(252,217,125)",
            //   "rgb(255,182,100)",
            //   "rgb(252,150,75)",
            //   "rgb(250,112,52)",
            //   "rgb(245,64,32)",
            //   "rgb(237,45,28)",
            //   "rgb(220,24,32)",
            //   "rgb(180,0,35)"
            // ],
            // velocityScale: 1 / 20,
            // paths: 5000,
            frameRate: 16,
            maxAge: 600,
            globalAlpha: 0.9,
            velocityScale: 0.00002,
            paths: 3782,
          },
        });

        console.log(map, window.windLayer);

        // map.addLayer(window.windLayer);
        window.windLayer.addTo(map);
        debugger
      });
  });
//wind
//localizar usuario
map.addControl(
    new mapboxgl.GeolocateControl({
        fitBoundsOptions: {
            zoom: 15,
        },
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
   })
 );
//localizar usuario
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
//zomm
//geocoding
//geocoding
// Creates new Event Listener

map.on('click', mapClick);
function mapClick(e){
    long = e.lngLat.lng;
    lat = e.lngLat.lat;
    console.log(long, lat);
    getCountryName(lat, long);

    getCurrentWeather(lat, long);        


};

//listenernuevo
// When the page is loaded
window.addEventListener('load', () => {
    // Rotherdam on load default view

    let point = {
        lat: -2.166194,
        lng: -79.904594
    }
    getCountryName(point.lat, point.lng);    
    getCurrentWeather(point.lat, point.lng);
});


/**
 * @param {number} lat 
 * @param {number} lon 
 */
function getCurrentWeather(lat, lon){
    const APPID = "b432b286b3d8beba074a2045c82ee21c";
   
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${APPID}&units=metric`,
        dataType: "JSON",
     
        /**
         * @param {Object} response 
         */
        success: function (response) {

            $("#weather-description").html(response.weather[0].description);
            $("#current-temperature").html(response.main.temp + " C");
            $("#current-wind-speed").html(response.wind.speed + " m/s");

            
            // Get an icon from the img folder
            // $("#weather-icon").attr('src','../img/' + response.weather[0].icon + "@2x.png" );
            
            var iconurl = "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

            $("#weather-icon").attr('src', iconurl);
            getForecast(lat, lon);
   },

           
        /**
         * @param {Object} request 
         * @param {String} status
         * @param {String} message 
         */
        error: function(request, status, message){

            $("#message-box-backdrop").fadeIn();
            $("#close-message").on("click", function () {
                $("#message-box-backdrop").fadeOut();
            });
        }
        
    });
}

function getForecast(lat, lon){
    const APPID = "b432b286b3d8beba074a2045c82ee21c";
   
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&APPID=${APPID}&units=metric`,
        dataType: "JSON",
     
        /**
         * @param {Object} response 
         */
        success: function (response) {
            console.log(response);

            // check if everything is OK
            if(response.cod == 200){
                
                let labels = [];
                let data = [];
                let bckColor = [];

                let list = response.list;
                for (let i = 0; i < response.cnt/4; i++) {

                    data.push(list[i].main.temp);
                    bckColor.push('rgba(216, 100,84, 1)');
                    // Converts to datetime
                    var date = new Date(list[i].dt * 1000);
                    console.log(date.getHours());
                    const days = [
                        'Sun',
                        'Mon',
                        'Tue',
                        'Wed',
                        'Thu',
                        'Fri',
                        'Sat'
                    ];
                    labels.push(days[date.getDay()] + " " + date.getHours()+":00");
                    
                
                }

                drawChart(labels, data, bckColor);

            }
   },
    error: function(request, status, message){
        
    }
        
    });
}

function drawChart(labels, data, bckColor){
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: data,
                backgroundColor:bckColor,
                borderWidth: 0,
                pointBackgroundColor: 'rgba(166, 166, 166, 0.9)'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    },
                    drawBorder: false

                }],
                xAxes:[{
                    drawOnChartArea: true,
                    drawBorder: false
                }]
            }
        }
    });
  
}

function getCountryName(lat, lon){
    
    $.ajax({
        url:`https://us1.locationiq.com/v1/reverse.php?key=pk.57995f73cfcd071db18d191591974e1f&lat=${lat}&lon=${lon}&format=json`,
        dataType:"JSON",
        
         
        success: function (response) {

            console.log(response);
            // you can get town name
            $("#location-name").html(response.address.city); 
            $("#pop-location").html(response.address.city); 
    
    },
        
        error: function(request, status, message){

            $("#message-box-backdrop").fadeIn();
            $("#close-message").on("click", function () {
                $("#message-box-backdrop").fadeOut();
            });
        }
    })
}

