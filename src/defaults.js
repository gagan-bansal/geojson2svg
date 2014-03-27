module.exports = {
  mapExtent: [-180,-90,180,90],
  mapExtentProjCode: 'EPSG:4326',
  mapExtent: [-180,-90,180,90],
  inProjCode: 'EPSG:4326',
  outProjCode: 'EPSG:4326',
  r: 2,
  style:"",
  proj4jsDefs: {
    'SR-ORG:6864': '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    'EPSG:4326': '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
  }
};
