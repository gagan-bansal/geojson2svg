//converter.js
var multi = require('multigeojson');
function getCoordString(coords,res,origin) {
  //origin - svg image origin 
  var coordStr = coords.map(function(coord) {
    return (coord[0] - origin.x)/res + ',' + (origin.y - coord[1])/res;
  });
  return coordStr.join(' ');
}
function addAttributes(ele,attributes) {
  console.log('adding attr');
  var part = ele.split('/>')[0];
  for(var key in attributes) {
    if(attributes[key]) {
      part += ' ' + key + '="' + attributes[key] + '"';
    }
  }
  return part + ' />';
}

function point(geom,res,origin,opt) {
  var forcePath = opt && opt.hasOwnProperty('forcePath') ? opt.forcePath
     : false;
  var path;
  if(forcePath) {

  } else {
    path = getCoordString([geom.coordinates],res,origin);
  }
  return [path];
}
function multiPoint(geom,res,origin,attributes) {

}
function lineString(geom,res,origin,otp) {
  var coords = getCoordString(geom.coordinates,res,origin);
  var path = 'M'+ coords;  
  return [path];
}
function multiLineString(geom,res,origin,opt) {
  var explode = opt.hasOwnProperty('explode') ? opt.explode : false;
  var paths = multi.explode(geom).map(function(single) {
    return lineString(single,res,origin,opt)[0];
  });
  if(!explode) return [paths.join(' ')]
  return paths;
}
function polygon(geom,res,origin,opt) {
  var mainStr,holes,holeStr;
  mainStr = getCoordString(geom.coordinates[0],res,origin);
  if (geom.coordinates.length > 1) {
    holes = geom.coordinates.slice(1,geom.coordinates.length);
  }
  var path = 'M'+ mainStr;
  if(holes) {
    for(var i=0;i<holes.length; i++) {
      path += ' M' +  getCoordString(holes[i],res,origin);
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
  if(!explode) return [paths.join(' ').replace('Z','') + 'Z'];
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
