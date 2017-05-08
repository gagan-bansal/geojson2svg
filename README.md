# geojson2svg
Converts geojson to svg string given svg viewport size and maps extent. Check [world map](https://rawgit.com/gagan-bansal/geojson2svg/master/examples/world.html) and [color coded map](https://rawgit.com/gagan-bansal/geojson2svg/master/examples/world-pop.html) examples to demostrate that its very easy to convert geojson into map.

## Installation
Using in node.js or with browserify
```
npm install geojson2svg
```
For including in html page standard way, download file dist/geojson2svg.min.js
```html
<script type="text/javascipt" src="path/to/geojson2svg.min.js"></script>
```
This creates a global variable 'geojson2svg'

geojson2svg is also available on [cdnjs](https://cdnjs.com/libraries/geojson2svg) and can be included like:
```html
<script type="text/javascipt" src="//cdnjs.cloudflare.com/ajax/libs/geojson2svg/x.x.x/geojson2svg.min.js"></script>
```

## Usage
Using in node.js or with browserify
```javascript
var geojson2svg = require('geojson2svg');
var converter = geojson2svg(options);
var svgString = converter.convert(geojson,options);
```
Using in browser standard way
```
var converter = geojson2svg(options);
var svgString = converter.convert(geojson,options);
```
**convert** function returns array of svg element string
### Options

* **viewportSize** is object containing width and height in pixels. Default viewportSize values are:
```
  {
    width: 256,
    height: 256
  }
```
* **mapExtent:** {"left": coordinate, "bottom": coordinate, "right": coordinate, "top": coordinate}. Coordinates should be in same projection as of geojson. Default maps extent are of Web Mercator projection (EPSG:3857). Default extent values are:
```
  {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  }
```
* **output:** 'svg'|'path' default is 'svg'

    'svg' - svg element string is returned like ```'<path d="M0,0 20,10 106,40"/>'```

    'path' - path 'd' value is returned ```'M0,0 20,10 106,40'``` a linestring

* **fitTo** 'width' | 'height' Fit ouput svg map to width or height.

* **explode:** true | false, default is false. Should multigeojson be exploded to many svg elements or not. 
* **attributes:**  Attributes which are required to attach as SVG attributes from features can be passed here as list of path in feature or json object for static attributes, like shown here

    **dynamic**  ``` {"attributes": ["properties.foo", "properties.bar"]}```

    output: ``` [<path foo="fooVal-1"  bar="barVal-1" d="M0,0 20,10 106,40"/>] ```

    or **static** ``` {"attributes": {"class": "mapstyle"}}```
    
    outut: ```'<path class="mapstyle" d="M0,0 20,10 106,40"/>'```

    or **dynamic** and **static** both
     
      {attributes: [
        {
          property: 'properties.foo',
          type: 'dynamic',
          key: 'id'
        }, {
          property: 'properties.baz',
          type: 'dynamic'
        }, {
          property: 'bar',
          value: 'barStatic',
          type: 'static'
        }]
      })

    
    output: ``` [ '<path d="M128,128 128.00638801979818,127.99361198020182" id="fooVal-1" baz="bazVal-1" bar="barStatic"/>'] ```


    Note: If a feature does not have value at the mentioned path then the attribute key would not be attached to svg string and even error would not be thrown. 

* **pointAsCircle:** true | false, default is false. For point geojson return circle element for option:
    ``` { "pointAsCircel": true } ```
    output svg string would be:

    ```'<cirlce cx="30" cy="40" r="1" />'```
* **r:** radius of point svg element
* **callback:** function, accept function that will be called on every geojson conversion with output string as one input variable e.g:
   ```
   { "callback": function(svgString) {
     // do something with svgString
   }}
   ```

   Callback function could be used to render SVG string.
  
The options **'attributes'**, **'r'** and **'callback'** can also be given in **convert** function 
``` 
var svgString = convertor.convert(geojson, 
  {
    "attributes": ...,
    "r": ...,
    "callback": function
  }
```


**mapExtent** is critical option default are the extents of Web Mercator projection ('EPSG:3857') or also known as Spherical Mercator. This projection is used by many web mapping sites (Google / Bing / OpenStreetMap). In case your source data is in geographic coordinates, it can be converted on the fly to Web Mercator Projection using [reproject-spherical-mercator](https://github.com/geosquare/reproject-spherical-mercator) or [reproject](https://github.com/perliedman/reproject) or [proj4js](https://github.com/proj4js/proj4js). Check my [world map](https://github.com/gagan-bansal/geojson2svg/blob/master/examples/world.html) example for detail.

**Assigning id to SVG path**

There are three ways for doing this. First and second, `.converter` reads it from `feature.properties.id` or `feature.id`. Third way, pass id along with attributes like `converter.convert(feature, {attributes: {id:'foo-1', class: 'bar'}})`. Preference order is first as id key in attributes then feature.id and last feature.properties.id.

### Examples
Converts geojson LineString to svg element string:
```
var converter = geojson2svg(
  {
    viewportSize: {width: 200, height: 100},
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
var converter = geojson2svg(
  {
    viewportExtent: {width: 200, height: 100}, 
    mapExtent: {left: -180, bottom: -90, right: 180, top: 90},
    output: 'path'
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

Check my blog [maps-on-blackboard](http://maps-on-blackboard.com/tag/geojson2svg/) for more detailed examples.
## Developing
Once you run
 
```npm install```

then for running test 

```npm run test```

to create build

```npm run build```

##License
This project is licensed under the terms of the MIT license.
