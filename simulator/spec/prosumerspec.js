const Prosumer = require('../prosumer.js').Prosumer;

const now = new Date();

// "Standardized" production/consumption values.
const highProduction = 100;
const lowProduction = 10;
const highConsumption = 100;
const lowConsumption = 10;
// All combinations of high/low/0.
const highProductionOnly = constantModel(highProduction, 0);
const highConsumptionOnly = constantModel(0, highConsumption);
const lowProductionOnly = constantModel(lowProduction, 0);
const lowConsumptionOnly = constantModel(0, lowConsumption);
const highProductionLowConsumption = constantModel(highProduction, lowConsumption);
const lowProductionHighConsumption = constantModel(lowProduction, highConsumption);
const noProductionOrConsumption = constantModel(0, 0);
const highProductionAndConsumption = constantModel(highProduction, highConsumption);
const lowProductionAndConsumption = constantModel(lowProduction, lowConsumption);
// Battery.
const highCapacity = 1000;
const lowCapacity = 100;
const highCharge = 100;
const lowCharge = 10;

function battery(charge, capacity) {
  return {
    battery: charge,
    batteryCapacity: capacity,
    and(otherArgs) { return Object.assign(this, otherArgs); },
  };
}

function policy(chargeRatio, dischargeRatio) {
  return {
    overproductionPolicy: () => chargeRatio,
    underproductionPolicy: () => dischargeRatio,
    and(otherArgs) { return Object.assign(this, otherArgs); },
  };
}

function fullBattery(capacity) {
  return battery(capacity, capacity);
}

function emptyBattery(capacity) {
  return battery(0, capacity);
}

let prosumer;

describe("Prosumer created with defaults", function() {

  beforeEach(function() {
    prosumer = Prosumer();
  });

  it("starts out with empty batteries", function() {
    expect(prosumer.batteryCharge()).toBe(0);
  });

  it("starts out not being banned", function() {
    expect(prosumer.isBanned()).toBeFalse();
  });

  it("starts out not in blackout", function() {
    expect(prosumer.isBlackedOut()).toBeFalse();
  });
});

describe("Prosumer with small deficit but plenty of battery charge", function() {

  beforeEach(function() {
    prosumer = Prosumer(lowConsumptionOnly, initialState(), fullBattery(highCapacity));
  });

  it("should not enter a blackout even if under supplied", function() {
    prosumer.startUpdate(initialState().plus(1));
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeFalse();
  });

  it("should still demand electricity from the grid", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.demandingFromGrid()).toBeGreaterThan(0);
  });

  it("should discharge battery if under supplied", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.netProduction()).toBe(-10);
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(highCapacity - 10); // remove 10 Ws
  });

});

describe("Prosumers with low consumption and no production", function() {

  beforeEach(function() {
    prosumer = Prosumer(lowConsumptionOnly, initialState(), {});
  });

  it("should consume some power", function() {
    expect(prosumer.currentPowerConsumption()).toEqual(lowConsumption);
    expect(prosumer.currentNetPowerProduction()).toEqual(-lowConsumption);
  });

  it("should demand electricity from the grid", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.demandingFromGrid()).toBeGreaterThan(0);
  });

  it("should be in a blackout when no electricity is delivered", function() {
    prosumer.startUpdate(initialState().plus(1));
    // Not delivering any electricity to the prosumer.
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeTrue();
  });

  it("should be in a blackout when not enough electricity is delivered", function() {
    prosumer.startUpdate(initialState().plus(1));
    // Not delivering any electricity to the prosumer.
    prosumer.buyFromGrid(1);
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeTrue();
  });

  it("should not offer any electricity to the grid", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.offeringToGrid()).toBe(0);
  });

});

describe("Prosumers with low production and no consumption", function() {

  beforeEach(function() {
    prosumer = Prosumer(lowProductionOnly, initialState(), {});
  });

  it("should produce some power", function() {
    expect(prosumer.currentPowerProduction()).toBe(10);
  });

  it("should have net production equal to raw production", function() {
    const rawProduction = prosumer.currentPowerProduction();
    const netProduction = prosumer.currentNetPowerProduction();
    expect(netProduction).toBe(rawProduction);
  });

  it("should offer some electricity to the grid", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.offeringToGrid()).toBeGreaterThan(0);
  });

  it("should offer at most its net production", function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.offeringToGrid()).not.toBeGreaterThan(prosumer.netProduction());
  });

  // TODO: move this? This probably depends on charge ratio?
  it("should charge their batteries when not selling anything", function() {
    prosumer.startUpdate(initialState().plus(1));
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBeGreaterThan(0);
  });

  it("should not be in a blackout even if no electricity is delivered", function() {
    prosumer.startUpdate(initialState().plus(1));
    // Not delivering any electricity to the prosumer.
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeFalse();
  });

  it("should not offer electricity to the grid when banned", function() {
    expect(prosumer.currentPowerProduction()).toBe(10);
    expect(prosumer.currentNetPowerProduction()).toBe(10);
  });

});

