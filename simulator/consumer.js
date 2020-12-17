const Prosumer = require('./prosumer.js').Prosumer;
const ConsumptionModel = require('./consumption.js').ConsumptionModel;

exports.Consumer = Consumer;

/* Inheritance *should* go the other way so that a prosumer is both a
 * consumer and a producer. But because that would require a lot of
 * refactoring, we're temporarily cheating by making a consumer be
 * a producer that always produces 0.
 *
 * Can be banned, which does not affect anything, since it doesn't want
 * to sell anything anyway.
 */
function Consumer({consumption=defaultConsumptionModel(), state}) {
  const model = {consumption, production: () => 0};
  const args = {batteryCapacity: 0, underproductionPolicy: () => 0};
  const prosumer = Prosumer(model, state, args);
  return prosumer;
}

function defaultConsumptionModel() {
  return ConsumptionModel({randomizeMissing:true});
}
