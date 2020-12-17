const model = require('../../model');

const sim = model.simulation;

// Note: Args are now in parent rather than args.
module.exports = {
  simulation: () => sim.currentState(),

  stopSimulation() {
    if (sim.isRunning()) {
      sim.stopSimulation();
    }
    return sim.currentState();
  },

  startSimulation({ interval, speed }) {
    if (!sim.isRunning()) {
      sim.startSimulation(interval, speed);
    }
    return sim.currentState();
  },

  advanceBy({ interval, steps }) {
    sim.advanceSimulationBy(interval, steps);
    return sim.currentState();
  },

  // XXX: Starting and stopping is a temporary implementation.
  setSimulationParameters({interval, speed}) {
    sim.stopSimulation();
    sim.startSimulation(interval, speed);
    return sim.currentState();
  },
}
