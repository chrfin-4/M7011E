const model = require('../model.js');
const Prosumer = require('../prosumer.js').Prosumer;

const initialState = newState();

describe("Prosumer created with defaults", function() {
  it("starts out with empty batteries", function() {
    const prosumer = Prosumer();
    expect(prosumer.batteryCharge()).toBe(0);
  });

  it("starts out not being banned", function() {
    const prosumer = Prosumer();
    expect(prosumer.isBanned()).toBeFalse();
  });

  it("starts out not in blackout", function() {
    const prosumer = Prosumer();
    expect(prosumer.isBlackedOut()).toBeFalse();
  });
});

describe("Prosumers with net production < 0 (and no production)", function() {
  it("should consume some power", function() {
    const prosumer = Prosumer(constantModel(0, 10), initialState);
    expect(prosumer.currentPowerConsumption()).toEqual(10);
    expect(prosumer.currentNetProduction()).toEqual(-10);
  });

  it("should demand electricity from the grid", function() {
    const prosumer = Prosumer(constantModel(0, 10), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    expect(prosumer.demandingFromGrid()).toBeGreaterThan(0);
  });

  it("should be in a blackout when no electricity is delivered", function() {
    const prosumer = Prosumer(constantModel(0, 10), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    // Not delivering any electricity to the prosumer.
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeTrue();
  });

  it("should be in a blackout when not enough electricity is delivered", function() {
    const prosumer = Prosumer(constantModel(0, 10), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    // Not delivering any electricity to the prosumer.
    prosumer.buyFromGrid(1);
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeTrue();
  });

  it("should not offer any electricity to the grid", function() {
    const prosumer = Prosumer(constantModel(0, 10), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    expect(prosumer.offeringToGrid()).toEqual(0);
  });

});

describe("Prosumers with net production > 0 (and no consumption)", function() {
  it("should produce some power", function() {
    const prosumer = Prosumer(constantModel(10, 0), initialState);
    expect(prosumer.currentPowerProduction()).toEqual(10);
    expect(prosumer.currentNetProduction()).toEqual(10);
  });

  it("should offer electricity to the grid", function() {
    const prosumer = Prosumer(constantModel(10, 0), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    expect(prosumer.offeringToGrid()).toBeGreaterThan(0);
  });

  // TODO: move this? This probably depends on charge ratio?
  it("should charge their batteries when not selling anything", function() {
    const prosumer = Prosumer(constantModel(10, 0), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBeGreaterThan(0);
  });

  it("should not be in a blackout even if no electricity is delivered", function() {
    const prosumer = Prosumer(constantModel(10, 0), initialState);
    prosumer.startUpdate(addSeconds(initialState, 1));
    // Not delivering any electricity to the prosumer.
    prosumer.finishUpdate();
    expect(prosumer.isBlackedOut()).toBeFalse();
  });

});

describe("Prosumer with production = 10, consumption = 6, charge ratio = 0.5", function() {
  const production = 10;
  const consumption = 6;
  const initialState = newState();
  const model = constantModel(production, consumption);
  const args = {
    overproductionPolicy: () => 0.5,  // XXX: not actually used currently
    batteryCapacity: 40,
  }

  let prosumer;

  beforeEach(function() {
    prosumer = Prosumer(model, initialState, args);
  });

  it(`has a raw production of ${production}`, function() {
    expect(prosumer.currentPowerProduction()).toBe(production);
  });

  it(`has a consumption of ${consumption}`, function() {
    expect(prosumer.currentPowerConsumption()).toBe(consumption);
  });

  it(`has a net production of ${production - consumption}`, function() {
    prosumer.startUpdate(addSeconds(initialState, 1));
    expect(prosumer.netProduction()).toBe(production - consumption);
  });

  it("should not buy electricity", function() {
    prosumer.startUpdate(newState());
    expect(prosumer.demandingFromGrid()).toBe(0);
  });

  it("should direct 100 % overproduction to battery", function() {
    prosumer.startUpdate(newState());
    expect(prosumer.offeringToGrid()).toBe(0);
  });

  it("should charge its battery", function() {
    expect(prosumer.batteryCharge()).toBe(0);

    prosumer.startUpdate(addSeconds(initialState, 1));  // Advance to t0 + 1
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(2);

    prosumer.startUpdate(addSeconds(initialState, 2));  // Advance to t0 + 1
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(4);
  });

});

describe("Prosumer with positive net production", function() {
  const initialState = newState();
  const args = {
    overproductionPolicy: () => 0.5,  // XXX: not actually used currently
    batteryCapacity: 10,
  }
  const prosumer = Prosumer(constantModel(2, 1), initialState, args);

  // TODO: check whether this test is still meaningful!
  it("should switch to selling its surplus when the battery is full", function() {
    prosumer.startUpdate(addSeconds(initialState, 10)); // Advance to t0 + 10
    prosumer.finishUpdate();
    expect(prosumer.batteryCharge()).toBe(5);

    prosumer.startUpdate(addSeconds(initialState, 11));
    expect(prosumer.batteryCharge()).toBe(5);
    expect(prosumer.offeringToGrid()).toBe(0.5);
  });

});

// TODO: clean up utils/helpers

function policyArgs(overProdRatio = 0.5, underProdRatio = 0.5) {
  return {
    overproductionPolicy: () => overProdRatio,
    underproductionPolicy: () => underProdRatio,
  };
}

function constantModel(production, consumption) {
  return {
    consumption: () => consumption,
    production: () => production,
  };
}

function newState(date=new Date(), msOffset=0) {
  return {
    date: time(0, 0, 0),
  };
}

function addTime(state, ms) {
  return newState(state.date, ms);
}

// Create a date for a certain time (and fixed date).
function time(h=0, m=0, s=0) {
  return new Date(2020, 11, 1, h, m, s);
}

function withHours(date, h) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h);
}

function withSeconds(date, s) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), s);
}

function addSeconds(state, s) {
  return {
    date: withSeconds(state.date, state.date.getSeconds() + s), // XXX
  };
}

function addHours(state, h) {
  return addTime(h*1000*3600);
}
