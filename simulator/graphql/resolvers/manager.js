const model = require('../../model');

const sim = model.simulation;

// Note: Args are now in parent rather than args.
module.exports = {
  setProductionLevel: ({ id, percent }) => {
    if (percent == 100) {
      return sim.prosumer(id).turnProductionOn().currentState();
    } else if (percent == 0) {
      return sim.prosumer(id).turnProductionOff().currentState();
    } else {
      return sim.prosumer(id).currentState();
    }
  },

  turnProductionOn: ({ id }) => {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 100 });
  },

  turnProductionOff({ id }) {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 0 });
  },

  banProducer: ({ id, duration }) => {
    return sim.prosumer(id).banFor(duration).currentState();
  },
}
