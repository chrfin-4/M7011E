const util = require('./util.js');
const rng = util.normalDistribution();

exports.Weather = Weather;

// GPS coordinates ignored for now.
function windSpeed(date, gps) {
  return rng(0, 10);
}

function Weather() {
  const obj = {
    windSpeed(time=util.now()) {
      return windSpeed(time);
    },
    currentWeather(time=util.now()) {
      return {
        when: time,
        windSpeed: this.windSpeed(time),
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