// FIXME: Must check that changes in time and/or weather change production/consumption correctly! (That state changes are applied.)

describe("Over production policy (charge/sell ratio)", function() {

  it("should determine how much is offered to the grid", function() {
    prosumer = Prosumer(lowProductionOnly, initialState(), emptyBattery(highCapacity).and(policy(0.25, 1)));
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.offeringToGrid()).toBe(lowProduction * 0.75); // charge 0.75, sell 0.25
  });

  it("should be settable between updates", function() {
    prosumer = Prosumer(lowProductionOnly, initialState(), emptyBattery(highCapacity).and(policy(0.25, 1)));
    prosumer.startUpdate(initialState().plus(1));
    prosumer.finishUpdate();
    prosumer.setChargeRatio(0.75);
    prosumer.startUpdate(initialState().plus(2));
    expect(prosumer.offeringToGrid()).toBe(lowProduction * 0.25); // charge 0.25, sell 0.75
  });

});

describe("bans ...", function() {

  // TODO: what is the effect of a ban on net demand?

  it("should not be allowed in the middle of an update", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.startUpdate(initialState().plus(1));
    expect(() => prosumer.banFor(3_000)).toThrowError();
  });

  it("should expire after duration", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.banFor(3_000); // 3 seconds
    prosumer.startUpdate(initialState().plus(5));
    prosumer.finishUpdate();
    prosumer.startUpdate(initialState().plus(5));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeFalse();
  });

  it("should only apply if time diff is strictly smaller than duration", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.banFor(3_000); // 3 seconds
    prosumer.startUpdate(initialState().plus(1)); // the 3 second ban takes effect at t = t0 + 1000 (should expire at t = t0 + 4000)
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeTrue();
    prosumer.startUpdate(initialState().plus(4 + 0.001));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeFalse();  // A 3 second ban expires after 3 seconds.
  });

  it("should persist over updates if long enough (expire only after the full duration)", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.banFor(3_001); // 3 seconds + 1 ms
    prosumer.startUpdate(initialState().plus(1));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeTrue(); // A 3.001 second ban does not expire after 1 second.
    prosumer.startUpdate(initialState().plus(3));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeTrue(); // A 3.001 second ban does not expire after 3 seconds.
  });

  it("should replace any existing ban (possibly shorten it)", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.banFor(5_000);   // ban until t0 + 5000 = 5000
    prosumer.startUpdate(initialState().plus(1));
    prosumer.finishUpdate();
    prosumer.banFor(1_000);   // ban until t1 + 1000 = 2000
    expect(prosumer.isBanned()).toBeTrue();
    prosumer.startUpdate(initialState().plus(3));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeFalse();  // not banned at t2 = 4000
  });

  it("should replace any existing ban (possibly lengthen it)", function() {
    prosumer = Prosumer(noProductionOrConsumption, initialState());
    prosumer.banFor(5_000);   // ban until t0 + 5000 = 5000
    prosumer.startUpdate(initialState().plus(4));
    prosumer.finishUpdate();
    prosumer.banFor(5_000);   // ban until t1 + 5000 = 9000
    expect(prosumer.isBanned()).toBeTrue();
    prosumer.startUpdate(initialState().plus(8));
    prosumer.finishUpdate();
    expect(prosumer.isBanned()).toBeTrue();  // still banned at t2 = 8000
  });

  it("should prevent a prosumer from selling to the grid", function() {
    prosumer = Prosumer(highProductionOnly, initialState());
    prosumer.banFor(1_000);
    prosumer.startUpdate(initialState().plus(1));
    expect(() => prosumer.buyFromGrid(1)).toThrowError();
  });

});

