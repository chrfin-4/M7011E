const Powerplant = require('../powerplant.js').Powerplant;

const capacity = 1000;
const transitionDelay = 30_000;
const initiallyOn = true;
const initiallyOff = false;
const t0 = new Date(2020, 11, 1, 0, 0, 0);
const t_10s = new Date(t0.getTime() + 10_000);
const t_20s = new Date(t0.getTime() + 20_000);
const t_30s = new Date(t0.getTime() + 30_000);

describe("Powerplant", function() {
  it("should be initially off by default", function() {
    const plant = Powerplant(capacity, transitionDelay);
    expect(plant.isOn()).toBeFalse();
    expect(plant.isOff()).toBeTrue();
  });

  it("should initially not be transitioning", function() {
    const plant = Powerplant(capacity, transitionDelay);
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeFalse();
  });

  it("should have 0 production if initially off", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    expect(plant.currentPowerProduction()).toEqual(0);
  });

  it("should have max production if initially on", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    expect(plant.currentPowerProduction()).toEqual(capacity);
  });

});

describe("plant.turnOn", function() {
  it("should fail of no time has been set", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    expect(() => plant.turnOn()).toThrowError();
  });

  it("should set a transition point when starting a transition", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOn();
    expect(plant.transitionPoint()).toEqual(t0.getTime() + transitionDelay);
  });

  it("should start a transition if initially off and not already transitioning", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOn();
    expect(plant.isTurningOn()).toBeTrue();
    expect(plant.isTurningOff()).toBeFalse();
    // Still off.
    expect(plant.isOn()).toBeFalse();
    expect(plant.isOff()).toBeTrue();
  });

  it("should not start a transition if initially on", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOn();
    // No transition.
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeFalse();
    // Still on.
    expect(plant.isOn()).toBeTrue();
    expect(plant.isOff()).toBeFalse();
  });

  it("should be delayed", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOn();
    plant.setTime(t_10s);
    expect(plant.isOn()).toBeFalse();
    expect(plant.isTurningOn()).toBeTrue();
    plant.setTime(t_30s);
    expect(plant.isOn()).toBeTrue();
    expect(plant.isTurningOn()).toBeFalse();
  });

  it("should be idempotent", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOn();
    plant.setTime(t_10s);
    expect(plant.isOn()).toBeFalse();
    plant.turnOn();
    plant.setTime(t_20s);
    expect(plant.isOn()).toBeFalse();
    plant.turnOn();
    plant.setTime(t_30s);
    expect(plant.isOn()).toBeTrue();
  });

  it("should not start a transition if already transitioning to OFF", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOff();
    //plant.turnOn();   // TODO: not 100 % clear how this should be handled
    plant.setTime(t_10s);
    plant.turnOn();
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeTrue();
    plant.setTime(t_30s);
    expect(plant.isOn()).toBeFalse();
    expect(plant.isOff()).toBeTrue();
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeFalse();
  });

});

describe("plant.turnOff", function() {
  it("should fail of no time has been set", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    expect(() => plant.turnOff()).toThrowError();
  });

  it("should set a transition point when starting a transition", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOff();
    expect(plant.transitionPoint()).toEqual(t0.getTime() + transitionDelay);
  });

  it("should start a transition if initially on and not already transitioning", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOff();
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeTrue();
    // Still on.
    expect(plant.isOn()).toBeTrue();
    expect(plant.isOff()).toBeFalse();
  });

  it("should not start a transition if initially off", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOff();
    // No transition.
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeFalse();
    // Still ff.
    expect(plant.isOn()).toBeFalse();
    expect(plant.isOff()).toBeTrue();
  });

  it("should be delayed", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOff();
    plant.setTime(t_10s);
    expect(plant.isOff()).toBeFalse();
    expect(plant.isTurningOff()).toBeTrue();
    plant.setTime(t_30s);
    expect(plant.isOff()).toBeTrue();
    expect(plant.isTurningOff()).toBeFalse();
  });

  it("should be idempotent", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOn);
    plant.setTime(t0);
    plant.turnOff();
    plant.setTime(t_10s);
    expect(plant.isOff()).toBeFalse();
    plant.turnOff();
    plant.setTime(t_20s);
    expect(plant.isOff()).toBeFalse();
    plant.turnOff();
    plant.setTime(t_30s);
    expect(plant.isOff()).toBeTrue();
  });

  it("should not start a transition if already transitioning to ON", function() {
    const plant = Powerplant(capacity, transitionDelay, initiallyOff);
    plant.setTime(t0);
    plant.turnOn();
    //plant.turnOff();   // TODO: not 100 % clear how this should be handled
    plant.setTime(t_10s);
    plant.turnOff();
    expect(plant.isTurningOn()).toBeTrue();
    expect(plant.isTurningOff()).toBeFalse();
    plant.setTime(t_30s);
    expect(plant.isOn()).toBeTrue();
    expect(plant.isOff()).toBeFalse();
    expect(plant.isTurningOn()).toBeFalse();
    expect(plant.isTurningOff()).toBeFalse();
  });

});
