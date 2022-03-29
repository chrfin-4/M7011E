// Os
const { join } = require('path');

const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { loadSchemaSync } = require("@graphql-tools/load");
const { addResolversToSchema } = require("@graphql-tools/schema");
const graphQlResolvers = require('./resolvers/index');

const graphQlSchema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [
    new GraphQLFileLoader(),
  ]
});

const localSchema = addResolversToSchema({
  schema: graphQlSchema,
  resolvers: graphQlResolvers
});

module.exports = localSchema;