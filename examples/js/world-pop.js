// countries data taken from https://github.com/johan/world.geo.json 
var dataURLPoly = './data/countries.geo.json';
// population data source http://peric.github.io/GetCountries/
var popDataURL = './data/population.json';

//get population data
var popData;
getjson(popDataURL, function(resp) {
  popData = JSON.parse(resp);
  // get countries geojson
  getjson(dataURLPoly,drawGeoJSON);
});

function drawGeoJSON(resp) {
  var geojson = JSON.parse(resp);
  // extend geojson properties with country's population
  var joinMap = {
    geoKey: 'properties.name',
    dataKey: 'countryName',
    propertyMap: [{
      geoProperty: 'population',
      dataProperty: 'population'
    }]
  };
  extendGeoJSON(geojson.features,popData.countries,joinMap);
  // covert wgs84 data to Web Mercator projection
  var geojsonWebMerc = reproject.reproject(
    geojson,'EPSG:4326','EPSG:3857',proj4.defs);
  // calculate geojson data extent
  var extent = bbox(geojsonWebMerc)
  // get map svg element
  var svgMap = document.getElementById('map');
  // initiate geojson2svg
  var convertor = geojson2svg({
    viewportSize: {width:800,height:800},
    mapExtent: {
      left: extent[0], right: extent[2],
      bottom: extent[1], top: extent[3]
    }
  });
  
  // render feature based on population
  var svgElements = [];
  geojsonWebMerc.features
    .filter( function(f) {
      return f.properties.population > 50000000; })
    .forEach( function(f) {
      // next four lines can be wrapped in a function as these are repeating
      // for every filter
      var svgString = convertor.convert(f);
      var svgDocFrag = parseSVG(svgString);
      svgDocFrag.firstChild.classList.add('more');
      svgMap.appendChild(svgDocFrag);
    });
  geojsonWebMerc.features
    .filter( function(f) {
      return f.properties.population <= 50000000; })
    .forEach( function(f) {
      var svgString = convertor.convert(f);
      var svgDocFrag = parseSVG(svgString);
      svgDocFrag.firstChild.classList.add('less');
      svgMap.appendChild(svgDocFrag);
    });
}
