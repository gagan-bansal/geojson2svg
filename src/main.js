var extend = require('deep-extend');
var g2svg = require('./instance.js');
var geojson2svg = function(viewportSize,options) {
  if(!viewportSize) return;
  return new g2svg(viewportSize,options);
};

if(typeof module !== 'undefined' && module.exports) {
  module.exports = geojson2svg;
} else if(window !== 'undefined') {
  window.geojson2svg = geojson2svg;
}
