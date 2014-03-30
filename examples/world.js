//(function() {
  var dataURLPoly = 'http://54.255.134.125:3005/examples/data/countries.geo.json';
  //var dataURL = 'http://54.255.134.125:3005/examples/data/CAN.geo.json';
  var dataURLPoint = 'http://54.255.134.125:3005/examples/data/capitals.json';
  getjson(dataURLPoint,drawGeoJSON);
  getjson(dataURLPoly,drawGeoJSON2);
  
  function handleRequest() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        drawGeoJSON(JSON.parse(httpRequest.responseText));
      } else {
        console.log('There was a problem with the request.');
      }
    }
  }

  function drawGeoJSON(resp) {
    console.log('i am drawing');
    var geojson = JSON.parse(resp);
    var svgMap = document.getElementById('map');
    var convertor = geojson2svg({width:800,height:800});
    //var attributes = {style:"stroke:#006600; fill: #00cc00"};
    var attributes = {style:"stroke:#006600; fill: none;stroke-width:1px;"};
    var svgElements = convertor.convert(geojson,{attributes:attributes,output:'svg',explode:false});
    var parser = new DOMParser();
    svgElements.forEach(function(svgStr) {
      var el = parser.parseFromString(svgStr, "image/svg+xml");
      //var svg = el.firstChild;
      var svg = parseSVG(svgStr);
      svgMap.appendChild(svg);
    });
  }
  function drawGeoJSON2(resp) {
    console.log('i am drawing2');
    var geojson = JSON.parse(resp);
    var svgMap = document.getElementById('map');
    var convertor = geojson2svg({width:800,height:800});
    //var attributes = {style:"stroke:#006600; fill: #00cc00"};
    var attributes = {style:"stroke:#006600; fill: none;stroke-width:1px;"};
    var svgElements = convertor.convert(geojson,{attributes:attributes,output:'svg',explode:false});
    var parser = new DOMParser();
    svgElements.forEach(function(svgStr) {
      var el = parser.parseFromString(svgStr, "image/svg+xml");
      //var svg = el.firstChild;
      var svg = parseSVG(svgStr);
      svgMap.appendChild(svg);
    });
  }
  //parseSVG from http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
    function parseSVG(s) {
        var div= document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        div.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
        var frag= document.createDocumentFragment();
        while (div.firstChild.firstChild)
            frag.appendChild(div.firstChild.firstChild);
        return frag;
    }
//})();
