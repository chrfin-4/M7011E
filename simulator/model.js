const prosumer = require('./prosumer.js');
const Manager = require('./manager.js').Manager;
const Weather = require('./weather.js').Weather;
const Powerplant = require('./powerplant.js').Powerplant;
const Consumer = require('./consumer.js').Consumer;
const util = require('./util.js');
const assert = util.assert;

const model = require('./model.js');

exports.Prosumer = prosumer.Prosumer;
exports.prosumer = prosumer;
exports.Manager = Manager;
exports.ConsumptionModel = prosumer.ConsumptionModel; // Deprecated
exports.Sim = Sim;

// TODO: Change this when we leave test-stage
exports.simulation = Sim(makeProsumers());

function makeProsumers(count=50) {
  let prosumers = {};
  for (let i = 0; i < count; i++) {
    prosumers[i] = model.Prosumer().setId(i);
  }
  for (let i = count; i < count*3; i++) {
    prosumers[i] = Consumer({}).setId(i);
  }
  return prosumers;
}

/*
 * t0 sets the (real) start time.
 * The timeFactor controls how fast the clock ticks in the simulation.
 * timeFactor=1 => 1 second per second
 */
function Sim(prosumers, weatherModel=Weather({randomize: true}), t0=util.now(), timeFactor=1) {

  let running = false;
  let consumers;
  let manager = Manager();  // FIXME: either take as parameter or make sure to use appropriate args here
  let marketDemand;
  let blackout = false; // At least one home is not getting its demands met.

  let simTime = util.toMilliseconds(t0);
  let weather = weatherModel?.currentWeather(simTime);
  const electricityPrice = 23.50;  // FIXME: must get updated
  let updateInterval;
  let timeoutToken;
  const prosumerLocations = generateProsumerPositions(prosumers);

  // TODO: find a better name?
  function currentGlobalState() {
    return {
      date: new Date(simTime),
      weather: weatherModel.currentWeather(simTime),
      electricityPrice,
      marketDemand,
    };
  };

  const obj = {
    prosumer(id) {
      if (id == -1) {
        return manager;
      }
      return prosumers[id];
    },
    // --- Model stuff. ---
    prosumerState(id) {
      return this.prosumer(id).currentState();
    },
    prosumerStates() {
      const arr = [];
      for (let id in prosumers) {
        state = prosumers[id].currentState();
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
    simulationSpeed() { return timeFactor; },
    updateInterval() { return updateInterval; },
    blackout() { return blackout; },

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
        updateInterval,
        speed: timeFactor,
        running,
        prosumers: prosumers.length, // XXX: adding 1 for the manager??
        blackout,
      };
    },

  };

  function stepBy(timeDiff) {
    simTime += timeDiff;
    doUpdate();
  }

  function doUpdate() {
    // TODO: should the manager simply be one of the prosumers??
    const state = currentGlobalState();
    const { supply, demand } = getTotalSupplyAndDemand(state);
    marketDemand = demand - supply;
    manager.startUpdate({ ...state, demand: marketDemand });
    const managerSupply = manager.offeringToGrid();
    const { bought, sold } = performExchange(supply+managerSupply, demand);
    manager.finishUpdate();
    updateBlackout();
    assert(bought >= 0);
    assert(sold >= 0);
    assert(Math.round(bought) == Math.round(sold));
  }

  function updateBlackout() {
    blackout = false;
    for (id in prosumers) {
      if (prosumers[id].isBlackedOut()) {
        blackout = true;
        break;
      }
    }
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

  function getTotalSupplyAndDemand(state) {
    let supply = 0;
    let demand = 0;
    for (let id in prosumers) {
      const prosumer = prosumers[id];
      prosumer.startUpdate({...state, weather: localProsumerWeather(id)});
      if (!prosumer.isBanned()) {
        supply += prosumer.offeringToGrid();
      }
      demand += prosumer.demandingFromGrid();
    }
    return {supply, demand};
  }

  function performExchange(supply, demand) {
    let sold = 0;
    let bought = 0;
    for (id in prosumers) {
      const prosumer = prosumers[id];
      // Sell to consumers.
      if (demand > 0) {
        const demanding = prosumer.demandingFromGrid();
        if (supply > 0 && demanding > 0) {
          const fractionOfTotalDemand = demanding / demand;
          const sell = Math.min(demanding, fractionOfTotalDemand * supply);
          prosumer.buyFromGrid(sell);
          sold += sell;
        }
      }
      // Buy from producers.
      if (supply > 0) {
        const offering = prosumer.offeringToGrid();
        const fractionOfTotalSupply = offering / supply;
        const buy = Math.min(offering, fractionOfTotalSupply * demand);
        if (demand > 0 && offering > 0) {
          if (!prosumer.isBanned()) {
            prosumer.sellToGrid(buy);
            bought += buy;
          }
        }
      }
      prosumer.finishUpdate();
    }
    // Do (almost) the same with the manager.
    const offering = manager.offeringToGrid();
    const fractionOfTotalSupply = offering / supply;
    const buy = Math.min(offering, fractionOfTotalSupply * demand);
    if (buy > 0) {
      manager.sellToGrid(buy);
      bought += buy;
    }
    return { bought, sold };
  }

  function localProsumerWeather(id) {
    const gps = prosumerLocations[id];
    return weatherModel.currentWeather(simTime, gps);
  }

  return obj;
};

function generateProsumerPositions(prosumers) {
  const rng = util.normalDistribution();
  const positions = {};
  for (let id in prosumers) {
    const gps = { lat: 65 + rng(-1, 1), lon: 22 + rng(-1, 1) };
    positions[id] = gps;
  }
  return positions;
}
