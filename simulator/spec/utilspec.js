const util = require('../util.js');

// TODO: test util.milliseconds(date)

function assertIsNumber(x) {
  return () => util.assertIsNumber(x);
}

describe("assertIsNumber", function() {
  it("should fail for undefined", function() {
    expect(assertIsNumber(undefined)).toThrowError();
  });

  it("should fail for null", function() {
    expect(assertIsNumber(null)).toThrowError();
  });

  it("should fail for non-numeric string", function() {
    expect(assertIsNumber('hello')).toThrowError();
  });

  it("should fail for NaN", function() {
    expect(assertIsNumber(NaN)).toThrowError();
  });

  it("should pass for a number", function() {
    expect(assertIsNumber(3)).nothing();
  });

  // anything that can be converted to a number ('123' or false)
  // currently passes. Not testing this because it's unclear how
  // the function should be have in those cases.

});

describe("getArgOrDefault", function() {

  const argName = 'argName';
  const withArg = {argName: 3};
  const withUndefinedArg = {argName: undefined};
  const withMissingArg = {};
  const defaultValue = 5;

  it("should fail when args and default are missing", function() {
    expect(() => util.getArgOrDefault()).toThrow();
  });

  it("should be the argument value when present", function() {
    expect(util.getArgOrDefault(withArg, argName)).toBe(withArg[argName]);
  });

  it("should be the default value when value is missing", function() {
    expect(util.getArgOrDefault(withMissingArg, argName, () => defaultValue)).toBe(defaultValue);
  });

  it("should be the default value when value is undefined", function() {
    expect(util.getArgOrDefault(withUndefinedArg, argName, () => defaultValue)).toBe(defaultValue);
  });

  it("should be the default value when args is undefined", function() {
    expect(util.getArgOrDefault(undefined, argName, () => defaultValue)).toBe(defaultValue);
  });

  it("should be the default value when args is null", function() {
    expect(util.getArgOrDefault(null, argName, () => defaultValue)).toBe(defaultValue);
  });

});

describe("constantFunction", function() {
  const val = 3;
  const fun = () => 5;

  it("should return the same function when passed a function", function() {
    expect(util.constantFunction(fun)).toBe(fun);
    expect(util.constantFunction(fun)()).toBe(5);
  });

  it("should return a function returning the non-function constant it was given", function() {
    expect(util.constantFunction(val)()).toBe(val);
  });
});

function normalDistribution(n) {
  return () => util.normalDistribution(n);
}

describe("normalDistribution", function() {
  it("should fail when given < 1", function() {
    expect(normalDistribution(0)).toThrow();
    expect(normalDistribution(-1)).toThrow();
  });

  it("should return a function randomizing in [min,max[", function() {
    const rng = util.normalDistribution();
    for (let i = 0; i < 10; i++) {
      const x = rng(0, 0.1);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(0.1);  // strictly less
    }
    for (let i = 0; i < 10; i++) {
      const x = rng(10, 20);
      expect(x).toBeGreaterThanOrEqual(10);
      expect(x).toBeLessThan(20); // strictly less
    }
  });

  // when min = max, there is only one possible value.
  it("should return a function randomizing in [n,n]", function() {
    const rng = util.normalDistribution();
    for (let i = 0; i < 10; i++) {
      expect(rng(10,10)).toBe(10);
    }
  });
});

describe("forceBetween", function() {
  it("should increase a small value up to the lower limit", function() {
    expect(util.forceBetween(5, 10, 20)).toBe(10);
  });

  it("should decrease a large value down to the upper limit", function() {
    expect(util.forceBetween(30, 10, 20)).toBe(20);
  });

  it("should leave a value within the range unchanged", function() {
    expect(util.forceBetween(15, 10, 20)).toBe(15);
  });
});

describe("forceAtLeast", function() {
  it("should increase a small value up to the lower limit", function() {
    expect(util.forceAtLeast(5, 10)).toBe(10);
  });

  it("should leave a sufficiently large value unchanged", function() {
    expect(util.forceAtLeast(15, 10)).toBe(15);
  });
});

describe("forceAtMost", function() {
  it("should decrease a large value down to the lower limit", function() {
    expect(util.forceAtMost(10, 5)).toBe(5);
  });

  it("should leave a sufficiently small value unchanged", function() {
    expect(util.forceAtMost(5, 10)).toBe(5);
  });
});

describe("milliseconds", function() {
  it("should return numbers unchanged", function() {
    expect(util.milliseconds(12345)).toBe(12345);
  });

  it("should convert a Date object to milliseconds", function() {
    expect(util.milliseconds(new Date(12345))).toBe(12345);
  });
});
