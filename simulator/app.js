const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { loadSchemaSync, GraphQLFileLoader } = require('graphql-tools');
const graphQlResolvers = require('./graphql/resolvers/index')
const mongoose = require('mongoose');
const model = require('./model.js');
const { join } = require('path');

const main = async () => {
  const app = express();

  const port = process.env.SIM_PORT;

  // --- Initialize the simulation ---
  model.simulation.startSimulation(1000);  // update each second

  // Load schema from the file
  const graphQlSchema = loadSchemaSync(join(__dirname, './graphql/schema.graphql'), {
    loaders: [
      new GraphQLFileLoader(),
    ]
  });

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: graphQlSchema,
      rootValue: graphQlResolvers,
      graphiql: true
    })
  );

  // ==== Start server ====

  mongoose.connect(process.env.MONGO_CONNECTION, {useNewUrlParser: true})
  .then(() => {
    app.listen(port);
  })
  .catch(err => {
    console.log(err);
  });
};

main().catch((err) => {
  console.log(err);
});


