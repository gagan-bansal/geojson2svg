fs = require('fs');
//var lines;
fs.readFile('WUP2011-F13-Capital_Cities.txt','utf8',function(err,data) {
//fs.readFile('test.txt','utf8',function(err,data) {
  if(err) throw err;
  lines = data.split('\n');
  var jsons = lines.map(function(line) {
    fields = line.split('\t');
    if(fields.length == 8) {
      console.log('name: '+ fields[2]);
      return {type: 'Feature', properties: { name:fields[2],country:fields[1]},
        geometry: {type:'Point', 
          coordinates: [parseFloat(fields[6]),parseFloat(fields[5])]
        }
      };
    } else {
      return {type: 'wrong'};
    }
  });
 
  var features = jsons.filter(function(f) { 
    return f.type == 'Feature'; 
  });
  var featColl = {type: 'FeatureCollection',
    features: features};
  fs.writeFile('capitals.json', JSON.stringify(featColl));
});
