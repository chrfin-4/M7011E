const prosumer = require('./prosumer.js');
const manager = require('./manager.js');
const Weather = require('./weather.js').Weather;
const Powerplant = require('./powerplant.js').Powerplant;
const util = require('./util.js');
const assert = util.assert;

exports.Prosumer = prosumer.Prosumer;
exports.prosumer = prosumer;
exports.Manager = manager.Manager;
exports.manager = manager;
exports.ConsumptionModel = prosumer.ConsumptionModel; // Deprecated
exports.Sim = Sim;

/*
 * t0 sets the (real) start time.
 * Speed controls how fast the clock ticks in the simulation.
 * speed=1 => 1 second per second
 */
function Sim(prosumers, weatherModel=Weather(), t0=util.now(), speed=1) {

  let running = false;
  let consumers;
  let manager;
  let marketDemand;
  // FIXME: manager should probably have its own power plant?
  // Should also be a parameter.
  let powerPlant = Powerplant(1e9, 30_000);
  let blackout = false; // At least one home is not getting its demands met.

  const timeFactor = speed;
  let simTime = util.toMilliseconds(t0);
  let weather = weatherModel?.currentWeather(simTime);
  const electricityPrice = 23.50;  // FIXME: must get updated
  let updateInterval;

  function currentState() {
    return {
      date: new Date(simTime),
      weather: weatherModel.currentWeather(simTime),
      electricityPrice,
      marketDemand,
    };
  };

  const obj = {
    // --- Model stuff. ---
    prosumer(id) { return prosumers[id]; },
    currentMargetDemand() { return marketDemand; },
    currentElectricityPrice() { return electricityPrice; },
    currentWeather() { return weather; },
    // TODO: add more methods for simulating prosumer/manager actions
    // (like getting consumption/production for a specific user, setting
    // charge/sell ratios, etc.)

    // --- Simulator-specific stuff. ---

    simulationTime() { return simTime; },
    isRunning() { return running; },

    stopSimulation() {
      assert(running);  // TODO: necessary/useful?
      running = false;
    },

    // Step forward in simulation time.
    advanceSimulationBy(interval=1000, steps=1) {
      assert(!running);
      assert(interval > 0);
      for (let i = 0; i < steps; i++) {
        stepBy(interval);
      }
    },

    advanceSimulationTo(simulationTime, steps=1) {
      assert(simulationTime > simTime);  // Must be in the future.
      assert(steps >= 1);
      const diff = simulationTime - simTime;
      const interval = diff / steps;
      this.advanceSimulationBy(interval, steps);
    },

    /* Interval controls how often the simulation is updated.
     * (In real time, not simulation time.)
     */
    startSimulation(interval=500) {
      assert(!running);  // can only start once
      updateInterval = interval;
      running = true;
      loop();
    },

  };

  function stepBy(timeDiff) {
    simTime += timeDiff;
    doUpdate();
  }

  function doUpdate() {
    // TODO: add manager/plant production
    // TODO: should the manager simply be one of the prosumers??
    weather = weatherModel.currentWeather(simTime);
    const state = currentState();
    updatePowerPlant();
    marketDemand = getTotalNetDemand(state);
    let supply = -marketDemand;
    supply = satisfyDemand(supply);
  }

  function loop() {
    // Use inner function to prevent the first update from happening immediately.
    // It's unclear which is the most desirable behavior.
    function inner() {
      if (!running) {
        return;
      }
      stepBy(updateInterval * timeFactor);
      setTimeout(() => inner(), updateInterval);
    }
    setTimeout(() => inner(), updateInterval);
  }

  // FIXME: not complete
  // TODO: note: pooling all production into a big pot probably doesn't work.
  // After all, if the power plant uses its own power to charge its batteries,
  // it's not buying it from anyone.
  /* Return the net demand placed on the grid, summed over all prosumers. */
  function getTotalNetDemand(state) {
    let sum = 0;
    for (id in prosumers) {
      const prosumer = prosumers[id];
      prosumer.startUpdate(state);
      sum += prosumer.netDemand();
    }
    return sum;
  }

  // FIXME: not complete
  /* Distribute the supply among the prosumers that demand electricity. */
  function satisfyDemand(supply) {
    for (id in prosumers) {
      const prosumer = prosumers[id];
      const demand = prosumer.demandingFromGrid();
      if (demand > 0 && demand <= supply) {
        prosumer.buyFromGrid(demand);
        supply -= demand;
      }
      prosumer.finishUpdate();
    }
    return supply;
  }

  function updatePowerPlant() {
    powerPlant.setTime(simTime);
  }

  return obj;
};
