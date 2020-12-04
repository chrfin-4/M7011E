const model = require('../model.js');

const t0 = new Date(2020, 12, 1, 0, 0, 0);

describe("turning plant on/off", function() {
  const managerModel = {controller: model.manager.nopController};
  const state = {date: t0};

  it("should take 30 seconds", function() {
    const manager = model.Manager(managerModel, state);
    // Initially off.
    expect(manager.plantIsOn()).toBeFalse();
    expect(manager.plantIsOff()).toBeTrue();
    expect(manager.plantIsTurningOn()).toBeFalse();
    expect(manager.plantIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toBeUndefined();
    expect(manager.currentPowerProduction()).toEqual(0);
    // Turning on does nothing until time passes.
    manager.turnPlantOn();
    expect(manager.plantIsOn()).toBeFalse();
    expect(manager.plantIsOff()).toBeTrue();
    expect(manager.plantIsTurningOn()).toBeTrue();                        // XXX: not necessarily
    expect(manager.plantIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toEqual(t0.getTime() + 30_000); // XXX: not necessarily
    expect(manager.currentPowerProduction()).toEqual(0);
    // 15 seconds after turning on, still not on, still no production.
    const t1 = new Date(t0.getTime() + 15_000);
    manager.updateState({date: t1});
    expect(manager.plantIsOn()).toBeFalse();
    expect(manager.plantIsOff()).toBeTrue();
    expect(manager.plantIsTurningOn()).toBeTrue();
    expect(manager.plantIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toEqual(t0.getTime() + 30_000);   // transition was scheduled at +0 and it takes +30.
    expect(manager.currentPowerProduction()).toEqual(0);
    // 30 seconds after turning on, plant is on, full production.
    const t2 = new Date(t0.getTime() + 30_000);
    manager.updateState({date: t2});
    expect(manager.plantIsOn()).toBeTrue();
    expect(manager.plantIsOff()).toBeFalse();
    expect(manager.plantIsTurningOn()).toBeFalse();
    expect(manager.plantIsTurningOff()).toBeFalse();
    expect(manager.nextPlantTransition()).toBeUndefined();
    expect(manager.currentPowerProduction()).toBeGreaterThan(0);
  });

  it("should eventually happen", function() {
    const manager = model.Manager(managerModel, state);
    manager.turnPlantOn();
    manager.updateState(state);
    let t = t0;
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.plantIsOn()).toBeTrue();
  });

  it("should be permanent", function() {
    expect(managerModel.controller).toBeDefined();
    const manager = model.Manager(managerModel, state);
    manager.turnPlantOn();
    manager.updateState(state);
    let t = t0;
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.plantIsOn()).toBeTrue();
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.plantIsOn()).toBeTrue();
    t = new Date(t.getTime() + 120_000);
    manager.updateState({date: t});
    expect(manager.plantIsOn()).toBeTrue(); // Fails
  });

  it("should be idempotent - turning on multiple times does not increase delay", function() {
    const manager = model.Manager(managerModel, state);
    expect(t0.getMilliseconds()).toEqual(0);
    manager.turnPlantOn();
    manager.updateState({date: t0});  // trigger transition
    // Turn on again 15 seconds later.
    const t1 = new Date(t0.getTime() + 15_000);
    manager.turnPlantOn();
    manager.updateState({date: t1});
    // 30 seconds after turning on, plant is on, full production.
    const t2 = new Date(t0.getTime() + 30_000);
    manager.turnPlantOn();
    manager.updateState({date: t2});
    expect(manager.plantIsOn()).toBeTrue();
    const t3 = new Date(t0.getTime() + 45_000);
    manager.updateState({date: t3});
    expect(manager.plantIsOn()).toBeTrue();
  });

});
