# geojson2svg
Converts geojson to svg or path data string given svg viewport size and maps extent.

## Installation
Using in node.js or with browserify
```
npm install geojson2svg
```
For including in html page standard way, download file dist/geojson2svg.js
```html
<script type="text/javascipt" src="path/to/geojson2svg.js"></script>
```
This create a global variable 'geojson2svg'
## Usage
Using in node.js or with browserify
```javascript
var geojson2svg = require('geojson2svg');
var converter = geojson2svg(viewportSize,options);
var svgString = converter.convert(geojson,options);
```
Using in browser standard way
```
var converter = geojson2svg(viewportSize,options);
var svgString = converter.convert(geojson,options);
```
**viewportSize** is object containing width and height in pixels - {width: 200, height: 100}

**mapExtent** is critical option default is ```{left: -180, bottom: -90, right: 180, top: 90}``` geographic extent, if set as default that means your data is in geographic coordinate system and output svg string would be without any projection used. For the projected data specify map extent(mapExtent) in the projected coordinate system e.g. for Spherical Mercator that is used by Google Maps, use extent as ```{left: -20037508.34,bottom: -20037508.34, right: 20037508.34, top: 20037508.34}```.

In case the geojsons are in geographic coordinates and you want to project the data, use [reproject](https://github.com/perliedman/reproject) or [proj4js](https://github.com/proj4js/proj4js).

**convert** function returns array of svg/path data string
### Examples
Converts geojson LineString to svg element string:
```
var converter = geojson2svg({width: 200, height: 100},
  {
    mapExtent: {left: -180, bottom: -90, right: 180, top: 90},
    output: 'svg'
  }
);
var svgString = converter.convert(
  {type:'LineString',coordinates:[[10,10],[15,20],[30,10]]}
);
//svgString: ['<path d="M105.55555555555556,44.44444444444444 108.33333333333333,38.888888888888886 116.66666666666666,44.44444444444444" />']
```
Converts geojson Polygon to svg path data 'd' string:
```
var converter = geojson2svg({width: 200, height: 100},
  {    
    output: 'path' //default is path
  }
);
var pathData = converter.convert(
  {
    "type": "Polygon", 
    "coordinates": [
      [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]] 
    ]
  }
);
// pathData: ['M116.66666666666666,44.44444444444444 122.22222222222221,27.77777777777778 111.11111111111111,27.77777777777778 105.55555555555556,38.888888888888886 116.66666666666666,44.44444444444444Z']
``` 
### Options

* **mapExtent:** {"left": coordinate, "bottom": coordinate, "right": coordinate, "top": coordinate}. Coordinates should be in same projection as of geojson
* **output:** 'svg'|'path' default is 'path'
    path - path 'd' value is returned 'M0,0 20,10 106,40' a linestring
    svg - svg element string is returned like '<path d="M0,0 20,10 106,40"/>'
* **explode:** true|false default is false. Should multigeojson be exploded to many svg elements or not. 
* **attributes:** json object containing attribute(key) and values(value) for all svg elements. These attributes would be added for output:'svg' option like attributes: {"class": "mapstyle"} returned string would be '<path class="mapstyle" d="M0,0 20,10 106,40"/>' 
* **pointAsCircle:** true|false default is false, for point geojson return cirlce element for output:'svg' like '<cirlce cx="30" cy="40" r="1" />'; when output:'path' out string is '30,40'
* **r:** radius of point svg element
* **callback:** function, accept function that will be called on every geojson conversion with output string as one input variable e.g ```parseSVG(svg) { //do some thing}```

**Options for each geojson:**

  **output, exlpode, attributes, pointAsCircle, r** if passed in **convert** function along with each geojson overrides the main options
## Developing
Once you run
 
```npm isntall```

then for running test 

```npm run test```

to create build

```npm run build```

##License
This project is licensed under the terms of the MIT license.
