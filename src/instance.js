var extend = require('deep-extend'),
  proj4 = require('proj4'),
  reproject = require('reproject'),
	defaults = require('./defaults.js'),
	converter = require('./converter.js');

//g2svg as geojson2svg (shorthand)
var g2svg = function(viewportSize,opt) {
  if(!viewportSize) return;
  this.viewportSize = viewportSize;
  var opt = opt || {};
  extend(defaults,opt);
  extend(this,defaults);
  var mapExtentProj,inPorj,outProj;
  this.reproject = reproject;
  if(this.mapExtentProjCode != this.outProjCode) {
    if(!this.proj4jsDefs) return;
    if(!proj4.defs[this.mapExtentProjCode]) {
      if(this.proj4jsDefs[this.mapExtentProjCode]){
        mapExtentProj = proj4.Proj(this.proj4jsDefs[this.mapExtentProjCode]);
      } else {
        return false;
      }
    } else {
      mapExtentProj = proj4.Proj(this.mapExtentProjCode);
    }
    if(!proj4.defs[this.outProjCode]) {
      if(this.proj4jsDefs[this.outProjCode]){
        outProj = proj4.Proj(this.proj4jsDefs[this.outProjCode]);
      } else {
        return false;
      }
    } else {
      outProj = proj4.Proj(this.outProjCode);
    }
    var ll = proj4(mapExtentProj,outProj,[this.mapExtent[0],this.mapExtent[1]]);
    var tr = proj4(mapExtentProj,outProj,[this.mapExtent[2],this.mapExtent[3]]);
    this.projectedMapExtent = [ll[0],ll[1],tr[0],tr[1]];
    this.mapExtentProj = mapExtentProj;
    this.outProj = outProj;
  } else {
    this.projectedMapExtent = this.mapExtent;
  }
  this.res = this.calResolution(this.projectedMapExtent,this.viewportSize);
  
  if(this.inProjCode !== this.outProjCode) {
    if(!this.proj4jsDefs) return;
    if(!proj4.defs[this.inProjCode]) {
      if(this.proj4jsDefs[this.inProjCode]){
        inProj = proj4.Proj(this.proj4jsDefs[this.inProjCode]);
      } else {
        return false;
      }
    } else {
      inProj = proj4.Proj(this.inProjCode);
    }
    this.inProj = inProj;
    if(!this.outProj) {
	    if(!proj4.defs[this.outProjCode]) {
	      if(this.proj4jsDefs[this.outProjCode]){
	        outProj = proj4.Proj(this.proj4jsDefs[this.outProjCode]);
	      } else {
	        return false;
	      }
	    } else {
	      outProj = proj4.Proj(this.outProjCode);
	    }
      this.outProj = outProj;
    }
  }
};
g2svg.prototype.calResolution = function(extent,size) {
  var xres = (extent[2] - extent[0])/size.width;
  var yres = (extent[3] - extent[1])/size.height;
  return Math.max(xres,yres);
};
g2svg.prototype.convert = function(geojson,options)  {
  var options = options || {};
  var multiGeometries = ['MultiPoint','MultiLineString','MultiPolygon'];
  var geometries = ['Point', 'LineString', 'Polygon'];
  var svgElements = [];
  if (geojson.type == 'FeatureCollection') {
    for(var i=0; i< geojson.features.length; i++) {
      svgElements = svgElements.concat(
        this.convertFeature(geojson.features[i],options));
    }
  } else if (geojson.type == 'Feature') {
    svgElements = this.convertFeature(geojson,options);
  } else if (geojson.type == 'GeomtryCollection') {
    for(var i=0; i< geojson.geometries.length; i++) {
      svgElements = svgElements.concat(
        this.convertGeometry(geojson.geometries[i],options));
    }
  } else if (converter[geojson.type]) {
    svgElements = this.convertGeometry(geojson,options);
  } else {
    return;
  }
  if(options.callback) options.callback.call(this,svgElements);
  return svgElements;
};
g2svg.prototype.convertFeature = function(feature,options) {
  if(!feature.geometry) return;
  var opt = {};
  extend(opt,options);
  opt.attributes = opt.attributes || {};
  opt.attributes.id = opt.attributes.id || feature.id || null;
  return this.convertGeometry(feature.geometry,opt);
};
g2svg.prototype.convertGeometry = function(geom,opt) {
  if(converter[geom.type]) {
    var outGeom
      ,opt = opt || {};

    if(this.inProjCode != this.outProjCode) {
      outGeom = this.reproject.reproject(geom,this.inProj,this.outProj);
    } else {
      outGeom = geom;
    }
    var explode = opt.hasOwnProperty('explode') ? opt.explode : false;
    var paths = converter[geom.type].call(this,outGeom,this.res,
      {x:this.projectedMapExtent[0],y:this.projectedMapExtent[3]},
      {explode:explode}
    );
    var svgJsons,svgEles;
    if(opt.output && opt.output.toLowerCase() == 'svg') {
      svgJsons = paths.map(function(path) {
        return pathToSvgJson(path,geom.type,opt.attributes);
      });
      svgEles = svgJsons.map(function(json) {
        return jsonToSvgElement(json,geom.type);
      });
      return svgEles;
    }
    return paths;
  } else {
    return;
  }
};
var pathToSvgJson = function(path,type,attributes,opt) {
  var svg = {};
  var forcePath = opt && opt.hasOwnProperty('forcePath') ? opt.forcePath
     : false;
  if(type == 'Point' || type == 'MultiPoint' && !forcePath) {
    svg['cx'] = path.split(',')[0];
    svg['cy'] = path.split(',')[1];
    svg['r'] = opt && opt.r ? opt.r : '2';
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
     : false;
  var ele ='<path';
  if(type == 'Point' || type == 'MultiPoint' && !forcePath) {
    ele = '<circle';
  }
  for(var key in json) {
    ele += ' ' + key +'="' + json[key] + '"';
  }
  ele += '/>';
  return ele;
};

module.exports = g2svg;
