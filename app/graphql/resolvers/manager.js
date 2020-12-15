const model = require('../../model');

const sim = model.simulation;

module.exports = {
  // XXX: takes and ID even though there currently only exists one manager.
  // Should work with any prosumer in the future, and then ID is required.
  setProductionLevel: (_, { id, percent }) => {
    const manager = sim.manager(); // TODO: should be prosumer
    if (percent == 100) {
      return manager.turnProductionOn().currentState();
    } else if (percent == 0) {
      return manager.turnProductionOff().currentState();
    } else {
      return manager.currentState();
    }
  },

  turnProductionOn: (_, { id }) => {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 100 });
  },

  turnProductionOff: (_, args) => {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 0 });
  },

  banProducer: (_, { id, duration }) => {
    return sim.prosumer(id).banFor(duration).currentState();
  },
}