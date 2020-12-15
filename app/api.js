const path = require('path');
const fs = require('fs');
const { ApolloServer } = require('apollo-server');

exports.getApi = getApi;

function getApi(sim) {
  return new ApolloServer({
    typeDefs: getTypeDefs(),
    resolvers: getResolvers(sim),
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
  });
}

function getTypeDefs() {
  return fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');
}

function getResolvers(sim) {
  const resolvers = {

    Query: {
      prosumerStates: () => sim.prosumerStates(),
      prosumerState: (_, args) => sim.prosumerState(args.id),
      weather: () => sim.currentWeather(),
      marketDemand: () => sim.currentMarketDemand(),
      currentPrice: () => sim.currentElectricityPrice(),
      modelledPrice: () => sim.modelledElectricityPrice(),
      simulation: () => sim.currentState(),
    },

    Mutation: {
      // XXX: Setting charge/discharge ratio currently only works with
      // prosumers. Should eventually be extended to also work on the
      // manager(s).
      setChargeRatio(_, {id, ratio}) {
        try {
          return sim.prosumer(id).setChargeRatio(ratio).currentState();
        } catch (e) {
          return sim.prosumer(id).currentState();  // Return unchanged.
        }
      },

      setDischargeRatio(_, {id, ratio}) {
        try {
          return sim.prosumer(id).setDischargeRatio(ratio).currentState();
        } catch (e) {
          return sim.prosumer(id).currentState();  // Return unchanged.
        }
      },

      // XXX: takes and ID even though there currently only exists one manager.
      // Should work with any prosumer in the future, and then ID is required.
      setProductionLevel(_, {id, percent}) {
        const manager = sim.manager(); // TODO: should be prosumer
        if (percent == 100) {
          return manager.turnProductionOn().currentState();
        } else if (percent == 0) {
          return manager.turnProductionOff().currentState();
        } else {
          return manager.currentState();
        }
      },

      turnProductionOn(_, {id}) {
        return resolvers.Mutation.setProductionLevel(null, {id, percent: 100});
      },

      turnProductionOff(_, args) {
        return resolvers.Mutation.setProductionLevel(null, {id, percent: 0});
      },

      banProducer(_, {id, duration}) {
        return sim.prosumer(id).banFor(duration).currentState();
      },


      // --- Simulation ---

      stopSimulation() {
        if (sim.isRunning()) {
          sim.stopSimulation();
        }
        return sim.currentState();
      },

      startSimulation(_, {interval, speed}) {
        if (!sim.isRunning()) {
          sim.startSimulation(interval, speed);
        }
        return sim.currentState();
      },

      advanceBy(_, {interval, steps}) {
        sim.advanceSimulationBy(interval, steps);
        return sim.currentState();
      },
    },

  };

  return resolvers;
}
