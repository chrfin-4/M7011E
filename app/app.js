const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { loadSchemaSync, addResolversToSchema, GraphQLFileLoader, introspectSchema, makeExecutableSchema, stitchSchemas, getSubschema } = require('graphql-tools');
const graphQlResolvers = require('./graphql/resolvers/index');
const mongoose = require('mongoose');
const { join } = require('path');
const { fetch } = require('cross-fetch');
const { print } = require('graphql');

const app = express();

const port = 8080;

async function setup() {
  // Load schema from the file
  const graphQlSchema = loadSchemaSync(join(__dirname, './graphql/schema.graphql'), {
    loaders: [
      new GraphQLFileLoader(),
    ]
  });


  let localSchema = addResolversToSchema({
    schema: graphQlSchema,
    resolvers: graphQlResolvers
  });

  async function simExecutor({ document, variables }) {
    const query = print(document);
    const fetchResult = await fetch(process.env.SIM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json();
  }

  const simSubschema = {
    schema: await introspectSchema(simExecutor),
    executor: simExecutor,
    // subscriber: remoteSubscriber
  };

  const localSubschema = { schema: localSchema };

  const gatewaySchema = stitchSchemas({
    subschemas: [
      localSubschema,
      simSubschema,
    ]
  });

  app.use(bodyParser.json());

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: gatewaySchema,
      graphiql: true
    })
  );

  // ==== Start server ====

  mongoose.connect(
    `${process.env.MONGO_CONNECTION}`
  )
    .then(() => {
      app.listen(port);
    })
    .catch(err => {
      console.log(err);
    });
}

setup();