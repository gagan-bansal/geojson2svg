var dataURLPoly = './data/countries.geo.json';
// countries data taken from https://github.com/johan/world.geo.json 
getjson(dataURLPoly,drawGeoJSON);
//var dataURLPoint = './data/capitals.json';
//getjson(dataURLPoint,drawGeoJSON);

function drawGeoJSON(resp) {
  var geojson = JSON.parse(resp);
  // covert wgs84 data to Web Mercator projection
  var geojson3857 = reproject.reproject(
    geojson,'EPSG:4326','EPSG:3857',proj4.defs);
  var svgMap = document.getElementById('map');
  var convertor = geojson2svg(
    { 
      viewportSize: {width:800,height:800},
      attributes: {
        'style': 'stroke:#006600; fill: #F0F8FF;stroke-width:0.5px;',
        'vector-effect':'non-scaling-stroke'
      },
      explode: false
    }
  );
  var svgElements = convertor.convert(geojson3857);
  var parser = new DOMParser();
  svgElements.forEach(function(svgStr) {
    var svg = parseSVG(svgStr);
    svgMap.appendChild(svg);
  });
}
//parseSVG from http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
function parseSVG(s) {
  var div= document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  div.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  var frag= document.createDocumentFragment();
  while (div.firstChild.firstChild)
      frag.appendChild(div.firstChild.firstChild);
  return frag;
}
