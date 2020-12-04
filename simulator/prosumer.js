const util = require('./util.js');
const Battery = require('./battery.js').Battery;
const assert = util.assert;
const assertIsNumber = util.assertIsNumber;
const getArgOrDefault = util.getArgOrDefault;
const normalDistribution = util.normalDistribution;

exports.ConsumptionModel = ConsumptionModel;
exports.Prosumer = Prosumer;

/*
 * A prosumer has a certain level of production/consumption (in Watts) at a particular
 * point in time (that is set at each update).
 * Until the next update some amount of electricity as been produced/consumed (in Ws).
 * During that update, some electricity is bought/sold. At that point, demands are
 * actually satisfied (or not) and batteries charged/discharged.
 *
 * This means production refers to what can be "manufactured" rather than sold, and
 * consumption refers to needs/requirements (which may or may not end up being met)
 * rather than power actually being used.
 *
 * So a prosumer basically says "this is how much I am producing, and this is how much
 * I need". That statement doesn't say anything about where production is going or from
 * where demand is satisfied.
 *
 * A prosumer can *also* say "I would like to sell this much" or "I would like to buy
 * this much". That does not mean that amount will be sold/bought.
 *
 * Note that battery charge/discharge does not count as consumption/production!
 *
 * This also means that production and consumption are not affected by ratio settings.
 * It's only when electricity is bought/sold that the over/under production is truly
 * known and a decision can be made about where to put the available electricity
 * (how much surplus can be put into the battery) and from where to take the needed
 * electricity (grid or battery).
 *
 * It's possible to sell less than was offered (when less is bought), and it's
 * possible to buy less than demanded (when less is sold).
 *
 * Could we just deal with each moment in time, and thus W rather than Ws?
 * No. Probably not. Because you can't store Watts in a battery. So we have to deal with
 * discrete chunks/intervals of time.
 */

// TODO: if a prosumer has lots of available battery charge and wants to satisfy
// most of its demand from the grid (to save battery for later), but the grid does
// not deliver the requested amount, is the prosumer in a blackout (even though
// there's plenty of battery available)?
// Should it adapt and draw more from the battery than initially dictated by the
// discharge/buy ratio? Or should it stubbornly stick to its original plan?
//
// Similarly, surely failing to sell electricity to the grid should result in more
// being diverted to the battery?
//
// Perhaps a flag could be used to control this?

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

