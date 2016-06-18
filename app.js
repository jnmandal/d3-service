var express  = require('express'),
    d3       = require('d3'),
    topojson = require('topojson'),
    world    = require('./data/worldc11.json');

//extended projections
require("d3-geo-projection")(d3);

var app = express();
app.set('view engine', 'ejs');

const WIDTH = 960,
    HEIGHT = 500;

function generate(country) {
  if (!country) return {};
  var subunits = topojson.feature(world, world.objects.worldc11);
  var data = subunits.features
    .filter(f => {
      console.log(f.properties.adm0_a3);
      return f.properties.adm0_a3 === country})
    .map(f => {
      var scale  = 500;
      var center = d3.geo.centroid(f)
      var offset = [WIDTH / 2, HEIGHT / 2];

      var projection = d3.geo
          .mercator()
          .scale(scale)
          .center(center)
          .translate(offset)

      var path = d3.geo
        .path()
        .projection(projection);

      bounds = path.bounds(f);
      minx = Math.min(bounds[0][0], bounds[1][0])
      miny = Math.min(bounds[0][1], bounds[1][1])
      maxx = Math.max(bounds[0][0], bounds[1][0])
      maxy = Math.max(bounds[0][1], bounds[1][1])
      console.log(bounds)

      return {
        viewbox: `${minx} ${miny} ${maxx} ${maxy}`,
        name: f.properties.name,
        id: f.id,
        coords: [path(f)],
      }
    });
  return data;
}

app.get('/countries/:country?.svg?', (req, res) => {
  console.log(req.params.country);
  var data = generate(req.params.country);
  if (data.length === 0) {
    res.status(404);
    res.send({error: 404, message: 'Could not find this country'});
  } else {
    res.render('template', {viewbox: data[0].viewbox, path:  data[0].coords[0]});
  }
});

app.get('/countries/:country', (req, res) => {
  console.log(req.params.country);
  var data = generate(req.params.country);
  if (data.length === 0) {
    res.status(404);
    res.send({error: 404, message: 'Could not find this country'});
  } else {
    res.send(data);
  }
});

app.get('/countries', (req, res) => {
  var subunits = topojson.feature(world, world.objects.subunits_world);
  var projection = d3.geo
    .equirectangular()

  var path  = d3.geo
    .path()
    .projection(projection);

  var data = subunits.features
    .map(f => {
      return {
        name: f.properties.name,
        id: f.id,
        coords: [path(f)],
      }
    });
  res.send(data);
});

app.listen(process.env.PORT || 3001, () => {
  console.log('D3 service up!');
});
