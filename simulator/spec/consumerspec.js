const Consumer = require('../consumer.js').Consumer;

const now = new Date();
const highConsumption = 100;
const lowConsumption = 10;

let consumer;

describe("when instantiating a consumer with low consumption", function() {

  const model = constantModel(lowConsumption);

  beforeEach(function() {
    consumer = Consumer({consumption: model.consumption, state: initialState()});
  });

  it("it should be defined", function() {
    expect(consumer).toBeDefined();
  });

  it("current production should be 0", function() {
    expect(consumer.currentPowerProduction()).toBe(0);
  });

  it(`current consumption should be ${lowConsumption}`, function() {
    expect(consumer.currentPowerConsumption()).toBe(lowConsumption);
  });

  describe("after updating with an interval of 2", function() {

    beforeEach(function() {
      consumer.startUpdate(initialState().plus(2));
    });

    // XXX eh, does it make sense to test this?
    it(`net production should be 0`, function() {
      expect(consumer.netProduction()).toBe(-20);
    });

    it(`should not offer to sell`, function() {
      expect(consumer.offeringToGrid()).toBe(0);
    });

    it(`net demand should be 2 x ${lowConsumption}`, function() {
      expect(consumer.netDemand()).toBe(lowConsumption*2);
    });

    it('should not accept more from the grid than requested', function() {
      expect(() => consumer.buyFromGrid(100)).toThrowError();
    });

    it('should accept electricity from the grid', function() {
      expect(consumer.buyFromGrid(10)).nothing();
    });

    it('should be in blackout if not getting enough electricity', function() {
      expect(consumer.buyFromGrid(10)).nothing();
      consumer.finishUpdate();
      expect(consumer.isBlackedOut()).toBeTrue();
    });

    it('should not be in blackout if getting enough electricity', function() {
      expect(consumer.buyFromGrid(20)).nothing();
      consumer.finishUpdate();
      expect(consumer.isBlackedOut()).toBeFalse();
    });

  });

});

function initialState(t0=now) {
  return {
    date: t0,
    plus(seconds=1) {
      return initialState(new Date(t0.getTime() + seconds*1000));
    },
    // TODO: withWeather
  };
}

// TODO: just return the function, not an object
function constantModel(consumption) {
  return {
    consumption: () => consumption,
  };
}
