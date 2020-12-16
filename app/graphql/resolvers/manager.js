const { gql } = require('graphql-request');
const client = require('../client');

module.exports = {
  // XXX: takes and ID even though there currently only exists one manager.
  // Should work with any prosumer in the future, and then ID is required.
  setProductionLevel: (_, { id, percent }) => {
    console.log(id);
    const query = gql`
      mutation {
        setProductionLevel(id: ID!, percent: Int!) {
          battery {
            charge
            capacity
          }
        }
      }
    `
    const variables = {
      id: id,
      percent: percent
    }

    const data = client.request(query, variables);
    console.log(data);
    return data;
  },

  turnProductionOn: (_, { id }) => {
  },

  turnProductionOff: (_, args) => {
  },

  banProducer: (_, { id, duration }) => {
  },
}