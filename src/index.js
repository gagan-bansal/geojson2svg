var bbox = require('geojson-bbox');
var extend = require('extend');
var converter = require('./converter.js');

var GeoJSON2SVG = function(options = {}) {
  if (!options.mapExtent) {
    // throw new
    //   Error('One of the parameter is must: mapExtent or mapExtentFromGeojson');
    this.mapExtentFromGeojson = true;
  } else {
    this.mapExtentFromGeojson = options.mapExtentFromGeojson;
  }
  if (options.fitTo && !/^(width|height)$/i.test(options.fitTo)) {
    throw new Error('"fitTo" option should be "width" or "height" ');
  }
  this.options = options;
  this.viewportSize = options.viewportSize ||
    {width: 256, height: 256};
  if (options.coordinateConverter
    && typeof options.coordinateConverter != 'function')
  {
    throw new Error('"coordinateConverter" option should be function');
  }
  this.coordinateConverter = options.coordinateConverter;
  if (options.mapExtent && this.coordinateConverter) {
    var rightTop = this.coordinateConverter(
      [options.mapExtent.right, options.mapExtent.top]);
    var leftBottom = this.coordinateConverter(
      [options.mapExtent.left, options.mapExtent.bottom]);
    this.mapExtent = {
      left: leftBottom[0], bottom: leftBottom[1],
      right: rightTop[0], top: rightTop[1]
    };
  } else {
    // yes, it may be undefined in case of mapExtentFromGeojson is true
    this.mapExtent = options.mapExtent;
  }
  if (this.mapExtent) {
    this.res = this.calResolution(this.mapExtent,this.viewportSize,
      this.options.fitTo);
  }
};
function convertExtent (extent, converter) {
  var leftBottom = converter([extent[0], extent[1]]);
  var rightTop = converter([extent[2], extent[3]]);
  return [...leftBottom, ...rightTop];
}
GeoJSON2SVG.prototype.calResolution = function(extent,size,fitTo) {
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
GeoJSON2SVG.prototype.convert = function(geojson,options) {
  var resetExtent = false;
  if (!this.res && this.mapExtentFromGeojson) {
    var resetExtent = true;
    var extent = bbox(geojson); // output extent is an array
    if (this.coordinateConverter) {
      // var rightTop = this.coordinateConverter(extent[2] , extent[3]);
      // var leftBottom = this.coordinateConverter(extent[0], extent[1]);
      // extent = [leftBottom[0], leftBottom[1],
      //   rightTop[0], rightTop[1]];
      extent = convertExtent(extent, this.coordinateConverter);
    }
    this.mapExtent = {
      left: extent[0], bottom: extent[1],
      right: extent[2], top: extent[3]
    };
    this.res = this.calResolution(
      this.mapExtent, this.viewportSize, this.options.fitTo);
  }
  var opt = extend(true, {}, this.options, options || {});
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
    throw new Error('Geojson type not supported.');
  }
  if (resetExtent) {
    this.res = null;
    this.mapExtent = null;
  }
  if(opt.callback) opt.callback.call(this,svgElements);
  return svgElements;
};
GeoJSON2SVG.prototype.convertFeature = function(feature,options) {
  if(!feature && !feature.geometry) return;
  var opt = extend(true, {}, this.options, options || {});
  if (opt.attributes && opt.attributes instanceof Array) {
    var arr = opt.attributes
    opt.attributes = arr.reduce(function(sum, property) {
      if (typeof(property) === 'string') {
        var val, key = property.split('.').pop()
        try {
          val = valueAt(feature, property)
        } catch(e) {
          val = undefined
        }
        if (val !== undefined) sum[key] = val
      } else if (typeof(property) === 'object' && property.type
        && property.property)
      {
        if (property.type === 'dynamic') {
          var val, key = property.key ? property.key
            : property.property.split('.').pop()
          try {
            val = valueAt(feature, property.property)
          } catch(e) {
            val = undefined
          }
          if (val !== undefined) sum[key] = val
        } else if (property.type === 'static'  && property.value) {
          sum[property.property] = property.value
        }
      }
      return sum
    }, {})
  } else {
    opt.attributes = opt.attributes || {};
  }
  var id = opt.attributes.id || feature.id ||
    (feature.properties && feature.properties.id
    ? feature.properties.id : null);
  if (id) opt.attributes.id = id;
  return this.convertGeometry(feature.geometry,opt);
};
GeoJSON2SVG.prototype.convertGeometry = function(geom,options) {
  if(converter[geom.type]) {
    var opt = extend(true, {}, this.options, options || {});
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
    throw new Error('Geojson type not supported.');
  }
};

function pathToSvgJson(path,type,attributes,opt) {
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

function jsonToSvgElement(json,type,opt) {
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
}

function valueAt(obj,path) {
  //taken from http://stackoverflow.com/a/6394168/713573
  function index(prev,cur, i, arr) {
    if (prev.hasOwnProperty(cur)) {
      return prev[cur];
    } else {
      throw new Error(arr.slice(0,i+1).join('.') + ' is not a valid property path');
    }
  }
  return path.split('.').reduce(index, obj);
}
module.exports = {GeoJSON2SVG};
