// Web
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const originalFetch = require('cross-fetch');
const fetch = require('fetch-retry')(originalFetch);

// Os
const glob = require("glob");
const path = require("path");

// GraphQL
const { ApolloServer } = require('apollo-server-express');
const { introspectSchema } = require('@graphql-tools/wrap');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { GraphQLUpload, graphqlUploadExpress } = require('graphql-upload');
const { GraphQLUpload: GatewayGraphQLUpload } = require('@graphql-tools/links');

// Db and store
const mongoose = require('mongoose');
const RedisStore = require('connect-redis')(session);

// Local includes
const makeRemoteExecutor = require('./graphql/makeRemoteExecutor');
const localSchema = require('./graphql/localSchema');
const { __prod__, COOKIE_NAME, PROD_DOMAIN_NAME, SIM_ENDPOINT, CORS_ORIGIN, CRYPT_KEY, MONGO_CONNECTION, SRV_PORT, UPLOADS_PATH } = require('./constants');
const { redis, batchDeletionKeysByPattern } = require('./redis');
const { assertIsSignedIn, assertIsAuth } = require('./util/asserts');


const makeGatewaySchema = async () => {
  // Make remote executors:
  // these are simple functions that query a remote GraphQL API for JSON.
  const simulationExecutor = makeRemoteExecutor(SIM_ENDPOINT)

  const gatewaySchema = stitchSchemas({
    subschemas: [
      {
        // 1. Introspect a remote schema. Simple, but there are caveats:
        // - Remote server must enable introspection.
        // - Custom directives are not included in introspection.
        schema: await introspectSchema(simulationExecutor),
        executor: simulationExecutor,
        batch: true,
      },
      {
        // 4. Incorporate a locally-executable subschema.
        // No need for a remote executor!
        // Note that that the gateway still proxies through
        // to this same underlying executable schema instance.
        schema: localSchema,
        batch: true,
      },
    ],
    resolvers: {
      Upload: GatewayGraphQLUpload,
    }
  });

  return gatewaySchema;
}

const main = async () => {
  console.log("Starting Exerge server.");

  // GraphQL
  const gatewaySchema = await makeGatewaySchema();
  const apolloServer = new ApolloServer({
    schema: gatewaySchema,
    context: ({ req, res}) => ({
      req,
      res,
      redis
    }),
    uploads: false
  });
  await apolloServer.start();


  // Express
  const app = express();
  app.set("trust proxy", 1);

  // Express middlewares
  app.use(
    cors({
      origin: CORS_ORIGIN,
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
        domain: __prod__ ? PROD_DOMAIN_NAME : undefined,
      },
      saveUninitialized: false,
      secret: CRYPT_KEY,
      resave: false,
    })
  );

  // Endpoints
  app.use('/profile/:id', (req, res, next) => {
    assertIsSignedIn(req);
    assertIsAuth(req);
    console.log(req.params);
    let files = glob.sync(path.join(UPLOADS_PATH, req.params.id + '_image.*'));
    if (files.length === 0) {
      res.sendStatus(404);
      return
    }
    console.log(files);
    res.sendFile(files[0]);
  })

  app.use('/profile', (req, res, next) => {
    assertIsSignedIn(req);
    console.log(req.session);
    let files = glob.sync(path.join(UPLOADS_PATH, req.session.userId + '_image.*'));
    if (files.length === 0) {
      res.sendStatus(404);
      return
    }
    console.log(files);
    res.sendFile(files[0]);
  });

  // Express Apollo middleware
  app.use(graphqlUploadExpress({
    maxFileSize: 10000000,
    maxFiles: 1,
  }));

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  // await new Promise(r => app.listen({ port: parseInt(process.env.SRV_PORT) }, r));
  // console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`);  

  // Start http server
  const server = http.createServer(app);
  
  // Socket io
  const io = socketIo(server, {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    }
  });

  io.sockets.on('connection', (socket) => {
    socket.on('active', userId => {
      console.log('active: ' + userId);
      socket.userId = userId;
      const res = redis.set('active:' + socket.id + ':' + userId, "1");
      if (res) res.then(console.log).catch(console.error);
    });

    socket.on('inactive', userId => {
      console.log('inactive: ' + socket.id);
      batchDeletionKeysByPattern('active:' + socket.id + ':*')
    })

    socket.on('disconnect', userId => {
      console.log('disconnect: ' + socket.id);
      batchDeletionKeysByPattern('active:' + socket.id + ':*')
    });
  });

  // ==== Start server ====

  mongoose.connect(MONGO_CONNECTION, {useNewUrlParser: true})
    .then(() => {
      server.listen(parseInt(SRV_PORT));
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