'use strict';
var testDataSets = [];
var merge = require('deepmerge');
var basics = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString',
 'MultiPolygon'];
var testData = require('./testdata.js');
var {expect, assert} = require('chai');
var parsePath = require('parse-svg-path');
var jsdom = require('jsdom');
var {JSDOM} = jsdom;

describe('geojson2svg', function() {
  var precision = testData.precision;
  var g2svg = require('../src/instance.js');
  var geojson2svg = require('../src/main.js');
  describe('Test geojson2svg Class and instance', function () {
    it('g2svg is function',function () {
      expect(typeof g2svg === 'function').to.be.true;
    });
    it('geojson2svg is function',function () {
      expect(typeof geojson2svg === 'function').to.be.true;
    });
    var converter = geojson2svg(testData.options);
    it('converter is an instance of g2svg', function () {
      assert.instanceOf(converter, g2svg);
    });
    it("converter has method convert", function () {
      assert.isFunction(converter.convert);
    });
    it("converter has method convertFeature", function () {
      assert.isFunction(converter.convertFeature);
    });
    it("converter has method convertGeometry", function () {
      assert.isFunction(converter.convertGeometry);
    });
  });

  describe("Test all geojson types for 'convert' function", function() {
    var converter = geojson2svg(testData.options);
    testData.geojsons.forEach(function(data) {
      it(data.type+ ' {output: "path",explode: false,r:2}',function() {
        var options = {output:'path'};
        options = merge(options,testData.options);
        var actualPaths = converter.convert(data.geojson,options);
        assertPath(actualPaths,data.path,data.geojson.type,precision);
      });
      it(data.type + ' {output: "svg",explode: false,r:2}',function() {
        var actualSVGs = converter.convert(data.geojson,testData.options);
        assertSVG(actualSVGs,data.svg,data.geojson.type,precision);
      });
    });
  });

  describe("Test all options of 'convert' function", function() {
    var converter = geojson2svg(testData.options);
    it('Point while output svg as Circle', function() {
      var expSVGs = [ '<circle cx="128.00031940098992" cy="127.99968059901009" r="2"/>' ]
      var converter = geojson2svg(testData.options);
      var actualSVGs = converter.convert(
        {type:'Point',coordinates:[50,50]},
        {pointAsCircle: true});
      expect(actualSVGs).to.be.an('array');
      expect(actualSVGs.length).to.be.equal(1);
      var actSVGEle = string2dom(actualSVGs);
        expect(actSVGEle.nodeName).to.be.equal('CIRCLE');
        expect(actSVGEle.hasAttribute('cx'))
        expect(parseFloat(actSVGEle.getAttribute('cx')))
          .to.be.closeTo(127.77777777777777, precision);
        expect(actSVGEle.hasAttribute('cy'))
        expect(parseFloat(actSVGEle.getAttribute('cy')))
          .to.be.closeTo(22.22222222222222, precision);
        expect(actSVGEle.hasAttribute('r'))
        expect(actSVGEle.getAttribute('r'))
          .to.be.equal('2');
    });
    it('Output svg coordinates precision', function() {
      var geojson = {type:'LineString',coordinates:[[10,10],[15,20],[30,10]]};
      var expSVGs = ['<path d="M105.556,44.444 108.333,38.889 116.667,44.444"/>'];
      var converter = geojson2svg(testData.options);
      var actualSVGs = converter.convert(geojson, {precision: 3});
      expect(actualSVGs).to.be.an('array');
      expect(actualSVGs.length).to.be.equal(1);
      expect(actualSVGs).to.be.deep.equal(expSVGs);
    });
    it('Feature {output: "path",explode: false}', function() {
      var actualPaths = converter.convert(testData.feature.geojson,
        {output:'path',explode:false});
      assertPath(actualPaths,testData.feature.path,
        testData.feature.geojson.type,
        precision);
    });
    it('Feature {output: "svg",explode: false}', function() {
      var actualSVGs = converter.convert(testData.feature.geojson,
        {
          output:'svg',
          explode:false,
          attributes: { id: 'id1',style:'stroke: #000066; fill: 3333ff;' }
        });
      assertSVG(actualSVGs,testData.feature.svg,
        testData.feature.geojson.geometry.type,
        precision);
    });
    it('Feature {output: "path",explode: true}', function() {
      if(basics.indexOf(testData.feature.geojson.type) > -1) {
        var actualPaths = converter.convert(testData.feature.geojson,
          {output:'path',explode:true});
        assertPath(actualPaths,testData.feature.path_explode,
          testData.feature.geojson.type,
          precision);
      }
    });
    it('Feature {output: "svg",explode: true}', function() {
      if(basics.indexOf(testData.feature.geojson.type) > -1) {
        var actualSVGs = converter.convert(testData.feature.geojson,
          {
            output:'svg',
            explode:true,
            attributes: { id: 'id1',style:'stroke: #000066; fill: 3333ff;' }
          });
        assertSVG(actualSVGs,testData.feature.svg,
          testData.feature.geojson.geometry.type,
          precision);
      }
    });
    it('FeatureCollection {output: "path",explode: false}', function() {
      var actualPaths = converter.convert(testData.featureCollection.geojson,
        {output: 'path', explode: false});
      expect(actualPaths).to.be.an('array');
      var expPaths = testData.featureCollection.path;
      expect(actualPaths.length).to.be.equal(expPaths.length);
      for(var i=0; i < expPaths.length; i++) {
        assertPath([actualPaths[i]],[expPaths[i]],
          testData.featureCollection.geojson.features[i].geometry.type,precision);
      }
    });
    it('Polygon fit to width', function() {
      var converter2 = geojson2svg(
        {
          viewportSize: {width: 300, height: 100},
          mapExtent: {left: -180, bottom: -90, right: 180, top: 90},
          fitTo: 'width',
          output: 'svg',
          explode: false
        }
      );
      var actualData = converter2.convert(
        testData['Polygon fit to width'].geojson);
      assertSVG(
        actualData,
        testData['Polygon fit to width'].svg,
        testData['Polygon fit to width'].geojson.type,
        precision);
    });

    it('Add attributes to svg based on each feature properties:', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: ['properties.foo', 'properties.bar', 'properties.baz']
      })
      var svgStr = converter.convert({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[0,0], [1000,1000]]},
          properties: {foo: 'fooVal-1', bar: 'barVal-1', baz: 'bazVal-1'}
        }, {
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[10,10], [100,100]]},
          properties: {foo: 'fooVal-2', bar: 'barVal-2'}
        }]
      })

      var svgEle1 = string2dom(svgStr[0]);
      expect(svgEle1).to.respondTo('getAttribute');
      expect(svgEle1.getAttribute('foo')).to.be.equal('fooVal-1');
      expect(svgEle1.getAttribute('bar')).to.be.equal('barVal-1');
      expect(svgEle1.getAttribute('baz')).to.be.equal('bazVal-1');

      var svgEle2 = string2dom(svgStr[1]);
      expect(svgEle2).to.respondTo('getAttribute');
      expect(svgEle2.getAttribute('foo')).to.be.equal('fooVal-2');
      expect(svgEle2.getAttribute('bar')).to.be.equal('barVal-2');
      expect(svgEle2.getAttribute('baz')).to.be.null;
    });

    it('Add attributes to svg based on each feature properties and static attributes also:', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: [
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
      });
      var svgStr = converter.convert({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[0,0], [1000,1000]]},
          properties: {foo: 'fooVal-1', bar: 'barVal-1', baz: 'bazVal-1'}
        }, {
          type: 'Feature',
          geometry: {type: 'LineString', coordinates: [[10,10], [100,100]]},
          properties: {foo: 'fooVal-2', bar: 'barVal-2'}
        }]
      })
      var svgEle1 = string2dom(svgStr[0]);
      expect(svgEle1).to.respondTo('getAttribute');
      expect(svgEle1.getAttribute('id')).to.be.equal('fooVal-1');
      expect(svgEle1.getAttribute('bar')).to.be.equal('barStatic');
      expect(svgEle1.getAttribute('baz')).to.be.equal('bazVal-1');
      expect(svgEle1.getAttribute('foo')).to.be.null;

      var svgEle2 = string2dom(svgStr[1]);
      expect(svgEle2).to.respondTo('getAttribute');
      expect(svgEle2.getAttribute('id')).to.be.equal('fooVal-2');
      expect(svgEle2.getAttribute('bar')).to.be.equal('barStatic');
      expect(svgEle2.getAttribute('baz')).to.be.null;
      expect(svgEle2.getAttribute('foo')).to.be.null;
    });

    it('Add given attributes in options to all svg elements: '
      + 'pass attributes in constructor', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: {class: 'foo'}
      });
      var output = converter.convert(
        {type:'LineString', coordinates: [[0,0], [1000,1000]]});
      var outputEle = string2dom(output);
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
    });
    it('Add given attributes in options to all svg elements: '
      + 'pass attributes in .convert', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: {class: 'foo',id: 'foo-1'}
      });
      var output = converter.convert(
        {type:'LineString', coordinates: [[0,0], [1000,1000]]},
        {attributes: {class: 'foo',id: 'foo-1'}}
      );
      var outputEle = string2dom(output);
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });
    it('Add id to svg: as feature.id', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: {class: 'foo'}
      });
      var output = converter.convert({
        type: 'Feature',
        id: 'foo-1',
        geometry: {type:'LineString', coordinates: [[0,0], [1000,1000]]}
      });
      var outputEle = string2dom(output);
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });
    it('Add id to svg: as feature.properties.id', function() {
      var converter = geojson2svg({
        mapExtent: testData.mercatorExtent,
        attributes: {class: 'foo'}
      });
      var output = converter.convert({
        type: 'Feature',
        geometry: {type:'LineString', coordinates: [[0,0], [1000,1000]]},
        properties: {id: 'foo-1', name: 'bar'}
      });
      var outputEle = string2dom(output);
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });

    it('Extent from geojson', function () {
      var converter = geojson2svg({
        mapExtentFromGeojson: true
      });
      var actualData = converter.convert(
        testData['Extent from geojson'].geojson);
      assertSVG(
        actualData,
        testData['Extent from geojson'].svg,
        testData['Extent from geojson'].geojson.type,
        precision);
    });

    it('coordinateConverter options', function () {
      const proj4 = require('proj4');
      const forward = proj4('WGS84', 'EPSG:3857').forward;
      var converter = geojson2svg({
        mapExtentFromGeojson: true,
        viewportSize: {width: 800, height: 60},
        fitTo: 'width',
        coordinateConverter: forward
      });
      var actualData = converter.convert(
        testData['coordinateConverter option'].geojson);
      assertSVG(
        actualData,
        testData['coordinateConverter option'].svg,
        testData['coordinateConverter option'].geojson.type,
        precision);
    })
  });
});

