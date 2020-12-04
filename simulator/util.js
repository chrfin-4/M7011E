const assert = require('assert');

exports.assert = assert;
exports.milliseconds = toMilliseconds;  // deprecated
exports.toMilliseconds = toMilliseconds;
exports.toSeconds = toSeconds;
exports.toMinutes = toMinutes;
exports.toHours = toHours;
exports.fromSeconds = fromSeconds;
exports.fromMinutes = fromMinutes;
exports.fromHours = fromHours;

// TODO: make more strict so it fails for '0' and false as well?
// In other words, assert literally a number, or just "numbery"?
exports.assertIsNumber = function(v) {
  assert(v !== undefined);
  assert(v !== null);
  assert(v >= 0 || v <= 0); // not NaN
}

exports.getArgOrDefault = function(args, name, f) {
  return args?.[name] ?? f();
}

// Use uniform distribution to simulate normal distribution.
exports.normalDistribution = function(n=3) {
  assert(n >= 1);
  // By default randomizes in [0,1[, just like Math.random().
  return function(min=0, max=1) {
    let tmp = 0;
    for (let i = 0; i < n; i++) {
      tmp += Math.random();
    }
    const rand = tmp/n;
    return min + rand * (max - min);
  };
}

// If x is a function, return it unchanged.
// Otherwise return a function that returns x.
exports.constantFunction = function(x) {
  return typeof(x) === 'function' ? x : () => x;
}

// Force val to be in [lower, upper].
exports.forceBetween = function(val, lower, upper) {
  return Math.min(upper, Math.max(lower, val));
}

// Force val to be in [lower, upper].
exports.forceAtLeast = function(val, lower) {
  return exports.forceBetween(val, lower, Infinity);
}

// Force val to be in [lower, upper].
exports.forceAtMost = function(val, upper) {
  return exports.forceBetween(val, -Infinity, upper);
}

exports.now = function() {
  return new Date().getTime();
}

// TODO: Deprecated. Use toMilliseconds.
function milliseconds(date) {
  if (typeof(date) == 'number') {
    return date;
  }
  return date.getTime();
}

// Convert Date to milliseconds or return as is.
function toMilliseconds(date) {
  if (typeof(date) == 'number') {
    return date;
  }
  return date.getTime();
}

function toSeconds(date) {
  return toMilliseconds(date) / 1000;
}

function toMinutes(date) {
  return toMilliseconds(date) / 1000 / 60;
}

function toHours(date) {
  return toMilliseconds(date) / 1000 / 60 / 60;
}

function fromSeconds(s) {
  return s * 1000;
}

function fromMinutes(m) {
  return m * 1000 * 60;
}

function fromHours(h) {
  return h * 1000 * 60 * 60;
}
