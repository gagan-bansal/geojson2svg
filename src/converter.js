//converter.js
var multi = require('multigeojson');

function getCoordString(coords,res,origin,opt) {
  //origin - svg image origin 
  var coordStr = coords.map(function(coord) {
          if (opt.coordinateConversion) {
           //CONVERT coords into meters
           var newCoord = opt.coordinateConversion(coord[1], coord[0]);
           var newOrigin = opt.coordinateConversion(origin.y, origin.x);
           return (newCoord[0] - newOrigin[0])/res + ',' + (newOrigin[1] - newCoord[1])/res;
       }
    return (coord[0] - origin.x)/res + ',' + (origin.y - coord[1])/res;
  });
  return coordStr.join(' ');
}

function addAttributes(ele,attributes) {
  var part = ele.split('/>')[0];
  for(var key in attributes) {
    if(attributes[key]) {
      part += ' ' + key + '="' + attributes[key] + '"';
    }
  }
  return part + ' />';
}

function point(geom,res,origin,opt) {
  var r = opt && opt.r ? opt.r : 1;
  var path = 'M' + getCoordString([geom.coordinates],res,origin,opt)
    +' m'+ -r+ ',0'+ ' a'+r+','+ r + ' 0 1,1 '+ 2*r + ','+0
    +' a'+r+','+ r + ' 0 1,1 '+ -2*r + ','+0;
  return [path];
}

function multiPoint(geom,res,origin,opt) {
  var explode = opt && opt.hasOwnProperty('explode') ? opt.explode : false;
  var paths = multi.explode(geom).map(function(single) {
    return point(single,res,origin,opt)[0];
  });
  if(!explode) return [paths.join(' ')];
  return paths;
}

function lineString(geom,res,origin,opt) {
  var coords = getCoordString(geom.coordinates,res,origin,opt);
  var path = 'M'+ coords;  
  return [path];
}

function multiLineString(geom,res,origin,opt) {
  var explode = opt && opt.hasOwnProperty('explode') ? opt.explode : false;
  var paths = multi.explode(geom).map(function(single) {
    return lineString(single,res,origin,opt)[0];
  });
  if(!explode) return [paths.join(' ')];
  return paths;
}

function polygon(geom,res,origin,opt) {
  var mainStr,holes,holeStr;
  mainStr = getCoordString(geom.coordinates[0],res,origin, opt);
  if (geom.coordinates.length > 1) {
    holes = geom.coordinates.slice(1,geom.coordinates.length);
  }
  var path = 'M'+ mainStr;
  if(holes) {
    for(var i=0;i<holes.length; i++) {
      path += ' M' +  getCoordString(holes[i],res,origin, opt);
    }
  }
  path += 'Z';
  return [path];
}

function multiPolygon(geom,res,origin,opt) {
  var explode = opt.hasOwnProperty('explode') ? opt.explode : false;
  var paths = multi.explode(geom).map(function(single) {
    return polygon(single,res,origin,opt)[0];
  });
  if(!explode) return [paths.join(' ').replace(/Z/g,'') + 'Z'];
  return paths;
}

module.exports = {
  Point: point,
  MultiPoint: multiPoint,
  LineString: lineString,
  MultiLineString: multiLineString,
  Polygon: polygon,
  MultiPolygon: multiPolygon
};
