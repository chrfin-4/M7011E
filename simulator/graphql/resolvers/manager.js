const model = require('../../model');

const sim = model.simulation;

module.exports = {
  setProductionLevel: (_, { id, percent }) => {
    if (percent == 100) {
      return sim.prosumer(id).turnProductionOn().currentState();
    } else if (percent == 0) {
      return sim.prosumer(id).turnProductionOff().currentState();
    } else {
      return sim.prosumer(id).currentState();
    }
  },

  turnProductionOn: (_, { id }) => {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 100 });
  },

  turnProductionOff(_, {id}) {
    return resolvers.Mutation.setProductionLevel(null, { id, percent: 0 });
  },

  banProducer: (_, { id, duration }) => {
    return sim.prosumer(id).banFor(duration).currentState();
  },
}