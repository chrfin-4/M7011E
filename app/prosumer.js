const util = require('./util.js');
const Battery = require('./battery.js').Battery;
const WindTurbine = require('./turbine.js').WindTurbine;
const assert = util.assert;
const assertIsNumber = util.assertIsNumber;
const getArgOrDefault = util.getArgOrDefault;
const normalDistribution = util.normalDistribution;
const ConsumptionModel = require('./consumption.js').ConsumptionModel;

exports.ConsumptionModel = ConsumptionModel;
exports.Prosumer = Prosumer;

/*
 * Based on ??? (article)
 * 10-11 kWh/day is a good average consumption.
 * Values between 3.3 and 26.2 are plausible.
 * TODO: use Ws instead of Wh!
 * The model uses Wh (rather than kWh) to avoid rounding errors in the computations.
 * So that means a daily average of 10,000 - 11,000.
 *
 * The minimum (night) value should be 200 W ([100-350]) at 5:15.
 * The maximum (evening) value should be 740 W ([550-950]) at 22:15.
 * The morning peak should be just below 400 W at around 08:00.
 * The lunch peak should be around 500 W at around 13:30.
 * TODO:
 * The model needs to be adjusted so that the peaks have better timing.
 *
 * A reasonable average for electricity cost is 0.25 kr/kWh.
 */

/*
 * The model is used to compute the production and consumption.
 * 13,500 Wh is the capacity of a Tesla Powerwall.
 *
 * The only operations on a Prosumer (modifying it somehow as opposed to simply
 * looking at it) are
 * - ban
 * - buy/sell
 * - set ratios
 * (- and update)
 *
 * expected args:
 * battery=0, batteryCapacity=13500, powerBought=0, powerSold=0,
 * overproductionPolicy=(state -> [1,0[), underproductionPolicy=(state -> [1,0[)
 */
