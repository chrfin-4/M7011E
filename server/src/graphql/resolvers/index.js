const userResolver = require('./user');
const authResolver = require('./auth');

const rootResolver = {
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
