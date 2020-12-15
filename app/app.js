const express = require('express');
const model = require('./model.js');
const api = require('./api.js');

const app = express();

const port = 8080;
const windUrl = '/windSpeed';
const consumptionUrl = '/consumption';
const productionUrl = '/production';
const marketDemandUrl = '/marketDemand';
const priceUrl = '/currentPrice';

// --- Initialize the simulation ---

let sim = makeSimulation();
console.log('starting simulation ...');
sim.startSimulation(1000);  // update each second

// ==== Routes ==== (temporary/experimental)
// THESE ARE ALL DEPRECATED NOW!
// Use the GraphQL API instead.

app.get(windUrl, handler(getWindSpeed));
app.get(consumptionUrl, handler(getPowerConsumption));  // XXX: Deprecated
app.get(marketDemandUrl, handler(getPowerConsumption));
app.get(priceUrl, handler(getPrice));

app.get('/prosumer/:id', prosumerState);
app.get('/prosumer/:id/consumption', prosumerConsumption);
app.get('/prosumer/:id/production', prosumerProduction);
app.get('/prosumer/:id/battery', prosumerBattery);
// XXX: These should be POSTs (at least for setting).
// (Does it matter that the operations are idempotent?)
app.post('/prosumer/:id/chargeRatio/:ratio?', prosumerChargeRatio);
app.post('/prosumer/:id/dischargeRatio/:ratio?', prosumerDischargeRatio);

// --- Manager Prosumer ---
// TODO: fetch all prosumers (just a list of IDs, or all info?)
//app.get('/manager/blackouts/', blackouts);
app.post('/manager/ban/:id/:time', banProsumer);
app.post('/manager/plantOn', managerPlantOn);
app.post('/manager/plantOff', managerPlantOff);
app.post('/manager/setCurrentPrice/:id', handler(notImplemented('setting price'), 404));  // FIXME
app.get('/manager/modelledPrice', handler(notImplemented('modelled price'), 404));  // FIXME
//app.get('/manager/prosumers', handler(notImplemented('fetching prosumers'), 404));  // FIXME
app.get('/manager/prosumers', handler(prosumers));  // FIXME

// --- Controlling the simulation ---
// (For testing.)

app.post('/sim/start/:interval?', startSim);
app.post('/sim/stop', stopSim);
app.post('/sim/reboot/:interval?', rebootSim);
app.post('/sim/advanceBy/:interval/:steps?', advanceSimBy);
//app.post('/sim/advanceTo/:simtime/:steps?', advanceSimTo);  // This probably doesn't make much sense.
app.get('/sim/time', handler(simTime));

// ==== Start server ====

const server = app.listen(port, nop);
const apollo = api.getApi(sim);
apollo.listen(4000);

// ==== Handlers ====

// General purpose handler that sends back whatever f produces.
function handler(f, stat) {
  return function(req, res) {
    if (stat !== undefined) {
      res.status(stat);
    }
    res.send(JSON.stringify(f()));
  };
}

function notImplemented(s) {
  return () => `${s} not implemented`;
}

function managerPlantOn(req, res) {
  sim.manager().turnProductionOn();
  res.status(202).end();
}

function managerPlantOff(req, res) {
  sim.manager().turnProductionOff();
  res.status(202).end();
}

function prosumers() {
  return sim.prosumerStates();
}

function banProsumer(req, res) {
  const id = req.params.id;
  const time = Number(req.params.time);
  console.log(`banning prosumer ${id} for ${time}`);
  sim.prosumer(id).banFor(time);
  res.status(202).end();
}

function prosumerConsumption(req, res) {
  const id = req.params.id;
  res.send(sim.prosumer(id).currentPowerConsumption().toString());
}

function prosumerProduction(req, res) {
  const id = req.params.id;
  res.send(sim.prosumer(id).currentPowerProduction().toString());
}

function prosumerBattery(req, res) {
  const id = req.params.id;
  const prosumer = sim.prosumer(id);
  const battery = {
    charge: prosumer.batteryCharge(),
    capacity: prosumer.batteryCapacity(),
  };
  res.send(JSON.stringify(battery));
}

function prosumerState(req, res) {
  const id = req.params.id;
  res.send(JSON.stringify(sim.prosumer(id).currentState()));
}

function prosumerChargeRatio(req, res) {
  const id = req.params.id;
  const ratio = req.params.ratio;
  const prosumer = sim.prosumer(id);
  if (ratio !== undefined) {
    prosumer.setChargeRatio(ratio);
    res.send(ratio.toString());
  } else {
    res.send(prosumer.getChargeRatio(ratio).toString());
  }
}

function prosumerDischargeRatio(req, res) {
  const id = req.params.id;
  const ratio = req.params.ratio;
  const prosumer = sim.prosumer(id);
  if (ratio !== undefined) {
    prosumer.setDischargeRatio(ratio);
    res.send(ratio.toString());
  } else {
    res.send(prosumer.getDischargeRatio(ratio).toString());
  }
}

function advanceSimBy(req, res) {
  if (sim.isRunning()) {
    res.status(409).send('already running');
  } else {
    sim.advanceSimulationBy(req.params.interval, req.params.steps);
    handler(simTime)(req, res); // send the new time
  }
}

function startSim(req, res) {
  if (sim.isRunning()) {
    res.status(409).send('already running');
  } else {
    sim.startSimulation(req.params.interval);
    res.send('started');
  }
}

function stopSim(req, res) {
  if (!sim.isRunning()) {
    res.status(409).send('already stopped');
  } else {
    sim.stopSimulation();
    res.send('stopped');
  }
}

function rebootSim(req, res) {
  sim.stopSimulation();
  sim = makeSimulation();
  startSim(req, res);
  console.log('restarted simulation');
}

function getWindSpeed() {
  return sim.currentWeather().windSpeed;
}

function getPowerConsumption() {
  return sim.currentMarketDemand();
}

function getPrice() {
  return sim.currentElectricityPrice();
}

function simTime() {
  return sim.simulationTime();
}

function makeProsumers(count=100) {
  let prosumers = {};
  for (let i = 0; i < count; i++) {
    prosumers[i] = model.Prosumer().setId(i);
  }
  return prosumers;
}

function makeSimulation(prosumers=makeProsumers()) {
  return model.Sim(prosumers);
}

function nop() {}
