var d3 = require('d3');
var topojson = require('topojson');
var world = require('./world.json');

var width = 960,
    height = 1160;

var subunits = topojson.feature(world, world.objects.subunits_world);
var projection = d3.geo
  .equirectangular()
var path  = d3.geo
  .path()
  .projection(projection);

var data = subunits.features.map(f => {
  return {
    name: f.properties.name,
    id: f.id,
    coords: [path(f)],
  }
})

fileData = JSON.stringify({
  viewbox: `0 0 ${height} ${width}`,
  regions: data
}, null, 2)

var fs = require('fs');
fs.writeFile("./world.svg.json", fileData, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
