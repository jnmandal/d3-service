var d3 = require('d3');
var topojson = require('topojson');
var uk = require('./uk.json');

var width = 960,
    height = 1160;

var subunits = topojson.feature(uk, uk.objects.subunits)
var projection = d3.geo.albers()
  .center([0, 55.4])
  .rotate([4.4, 0])
  .parallels([50, 60])
  .scale(6000)
  .translate([width / 2, height / 2]);

var path = d3.geo
  .path()
  .projection(projection);

subunits.features.forEach(f => {
  console.log(path(f));
})
