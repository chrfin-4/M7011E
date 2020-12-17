const util = require('./util.js');
const rng = util.normalDistribution();

exports.Weather = Weather;

// GPS coordinates ignored for now.
// Luleå: 65.5839, 22.1532
// The average wind speed is 3.27 m/s over the whole year.
// Average low = 2.76 m/s around June 15th.
// Average high = 3.78 m/s around december 4th.
function windSpeed(date, gps) {
  const t = util.toMilliseconds(date);
  const { lat, lon } = gps ?? { lat: 65.5839, lon: 22.1532 }  // XXX: defaults make sense?
  const P = 31557600*1000;  // The period is one year.
  const b = (2*Math.PI)/P;
  const peakOffset = 338*24*60*60*1000;  // Peak is december 4th
  const wind = 0.51 * (Math.cos(b*(t-peakOffset))) + 3.27;
  // XXX: This is kinda dubious. Not based on any real data.
  // Temporary way to get prosumers to experience different wind speeds.
  const personalization = 2*((100*lat-Math.round(100*lat)) + (100*lon-Math.round(100*lon)));
  return wind + personalization;
}

// TODO: add an arg for controlling the size of fluctuations.
function Weather({randomize, gps} = {}) {
  const min = 0;
  const max = 25;
  const maxOffset = 10;
  const minOffset = -10;
  const localizedTo = gps;
  let currentOffset = randomize ? rng(minOffset, maxOffset) : 0;

  const obj = {
    windSpeed(time=util.now(), gps) {
      const wind = windSpeed(time, gps);
      if (randomize) {
        currentOffset += rng(-0.5, 0.5);
        currentOffset = util.forceBetween(currentOffset, minOffset, maxOffset);
      }
      return util.forceBetween(wind + currentOffset, min, max);
    },

    currentWeather(time=util.now(), gps=localizedTo) {
      return {
        when: time,
        windSpeed: this.windSpeed(time, gps),
      };
    },
  };

  return obj;
}

// TODO:
// also add
// - cloud cover?
// - temperature?
// - amount of sunlight?
