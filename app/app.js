const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { loadSchemaSync, addResolversToSchema, GraphQLFileLoader } = require('graphql-tools');
const graphQlResolvers = require('./graphql/resolvers/index')
const mongoose = require('mongoose');
const model = require('./model.js');
const api = require('./api.js');
const { join } = require('path');

const app = express();

const port = 8080;

// --- Initialize the simulation ---

model.simulation.startSimulation(1000);  // update each second

// Load schema from the file
const graphQlSchema = loadSchemaSync(join(__dirname, './graphql/schema.graphql'), {
  loaders: [
    new GraphQLFileLoader(),
  ]
});

// Add resolvers to the schema
/*
const schemaWithResolvers = addResolversToSchema({
    graphQlSchema,
    graphQlResolvers,
});
*/

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

// ==== Start server ====

mongoose.connect(
  `${process.env.MONGO_CONNECTION}`
  /*
  `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD
  }@cluster0.zaaoj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  */
)
.then(() => {
  app.listen(port);
})
.catch(err => {
  console.log(err);
});
