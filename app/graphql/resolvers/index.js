const userResolver = require('./user');
const authResolver = require('./auth');

const rootResolver = {
  ...userResolver,
  ...authResolver
};

module.exports = rootResolver;