// TODO: include policies in the prosumer model? (Along with consumption and production.)
// Maybe not. Policies (functions rather than ratios) are probably overkill.
// Policies probably belong in the prosumer app, which dynamically sets ratios.
// However, using functions does make periodic updates easier.
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
  const batteryCap = getArgOrDefault(args, 'batteryCapacity', () => 13500);
  const batteryCharge = getArgOrDefault(args, 'battery', () => 0);
  let powerBought = getArgOrDefault(args, 'powerBought', () => 0);
  let powerSold = getArgOrDefault(args, 'powerSold', () => 0);
  let overProdPolicy = getArgOrDefault(args, 'overproductionPolicy', () => () => rng());
  let underProdPolicy = getArgOrDefault(args, 'underproductionPolicy', () => () => rng());

  // Raw production.
  let currentProduction = 0;
  // Raw consumption.
  let currentConsumption = 0;

  // Total surplus or deficit, independent of charge/discharge ratios.
  let netProduction = undefined; // computed at start of each update.
  // Actual offering to/demanding from the grid, includes charge/discharge target.
  let demand = undefined; // computed at start of update

  // Control how much we want to attempt to charge/discharge and buy/sell.
  // FIXME: should not be hardcoded
  let chargeRatio = 0.5;
  let dischargeRatio = 0.5;

  let totalBought = 0;  // Since beginning of time.
  let totalSold = 0;    // Since beginning of time.
  let banned = {        // bans can be injected between updates.
    from: undefined,
    until: undefined,
  };
  let blackout = false; // compute at end of update based on received vs needed.
  let currentTime = undefined; // and also last update
  let updating = false; // set by start update, cleared by finish update
  const battery = Battery(batteryCap, batteryCharge);  // TODO: take as parameter?

  const obj = {

    // TODO: allow ratios to be set

    // --- These only make sense between updates. ---

    /* How much power (W) is currently being produced. */
    currentPowerProduction() { return currentProduction; },
    /* How much power (W) is currently needed. */
    currentPowerConsumption() { return currentConsumption; },
    /* How much excess power (W) is currently being produced - may be negative. */
    currentNetProduction() { return currentProduction - currentConsumption; },
    /* Currently experiencing a blackout? */
    isBlackedOut() { return blackout; },
    /* Currently banned from selling? */
    isBanned() {
      return false; // FIXME
    },
    /* Ban from selling for some number of milliseconds. */
    banFor(duration, from=currentTime) {
    }, // FIXME
    /* Ban until some date (can be milliseconds or Date). */
    banUntil(date, from=currentTime) {
    }, // FIXME

    batteryCharge() { return battery.currentCharge(); },
    // % charged
    batteryChargePercent() { return battery.currentChargePercent(); },

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
      return demand;
    },

    /* How much excess electricity (Ws) has been produced - may be negative. */
    netProduction() {
      assert(updating);
      return netProduction;
    },

    // TODO: immediately update demand in place?
    // Or accumulate in a variable and process during finishUpdate???
    // Probably accumulate! That also allows the total price to be computed
    // (without having to add that detail here).

    /* Send this much electricity (Ws) TO the prosumer. */
    buyFromGrid(Ws) {
      assert(updating);
      assert(Ws >= 0);      // Must always be positive.
      assert(demand >= 0);  // Can only buy something if deficit.
      assert(Ws <= demand); // Cannot buy more than requested.
      demand -= Ws;
      totalBought += Ws;
    },

    /* Receive this much electricity (Ws) FROM the prosumer. */
    sellToGrid(Ws) {
      assert(updating);
      assert(Ws >= 0);      // Must always be positive.
      assert(demand <= 0);  // Can only sell something if surplus.
      assert(Ws <= -demand); // Cannot sell more than offered.
      assert(!this.isBanned()); // Cannot sell if banned.
      demand += Ws;
      totalSold += Ws;
    },

  /* On start update:
   * - Use production/consumption (W) from previous update and time difference
   *   to compute net production (Ws) for that interval of time.
   * - Use net production and ratios to determine how much to offer/request.
   * On finish update:
   * - Use bought/sold electricity (Ws) from/to the grid and ratios to update battery.
   * - Compute new production/consumption (W) for next update.
   *
   * Ratios can only be updated between updates, not during.
   */

    /*
     * Assumes that the previous production/consumption applies since the last update
     * until now.
     */
    startUpdate(state) {  // FIXME
      updating = true;
      const newTime = util.toMilliseconds(state.date);
      const duration = newTime - currentTime;
      currentTime = newTime;                          // Update current time.
      bannedUntil = computeBannedTimer();             // Uses current time.
      netProduction = computeNetProduction(duration); // Uses current time.
      demand = computeNetDemand();
    },

    // Does not need any args. Right?
    finishUpdate() {  // FIXME
      currentProduction = computeProduction(state);
      currentConsumption = computeConsumption(state);
      updateBattery();
      updateBlackout();
      updateBanned();
      updating = false;
      demand = 0;
    },

    // TODO: deprecate?
    updateState(state) {
      this.startUpdate(state);
      this.finishUpdate();
      return this;
    }

  };

  function init(state) {
    currentProduction = computeProduction(state);
    currentConsumption = computeConsumption(state);
    currentTime = util.toMilliseconds(state.date);
  }

  function computeProduction(state) {
    return model.production(state);
  }

  function computeConsumption(state) {
    return model.consumption(state);
  }

  function computeBannedTimer() {
    // FIXME
  }

  // TODO: use initially computed charge/discharge values?
  // Or start over with the given surplus/deficit (after buying/selling from/to the grid)?
  function updateBattery() {
    // For now, simply try to add/remove demand to/from battery.
    let surplus = -demand;
    // Negative if removing too much (deficit); positive if adding too much (surplus).
    surplus = battery.addDiffToLimit(surplus);
    demand = -surplus;
  }

  function updateBlackout() {
    // FIXME: what about available battery charge??
    // Maybe take care of that in updateBattery?
    blackout = computeBlackout();
  }

  function updateBanned() {
    // FIXME
  }

  // compute... methods do not mutate state.

  /*
   * This is what we want to sell to or buy from the grid.
   * Can be positive (surplus) or negative (deficit).
   */
  function computeNetDemand() {
    const offering = computeOffering();
    if (offering > 0) {
      return -offering;
    }
    const requesting = computeRequesting();
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
  function computeRequesting() {
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
    return netProduction * chargeRatio; // FIXME: check battery
  }

  /* How much demand would we like to take from the battery?
   * (Based on net production and discharge/buy ratio.)
   * Never attempts to exceed available charge.
   * Always non-negative.
   */
  function computeDesiredDischarge() {
    assert(netProduction <= 0);
    return Math.abs(netProduction) * dischargeRatio; // FIXME: check battery
  }

  // TODO: Deprecated? Doesn't seem to be needed, since all the (rather trivial)
  // work can be done in updateBlackout?
  function computeBlackout() {
    // FIXME:
    // compare requested to received electricity
    // use a flag to decide whether available battery charge should be taken into account?
    return demand > 0;
  }

  function enforceInvariants() {
  }

  init(state);
  return obj;
};

// TODO: (High priority?) Add a constant term.
// TODO: (Low priority) Also consider temperature: cold weather -> needs more heating -> greater consumption.
// TODO: take peak times that can be passed to the peaks function? (Could allow variable length peaks.)
// TODO: accept ranges (for offset and scale) instead of plain numbers?
/*
 * Returns a consumption model that is a function from simulation state
 * (primarily time) to power consumption.
 * Expected args:
 * peakOffset, peakScale, dayNightOffset, dayNightScale, backgroundOffset, backgroundScale, noiseFunction, randomizeMissing=false
 */
