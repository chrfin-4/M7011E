// Dummy simulator

let express = require('express');

let app = express();

const port = 8080;
const windUrl = '/wind';
const consumptionUrl = '/consumption';
const priceUrl = '/price';

function nop() {}

// --- Model ---
// Purely random garbage

function getWindSpeed() {
  return Math.random() * 10;
}

function getPowerConsumption() {
  return 1000 + (Math.random() * 1000);
}

function getPrice() {
  return (1 + Math.random()) / 10;
}

// General purpose handler that sends back whatever f produces.
function handler(f) {
  return function(req, res) {
    res.send(f().toString());
  };
}

// --- Routes ---

app.get(windUrl, handler(getWindSpeed));
app.get(consumptionUrl, handler(getPowerConsumption));
app.get(priceUrl, handler(getPrice));

let server = app.listen(port, nop);
