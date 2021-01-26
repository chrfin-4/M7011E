const util = require('./util.js');
const Battery = require('./battery.js').Battery;
const Powerplant = require('./powerplant.js').Powerplant;
const pricing = require('./pricing.js');
const rng = util.normalDistribution();
const assert = util.assert;
const getArgOrDefault = util.getArgOrDefault;

exports.Manager = Manager;
exports.nopController = nopController;
exports.defaultController = defaultController;
exports.defaultPricingModel = defaultPricingModel();

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

function defaultPricingModel() {
  const initialPrice = 23.5;
  const slope = 1/1000;
  const maxPrice = 100;
  const minPrice = 5;
  //return pricing.LinearPricingModel({initialPrice, slope, maxPrice, minPrice});
  return pricing.ConstantPricingModel({initialPrice});
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

  let currentProduction = 0; // TODO: make depend on initial state (plant on/off)
  let offering = 0;
  // These are set from the outside by state updates.
  let marketDemand = 0;
  let currentTime = state.date.getTime(); // current time in ms
  let timeDiff = 0;
  // These can be manually/explicitly set from the outside.
  // TODO: extract from model like this or use model.controller(...) ???
  let controller = getArgOrDefault(model, 'controller', () => defaultController);
  let pricingModel = getArgOrDefault(model, 'pricingModel', () => defaultPricingModel());
  let desiredState = undefined;
  let chargeRatio = 0.5;
  let id = -1;
  let sold = 0; // Do we also want a "bought"? Can managers buy?

  const obj = {

    // FIXME: deprecated. ID should almost certainly be set at instantiation time.
    setId(newID) {
      id = newID;
      return this;
    },

    // --- Manager specific (not in prosumer/client) ---
    currentPrice() {
      return pricingModel(marketDemand);
    },
    setPrice(price) {
      pricingModel = pricing.ConstantPricingModel({initialPrice: price});
      return this;
    },

    // --- Common to all prosumers ---

    setChargeRatio(ratio) {
      assert(ratio >= 0 && ratio <= 1);
      chargeRatio = ratio;
      return this;
    },

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
    currentPowerDemand() { return marketDemand; },  // XXX

    productionIsTurningOn() { return plant.isTurningOn(); },
    productionIsTurningOff() { return plant.isTurningOff(); },
    productionIsOn() { return plant.isOn(); },
    productionIsOff() { return plant.isOff(); },

    /* How much electricity (Ws) the prosumer wants to sell.
     * Always non-negative.
     */
    offeringToGrid() {
      return offering;
    },

    /* How much electricity (Ws) the prosumer wants to buy.
     * Always non-negative.
     */
    demandingFromGrid() {
      return 0; // XXX: is this correct? Can a manager buy from the grid?
    },

    // FIXME: how does this differ from a client prosumer? Does it even make sense to have here?
    netDemand() {
      return -this.offeringToGrid();
    },

    /* Receive this much electricity (Ws) FROM the prosumer. */
    sellToGrid(Ws) {
      assert(Ws >= 0);      // Must always be positive.
      assert(Ws == 0 || offering > 0);
      assert(sold + Ws <= offering);
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

    startUpdate(state) {
      setClock(state.date);
      plant.setTime(currentTime);
      marketDemand = state.demand;

      // TODO: move
      currentProduction = this.currentPowerProduction() * timeDiff / 1000;  // Ws
      if (this.productionIsOff()) {
        offering = this.batteryCharge();  // use production XOR battery
      } else {
        const chargeCap = battery.remainingCapacity();
        const charge = Math.min(currentProduction * chargeRatio, chargeCap);
        offering = currentProduction - charge;
      }
      return this;
    },

    finishUpdate(state) {
      // TODO: Update battery.
      const surplus = currentProduction - sold;
      battery.addDiffToLimit(surplus);  // Store surplus/dicharge deficit.
      // Update production status last.
      updateProductionState();
      sold = 0;
      offering = 0;
      currentProduction = 0;
      enforceInvariants();
      return this;
    },

    // FIXME: Deprecated. Use startUpdate and finishUpdate instead.
    updateState(state) {
      this.startUpdate(state);
      return this.finishUpdate(state);
    },

    currentState() {
      const manager = this;
      return {
        id,
        powerConsumption: manager.currentPowerConsumption(),
        powerProduction: manager.currentPowerProduction(),
        battery: {
          charge: battery.currentCharge(),
          capacity: battery.capacity(),
        },
        chargeRatio,
        productionStatus: (manager.productionIsOn() ? 100 : 0),
        nextProductionTransition: plant.transitionLeft(),
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
    pricingModel: defaultPricingModel(),
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
