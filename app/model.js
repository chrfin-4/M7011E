const prosumer = require('./prosumer.js');
const Manager = require('./manager.js').Manager;
const Weather = require('./weather.js').Weather;
const Powerplant = require('./powerplant.js').Powerplant;
const util = require('./util.js');
const assert = util.assert;

exports.Prosumer = prosumer.Prosumer;
exports.prosumer = prosumer;
exports.Manager = Manager;
exports.ConsumptionModel = prosumer.ConsumptionModel; // Deprecated
exports.Sim = Sim;

/*
 * t0 sets the (real) start time.
 * The timeFactor controls how fast the clock ticks in the simulation.
 * timeFactor=1 => 1 second per second
 */
function Sim(prosumers, weatherModel=Weather(), t0=util.now(), timeFactor=1) {

  let running = false;
  let consumers;
  let manager = Manager();  // FIXME: either take as parameter or make sure to use appropriate args here
  let marketDemand;
  // FIXME: manager should probably have its own power plant?
  // Should also be a parameter.
  let powerPlant = Powerplant(1e9, 30_000);
  let blackout = false; // At least one home is not getting its demands met.

  let simTime = util.toMilliseconds(t0);
  let weather = weatherModel?.currentWeather(simTime);
  const electricityPrice = 23.50;  // FIXME: must get updated
  let updateInterval;
  let timeoutToken;

  function currentState() {
    return {
      date: new Date(simTime),
      weather: weatherModel.currentWeather(simTime),
      electricityPrice,
      marketDemand,
    };
  };

  const obj = {
    prosumer(id) {
      return prosumers[id];
    },
    // --- Model stuff. ---
    prosumerState(id) {
      return prosumers[id].currentState();
    },
    prosumerStates() {
      const arr = [];
      for (let id in prosumers) {
        state = prosumers[id].currentState();
        state.id = id;  // XXX: Prosumers should probably have their IDs.
        arr.push(state);
      }
      return arr;
    },
    setElectricityPrice(price) {
      electricityPrice = price;
      return this;
    },
    currentMarketDemand() { return marketDemand; },
    currentElectricityPrice() { return electricityPrice; },
    modelledElectricityPrice() { return electricityPrice; }, // FIXME: add pricing model
    currentWeather() { return weather; },
    // TODO: add more methods for simulating prosumer/manager actions
    // (like getting consumption/production for a specific user, setting
    // charge/sell ratios, etc.)

    // FIXME: should there be a special method for this? Get a manager by ID as
    // one of the prosumers?
    manager() { return manager; },

    // --- Simulator-specific stuff. ---

    simulationTime() { return simTime; },
    isRunning() { return running; },

  // FIXME: use clearTimeout when stopping
    stopSimulation() {
      assert(running);  // TODO: necessary/useful?
      running = false;
      clearTimeout(timeoutToken);
    },

    // Step forward in simulation time.
    advanceSimulationBy(interval, steps=1) {
      interval = Number(interval);
      steps = Number(steps);
      assert(!running);
      assert(interval > 0);
      for (let i = 0; i < steps; i++) {
        stepBy(interval);
      }
    },

    advanceSimulationTo(simulationTime, steps=1) {
      simulationTime = Number(simulationTime);
      steps = Number(steps);
      assert(simulationTime > simTime);  // Must be in the future.
      assert(steps >= 1);
      const diff = simulationTime - simTime;
      const interval = diff / steps;
      this.advanceSimulationBy(interval, steps);
    },

    /* The interval controls how often the simulation is updated.
     * (In real time, not simulation time.)
     * The timeFactor controls how fast the simulation clock ticks.
     */
    startSimulation(interval=500, speed=timeFactor) {
      assert(!running);  // can only start once
      updateInterval = interval;
      timeFactor = speed;
      running = true;
      loop();
    },

    currentState() {
      return {
        time: simTime,
        startTime: t0,
        duration: simTime - t0,
        prosumers: prosumers.length, // XXX: adding 1 for the manager??
      };
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
      timeoutToken = setTimeout(() => inner(), updateInterval);
    }
    timeoutToken = setTimeout(() => inner(), updateInterval);
  }

  // FIXME: not complete
  // TODO: note: pooling all production into a big pot probably doesn't work.
  // After all, if the power plant uses its own power to charge its batteries,
  // it's not buying it from anyone.
  // But if everyone buys and sells at the same price, does it matter?
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

  // XXX: this should happen when manager is updated
  function updatePowerPlant() {
    powerPlant.setTime(simTime);
  }

  return obj;
};
