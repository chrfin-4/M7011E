const LinearPricing = require('../pricing.js').LinearPricingModel;

describe("linear pricing model", function() {

  const initialPrice = 23.50;
  const capacity = 1000;
  const slope = 1/1000;
  const maxPrice = 50;
  const minPrice = 10;

  const model = LinearPricing({initialPrice, slope, maxPrice, minPrice});

  it("should return the initial price when demand is 0", function() {
    expect(model(0)).toBeCloseTo(initialPrice);
  });

  it("should return the minimum price when demand is very negative", function() {
    expect(model(-1e6)).toBeCloseTo(minPrice);
  });

  it("should return the maximum price when demand is very positive", function() {
    expect(model(1e6)).toBeCloseTo(maxPrice);
  });

  it("should return a value above the initial price when demand is positive", function() {
    const demand = capacity/20;
    const price = model(demand);
    expect(price).toBeGreaterThan(initialPrice);
    expect(price).toBeLessThan(maxPrice);
    expect(price).toBeCloseTo(initialPrice + slope*demand);
  });

  it("should return a value below the initial price when demand is negative", function() {
    const demand = -capacity/20;
    const price = model(demand);
    expect(price).toBeLessThan(initialPrice);
    expect(price).toBeGreaterThan(minPrice);
    expect(price).toBeCloseTo(initialPrice + slope*demand);
  });

});
