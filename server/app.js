const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlHTTP } = require('express-graphql');
const { loadSchemaSync, addResolversToSchema, GraphQLFileLoader, introspectSchema, stitchSchemas, } = require('graphql-tools');
const bodyParser = require('body-parser');
const { join } = require('path');
const { fetch } = require('cross-fetch');
const { print } = require('graphql');
const mongoose = require('mongoose');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

const port = 8080;

const main = async () => {
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
      headers: { 
        'Content-Type': 'application/json'
      },
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

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  app.use(isAuth);

  const apolloServer = await new ApolloServer({
    schema: gatewaySchema
  });

  apolloServer.applyMiddleware({ app });

  /*
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: gatewaySchema,
      graphiql: {
        headerEditorEnabled: true
      }
    })
  );
  */

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

main().catch((err) => {
  console.log(err);
});