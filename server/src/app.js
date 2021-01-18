const { __prod__, COOKIE_NAME } = require('./constants');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { graphqlHTTP } = require('express-graphql');
const { loadSchemaSync, addResolversToSchema, GraphQLFileLoader, introspectSchema, stitchSchemas, } = require('graphql-tools');
const bodyParser = require('body-parser');
const { join } = require('path');
const { fetch } = require('cross-fetch');
const { print } = require('graphql');
const cors = require('cors');
const mongoose = require('mongoose');
const graphQlResolvers = require('./graphql/resolvers/index');
const { RedisClient} = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');


const main = async () => {
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new RedisClient(process.env.REDIS_URL);
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? "exerge.akerstrom.dev" : undefined,
      },
      saveUninitialized: false,
      secret: process.env.CRYPT_KEY,
      resave: false,
    })
  );

  /*
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
  */
  
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

  const apolloServer = new ApolloServer({
    schema: gatewaySchema,
    context: ({ req, res}) => ({
      req,
      res,
      redis
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  // ==== Start server ====

  mongoose.connect(process.env.MONGO_CONNECTION, {useNewUrlParser: true})
    .then(() => {
      app.listen(parseInt(process.env.SRV_PORT));
    })
    .catch(err => {
      console.log(err);
    });
}

main().catch((err) => {
  console.log(err);
});