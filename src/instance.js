var merge = require('deepmerge'),
	converter = require('./converter.js');

//g2svg as geojson2svg (shorthand)
var g2svg = function(options) {
  this.options = options || {};
  this.viewportSize = this.options.viewportSize || 
    {width: 256, height: 256};
  this.mapExtent = this.options.mapExtent ||
    {
      left: -20037508.342789244,
      right: 20037508.342789244,
      bottom: -20037508.342789244,
      top: 20037508.342789244
    };
  this.res = this.calResolution(this.mapExtent,this.viewportSize,
    this.options.fitTo);
};
g2svg.prototype.calResolution = function(extent,size,fitTo) {
  var xres = (extent.right - extent.left)/size.width;
  var yres = (extent.top - extent.bottom)/size.height;
  if (fitTo) { 
    if (fitTo.toLowerCase() === 'width') {
      return xres;
    } else if (fitTo.toLowerCase() === 'height') {
      return yres;
    } else {
      throw new Error('"fitTo" option should be "width" or "height" ');
    }
  } else {
    return Math.max(xres,yres);
  }
};
g2svg.prototype.convert = function(geojson,options)  {
  var opt = merge(this.options, options || {}, {clone: true});
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
  } else if (geojson.type == 'GeometryCollection') {
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
  var opt = merge(this.options, options || {}, {clone: true});
  opt.attributes = opt.attributes || {};
  opt.attributes.id = opt.attributes.id || feature.id || 
    (feature.properties && feature.properties.id ? feature.properties.id : null);
  if(feature.properties && feature.properties.data) {
    for(var key in feature.properties.data) {
      opt.attributes[key] = feature.properties.data[key]
    }
  }
  return this.convertGeometry(feature.geometry,opt);
};
g2svg.prototype.convertGeometry = function(geom,options) {
  if(converter[geom.type]) {
    var opt = merge(this.options, options || {}, {clone: true});
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
        return jsonToSvgElement(json,geom.type,opt);
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
  var pointAsCircle = opt && opt.hasOwnProperty('pointAsCircle') 
    ? opt.pointAsCircle : false;
  if((type == 'Point' || type == 'MultiPoint') && pointAsCircle) {
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
  var pointAsCircle = opt && opt.hasOwnProperty('pointAsCircle') 
    ? opt.pointAsCircle : false;
  var ele ='<path';
  if((type == 'Point' || type == 'MultiPoint') && pointAsCircle) {
    ele = '<circle';
  }
  for(var key in json) {
    ele += ' ' + key +'="' + json[key] + '"';
  }
  ele += '/>';
  return ele;
};

module.exports = g2svg;
