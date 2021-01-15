const util = require('./util.js');
const forceBetween = util.forceBetween;

exports.LinearPricingModel = LinearPricingModel;
exports.ConstantPricingModel = ConstantPricingModel;

function LinearPricingModel({initialPrice, slope, maxPrice, minPrice=0}) {
  return function(marketDemand, currentPrice) {
    const price = initialPrice + slope*marketDemand;
    return forceBetween(price, minPrice, maxPrice);
  }
}

function ConstantPricingModel({initialPrice}) {
  return function() {
    return initialPrice;
  }
}
