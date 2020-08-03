// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
  };
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYWxhc3NldHRlciIsImEiOiI3andLQ1MwIn0.1q6yuZJaMCnAW0cm_6vy_A';

// This adds the map
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'poimapbox-map',
  // style URL
style: 'mapbox://styles/mapbox/light-v10',
// style: 'mapbox://styles/alassetter/cjpzuoypc0t902rocyzzqbvhx',
  // initial position in [long, lat] format
  center: [-256.166754,1.299151],
  // initial zoom
  zoom: 15,
  scrollZoom: false,
      bearing: 110,
  pitch: 500
});

// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
  // Insert the layer beneath any symbol layer.
  var layers = map.getStyle().layers;
   
  var labelLayerId;
  for (var i = 0; i < layers.length; i++) {
  if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
  labelLayerId = layers[i].id;
  break;
  }
  }
   
  map.addLayer({
  'id': '3d-buildings',
  'source': 'composite',
  'source-layer': 'building',
  'filter': ['==', 'extrude', 'true'],
  'type': 'fill-extrusion',
  'minzoom': 15,
  'paint': {
  'fill-extrusion-color': '#E76500',
   
  // use an 'interpolate' expression to add a smooth transition effect to the
  // buildings as the user zooms in
  'fill-extrusion-height': [
  "interpolate", ["linear"], ["zoom"],
  15, 0,
  15.05, ["get", "height"]
  ],
  'fill-extrusion-base': [
  "interpolate", ["linear"], ["zoom"],
  15, 0,
  15.05, ["get", "min_height"]
  ],
  'fill-extrusion-opacity': .6
  }
  }, labelLayerId);
  
     map.addSource('currentBuildings', {
      type: 'geojson',
      data: {
        "type": "FeatureCollection",
        "features": []
      }
    });
      map.addLayer({
      "id": "highlight",
      "source": "currentBuildings",
     'type': 'fill-extrusion',
  'minzoom': 5,
  'paint': {
  'fill-extrusion-color': '#foo',
   
  // use an 'interpolate' expression to add a smooth transition effect to the
  // buildings as the user zooms in
  'fill-extrusion-height': [
  "interpolate", ["linear"], ["zoom"],
  15, 0,
  15.05, ["get", "height"]
  ],
  'fill-extrusion-base': [
  "interpolate", ["linear"], ["zoom"],
  15, 0,
  15.05, ["get", "min_height"]
  ],
  'fill-extrusion-opacity': .6
  }
    }, labelLayerId);
     map.on('click', '3d-buildings', function(e) {
       console.log("hi")
       map.getSource('currentBuildings').setData({
        "type": "FeatureCollection",
        "features": e.features
      });
    });
    });
  // finish buildings 
var parks = {
  "type": "FeatureCollection",
   "features": [
  {
    "type": "Feature",
    "properties": {
      "category": "Real Estate",
      "name": "International Plaza",
      "address": "000 Address",
      "cityzip": "Celina, TX 75009",
      "info": "Your Real Estate Listing Descriptions",
      "website": "https://roqueleal.me/en.html",
      "imagetmb": "https://roqueleal.me/real-estate/image/International-Plaza-200x200.jpg",
      "image": "https://roqueleal.me/real-estate/image/International_Plaza-300x200.jpg",
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "park"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-256.154056,1.275859]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "category": "Real Estate",
      "name": "Ion Orchard",
      "address": "0000 Address",
      "cityzip": "Celina, TX 75009 ",
      "info": "Your Real Estate Listing Descriptions",
      "website": "https://roqueleal.me/en.html",
      "imagetmb": "https://roqueleal.me/real-estate/image/Ion-Orchard-200x200.jpg",
      "image": "https://roqueleal.me/real-estate/image/Ion-Orchard-300x200.jpg",
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "park"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-256.167966,1.304031]
    }
  },
  {
    "type": "Feature",
    "properties": {
      "category": "Real Estate",
      "name": "Lucky Plaza",
      "address": "0000 Address",
      "cityzip": "Celina, TX 75009 ",
      "info": "https://roqueleal.me/en.html",
      "website": "website.com",
      "imagetmb": "https://roqueleal.me/real-estate/image/Lucky-Plaza-200x200.jpg",				
      "image": "https://roqueleal.me/real-estate/image/Lucky-Plaza-300x200.jpg",
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "park"
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-256.166046,1.304347]
    }
  }
]
  };
// This adds the data to the map
map.on('load', function (e) {
  // This is where your '.addLayer()' used to be, instead add only the source without styling a layer
  map.addSource("places", {
    "type": "geojson",
    "data": parks
  });
  // Initialize the list
  buildLocationList(parks);

});

// This is where your interactions with the symbol layer used to be
// Now you have interactions with DOM markers instead
parks.features.forEach(function(marker, i) {
  // Create an img element for the marker
  var el = document.createElement('div');
  el.id = "poimapbox-marker-" + i;
  el.className = 'poimapbox-marker';
  // Add markers to the map at all points
  new mapboxgl.Marker(el, {offset: [0, 0]})
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);

  el.addEventListener('click', function(e){
      // 1. Fly to the point
      flyToPark(marker);

      // 2. Close all other popups and display popup for clicked Park
      createPopUp(marker);

      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');

      e.stopPropagation();
      if (activeItem[0]) {
         activeItem[0].classList.remove('active');
      }

      var listing = document.getElementById('listing-' + i);
      listing.classList.add('active');

  });
});


function flyToPark(currentFeature) {
  map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 18
    });
}

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
          
          '<img src=' + currentFeature.properties.image + '>' +
          '<div class="event-card-layout-column justify-space-between">' +
          '<h3><a href="' + currentFeature.properties.website + '">' + currentFeature.properties.name + '</a></h3>' +
          '<p>' + currentFeature.properties.info + '</p>' 
        )
        .addTo(map);
}


function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    var currentFeature = data.features[i];
    var prop = currentFeature.properties;

    var listings = document.getElementById('poimapbox-listings');
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'amenity-poi';
    listing.id = "listing-" + i;
    
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'name';
    link.dataPosition = i;
          link.innerHTML =  
          '<img src=' + currentFeature.properties.imagetmb + '>' +
          '<h3>' + currentFeature.properties.name +'</h3>' +
          '<p>' + currentFeature.properties.address + '</p>' 

    link.addEventListener('click', function(e){
      // Update the currentFeature to the Park associated with the clicked link
      var clickedListing = data.features[this.dataPosition];

      // 1. Fly to the point
      flyToPark(clickedListing);

      // 2. Close all other popups and display popup for clicked Park
      createPopUp(clickedListing);

      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('amenity-poi active');

      if (activeItem[0]) {
         activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

    });
  }
}
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
var nav3 = new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true });
map.addControl(nav3, 'top-right');