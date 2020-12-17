const Sim = require('../model.js').Sim;
const Prosumer = require('../prosumer.js').Prosumer;
const util = require('../util.js');
const now = util.now;
const seconds = util.fromSeconds;

// TODO: sort out Sim args.

describe("Simulation.stopSimulation", function() {
  it("should fail if simulation is not running", function() {
    const sim = Sim();
    expect(() => sim.stopSimulation()).toThrowError();
  });

  it("should stop the simulation", function() {
    const sim = Sim();
    sim.startSimulation();
    sim.stopSimulation();
    expect(sim.isRunning()).toBeFalse();
  });

});

describe("Simulation.startSimulation", function() {
  it("should fail if simulation is already running", function() {
    const sim = Sim();
    sim.startSimulation();
    expect(() => sim.startSimulation()).toThrowError();
  });

  it("should start the simulation", function() {
    const sim = Sim();
    sim.startSimulation();
    expect(sim.isRunning()).toBeTrue();
  });

});

describe("Simulation.advanceBy", function() {
  it("should advance the simulation time by the specified amount", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    sim.advanceSimulationBy(seconds(2));
    expect(sim.simulationTime()).toBe(t0 + seconds(2));
  });

  it("should advance the simulation time by the specified steps", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    sim.advanceSimulationBy(seconds(2), 3);
    expect(sim.simulationTime()).toBe(t0 + seconds(2) * 3);
  });

  it("should fail if the interval is not positive", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    expect(() => sim.advanceSimulationBy(0, 3)).toThrowError();
    expect(() => sim.advanceSimulationBy(-1, 3)).toThrowError();
  });

  it("should fail if the simulation is running", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    sim.startSimulation();
    expect(() => sim.advanceSimulationBy(seconds(2))).toThrowError();
  });

});

describe("Simulation.advanceTo", function() {
  it("should advance the simulation time to the specified amount", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    sim.advanceSimulationTo(t0 + seconds(2));
    expect(sim.simulationTime()).toBe(t0 + seconds(2));
  });

  it("should advance the simulation time by the specified steps", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    // Relies on implementation detail to indirectly count steps.
    spyOn(sim, 'advanceSimulationBy').and.callThrough();  // NOTE: advance to is implemented using advance by
    sim.advanceSimulationTo(t0 + seconds(6), 3);
    expect(sim.simulationTime()).toBe(t0 + seconds(6));
    expect(sim.advanceSimulationBy).toHaveBeenCalledTimes(1);
    expect(sim.advanceSimulationBy).toHaveBeenCalledWith(seconds(2), 3);
  });

  it("should fail if the target time is not in the future", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    expect(() => sim.advanceSimulationTo(t0)).toThrowError();
    expect(() => sim.advanceSimulationTo(t0 - 1)).toThrowError();
  });

  it("should fail if the simulation is running", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    sim.startSimulation();
    expect(() => sim.advanceSimulationTo(t0 + seconds(2))).toThrowError();
  });

});

describe("running simulation", function() {

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  // TODO: use separate test cases for different speeds.

  it("at 2x speed for 1 second with a 0.1 second interval should advance time by 2 seconds", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0, 2); // 2x speed
    sim.startSimulation(100);
    jasmine.clock().tick(1000);
    expect(sim.simulationTime()).toBe(t0 + seconds(2));
  });

  it("should be stopped by stopSimulation", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0, 0.5); // 0.5x speed
    sim.startSimulation(1000);  // update each second (by 0.5 seconds)
    jasmine.clock().tick(2000); // for 2 seconds
    expect(sim.simulationTime()).toBe(t0 + seconds(1));
    sim.stopSimulation();
    jasmine.clock().tick(2000);
    expect(sim.simulationTime()).toBe(t0 + seconds(1)); // same time
  });

});

describe("restarting simulation", function() {

  beforeEach(function() {
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  // FIXME: cleanup (in particular fix the documentation/description)

  it("should cancel periodic updates", function() {
    const t0 = now();
    const sim = Sim(null, undefined, t0);
    expect(sim.simulationTime()).toBe(t0);
    sim.startSimulation(1000);  // update each second
    expect(sim.simulationTime()).toBe(t0);
    jasmine.clock().tick(1500); // one update
    expect(sim.simulationTime()).toBe(t0 + seconds(1));
    sim.stopSimulation(); // Stopping before second update
    expect(sim.simulationTime()).toBe(t0 + seconds(1));
    sim.startSimulation(1000);  // Start again (scheduling an update 1 second from now)
    jasmine.clock().tick(1000); // Advancing time 1 second.
    expect(sim.simulationTime() - t0).toBe(seconds(2)); // Two 1 second updates should have happened.
  });

});

describe("blackout", function() {
  it("should be true if at least one prosumer is experiencing blackout", function() {
    const prosumer1 = Prosumer({consumption: () => 0, production: () => 0});
    const prosumer2 = Prosumer({consumption: () => 1, production: () => 0});
    const sim = Sim({1: prosumer1, 2: prosumer2});
    expect(prosumer1.isBlackedOut()).toBe(false);
    expect(prosumer2.isBlackedOut()).toBe(false);
    expect(sim.blackout()).toBe(false);
    sim.advanceSimulationBy(1);
    expect(prosumer1.isBlackedOut()).toBe(false);
    expect(prosumer2.isBlackedOut()).toBe(true);
    expect(sim.blackout()).toBe(true);
  });

  it("should be false if at no prosumer is experiencing blackout", function() {
    const prosumer1 = Prosumer({consumption: () => 0, production: () => 0});
    const prosumer2 = Prosumer({consumption: () => 0, production: () => 0});
    const sim = Sim({1: prosumer1, 2: prosumer2});
    sim.advanceSimulationBy(1);
    expect(sim.blackout()).toBe(false);
  });

});
