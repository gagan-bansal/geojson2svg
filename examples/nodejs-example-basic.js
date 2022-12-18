// uncomment next line if not using in this repo directory
// var geojson2svg = require('geojson2svg');
// comment next line if not using in this repo directory
var geojson2svg = require('../src/main.js');

var converter = geojson2svg({
  mapExtent: {left: -180, bottom: -90, right: 180, top: 90},
  viewportSize: {width: 200, height: 100},
  attributes: ['properties.class' , 'properties.foo'],
  r: 2
});
var geojsonData = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    id: 'pt-1',
    geometry: {type:'Point',coordinates:[50, 50]},
    properties: {foo: 'val-1', class: 'point-tree'}
  }, {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[10, 10],[15, 20],[30, 10]]
    },
    properties: {id: 'ln-1', foo: 'val-2', class: 'line-road', bar: 'val'}
  }, {
    type: 'Feature',
    id: 'pg-1',
    geometry: {
      type: 'LineString',
      coordinates: [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
    },
    properties: {id: 'not-used', foo: 'val-3', class: 'polygon-pond'}
  }]
};

var svgStr = converter.convert(geojsonData);
console.log(svgStr);

// output
// [
//   '<path d="M127.77777777777777,22.22222222222222 m-2,0 a2,2 0 1,1 4,0 a2,2 0 1,1 -4,0" class="point-tree" foo="val-1" id="pt-1"/>',
//   '<path d="M105.55555555555556,44.44444444444444 108.33333333333333,38.888888888888886 116.66666666666666,44.44444444444444" class="line-road" foo="val-2" id="ln-1"/>',
//   '<path d="M116.66666666666666,44.44444444444444 122.22222222222221,27.77777777777778 111.11111111111111,27.77777777777778 105.55555555555556,38.888888888888886 116.66666666666666,44.44444444444444" class="polygon-pond" foo="val-3" id="pg-1"/>'
// ]

var pointSvg = converter.convert({
  type: 'Feature',
  id: 'pt-1',
  geometry: {type:'Point',coordinates:[50, 50]},
  properties: {foo: 'val-1', class: 'point-tree'}
}, {
  pointAsCircle: true
});

console.log(pointSvg);

