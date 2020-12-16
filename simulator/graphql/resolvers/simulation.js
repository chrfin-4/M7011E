const model = require('../../model');

const sim = model.simulation;

module.exports = {
  simulation: () => sim.currentState(),

  stopSimulation() {
    if (sim.isRunning()) {
      sim.stopSimulation();
    }
    return sim.currentState();
  },

  startSimulation(_, { interval, speed }) {
    if (!sim.isRunning()) {
      sim.startSimulation(interval, speed);
    }
    return sim.currentState();
  },

  advanceBy(_, { interval, steps }) {
    sim.advanceSimulationBy(interval, steps);
    return sim.currentState();
  },

  // XXX: Starting and stopping is a temporary implementation.
  setSimulationParameters(_, {interval, speed}) {
    sim.stopSimulation();
    sim.startSimulation(interval, speed);
    return sim.currentState();
  },
}
