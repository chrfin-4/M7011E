const { request, GraphQLClient } = require('graphql-request');
const { sim_endpoint } = require('../util/settings');

module.exports = new GraphQLClient(sim_endpoint, { headers: {} });