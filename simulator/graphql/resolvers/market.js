const model = require('../../model');

const sim = model.simulation;

module.exports = {
  marketDemand: () => sim.currentMarketDemand(),
  currentPrice: () => sim.currentElectricityPrice(),
  modeledPrice: () => sim.modelledElectricityPrice(),
}
