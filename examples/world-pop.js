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
  var convertor = geojson2svg(
    {width:800,height:800},
    { 
      attributes: {
        'style': 'stroke:#006600; fill: #F0F8FF;stroke-width:0.5px;',
        'vector-effect':'non-scaling-stroke'
      },
      explode: false
    }
  );
  // render feature based on population
  var cat1StyleOpt = { attributes : {
    style: 'stroke:red; fill: pink; stroke-width:0.5px;'}};
  var cat2StyleOpt = { attributes : {
    style: 'stroke:blue; fill: skyblue; stroke-width:0.5px;'}};
  var svgElements = [];
  geojson.features
    .filter( function(f) {
      return f.properties.population > 50000000; })
    .forEach( function(f) {
      svgElements.push(convertor.convert(f,cat1StyleOpt)); });
  geojson.features
    .filter( function(f) {
      return f.properties.population <= 50000000; })
    .forEach( function(f) {
      svgElements.push(convertor.convert(f,cat2StyleOpt)); });

  //var svgElements = convertor.convert(geojson);
  var parser = new DOMParser();
  svgElements.forEach(function(svgStr) {
    var svg = parseSVG(svgStr);
    svgMap.appendChild(svg);
  });
}
