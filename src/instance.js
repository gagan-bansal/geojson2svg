var extend = require('xtend'),
	converter = require('./converter.js');

//g2svg as geojson2svg (shorthand)
var g2svg = function(viewportSize,options) {
  if(!viewportSize) return;
  this.viewportSize = viewportSize;
  this.options = options || {};
  this.mapExtent = this.options.mapExtent ||
    {
      left: -20037508.342789244,
      right: 20037508.342789244,
      bottom: -20037508.342789244,
      top: 20037508.342789244
    };
  this.res = this.calResolution(this.mapExtent,this.viewportSize);
};
g2svg.prototype.calResolution = function(extent,size) {
  var xres = (extent.right - extent.left)/size.width;
  var yres = (extent.top - extent.bottom)/size.height;
  return Math.max(xres,yres);
};
g2svg.prototype.convert = function(geojson,options)  {
  var opt = extend(extend({},this.options), options || {});
  var multiGeometries = ['MultiPoint','MultiLineString','MultiPolygon'];
  var geometries = ['Point', 'LineString', 'Polygon'];
  var svgElements = [];
  if (geojson.type == 'FeatureCollection') {
    for(var i=0; i< geojson.features.length; i++) {
      svgElements = svgElements.concat(
        this.convertFeature(geojson.features[i],opt));
    }
  } else if (geojson.type == 'Feature') {
    svgElements = this.convertFeature(geojson,opt);
  } else if (geojson.type == 'GeomtryCollection') {
    for(var i=0; i< geojson.geometries.length; i++) {
      svgElements = svgElements.concat(
        this.convertGeometry(geojson.geometries[i],opt));
    }
  } else if (converter[geojson.type]) {
    svgElements = this.convertGeometry(geojson,opt);
  } else {
    return;
  }
  if(opt.callback) opt.callback.call(this,svgElements);
  return svgElements;
};
g2svg.prototype.convertFeature = function(feature,options) {
  if(!feature && !feature.geometry) return;
  var opt = extend(extend({},this.options), options || {});
  opt.attributes = opt.attributes || {};
  opt.attributes.id = opt.attributes.id || feature.id || null;
  return this.convertGeometry(feature.geometry,opt);
};
g2svg.prototype.convertGeometry = function(geom,options) {
  if(converter[geom.type]) {
    var opt = extend(extend({},this.options), options || {});
    var output = opt.output || 'svg';
    var paths = converter[geom.type].call(this,geom,
      this.res,
      {x:this.mapExtent.left,y:this.mapExtent.top},
      opt
    );
    var svgJsons,svgEles;
    if (output.toLowerCase() == 'svg') {
      svgJsons = paths.map(function(path) {
        return pathToSvgJson(path,geom.type,opt.attributes,opt);
      });
      svgEles = svgJsons.map(function(json) {
        return jsonToSvgElement(json,geom.type);
      });
      return svgEles;
    } else {
      return paths;
    }
  } else {
    return;
  }
};
var pathToSvgJson = function(path,type,attributes,opt) {
  var svg = {};
  var forcePath = opt && opt.hasOwnProperty('forcePath') ? opt.forcePath
     : true;
  if((type == 'Point' || type == 'MultiPoint') && !forcePath) {
    svg['cx'] = path.split(',')[0];
    svg['cy'] = path.split(',')[1];
    svg['r'] = opt && opt.r ? opt.r : '1';
  } else {
    svg = {d: path};
    if(type == 'Polygon' || type == 'MultiPolygon') {
      svg['fill-rule'] == 'evenodd'; 
    } 
  }
  for (var key in attributes) {
    svg[key]= attributes[key];
  }
  return svg;
};
var jsonToSvgElement = function(json,type,opt) {
  var forcePath = opt && opt.hasOwnProperty('forcePath') ? opt.forcePath
     : true;
  var ele ='<path';
  if((type == 'Point' || type == 'MultiPoint') && !forcePath) {
    ele = '<circle';
  }
  for(var key in json) {
    ele += ' ' + key +'="' + json[key] + '"';
  }
  ele += '/>';
  return ele;
};

module.exports = g2svg;
