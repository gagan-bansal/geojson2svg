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
  var geojson = reproject.reproject(
    geojson,'EPSG:4326','EPSG:3857',proj4.defs);
  //render on svg
  var svgMap = document.getElementById('map');
  var convertor = geojson2svg({ viewportSize: {width:800,height:800}});
  // render feature based on population
  var svgElements = [];
  geojson.features
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
  geojson.features
    .filter( function(f) {
      return f.properties.population <= 50000000; })
    .forEach( function(f) {
      var svgString = convertor.convert(f);
      var svgDocFrag = parseSVG(svgString);
      svgDocFrag.firstChild.classList.add('less');
      svgMap.appendChild(svgDocFrag);
    });
}
