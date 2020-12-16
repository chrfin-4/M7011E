const WindTurbine = require('../turbine.js').WindTurbine;

describe("default wind turbine", function() {

  const turbine = WindTurbine();

  it("should generate 0 below the cut in speed", function() {
    expect(turbine(1.49)).toBe(0);
  });

  it("should generate 0 above the cut out speed", function() {
    expect(turbine(20.1)).toBe(0);
  });

  it("should generate close to 0 right at the cut in speed", function() {
    const power = turbine(1.5)
    expect(power).not.toBe(0);
    expect(power).toBeCloseTo(0, 0);
  });

  it("should generate close to 7 kW right at the max point", function() {
    const power = turbine(16)
    expect(power).not.toBe(7_000);
    expect(power).toBeCloseTo(7_000, 0);
  });

  it("should generate 7 kW above the max point", function() {
    const power = turbine(16.1)
    expect(power).toBe(7_000);
  });

  it("should generate 7 kW up to the cut off speed", function() {
    const power = turbine(20)
    expect(power).toBe(7_000);
  });

});
