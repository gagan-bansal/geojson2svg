# geojson2svg
Converts GeoJSON to SVG string given SVG viewport size and maps extent. geojson2svg can be used client side (in the browser) or server side (with Node.js).

Check [world map](https://rawgit.com/gagan-bansal/geojson2svg/master/examples/world.html), [SVG scaled map](https://rawgit.com/gagan-bansal/geojson2svg/master/examples/world-scaled.html) and [color coded map](https://rawgit.com/gagan-bansal/geojson2svg/master/examples/world-pop.html) examples to demonstrate that its very easy to convert GeoJSON into map.

* [Installation](#installation)
* [Usage](#usage)
* [Basic Example](#basic-example)
* [API](#api)
  * [Initializing the instance](#initializing-the-instance)
  * [Instance method](#instance-method)
* [Migration from 1.x to 2.x (Breaking Change)](#migration-from-1x-to-2x)
* [Important points](#important-points)
* [Changelog](#changelog)
* [License](#license)
* [Related useful articles](#related-useful-articles)

## Installation
Using in node.js or with browserify
```
npm install geojson2svg
```
For including in html page, download the build file [./dist/geojson2svg.min.js](https://raw.githubusercontent.com/gagan-bansal/geojson2svg/master/dist/geojson2svg.min.js)
```html
<script type="text/javascript" src="path/to/geojson2svg.min.js"></script>
```
This creates a global variable 'geojson2svg'

geojson2svg is also available on [cdnjs](https://cdnjs.com/libraries/geojson2svg) and can be included like:
```html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/geojson2svg/x.x.x/geojson2svg.min.js"></script>
```

## Usage
Using in node.js or with browserify
```javascript
var geojson2svg = require('geojson2svg');
var converter = geojson2svg(options);
var svgStrings = converter.convert(geojson, options);
```
Using in browser standard way
```
var converter = geojson2svg(options);
var svgStrings = converter.convert(geojson,options);
```

## Basic Example
```javascript
var geojson2svg = require('geojson2svg');

var converter = geojson2svg({
  mapExtent: {left: -180, bottom: -90, right: 180, top: 90},
  viewportSize: {width: 200, height: 100},
  attributes: ['properties.class' , 'properties.foo'],
  r: 2
});
var geojsonData = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    id: 'pt-1',
    geometry: {type:'Point',coordinates:[50, 50]},
    properties: {foo: 'val-1', class: 'point-tree'}
  }, {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[10, 10],[15, 20],[30, 10]]
    },
    properties: {id: 'ln-1', foo: 'val-2', class: 'line-road', bar: 'val'}
  }, {
    type: 'Feature',
    id: 'pg-1',
    geometry: {
      type: 'LineString',
      coordinates: [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
    },
    properties: {id: 'not-used', foo: 'val-3', class: 'polygon-pond'}
  }]
});

var svgStr = converter.convert(geojsonData);
console.log(svgStr);

// output
// [
//   '<path d="M127.77777777777777,22.22222222222222 m-2,0 a2,2 0 1,1 4,0 a2,2 0 1,1 -4,0" class="point-tree" foo="val-1" id="pt-1"/>',
//   '<path d="M105.55555555555556,44.44444444444444 108.33333333333333,38.888888888888886 116.66666666666666,44.44444444444444" class="line-road" foo="val-2" id="ln-1"/>',
//   '<path d="M116.66666666666666,44.44444444444444 122.22222222222221,27.77777777777778 111.11111111111111,27.77777777777778 105.55555555555556,38.888888888888886 116.66666666666666,44.44444444444444" class="polygon-pond" foo="val-3" id="pg-1"/>'
// ]
```
**convert** function returns an array of SVG elements' strings.

## Migration from 1.x to 2.x

Default value of `mapExtent` in 1.x was Web Mercator projection's full extent. In 2.x if `mapExtent` is not provided the `mapExtentFromGeoJSON` is considered to be true, that means the extent of the input data is considered as `mapExtent`.

There is only one case (from 1.x to 2.x) for which your existing code would fail, the input GeoJSON data projection system is Web Mercator and you have not specified `mapExtent`. So to work with 2.x just pass the `mapExtent` as [Web Mercator extent](https://gis.stackexchange.com/a/280022/12962)

## API

### Initializing the instance

```javascript
var converter = geojson2svg(options);
```

Here are all options available for initializing the instance.


* **viewportSize** is object containing width and height in pixels. Default viewportSize value is: `{width: 256, height: 256}`
* **mapExtent:** {"left": coordinate, "bottom": coordinate, "right": coordinate, "top": coordinate}. Coordinates should be in same projection as of GeoJSON data. <ins>**NOTE: If `mapExtent` is not defined, the parameter `mapExtentFromGeojson` is considered `true`.**</ins>

* **mapExtentFromGeojson:** boolean, if true `mapExtent` is calculated from GeoJSON data that is passed in `.convert` function.

* **fitTo:** 'width' | 'height' Fit output SVG map to width or height. If nothing is provided, the program tries to fit the data within width or height so that full mapExtent is visible in viewport.
* **coordinateCoverter:** 'function' to convert input GeoJSON coordinates while converting to SVG. This function should take coordinates of a point `[x,y]` and returns transformed point `[x, y]`.
* **pointAsCircle:** true | false, default is false. For point GeoJSON return circle element for option:
    ``` { "pointAsCircel": true } ```
    output SVG string would be:

    ```'<cirlce cx="30" cy="40" r="1" />'```
* **r:** radius of point SVG element

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


    **Note**: If a feature does not have value at the mentioned path then the attribute key would not be attached to SVG string and no error would be thrown.

* **explode:** true | false, default is false. Should multigeojson be exploded to many SVG elements or not.

* **precision** number, precision of output SVG coordinates. Default is false.
* **output:** 'svg'|'path' default is 'svg'

    'svg' - SVG element string is returned like ```'<path d="M0,0 20,10 106,40"/>'```

    'path' - path 'd' value is returned ```'M0,0 20,10 106,40'``` a linestring

* **callback:** function, accept function that will be called on every GeoJSON conversion with output string as one input variable e.g:
   ```
   { "callback": function(svgString) {
     // do something with svgString
   }}
   ```

   Callback function could be used to render SVG string.

### Instance method

  `.convert(geojson, options)`

  The options **'attributes'**, **'r'** and **'callback'** can also be given in **convert** function's option. Example:

```javascript
var svgStrings = convertor.convert(geojson,
  {
    "attributes": ...,
    "r": ...,
    "callback": function
  }
);
```

## Important points

* **mapExtent** is critical option. Usually your data would would be in [WGS84](https://en.wikipedia.org/wiki/World_Geodetic_System) (World Geodetic System) and unit as degree decimal for latitudes and longitude. Spatial reference system code for this is "EPSG:4326". To show the geographic data on two dimensional plane (paper or HTML page) the coordinates need to be projected. The usual choice is Web Mercator projection ('EPSG:3857') also known as Spherical Mercator. Web Mercator projection is used by many web mapping sites (OpenStreetMap, Google, Bing, and others). Geographic coordinates can be converted to Web Mercator Projection using [reproject-spherical-mercator](https://github.com/geosquare/reproject-spherical-mercator) or [reproject](https://github.com/perliedman/reproject) or [proj4js](https://github.com/proj4js/proj4js). Check [world map](https://github.com/gagan-bansal/geojson2svg/blob/master/examples/js/world.js) example for detail.

* **Assigning id to SVG path,** there are two ways to achieve this. The first is default, the converter reads it from GeoJSON data attributes `feature.properties.id` or `feature.id`. Another way is explicitly specify the `id` attributes in `.convert` method, pass id along with attributes like `converter.convert(feature, {attributes: {id:'foo-1', class: 'bar'}})`. Preference order is: first as `id` key in attributes then `feature.id` and last `feature.properties.id`.

* **Converting SVG string to HTML DOM element**, the SVG strings returned by `convert` method can be easily converted to HTML SVG elements. Intentionally I have kept the geojson2svg's output as string to make it more modular. Here is simple way to convert SVG strings to SVG elements with [parse-svg](https://github.com/gagan-bansal/parse-svg) or with any other parser. Read more about SVG string conversion to DOM Element [here](https://stackoverflow.com/a/3642265/713573) or [here](https://stackoverflow.com/a/24109000/713573). The usage of 'parse-svg' is as follows:

  ```shell
  npm install parse-svg
  ```
  or include in your html file
  ```html
  <script type="text/javascript" src="path/to/parse-svg.min.js"></script>
  ```
  Simple way to convert svgStrings to SVG elements

  ```javascript
  var parseSVG = require('parse-svg');
  var svgElements = svgStrings.map(parseSVG);
  ```

## Changelog
Check [here](https://github.com/gagan-bansal/geojson2svg/blob/master/CHANGELOG.md)

## License

This project is licensed under the terms of the [MIT license](https://github.com/gagan-bansal/geojson2svg/blob/master/LICENSE).

## Related useful articles

* [CSS-TRICKS: SVG Properties and CSS](https://css-tricks.com/svg-properties-and-css/)
* [MDN SVG Tutorial: SVG and CSS](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_and_CSS)
* [JENKOV SVG Tutorial: SVG and CSS - Cascading Style Sheets](https://jenkov.com/tutorials/svg/svg-and-css.html#css-attributes)
* Check my blog [maps-on-blackboard](http://maps-on-blackboard.github.io/tag/geojson2svg/) for more detailed examples using `geojson2svg`.
