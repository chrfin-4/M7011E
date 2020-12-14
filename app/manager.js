const util = require('./util.js');
const Battery = require('./battery.js').Battery;
const Powerplant = require('./powerplant.js').Powerplant;
const rng = util.normalDistribution();
const assert = util.assert;
const getArgOrDefault = util.getArgOrDefault;

exports.Manager = Manager;
exports.nopController = nopController;
exports.defaultController = defaultController;

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
  if (manager.productionIsOn() || manager.productionIsTurningOn()) {
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
  return (capacity < demand * safetyFactor) ? ON : OFF;
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
  let production = 0; // TODO: make depend on initial state (plant on/off)
  let currentWastedProduction = 0;
  let currentUnderProduction = 0;
  let totalWastedProduction = 0;
  let totalUnderProduction = 0;
  // These are set from the outside by state updates.
  let demand = 0;
  let currentTime = state.date.getTime(); // current time in ms
  let timeDiff = 0;
  // These can be manually/explicitly set from the outside.
  // TODO: extract from model like this or use model.controller(...) ???
  let controller = getArgOrDefault(model, 'controller', () => defaultController);
  let desiredState = undefined;

  const obj = {
    // --- Manager specific (not in prosumer/client) ---
    currentPrice() { return currentPrice; },

    // --- Common to all prosumers ---

    currentPowerProduction() { return plant.currentPowerProduction(); },
    // FIXME: how is the power consumption determined?
    currentPowerConsumption() { return 0; },
    productionTransitionDelay() { return plant.transitionDelay(); },
    batteryCharge() { return battery.currentCharge(); },
    batteryChargePercent() { return battery.currentChargePercent(); },
    batteryCapacity() { return battery.capacity(); },

    productionStatus() { return productionStatus; },  // TODO: Deprecated
    powerFailure() { return currentUnderProduction > 0; },  // XXX
    nextPlantTransition() { return plant.transitionPoint(); },  // TODO: Deprecated
    currentPowerDemand() { return demand; },  // XXX

    productionIsTurningOn() { return plant.isTurningOn(); },
    productionIsTurningOff() { return plant.isTurningOff(); },
    productionIsOn() { return plant.isOn(); },
    productionIsOff() { return plant.isOff(); },

    /* How much electricity (Ws) the prosumer wants to sell.
     * Always non-negative.
     */
    offeringToGrid() {
      return this.currentPowerConsumption() * timeDiff;
    },

    /* How much electricity (Ws) the prosumer wants to buy.
     * Always non-negative.
     */
    demandingFromGrid() {
      return Math.max(0, this.netDemand());
    },

    /* Receive this much electricity (Ws) FROM the prosumer. */
    sellToGrid(Ws) {
      assert(updating);
      assert(Ws >= 0);      // Must always be positive.
      assert(netDemand <= 0);  // Can only sell something if surplus.
      assert((sold + Ws) <= -netDemand); // Cannot sell more than offered.
      assert(!this.isBanned()); // Cannot sell if banned.
      netDemand += Ws;
      totalSold += Ws;
      sold += Ws;
    },

    setProductionController(f) {
      controller = f;
      return this;
    },

    turnProductionOn() {
      plant.turnOn();
      return this;
    },

    turnProductionOff() {
      plant.turnOff();
      return this;
    },

    // FIXME: no, it does not
    // TODO: does this even belong here? Or rather place in the simulation outside?
    // TODO: set immediately or remember until next update?
    setPrice(price) {
      currentPrice = price;
      return this;
    },

    updateState(state) {
      setClock(state.date);
      const demand = state.demand;
      plant.setTime(currentTime);
      updateBalance(timeDiff, demand);
      // Update production status last.
      updateProductionState();
      enforceInvariants();
      return this;
    },

    currentState() {
      const manager = this;
      return {
        powerConsumption: manager.currentPowerConsumption(),
        powerProduction: manager.currentPowerProduction(),
        battery: {
          charge: battery.currentCharge(),
          capacity: battery.capacity(),
        },
        // TODO: try to capture transition here??
        // Or add an extra field for that?
        productionStatus: (manager.productionIsOn() ? 100 : 0),
      };
    }

  };

  function setClock(time) {
    time = util.toMilliseconds(time);
    if (currentTime === undefined) {
      currentTime = time;
    }
    assert(time >= currentTime);
    timeDiff = time - currentTime;
    currentTime = time;
  }

  function updateProductionState() {
    // Explicitly set state overrides controller.
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

  // FIXME: this needs to happen at the end of update, after buying/selling

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
