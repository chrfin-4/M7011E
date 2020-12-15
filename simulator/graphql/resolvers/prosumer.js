const model = require('../../model');

const sim = model.simulation;

module.exports = {
  prosumerStates: () => sim.prosumerStates(),
  prosumerState: (_, args) => sim.prosumerState(args.id),
  setChargeRatio: (_, { id, ratio }) => {
    try {
      return sim.prosumer(id).setChargeRatio(ratio).currentState();
    } catch (e) {
      return sim.prosumer(id).currentState();  // Return unchanged.
    }
  },
  setDischargeRatio: (_, { id, ratio }) => {
    try {
      return sim.prosumer(id).setDischargeRatio(ratio).currentState();
    } catch (e) {
      return sim.prosumer(id).currentState();  // Return unchanged.
    }
  },
}