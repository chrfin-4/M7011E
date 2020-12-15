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
      modeledPrice: () => sim.modelledElectricityPrice(),
      simulation: () => sim.currentState(),
    },

    Mutation: {
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

      setProductionLevel(_, {id, percent}) {
        if (percent == 100) {
          return sim.prosumer(id).turnProductionOn().currentState();
        } else if (percent == 0) {
          return sim.prosumer(id).turnProductionOff().currentState();
        } else {
          return sim.prosumer(id).currentState();
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
