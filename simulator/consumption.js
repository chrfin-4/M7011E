const util = require('./util.js');
const getArgOrDefault = util.getArgOrDefault;
const normalDistribution = util.normalDistribution;

exports.ConsumptionModel = ConsumptionModel;

// TODO: (High priority?) Add a constant term.
// TODO: (Low priority) Also consider temperature: cold weather -> needs more heating -> greater consumption.
// TODO: take peak times that can be passed to the peaks function? (Could allow variable length peaks.)
// TODO: accept ranges (for offset and scale) instead of plain numbers?
/*
 * Returns a consumption model that is a function from simulation state
 * (primarily time) to power consumption.
 * Expected args:
 * peakOffset, peakScale, dayNightOffset, dayNightScale, backgroundOffset, backgroundScale, noiseFunction, randomizeMissing=false
 */
function ConsumptionModel(args) {
  const rng = normalDistribution();
  const m = 60*1000;
  const h = m*60;
  // Use random defaults for missing args?
  const randomizeMissing = getArgOrDefault(args, 'randomizeMissing', () => false);
  const defaults = cond(randomizeMissing);

  // default to 0 or randomize to ±2h
  const peakOffset = getArgOrDefault(args, 'peakOffset', defaults(rng(-2*h, 2*h), 0));  // equivalent to args?.peakOffset ?? (randomizeMissing ? rng(-2*h, 2*h) : 0);

  // default to 0 or randomize to ±12h
  const dayNightOffset = getArgOrDefault(args, 'dayNightOffset', defaults(rng(-12*h, 12*h), 0));

  // default to 0 or randomize to ±1000
  const backgroundOffset = getArgOrDefault(args, 'backgroundOffset', defaults(rng(-1000, 1000), 0));

  // default to 1 or randomize to ±½
  const peakScale = getArgOrDefault(args, 'peakScale', defaults(rng(0.5, 1.5), 1));

  // default to 1 or randomize to ±½
  const dayNightScale = getArgOrDefault(args, 'dayNightScale', defaults(rng(0.5, 1.5), 1));

  // default to 1 or randomize to ±½
  const backgroundScale = getArgOrDefault(args, 'backgroundScale', defaults(rng(0.5, 1.5), 1));

  // default to 0 or randomize to [0,50[
  const noiseFunction = getArgOrDefault(args, 'noiseFunction', defaults(() => () => rng(0, 50), () => () => 0)); // Add up to 50 W (25 on average)

  /* Takes a state containing current date/time. (Just a Date object also works.)
   */
  return function(state) {
    const date = state.date ?? state; // Work with both state and Date (deprecate?)
    const t = millisecondsSinceMidnight(date);
    const peak = peaks(t + peakOffset + dayNightOffset) * peakScale;  // peaks depend on both offsets
    const dayNight = dayNightVariance(t + dayNightOffset) * dayNightScale;
    const background = backgroundVariance(t + backgroundOffset) * backgroundScale;
    return peak + background + dayNight + noiseFunction();
  };
};

function cond(bool) {
  return function(a1, a2) {
    // Convert to functions if necessary.
    const f1 = util.constantFunction(a1);
    const f2 = util.constantFunction(a2);
    return bool ? f1 : f2;
  };
}

// TODO: use ms = util.fromHours(h)
/* Power consumption has peaks around certain times related to when people
 * work and sleep etc.
 * Takes time in milliseconds.
 */
function peaks(t) {
  const morningPeakStart = 6*60*60*1000;
  const morningPeakEnd = 8*60*60*1000;
  const morningPeakAmplitude = 100;
  const lunchPeakStart = 12*60*60*1000;
  const lunchPeakEnd = 13*60*60*1000;
  const lunchPeakAmplitude = 150;
  const eveningPeakStart = 18*60*60*1000;
  const eveningPeakEnd = 22*60*60*1000;
  const eveningPeakAmplitude = 300;
  if (t >= morningPeakStart && t <= morningPeakEnd) {
    return morningPeakAmplitude;
  } else if (t >= lunchPeakStart && t <= lunchPeakEnd) {
    return lunchPeakAmplitude;
  } else if (t >= eveningPeakStart && t <= eveningPeakEnd) {
    return eveningPeakAmplitude;
  } else {
    return 0;
  }
}

/* Add a small background oscillation with a period on the order of a few
 * seconds.
 * Time in milliseconds.
 */
function backgroundVariance(t) {
  return 10 * (1 + Math.sin(t*1000)); // FIXME: period
}

// TODO: maybe a millisecond resolution is counter productive?
// Maybe that is *too* smooth, and a choppier function would actually look more natural?
/* Adds a day/night cycle: large-scale oscillation with a period of 24 hours.
 * Half of the day has high consumption, half the day has low consumption.
 * Takes time in milliseconds.
 */
function dayNightVariance(t) {
  const P = 24*60*60*1000;  // The period is P = 24 h = 3,600,000 ms
  const b = (2*Math.PI)/P;
  const peakOffset = 20*60*60*1000;  // Peak is 20:00
  return 100 * (1 + Math.cos(b*(t-peakOffset)));
}

function millisecondsSinceMidnight(dateTime) {
  const minutes = dateTime.getHours() * 60 + dateTime.getMinutes();
  const seconds = minutes * 60 + dateTime.getSeconds();
  return seconds * 1000 + dateTime.getMilliseconds();
}
