'use strict';
var testDataSets = [];
//testDataSets.push(require('./testdata1.js'));
testDataSets.push(require('./testdata2.js'));
var expect = require("chai").expect;

describe('geojson2svg', function() {
  testDataSets.forEach(function(testData) {
	  describe(testData.desc+ ': .convert()', function() {
	    var geojson2svg = require('../src/main.js');
	    var converter = geojson2svg(testData.svgSize,testData.options);
	    testData.primitives.forEach(function(data) {
	      it(data.type,function() {
	        var outSVG = converter.convert(data.json);
	        //console.log('outSVG: '+ outSVG);
	        //console.log('expected SVG: '+ data.svg);
	        expect(outSVG).to.deep.equal(data.svg);
	      });
	    });
	  });
  });
});
