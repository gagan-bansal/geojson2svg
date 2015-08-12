'use strict';
var testDataSets = [];
var merge = require('deepmerge');
var basics = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString',
 'MultiPolygon'];
var testData = require('./testdata.js');
var expect = require('chai').expect
  ,parsePath = require('parse-svg-path')
  ,jsdom = require('jsdom').jsdom;

describe('geojson2svg', function() {
  var precision = testData.precision;
    describe(testData.desc+ ': .convert()', function() {
      var geojson2svg = require('../src/main.js');
      var converter = geojson2svg(testData.options);
      testData.geojsons.forEach(function(data) {
        it(data.type+ ' {output: "path",explode: false,r:2}',function() {
        var options = {output:'path'};
        options = merge(options,testData.options);
          var actualPaths = converter.convert(data.geojson,options);
        testPath(actualPaths,data.path,data.geojson.type,precision);
        });
        it(data.type + ' {output: "svg",explode: false,r:2}',function() {
          var actualSVGs = converter.convert(data.geojson,testData.options);
          testSVG(actualSVGs,data.svg,data.geojson.type,precision);
        });
      });
    it('Feature {output: "path",explode: false}', function() {
      var actualPaths = converter.convert(testData.feature.geojson,
        {output:'path',explode:false});
      testPath(actualPaths,testData.feature.path,
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
      testSVG(actualSVGs,testData.feature.svg,
        testData.feature.geojson.geometry.type,
        precision);
    });
    it('Feature {output: "path",explode: true}', function() {
      if(basics.indexOf(testData.feature.geojson.type) > -1) {
        var actualPaths = converter.convert(testData.feature.geojson,
          {output:'path',explode:true});
        testPath(actualPaths,testData.feature.path_explode,
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
        testSVG(actualSVGs,testData.feature.svg,
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
        testPath([actualPaths[i]],[expPaths[i]],
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
      testSVG(
        actualData,
        testData['Polygon fit to width'].svg,
        testData['Polygon fit to width'].geojson.type,
        precision);
    });
    it('Default vieport size and default maps extent.', function() {
      debugger;
      var converter = geojson2svg();
      var actualOutput = converter.convert(testData['Default values'].geojson);
      testSVG(actualOutput, testData['Default values'].svg, 
        testData['Default values'].geojson.type, precision);
    });
    it('add properties to svg: pass properties in constructor', function() {
      var converter = geojson2svg({attributes: {class: 'foo'}});
      var output = converter.convert(
        {type:'LineString', coordinates: [[0,0], [1000,1000]]});
      var outputEle = jsdom(output).firstChild.children[1].children[0];
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
    });
    it('add properties to svg: pass properties in .convert', function() {
      var converter = geojson2svg({attributes: {class: 'foo',id: 'foo-1'}});
      var output = converter.convert(
        {type:'LineString', coordinates: [[0,0], [1000,1000]]},
        {attributes: {class: 'foo',id: 'foo-1'}}
      );
      var outputEle = jsdom(output).firstChild.children[1].children[0];
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });
    it('add id to svg: as feature.id', function() {
      var converter = geojson2svg({attributes: {class: 'foo'}});
      var output = converter.convert({
        type: 'Feature',
        id: 'foo-1',
        geometry: {type:'LineString', coordinates: [[0,0], [1000,1000]]}
      });
      var outputEle = jsdom(output).firstChild.children[1].children[0];
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });
    it('add id to svg: as feature.properties.id', function() {
      var converter = geojson2svg({attributes: {class: 'foo'}});
      var output = converter.convert({
        type: 'Feature',
        geometry: {type:'LineString', coordinates: [[0,0], [1000,1000]]},
        properties: {id: 'foo-1', name: 'bar'}
      });
      var outputEle = jsdom(output).firstChild.children[1].children[0];
      expect(outputEle).to.respondTo('getAttribute');
      expect(outputEle.getAttribute('class')).to.be.equal('foo');
      expect(outputEle.getAttribute('id')).to.be.equal('foo-1');
    });
  });
});

function testSVG(actualSVGs,expSVGs,type,precision) {
  expect(actualSVGs).to.be.an('array');
  expect(actualSVGs.length).to.be.equal(expSVGs.length);
  var expSVGEle,actSVGEle,expPaths,actPaths;
  for(var i=0;i<expSVGs.length; i++) {
    expSVGEle = jsdom(expSVGs).firstChild.children[1].children[0];
    actSVGEle = jsdom(actualSVGs).firstChild.children[1].children[0];
    expect(actSVGEle.nodeName).to.be.equal('PATH');
    expect(actSVGEle.hasAttribute('d')).to.be.true;
    expPaths = expSVGEle.getAttribute('d');
    actPaths = actSVGEle.getAttribute('d');
    testPath([actPaths],[expPaths],type,precision);
  }
}

function testPath(actualPaths,expPaths,type,precision) {
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
