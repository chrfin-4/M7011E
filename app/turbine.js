const assert = require('assert');
exports.WindTurbine = WindTurbine;

/*
 * A wind turbine takes a wind speed and returns a power output (in W).
 * The defaults are modeled after the quietrevolution QR6.
 * Uses a sigmoid function to make the power curve S-shaped.
 * This is not a great approximation.
 */
function WindTurbine(rating=7_000, cutIn=1.5, cutOut=20, max=16) {
  assert(cutIn >= 0);
  assert(cutOut >= 0);
  assert(rating >= 0);
  assert(cutOut >= cutIn);
  assert(max >= cutIn);
  assert(max <= cutOut);
  return (w) => power(w, rating, cutIn, cutOut, max);
}

function power(w, rating, cutIn, cutOut, max) {
  assert(w >= 0);
  if (w < cutIn || w > cutOut) {
    return 0;
  }
  if (w > max) {
    return rating;
  }

  // Map the interval [cutIn, max] to [-10, 10]
  // We can use either max or cut out as the end point of the interval.
  //const x = mapToInterval(cutIn, cutOut, -10, 10, w);
  const x = mapToInterval(cutIn, max, -10, 10, w);
  const power = rating*(sigmoid(x));
  assert(power >= 0);
  assert(power <= rating);
  return power;
}

function sigmoid(x) {
  return 1/(1 + Math.exp(-x));
}

function mapToInterval(startIn, endIn, startOut, endOut, x) {
  const intervalIn = endIn-startIn;
  const intervalOut = endOut-startOut;
  const k = intervalOut/intervalIn;
  return k*(x - startIn) + startOut;
}
