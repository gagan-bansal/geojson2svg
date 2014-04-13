var g2svg = require('./instance.js');
var geojson2svg = function(viewportSize,options) {
  if(!viewportSize) return;
  return new g2svg(viewportSize,options);
};

module.exports = geojson2svg;
