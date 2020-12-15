const managerModule = require('../manager.js');
const Manager = managerModule.Manager;
const nopController = managerModule.nopController;

const t0 = new Date();

describe("turning plant on/off", function() {
  const managerModel = {controller: nopController};
  const state = {date: t0};

  let manager;

  beforeEach(function() {
    manager = Manager(managerModel, state);
  });

  it("should take 30 seconds", function() {
    // Initially off.
    expect(manager.productionIsOn()).toBeFalse();
    expect(manager.productionIsOff()).toBeTrue();
    expect(manager.productionIsTurningOn()).toBeFalse();
    expect(manager.productionIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toBeUndefined();
    expect(manager.currentPowerProduction()).toEqual(0);
    // Turning on does nothing until time passes.
    manager.turnProductionOn();
    expect(manager.productionIsOn()).toBeFalse();
    expect(manager.productionIsOff()).toBeTrue();
    expect(manager.productionIsTurningOn()).toBeTrue();                        // XXX: not necessarily
    expect(manager.productionIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toEqual(t0.getTime() + 30_000); // XXX: not necessarily
    expect(manager.currentPowerProduction()).toEqual(0);
    // 15 seconds after turning on, still not on, still no production.
    const t1 = new Date(t0.getTime() + 15_000);
    manager.updateState({date: t1});
    expect(manager.productionIsOn()).toBeFalse();
    expect(manager.productionIsOff()).toBeTrue();
    expect(manager.productionIsTurningOn()).toBeTrue();
    expect(manager.productionIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toEqual(t0.getTime() + 30_000);   // transition was scheduled at +0 and it takes +30.
    expect(manager.currentPowerProduction()).toEqual(0);
    // 30 seconds after turning on, plant is on, full production.
    const t2 = new Date(t0.getTime() + 30_000);
    manager.updateState({date: t2});
    expect(manager.productionIsOn()).toBeTrue();
    expect(manager.productionIsOff()).toBeFalse();
    expect(manager.productionIsTurningOn()).toBeFalse();
    expect(manager.productionIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toBeUndefined();
    expect(manager.currentPowerProduction()).toBeGreaterThan(0);
  });

  it("should eventually happen", function() {
    manager.turnProductionOn();
    manager.updateState(state);
    let t = t0;
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.productionIsOn()).toBeTrue();
  });

  it("should be permanent", function() {
    expect(managerModel.controller).toBeDefined();
    manager.turnProductionOn();
    manager.updateState(state);
    let t = t0;
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.productionIsOn()).toBeTrue();
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.productionIsOn()).toBeTrue();
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.productionIsOn()).toBeTrue(); // Fails
  });

  it("should be idempotent - turning on multiple times does not increase delay", function() {
    manager.turnProductionOn();
    manager.updateState({date: t0});  // trigger transition
    // Turn on again 15 seconds later.
    const t1 = new Date(t0.getTime() + 15_000);
    manager.turnProductionOn();
    manager.updateState({date: t1});
    // 30 seconds after turning on, plant is on, full production.
    const t2 = new Date(t0.getTime() + 30_000);
    manager.turnProductionOn();
    manager.updateState({date: t2});
    expect(manager.productionIsOn()).toBeTrue();
    const t3 = new Date(t0.getTime() + 45_000);
    manager.updateState({date: t3});
    expect(manager.productionIsOn()).toBeTrue();
  });

});
