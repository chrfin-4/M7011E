// Testing prosumer consumption model.
const ConsumptionModel = require('../prosumer.js').ConsumptionModel;

const t0 = new Date(2020, 11, 1, 0, 0, 0);

// Create a date for a certain time (and fixed date).
function time(h=0, m=0, s=0) {
  return new Date(2020, 11, 1, h, m, s);
}

function withHours(date, h) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h);
}

// --- Default args (no randomization) ---

describe("", function() {
  it("model for t = 0", function() {
    const consumption = ConsumptionModel()(t0);
    expect(consumption).toBeCloseTo(160);
  });

  it("model for t = 06:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 6));
    expect(consumption).toBeGreaterThan(100);  // morning peak
  });

  it("model for t = 08:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 8));
    expect(consumption).toBeGreaterThan(100);  // morning peak
  });

  it("model for t = 12:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 12));
    expect(consumption).toBeGreaterThan(150);  // lunch peak
  });

  it("model for t = 13:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 13));
    expect(consumption).toBeGreaterThan(150);  // lunch peak
  });

  it("model for t = 18:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 18));
    expect(consumption).toBeGreaterThan(300);  // evening peak + daily variance
  });

  it("model for t = 20:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 20));
    expect(consumption).toBeGreaterThan(300 + 100);  // evening peak + daily variance peak
  });

  it("model for t = 22:00", function() {
    const consumption = ConsumptionModel()(withHours(t0, 22));
    expect(consumption).toBeGreaterThan(300);  // evening peak + daily variance
  });
});

// --- Explicit args (no randomization) ---
// Should work identically.

const defaultArgs = {
  dayNightOffset: 0,
  dayNightScale: 1,
  peakOffset: 0,
  peakScale: 1,
  backgroundOffset: 0,
  backgroundScale: 1,
  noiseFunction: () => 0,
  randomizeMissing: true, // nop, since none are missing
};

describe("Consumption Model with explicit default args", function() {
  for (let i = 0; i < 24; i++) {
    const date = withHours(t0, i);
    it(`should be identical to implicit args for t0 + ${i} hours`, function() {
      expect(ConsumptionModel(defaultArgs)(date)).toEqual(ConsumptionModel()(date));
    });
  }
});

// --- Custom args (no randomization) ---

// TODO: similar to above, compare two models rather than literal values?
describe("with only day/night term, 20:00 day/night offset", function() {
  it("00:00 should match 20:00 day/night value", function() {
    const args = {
      dayNightOffset: 20*3600*1000,
      peakScale: 0,
      backgroundScale: 0,
    };
    const consumption = ConsumptionModel(args)(t0);
    expect(consumption).toBeCloseTo(200, 0);  // day/night maximum (evening peak is suppressed)
  });
});

describe("with only peak term, 20:00 day/night offset", function() {
  it("00:00 should match 20:00 evening peak", function() {
    const args = {
      dayNightOffset: 20*3600*1000,
      dayNightScale: 0,
      backgroundScale: 0,
    };
    const consumption = ConsumptionModel(args)(t0);
    expect(consumption).toBeCloseTo(300, 0);  // evening peak (day night variance is suppressed)
  });
});

describe("with day/night x10, peak x10, no background, 08:00 day/night offset, 01:00 peak offset", function() {
  it("00:00 should have no consumption", function() {
    const args = {
      dayNightOffset: 8*3600*1000,  // day night minimum (+0)
      dayNightScale: 10,            // 0 * 10 = 0
      peakOffset: 1*3600*1000,      // offset peaks by 1 hour so we miss the morning peak
      peakScale: 10,                // 0 * 10 = 0
      backgroundScale: 0,
    };
    const consumption = ConsumptionModel(args)(t0);
    expect(consumption).toBeCloseTo(0, 0);  // no consumption
  });
});

describe("with all terms suppressed, but adding constant noise", function() {
  it("the consumption should be equal to the noise at all times", function() {
    const args = {
      dayNightScale: 0,
      peakScale: 0,
      backgroundScale: 0,
      noiseFunction: () => 123,
      randomizeMissing: true,   // should make no difference
    };
    const consumption = ConsumptionModel(args)(new Date());
    expect(consumption).toBe(123);
  });
});
