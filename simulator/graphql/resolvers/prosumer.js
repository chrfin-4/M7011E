const model = require('../../model');

const sim = model.simulation;

// Note: Args are now in parent rather than args.
module.exports = {
  prosumerStates: () => sim.prosumerStates(),
  prosumerState: ({ id }) => sim.prosumerState(id),
  setChargeRatio: ({ id, ratio }) => {
    try {
      return sim.prosumer(id).setChargeRatio(ratio).currentState();
    } catch (e) {
      return sim.prosumer(id).currentState();  // Return unchanged.
    }
  },
  setDischargeRatio: ({ id, ratio }) => {
    try {
      return sim.prosumer(id).setDischargeRatio(ratio).currentState();
    } catch (e) {
      return sim.prosumer(id).currentState();  // Return unchanged.
    }
  },
}
