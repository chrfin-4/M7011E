// Web
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const originalFetch = require('cross-fetch');
const fetch = require('fetch-retry')(originalFetch)

// GraphQL
const { ApolloServer } = require('apollo-server-express');
const { addResolversToSchema, } = require('@graphql-tools/schema');
const { loadSchemaSync } = require('@graphql-tools/load')
const { introspectSchema } = require('@graphql-tools/wrap')
const { stitchSchemas } = require('@graphql-tools/stitch')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const { graphqlUploadExpress } = require('graphql-upload');
const { print } = require('graphql');

// Os
const { join } = require('path');

// Db and store
const mongoose = require('mongoose');
const { createClient } = require('redis');
const connectRedis = require('connect-redis');

// Local includes
const graphQlResolvers = require('./graphql/resolvers/index');
const { __prod__, COOKIE_NAME } = require('./constants');


const main = async () => {
  console.log("Starting Exerge server.");
  const app = express();

  const RedisStore = connectRedis(session);
  const redis = createClient({
    url: process.env.REDIS_URL,
  });
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

  // Start http server
  server = http.createServer(app);

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

  async function simExecutor({ document, variables, context }) {
    if (context) {
      if (!context?.res.req.session.userId) {
        throw new Error('Unauthorized');
      }
    }
    const query = print(document);
    const fetchResult = await fetch(process.env.SIM_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables }),
      retryDelay: 1000,
      retries: 5
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
    uploads: false,
    context: ({ req, res}) => ({
      req,
      res,
      redis
    }),
  });

  await apolloServer.start();

  app.use(graphqlUploadExpress({
    maxFileSize: 10000000,
    maxFiles: 1,
  }));

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  // Socket io
  io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }
  });

  io.sockets.on('connection', (socket) => {
    socket.on('active', userId => {
      socket.userId = userId;
      redis.set('active:' + userId, "1");
    });

    socket.on('inactive', data => {
      redis.del('active:' + socket.userId);
    })

    socket.on('disconnect', data => {
      redis.del('active:' + socket.userId);
    });
  });

  // ==== Start server ====

  mongoose.connect(process.env.MONGO_CONNECTION, {useNewUrlParser: true})
    .then(() => {
      server.listen(parseInt(process.env.SRV_PORT));
    })
    .catch(err => {
      console.log(err);
    });
}

main()
  .then(() => {
    console.log("Finished starting Exerge server.");
  })
  .catch((err) => {
    console.log(err);
  });