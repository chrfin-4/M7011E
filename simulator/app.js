const express = require('express');
const model = require('./model.js');

const app = express();

const port = 8080;
const windUrl = '/wind';
const consumptionUrl = '/consumption';
const priceUrl = '/price';

function nop() {}

// --- Model ---

function getWindSpeed() {
  return sim.currentWeather().windSpeed;
}

function getPowerConsumption() {
  return sim.currentMarketDemand();
}

function getPrice() {
  return sim.currentElectricityPrice();
}

// General purpose handler that sends back whatever f produces.
function handler(f) {
  return function(req, res) {
    res.send(f().toString());
  };
}

const prosumers = {};
for (let i = 0; i < 100; i++) {
  prosumers[i] = model.Prosumer();
}
const sim = model.Sim(prosumers);
console.log('starting simulation ...');
sim.startSimulation(1000);  // update each second

// --- Routes ---

app.get(windUrl, handler(getWindSpeed));
app.get(consumptionUrl, handler(getPowerConsumption));
app.get(priceUrl, handler(getPrice));

const server = app.listen(port, nop);
