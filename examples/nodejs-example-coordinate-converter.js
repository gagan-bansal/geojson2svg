const {GeoJSON2SVG} = require('../src/index.js');

const proj4 = require('proj4');

const forward = proj4('WGS84', 'EPSG:3857').forward;

// with coordinateConverter
const pt1 = [-71, 41];
const pt2 = [51, 51];
const viewportSize = {width: 800, height: 60};
const fitTo = 'width';

const lineWGS84 = {type:'LineString',coordinates:[pt1, pt2]};
console.log('lineWGS84: ', lineWGS84)

const converterWGS84 = new GeoJSON2SVG({
  mapExtentFromGeojson: true,
  viewportSize,
  fitTo,
  coordinateConverter: forward
});

const svgFromWGS84 = converterWGS84.convert(lineWGS84);
console.log('svgFromWGS84: ', svgFromWGS84);

// without coordinateConverter using Web mercator projected data outside
const pt1WM = forward(pt1);
const pt2WM = forward(pt2);
const lineWebMerc = {type:'LineString', coordinates: [pt1WM, pt2WM]};
console.log('lienWebMerc: ', JSON.stringify(lineWebMerc));
const converterWM = new GeoJSON2SVG({
  mapExtentFromGeojson: true,
  viewportSize,
  fitTo,
});

const svgFromWebMercLine = converterWM.convert(lineWebMerc);
console.log('svgFromWebMercLine: ', svgFromWebMercLine);
