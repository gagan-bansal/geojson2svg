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

function point(geom,res,origin,attributes) {
  var ele = '<circle cx="'+ (geom.coordinates[0] - origin.x)/res +'"'
    + ' cy="'+ (origin.y - geom.coordinates[1])/res + '"';
  ele +=' />';
  if(attributes) ele = addAttributes(ele,attributes); 
  return [ele];
}
function multiPoint(geom,res,origin,attributes) {
  return multi.explode(geom).map(function(single) {
    return point(single,res,origin,attributes)[0];
  });
}
function lineString(geom,res,origin,attributes) {
  var coords = getCoordString(geom.coordinates,res,origin);
  var ele = '<path d="M'+ coords + 'Z"';  
  ele +=' />';
  if(attributes) ele = addAttributes(ele,attributes); 
  return [ele];
}
function multiLineString(geom,res,origin,attributes) {
  return multi.explode(geom).map(function(single) {
    return lineString(single,res,origin,attributes)[0];
  });
}
function polygon(geom,res,origin,attributes) {
  var mainStr,holes,holeStr;
  mainStr = getCoordString(geom.coordinates[0],res,origin);
  if (geom.coordinates.length > 1) {
    holes = geom.coordinates.slice(1,geom.coordinates.length);
  }
  var ele = '<path fill-rule="evenodd" d="M '+ mainStr;
  if(holes) {
    for(var i=0;i<holes.length; i++) {
      ele += ' M ' +  getCoordString(holes[i],res,origin);
    }
  }
  ele += 'Z " />';
  if(attributes) ele = addAttributes(ele,attributes,origin); 
  return [ele];
}
function multiPolygon(geom,res,origin,attributes) {
  return multi.explode(geom).map(function(single) {
    return polygon(single,res,origin,attributes)[0];
  });
}
module.exports = {
  Point: point,
  MultiPoint: multiPoint,
  LineString: lineString,
  MultiLineString: multiLineString,
  Polygon: polygon,
  MultiPolygon: multiPolygon
};