describe("Prosumer with production = 10, consumption = 6, charge ratio = 0.5", function() {
  // TODO: translate test case to hihg/low production/consumption.
  const production = 10;
  const consumption = 6;
  //const initialState = newState();
  const model = constantModel(production, consumption);
  const args = {
    overproductionPolicy: () => 0.5,  // XXX: not actually used currently
    batteryCapacity: 40,
  }

  beforeEach(function() {
    prosumer = Prosumer(model, initialState(), args);
  });

  it(`has a raw production of ${production}`, function() {
    expect(prosumer.currentPowerProduction()).toBe(production);
  });

  it(`has a consumption of ${consumption}`, function() {
    expect(prosumer.currentPowerConsumption()).toBe(consumption);
  });

  it(`has a net production of ${production - consumption}`, function() {
    prosumer.startUpdate(initialState().plus(1));
    expect(prosumer.netProduction()).toBe(production - consumption);
  });

  it("should not buy electricity", function() {
    //prosumer.startUpdate(newState());
    prosumer.startUpdate(initialState());
    expect(prosumer.demandingFromGrid()).toBe(0);
  });

  it("should direct 100 % overproduction to battery", function() {
    //prosumer.startUpdate(newState());
    prosumer.startUpdate(initialState());
    expect(prosumer.offeringToGrid()).toBe(0);
  });

  it("should charge its battery", function() {
    expect(prosumer.batteryCharge()).toBe(0);

    prosumer.startUpdate(initialState().plus(1));  // Advance to t0 + 1
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(4); // surplus of 4 for 1 second, nothing bought

    prosumer.startUpdate(initialState().plus(2));  // Advance to t0 + 1
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(8); // surplus of 4 for 2 second, nothing bought
  });

});

describe("Prosumer with negative net production", function() {
  //const initialState = newState();
  const args = {
    underproductionPolicy: () => 0.5,  // XXX: not actually used currently
    battery: 10,  // initially full
    batteryCapacity: 10,
  }
  const prosumer = Prosumer(constantModel(1, 2), initialState(), args);

  it("should switch to draining its battery when not getting enough from the grid", function() {
    prosumer.startUpdate(initialState().plus(10)); // Advance to t0 + 10
    expect(prosumer.demandingFromGrid()).toBe(5); // ideally wants 5, gets 0,
    prosumer.finishUpdate();                      //  and has to take 10 from battery
    expect(prosumer.batteryCharge()).toBe(0);     // deficit of 1 for 10 seconds, nothing bought
    expect(prosumer.isBlackedOut()).toBeFalse();  // XXX: belongs in separate test case?

    prosumer.startUpdate(initialState().plus(20));
    expect(prosumer.demandingFromGrid()).toBe(10);  // if empty, demand 100 %
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeTrue(); // XXX: belongs in separate test case?
  });

});


describe("Prosumer with positive net production", function() {
  //const initialState = newState();
  const args = {
    overproductionPolicy: () => 0.5,  // XXX: not actually used currently
    batteryCapacity: 10,
  }
  const prosumer = Prosumer(constantModel(2, 1), initialState(), args);

  it("should switch to selling its surplus when the battery is full", function() {
    prosumer.startUpdate(initialState().plus(10)); // Advance to t0 + 10
    expect(prosumer.offeringToGrid()).toBe(5);
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(10); // surplus of 1 for 10 seconds, nothing sold

    prosumer.startUpdate(initialState().plus(20));
    expect(prosumer.batteryCharge()).toBe(10);
    expect(prosumer.offeringToGrid()).toBe(10);  // if full, offer 100 %
  });

});

// Note: Methods must not mutate the state.
//function initialState(t0=time(0,0,0)) {
function initialState(t0=now) {
  return {
    date: t0,
    plus(seconds=1) {
      //return initialState(withSeconds(t0, t0.getSeconds() + seconds));  // But neither is this!?
      return initialState(new Date(t0.getTime() + seconds*1000)); // This is apparently not reliable!
      //return initialState(t0 + seconds*1000); // This is apparently not reliable!
    },
    // TODO: withWeather, with
  };
}

// TODO: clean up utils/helpers

function constantModel(production, consumption) {
  return {
    consumption: () => consumption,
    production: () => production,
  };
}

// Create a date for a certain time (and fixed date).
function time(h=0, m=0, s=0) {
  return new Date(2020, 11, 1, h, m, s, 0);
}

/*
// Deprecated?
function _newState(date=new Date(), msOffset=0) {
  return {
    date: time(0, 0, 0),
  };
}

// Deprecated?
function addTime(state, ms) {
  return newState(state.date, ms);
}

// Deprecated?
function withHours(date, h) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h);
}

// Deprecated?
function withSeconds(date, s) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), s, date.getMilliseconds());
}

// Deprecated?
function addSeconds(state, s) {
  return {
    date: withSeconds(state.date, state.date.getSeconds() + s),
  };
}

// Deprecated?
function addHours(state, h) {
  return addTime(h*1000*3600);
}
*/
