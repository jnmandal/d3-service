var express  = require('express'),
    d3       = require('d3'),
    topojson = require('topojson'),
    world    = require('./data/world.json');

//extended projections
require("d3-geo-projection")(d3);

var app = express();
app.set('view engine', 'ejs');

const WIDTH = 960,
    HEIGHT = 500;

function generate(country) {
  if (!country) return {};
  var subunits = topojson.feature(world, world.objects.subunits_world);

  var data = subunits.features
    .filter(f => {
      return f.id === country})
    .map(f => {
      var scale  = 500;
      var center = d3.geo.centroid(f)
      var offset = [WIDTH / 2, HEIGHT / 2];

      var projection = d3.geo
          .mercator()
          .scale(scale)
          .translate(offset)
          .center(center)

      var path = d3.geo
        .path()
        .projection(projection);

      return {
        name: f.properties.name,
        id: f.id,
        coords: [path(f)],
      }
    });
  return data;
}

app.get('/countries/:country?.svg?', (req, res) => {
  console.log(req.params.country)
  var data = generate(req.params.country);
  if (data.length === 0) {
    res.status(404);
    res.send({error: 404, message: 'Could not find this country'});
  } else {
    res.render('template', {viewbox: `0 0 ${WIDTH} ${HEIGHT}`, path:  data[0].coords[0]});
  }
});

app.get('/countries/:country', (req, res) => {
  console.log(req.params.country)
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