function assertSVG(actualSVGs,expSVGs,type,precision) {
  expect(actualSVGs).to.be.an('array');
  expect(actualSVGs.length).to.be.equal(expSVGs.length);
  var expSVGEle,actSVGEle,expPaths,actPaths;
  //for(var i=0;i<expSVGs.length; i++) {
    expSVGEle = string2dom(expSVGs);
    actSVGEle = string2dom(actualSVGs);
    expect(actSVGEle.nodeName).to.be.equal('PATH');
    expect(actSVGEle.hasAttribute('d')).to.be.true;
    expPaths = expSVGEle.getAttribute('d');
    actPaths = actSVGEle.getAttribute('d');
    assertPath([actPaths],[expPaths],type,precision);
  //}
}

function assertPath(actualPaths,expPaths,type,precision) {
  expect(actualPaths).to.be.an('array');
  expect(actualPaths.length).to.be.equal(expPaths.length);
  var actPathObj,expPathObj,checkCoord = true;
  for(var i=0;i<actualPaths.length; i++) {
    actPathObj = parsePath(actualPaths[i]);
    expPathObj = parsePath(expPaths[i]);
    expect(actPathObj).to.be.an('array');
    expect(actPathObj.length).to.be.equal(expPathObj.length);
    //check each path moves
    for(var j=0;j< expPathObj.length; j++) {
      expect(actPathObj[j].length).to.equal(expPathObj[j].length);
      //compare move command
      expect(actPathObj[j][0]).to.equal(expPathObj[j][0]);
      //do not check for polygon's last close command
      checkCoord = !(j == expPathObj.length -1 && (type == 'Polygon'
        || type == 'MultiPolygon'));
      if(checkCoord) {
        for(var k=1;k<expPathObj[j].length; k++) {
          expect(actPathObj[j][k]).to.be.closeTo(expPathObj[j][k],precision);
        }
        /*//compare x coordinate
        expect(actPathObj[j][1]).to.be.closeTo(expPathObj[j][1],precision);
        //compare y coordinate
        expect(actPathObj[j][2]).to.be.closeTo(expPathObj[j][2],precision);*/
      }
    }
  }
}

function string2dom (str) {
  return (new JSDOM(str)).window.document.body.firstChild
}
