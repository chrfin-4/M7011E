//const marketResolver = require('./market');
//const weatherResolver = require('./weather');
//const managerResolver = require('./manager');
//const prosumerResolver = require('./prosumer');
//const simulationResolver = require('./simulation');
const userResolver = require('./user');

const rootResolver = {
  ...userResolver
  //...marketResolver,
  //...weatherResolver,
  //...managerResolver,
  //...prosumerResolver,
  //...simulationResolver
};

module.exports = rootResolver;