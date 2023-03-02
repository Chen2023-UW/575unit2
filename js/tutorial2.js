//declare map variable globally so all functions have access
var map;

//step 1 create map
function createMap(){
    
    //create the map
    map = L.map('map', {
        center: [-3, -60],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18,
        ext: 'png'
    }).addTo(map);


    //call getData function
    getData(map);
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allvalues = [];
    //loop through each country
    for(var country of data.features){
        for(var year = 2018; year <= 1999; year -= 1){
            //get immigrant for current year
            var value = country.properties["imm_" + String(year)];
            //add value to array
            if (value > 0)
              allvalues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allvalues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    if (attValue > 0)
      var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius /* PROBLEM HERE */
    else
      var radius = 3

    return radius;
};
    
//Step 3: Add circle markers for point features to the map
function createPropSymbols(data){
        //Step 4: Determine which attribute to visualize with proportional symbols
        var attribute = "imm_2010";
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, { /* PROBLEM HERE */
        pointToLayer: function (feature, latlng) {
            //step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);
             
            // step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);  /* PROBLEM HERE */

            //examine the attribute value to check that it is correct
            console.log(feature.properties, attValue);

            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/immtous.geojson")
        .then(function(response){
            if (!response.ok) {
				throw new Error("HTTP error, status = " + response.status);
			}
            return response.json();
        })
        .then(function(json){
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)