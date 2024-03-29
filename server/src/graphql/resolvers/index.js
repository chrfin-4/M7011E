// const { GraphQLUpload } = require('graphql-upload');
const { GraphQLUpload } = require("@graphql-tools/links");

const userResolver = require('./user');
const authResolver = require('./auth');

const rootResolver = {
  Upload: GraphQLUpload,
  Query: {
    ...userResolver.Query,
    ...authResolver.Query,
  },
  Mutation: {
    ...userResolver.Mutation,
    ...authResolver.Mutation,
  },
};

module.exports = rootResolver;