function Prosumer(model=getDefaultModel(), state=getDefaultState(), args) {

  const rng = normalDistribution();
  const batteryCap = getArgOrDefault(args, 'batteryCapacity', () => 13500); // tmp
  const batteryCharge = getArgOrDefault(args, 'battery', () => 0);          // tmp
  const battery = Battery(batteryCap, batteryCharge);  // TODO: take as parameter?
  // TODO: remove?
  //let powerBought = getArgOrDefault(args, 'powerBought', () => 0);
  //let powerSold = getArgOrDefault(args, 'powerSold', () => 0);
  let overProdPolicy = getArgOrDefault(args, 'overproductionPolicy', () => () => rng());
  let underProdPolicy = getArgOrDefault(args, 'underproductionPolicy', () => () => rng());

  // Raw production. (W)
  let currentProduction;    // Computed at start of each update.
  // Raw consumption. (W)
  let currentConsumption;   // Computed at start of each update.

  // Total surplus or deficit, independent of charge/discharge ratios. (Ws)
  let netProduction;        // Computed at start of each update.
  // Actual offering to/demanding from the grid, includes charge/discharge target. (Ws)
  let netDemand;            // Computed at start of update.
  // After buying/selling and charging/discharging.
  let finalBalance;         // Computed when finishing update.

  // Control how much we want to attempt to charge/discharge and buy/sell.
  // Set at start of update based on over/under production policies.
  let chargeRatio;
  let dischargeRatio;

  let totalBought = 0;  // Since beginning of time. (Ws)
  let totalSold = 0;    // Since beginning of time. (Ws)
  let banDuration = 0;
  let banned = false;
  let blackout = false; // compute at end of update based on received vs needed.
  let currentTime;      // Set at start of each update.
  let timeDiff = 0;     // Computed at start of each update.
  let currentState;     // Set at start of each update.
  let updating = false; // Set by start update, cleared by finish update.

  let bought = 0;
  let sold = 0;

  const obj = {

    // --- Prosumer (client) specific (not in Manager) ---

    // TODO: Really acceptable behavior? If a short ban is placed immediately after
    // an update and it expires before the next update, then the ban has no effect!
    // Is there even any better alternative?
    /* Ban from selling for some number of milliseconds.
     * The ban applies to (at least) the whole interval. So the minimum (actual)
     * duration cannot be shorter than the update interval.
     * Any previously pending ban is ignored and replaced.
     */
    banFor(duration) {
      assert(!updating);
      banDuration = duration;  // update each tick
      return this;
    },

    /* Currently banned from selling? */
    isBanned() {
      return banned;
    },

    // --- Common to all prosumers ---

    setChargeRatio(ratio) {
      assert(ratio >= 0 && ratio <= 1);
      overProdPolicy = () => ratio;
      return this;
    },

    setDischargeRatio(ratio) {
      assert(ratio >= 0 && ratio <= 1);
      underProdPolicy = () => ratio;
      return this;
    },

    getChargeRatio() { return chargeRatio; },
    getDischargeRatio() { return dischargeRatio; },

    // --- These only make sense between updates. ---

    /* How much power (W) is currently being produced. */
    currentPowerProduction() { return currentProduction; },
    /* How much power (W) is currently needed. */
    currentPowerConsumption() { return currentConsumption; },
    /* How much excess power (W) is currently being produced - may be negative. */
    currentNetPowerProduction() { return currentProduction - currentConsumption; },
    /* Currently experiencing a blackout? */
    isBlackedOut() { return blackout; },

    // Regular prosumers have no transition delay.
    // XXX: Transitional method.
    // This should be generalized so that managers and prosumers are both just
    // prosumers, and one happens to have one kind of power generation while
    // the other has another kind, each with whatever parameters (including
    // transition delay) that they have.
    productionTransitionDelay() { return 0; },
    // XXX: These are NOPs at the moment. In the future, any prosumer may or
    // may not be able to turn production on/off, depending on how they are
    // producing electricity. (Should depend on an object they contain.)
    turnProductionOn() { return this; },
    turnProductionOff() { return this; },

    batteryCharge() { return battery.currentCharge(); },
    // % charged
    batteryChargePercent() { return battery.currentChargePercent(); },
    batteryCapacity() { return battery.capacity(); },

    // --- These only make sense during updates. ---

    /* How much electricity (Ws) the prosumer wants to sell.
     * Always non-negative.
     */
    offeringToGrid() {
      return Math.max(0, -this.netDemand());
    },

    /* How much electricity (Ws) the prosumer wants to buy.
     * Always non-negative.
     */
    demandingFromGrid() {
      return Math.max(0, this.netDemand());
    },

    /* Electricity (Ws) surplus/deficit.
     * Can be positive (deficit) or negative (surplus).
     */
    netDemand() {
      assert(updating);
      return netDemand;
    },

    /* How much excess electricity (Ws) has been produced - may be negative. */
    netProduction() {
      assert(updating);
      return netProduction;
    },

    /* Send this much electricity (Ws) TO the prosumer. */
    buyFromGrid(Ws) {
      assert(updating);
      assert(Ws >= 0);      // Must always be non-negative.
      assert(Ws == 0 || netDemand >= 0);  // Can only buy something if deficit.
      assert((bought + Ws) <= netDemand); // Cannot buy more than requested.
      totalBought += Ws;
      bought += Ws;
    },

    /* Receive this much electricity (Ws) FROM the prosumer. */
    sellToGrid(Ws) {
      assert(updating);
      assert(Ws >= 0);      // Must always be positive.
      assert(Ws == 0 || netDemand <= 0);  // Can only sell something if surplus.
      assert((sold + Ws) <= -netDemand); // Cannot sell more than offered.
      assert(!this.isBanned()); // Cannot sell if banned.
      netDemand += Ws;
      totalSold += Ws;
      sold += Ws;
    },

    /*
     * Assumes that the previous production/consumption applies since the last update
     * until now.
     */
    startUpdate(state) {  // XXX: deprecated  ... or is it?
      startUpdate(state);
      return this;
    },

    finishUpdate() {  // XXX: deprecated  ... or is it?
      finishUpdate();
      return this;
    },

    // TODO: deprecated? Add some sort of currentState method that returns all properties.
    currentState() {
      return {
        powerConsumption: currentConsumption,
        powerProduction: currentProduction,
        blackout,
        banDuration,
        banned: banDuration > 0,
        battery: {
          charge: battery.currentCharge(),
          capacity: battery.capacity(),
        },
        chargeRatio,
        dischargeRatio,
        productionStatus: 100,  // XXX: always on for now
      };
    }

  };

  init(state);
  return obj;

  function init(state) {
    currentProduction = computeProduction(state);
    currentConsumption = computeConsumption(state);
    currentTime = util.toMilliseconds(state.date);
  }

  /* Update time.
   * Figure out demand based on current state (production,
   * consumption, banned, ratios, etc).
   */
  function startUpdate(state) {
    updating = true;
    setClock(state.date); // Update current time and interval since last update.
    currentState = state;
    // TODO: (also see finishUpdate)
    // Set production/consumption here, and use for the past interval?
    // Or set at end of update, and use for coming interval?
    currentProduction = computeProduction(state);
    currentConsumption = computeConsumption(state);
    updateBanned(); // Currently banned?
    updateRatios();
    netProduction = computeNetProduction(timeDiff); // Uses current time.
    netDemand = computeNetDemand();
  }

  // XXX: now the ban status is updated BOTH at the start of update AND at the end.
  // Is that correct? Does it make sense?

  /* Compute new
   * Blackout status.
   * Banned status.
   */
  function finishUpdate() {
    finalBalance = netProduction + bought - sold;
    updateBattery();
    updateBlackout();
    // TODO: (also see startUpdate)
    // Set production/consumption here, and use for the coming interval?
    // Or set at start of update, and use for past interval?
    //currentProduction = computeProduction(currentState);
    //currentConsumption = computeConsumption(currentState);
    updateBanDuration();
    updateBanned(); // Currently banned?
    // Clear.
    netDemand = 0;
    netProduction = 0;
    bought = 0;
    sold = 0;
    finalBalance = 0;
    updating = false;
    enforceInvariants();
  }

  function setClock(time) {
    time = util.toMilliseconds(time);
    if (currentTime === undefined) {
      currentTime = time;
    }
    assert(time >= currentTime);
    timeDiff = time - currentTime;
    currentTime = time;
  }

  // TODO:
  // If we take policies (as opposed to fixed (though settable) ratios) seriously,
  // then more state info must be supplied here when getting the new ratios.
  // We should probably just use policies purely for simulation purposes.
  function updateRatios() {
    chargeRatio = overProdPolicy();
    dischargeRatio = underProdPolicy();
  }

  function updateBattery() {
    finalBalance = battery.addDiffToLimit(finalBalance);
  }

  function updateBlackout() {
    blackout = computeBlackout();
  }

  function updateBanned() {
    banned = banDuration > 0;
  }

  function updateBanDuration() {
    banDuration -= timeDiff;  // some time has passed
    banDuration = Math.max(0, banDuration); // Never go below 0.
    assert(banDuration >= 0);
  }

  // compute methods do not mutate state.

  function computeProduction(state) {
    return model.production(state);
  }

  function computeConsumption(state) {
    return model.consumption(state);
  }

  /*
   * This is what we want to sell to or buy from the grid.
   * Can be positive (surplus) or negative (deficit).
   */
  function computeNetDemand() {
    const offering = computeOffering();
    if (offering > 0) {
      return -offering;
    }
    const requesting = computeDemanding();
    if (requesting > 0) {
      return requesting;
    }
    return 0;
  }

  /*
   * Can be positive (surplus) or negative (deficit).
   * Duration is in milliseconds.
   */
  function computeNetProduction(duration) {
    const netPower = currentProduction - currentConsumption;
    const seconds = util.toSeconds(duration);
    return netPower * seconds;  // Ws
  }

  /* How much do we want to try to sell?
   * Always non-negative.
   */
  function computeOffering() {
    assert(netProduction !== undefined);
    if (netProduction <= 0) {
      return 0; // Nothing to spare.
    }
    return netProduction - computeDesiredCharge();
  }

  /* How much do we want to try to buy?
   * Always non-negative.
   */
  function computeDemanding() {
    assert(netProduction !== undefined);
    if (netProduction >= 0) {
      return 0; // Nothing needed.
    }
    return Math.abs(netProduction) - computeDesiredDischarge();
  }

  /* How much surplus would we like to put into the battery?
   * (Based on net production and charge/sell ratio.)
   * Never attempts to exceed battery capacity.
   * Always non-negative.
   */
  function computeDesiredCharge() {
    assert(netProduction >= 0);
    const cap = battery.capacity() - battery.currentCharge();
    return Math.min(cap, netProduction * chargeRatio);
  }

  /* How much demand would we like to take from the battery?
   * (Based on net production and discharge/buy ratio.)
   * Never attempts to exceed available charge.
   * Always non-negative.
   */
  function computeDesiredDischarge() {
    assert(netProduction <= 0);
    const cap = battery.currentCharge();
    return Math.min(cap, Math.abs(netProduction) * dischargeRatio);
  }

  function computeBlackout() {
    return finalBalance < 0;
  }

  // These should always be true at the end of an update.
  function enforceInvariants() {
    assert(netDemand == 0);
    assert(netProduction == 0);
    assert(bought == 0);
    assert(sold == 0);
    assert(finalBalance == 0);
    assert(banDuration >= 0);
    assert(chargeRatio >= 0 && chargeRatio <= 1);
    assert(dischargeRatio >= 0 && dischargeRatio <= 1);
  }

};

// Note: The default model uses randomization.
function getDefaultModel() {
  const turbine = WindTurbine();
  return {
    consumption: ConsumptionModel({randomizeMissing:true}),
    production: ({weather}) => turbine(weather.windSpeed),
  };
}

function getDefaultState() {
  return {
    date: new Date(), // now
    price: 1.23,      // current electricity price
    weather: {        // current weather conditions
      windSpeed: 0,
      // etc
    },
  };
}
