const model = require('../../model');

const sim = model.simulation;

module.exports = {
  weather: () => sim.currentWeather(),
}