function ConsumptionModel(args) {
  const rng = normalDistribution();
  const m = 60*1000;
  const h = m*60;
  // Use random defaults for missing args?
  const randomizeMissing = getArgOrDefault(args, 'randomizeMissing', () => false);
  const defaults = cond(randomizeMissing);

  // default to 0 or randomize to ±2h
  const peakOffset = getArgOrDefault(args, 'peakOffset', defaults(rng(-2*h, 2*h), 0));  // equivalent to args?.peakOffset ?? (randomizeMissing ? rng(-2*h, 2*h) : 0);

  // default to 0 or randomize to ±12h
  const dayNightOffset = getArgOrDefault(args, 'dayNightOffset', defaults(rng(-12*h, 12*h), 0));

  // default to 0 or randomize to ±1000
  const backgroundOffset = getArgOrDefault(args, 'backgroundOffset', defaults(rng(-1000, 1000), 0));

  // default to 1 or randomize to ±½
  const peakScale = getArgOrDefault(args, 'peakScale', defaults(rng(0.5, 1.5), 1));

  // default to 1 or randomize to ±½
  const dayNightScale = getArgOrDefault(args, 'dayNightScale', defaults(rng(0.5, 1.5), 1));

  // default to 1 or randomize to ±½
  const backgroundScale = getArgOrDefault(args, 'backgroundScale', defaults(rng(0.5, 1.5), 1));

  // default to 0 or randomize to [0,50[
  const noiseFunction = getArgOrDefault(args, 'noiseFunction', defaults(() => () => rng(0, 50), () => () => 0)); // Add up to 50 W (25 on average)

  /* Takes a state containing current date/time. (Just a Date object also works.)
   */
  return function(state) {
    const date = state.date ?? state; // Work with both state and Date (deprecate?)
    const t = millisecondsSinceMidnight(date);
    const peak = peaks(t + peakOffset + dayNightOffset) * peakScale;  // peaks depend on both offsets
    const dayNight = dayNightVariance(t + dayNightOffset) * dayNightScale;
    const background = backgroundVariance(t + backgroundOffset) * backgroundScale;
    return peak + background + dayNight + noiseFunction();
  };
};

function cond(bool) {
  return function(a1, a2) {
    // Convert to functions if necessary.
    const f1 = util.constantFunction(a1);
    const f2 = util.constantFunction(a2);
    return bool ? f1 : f2;
  };
}

// Note: The default model uses randomization.
function getDefaultModel() {
  return {
    consumption: ConsumptionModel({randomizeMissing:true}),
    production: () => 200,  // FIXME: need an actual production model
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

// TODO: use ms = util.fromHours(h)
/* Power consumption has peaks around certain times related to when people
 * work and sleep etc.
 * Takes time in milliseconds.
 */
function peaks(t) {
  const morningPeakStart = 6*60*60*1000;
  const morningPeakEnd = 8*60*60*1000;
  const morningPeakAmplitude = 100;
  const lunchPeakStart = 12*60*60*1000;
  const lunchPeakEnd = 13*60*60*1000;
  const lunchPeakAmplitude = 150;
  const eveningPeakStart = 18*60*60*1000;
  const eveningPeakEnd = 22*60*60*1000;
  const eveningPeakAmplitude = 300;
  if (t >= morningPeakStart && t <= morningPeakEnd) {
    return morningPeakAmplitude;
  } else if (t >= lunchPeakStart && t <= lunchPeakEnd) {
    return lunchPeakAmplitude;
  } else if (t >= eveningPeakStart && t <= eveningPeakEnd) {
    return eveningPeakAmplitude;
  } else {
    return 0;
  }
}

/* Add a small background oscillation with a period on the order of a few
 * seconds.
 * Time in milliseconds.
 */
function backgroundVariance(t) {
  return 10 * (1 + Math.sin(t*1000)); // FIXME: period
}

// TODO: maybe a millisecond resolution is counter productive?
// Maybe that is *too* smooth, and a choppier function would actually look more natural?
/* Adds a day/night cycle: large-scale oscillation with a period of 24 hours.
 * Half of the day has high consumption, half the day has low consumption.
 * Takes time in milliseconds.
 */
function dayNightVariance(t) {
  const P = 24*60*60*1000;  // The period is P = 24 h = 3,600,000 ms
  const b = (2*Math.PI)/P;
  const peakOffset = 20*60*60*1000;  // Peak is 20:00
  return 100 * (1 + Math.cos(b*(t-peakOffset)));
}

function millisecondsSinceMidnight(dateTime) {
  const minutes = dateTime.getHours() * 60 + dateTime.getMinutes();
  const seconds = minutes * 60 + dateTime.getSeconds();
  return seconds * 1000 + dateTime.getMilliseconds();
}
