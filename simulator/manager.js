const util = require('./util.js');
const Battery = require('./battery.js').Battery;
const Powerplant = require('./powerplant.js').Powerplant;
const rng = util.normalDistribution();
const assert = util.assert;
const getArgOrDefault = util.getArgOrDefault;

exports.Manager = Manager;
exports.nopController = nopController;
exports.defaultController = defaultController;

// TODO: this is garbage. Needs lots of cleanup.

// TODO: what is a reasonable power generation capacity for a coal plant?

// FIXME: Should not be (completely) random.
// Should at least take demand into account.
function pricingModel() {
  return 0.20 + rng(0, 10);
}

const ON = 1;
const OFF = 0;

// Simply set the desired state to the current state.
function nopController(manager) {
  if (manager.plantIsOn() || manager.plantIsTurningOn()) {
    return ON;
  } else {
    return OFF;
  }
}

// TODO: take an optional safetyFactor and return a controller function?
function defaultController(manager, safetyFactor=5) {
  const charge = manager.batteryCharge();
  const delay = manager.productionTransitionDelay();
  const demand = manager.currentPowerDemand();
  const capacity = (charge / 3600) * delay;
  // Turn on if battery cannot cover the demand.
  return (capacity < demand * safetyFactor) ? PLANT_ON : PLANT_OFF;
}

// TODO: Needs a pricing model.
/*
 * 270,000 Wh corresponds to 20 Powerwalls.
 * Expected args:
 * battery=0, batteryCapacity=270000, productionCap=1e9, powerBought=0,
 * powerSold=0, transitionDelay = 30,000, plantInitiallyOn=false, controller=controller
 */
function Manager(model, state=getDefaultState(), args) {


  const transitionDelay = 30*1000; // 30 seconds
  const productionCap = getArgOrDefault(args, 'productionCapacity', () => 1e9); // 1 TW
  const batteryCap = getArgOrDefault(args, 'batteryCapacity', () => 270_000); // Wh
  let batteryCharge = getArgOrDefault(args, 'battery', () => 0);

  // FIXME: take as parameters?
  const battery = Battery(batteryCap, batteryCharge);
  const plant = Powerplant(productionCap, 30_000);

  let currentPrice = 0.25;
  //let productionStatus = false; // TODO: on/off or 0-100 % ???
  let production = 0; // TODO: make depend on initial state (plant on/off)
  //let batteryCharge = 0;
  let currentWastedProduction = 0;
  let currentUnderProduction = 0;
  let totalWastedProduction = 0;
  let totalUnderProduction = 0;
  // These are set from the outside by state updates.
  let demand = 0;
  let time = state.date.getTime(); // current time in ms
  // These can be manually/explicitly set from the outside.
  // TODO: extract from model like this or use model.controller(...) ???
  let controller = getArgOrDefault(model, 'controller', () => defaultController);
  let desiredState = undefined;

  const obj = {
    currentPrice() { return currentPrice; },
    currentPowerProduction() { return plant.currentPowerProduction(); },
    productionStatus() { return productionStatus; },  // TODO: Deprecated
    powerFailure() { return currentUnderProduction > 0; },  // XXX
    productionTransitionDelay() { return plant.transitionDelay(); },
    currentPowerDemand() { return demand; },  // XXX
    batteryCharge() { return battery.currentCharge(); },
    batteryCapacity() { return battery.capacity(); },

    nextPlantTransition() { return plant.transitionPoint(); },  // TODO: Deprecated
    plantIsTurningOn() { return plant.isTurningOn(); },
    plantIsTurningOff() { return plant.isTurningOff(); },
    plantIsOn() { return plant.isOn(); },
    plantIsOff() { return plant.isOff(); },
    setPlantController(f) {
      controller = f;
      return this;
    },

    turnPlantOn() {
      plant.turnOn();
      return this;
    },

    turnPlantOff() {
      plant.turnOff();
      return this;
    },

    // TODO: set immediately or remember until next update?
    setPrice(price) {
      currentPrice = price;
      return this;
    },

    // TODO: call updateState at instantiation time?
    // That makes sure everything is initialized the way it is on every
    // update. However, a duration of 0 could cause problems?
    updateState(state) {
      const now = state.date.getTime()
      const duration = now - time;
      time = now;
      const demand = state.demand;
      plant.setTime(time);
      updateBalance(duration, demand);
      // Update production status last.
      updateProductionState();
      enforceInvariants();
      return this;
    },
  };

  function updateProductionState() {
    // Explicitly state set overrides controller.
    if (desiredState === undefined) {
      // Only consult controller if nothing set.
      desiredState = controller(obj);
      if (desiredState == ON) {
        plant.turnOn();
      } else {
        plant.turnOff();
      }
    }
  }

  // Updates battery charge and (current and total) wasted/under production.
  function updateBalance(duration, demand) {
    const h = duration/(3600*1000); // convert ms to h
    const producedWh = production * h;
    const demandWh = demand * h;
    const surplus = producedWh - demandWh;
    const chargeCap = batteryCap - batteryCharge;
    if (surplus < 0) {
      const deficit = -surplus;
      currentUnderProduction = forceNonNegative(deficit - batteryCharge);
      currentWastedProduction = 0;
    } else if (surplus > 0) {
      currentWastedProduction = forceNonNegative(surplus - chargeCap);
      currentUnderProduction = 0;
    } else {
      currentWastedProduction = 0;
      currentUnderProduction = 0;
    }
    totalWastedProduction += currentWastedProduction;
    totalUnderProduction += currentUnderProduction;
    batteryCharge += surplus;
    batteryCharge = util.forceBetween(batteryCharge, 0, batteryCap);
  }

  return obj.updateState(state);

  function enforceInvariants() {
    // TODO
  }

};

function isNaN(n) {
  return typeof(n) == 'number' && !(n >= 0 || n <= 0);
}

function plantStateToString(state) {
  if (state == PLANT_ON) {
    return 'PLANT_ON';
  } else if (state == PLANT_OFF) {
    return 'PLANT_OFF';
  } else if (state == PLANT_TURNING_ON) {
    return 'PLANT_TURNING_ON';
  } else if (state == PLANT_TURNING_OFF) {
    return 'PLANT_TURNING_OFF';
  }
  return undefined;
}

function ManagerModel() {
  return {
    pricingModel: undefined,      // determines current price
    productionModel: undefined,   // determines production level
  };
}

function getDefaultModel() {
  return {
    controller: defaultController,
  };
}

function getDefaultState() {
  return {
    date: new Date(), // now
    demand: 123,      // current total electricity demand
  };
}

function forceNonNegative(val) {
  return util.forceAtLeast(val, 0);
}
