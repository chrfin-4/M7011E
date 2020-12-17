const Weather = require('../weather.js').Weather;
const rng = require('../util.js').normalDistribution();

const lulea = { lat: 65.5839, lon: 22.1532 };
const now = new Date();

describe("wind speed (no randomization)", function() {

  const weather = Weather({randomize: false, lulea});

  it("should be highest in december", function() {
    const windNov = weather.windSpeed(new Date(2020, 10, 1));
    const windDec = weather.windSpeed(new Date(2020, 11, 15));
    const windJan = weather.windSpeed(new Date(2021, 01, 31));
    expect(windDec).toBeGreaterThan(windNov);
    expect(windDec).toBeGreaterThan(windJan);
  });

  it("should be lowest in june", function() {
    const windMay = weather.windSpeed(new Date(2020, 4, 1));
    const windJun = weather.windSpeed(new Date(2020, 5, 15));
    const windJul = weather.windSpeed(new Date(2021, 6, 31));
    expect(windJun).toBeLessThan(windMay);
    expect(windJun).toBeLessThan(windJul);
  });

  it("should vary by gps", function() {
    const gps1 = { lat: 65.123, lon: 22.123 };
    const gps2 = { lat: 65.234, lon: 22.123 };
    const gps3 = { lat: 65.123, lon: 22.234 };
    const wind1 = weather.windSpeed(now, gps1);
    const wind2 = weather.windSpeed(now, gps2);
    const wind3 = weather.windSpeed(now, gps3);
    expect(wind1).not.toBe(wind2);
    expect(wind1).not.toBe(wind3);
    expect(wind2).not.toBe(wind3);
  });

  it("should be deterministic", function() {
    const gps = { lat: rng(-180, 180), lon: rng(-90, 90) };
    const time = rng(0, now.getTime());
    // Always the same wind speed for identical time and place.
    expect(weather.windSpeed(time, gps)).toBe(weather.windSpeed(time, gps));
    expect(weather.windSpeed(time, gps)).toBe(weather.windSpeed(time, gps));
    expect(weather.windSpeed(time, gps)).toBe(weather.windSpeed(time, gps));
  });

});

describe("wind speed (with randomization)", function() {

  const weather = Weather({randomize: true, lulea});

  it("should vary for same time and place", function() {
    let different = false;
    let prev = weather.windSpeed(now);
    // Generating 10 wind speeds should yield at least one that is different!
    for (let i = 0; i < 10; i++) {
      const next = weather.windSpeed(now);
      if (next != prev) {
        different = true;
        break;
      }
      prev = next;
    }
    expect(different).toBe(true);
  });

  it("should vary within limits from one value to the next", function() {
    // FIXME: This is a hardcoded value that depends on the step size used in
    // the implementation. This should be a parameter that can be set from the
    // outside.
    const limit = 1; // +/- 0.5
    let prev = weather.windSpeed(now);
    for (let i = 0; i < 20; i++) {
      const next = weather.windSpeed(now);
      const diff = Math.abs(prev-next);
      expect(diff).toBeLessThanOrEqual(limit);
      prev = next;
    }
  });

});
