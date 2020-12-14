const Battery = require('../battery.js').Battery;

const capacity = 1000;

describe("Battery", function() {
  it("should not accept an undefined capacity", function() {
    expect(() => Battery()).toThrowError();
    expect(() => Battery(undefined)).toThrowError();
  });

  it("should not accept a negative capacity", function() {
    expect(() => Battery(-1)).toThrowError();
    expect(() => Battery(-1, -1)).toThrowError();
  });

  it("should not accept a negative initial charge", function() {
    expect(() => Battery(capacity, -1)).toThrowError();
    expect(() => Battery(-1, -1)).toThrowError();
  });

  it("should not accept an initial charge larger than capacity", function() {
    expect(() => Battery(capacity, capacity+1)).toThrowError();
  });

  it("should use an initial charge of 0 by default", function() {
    const battery = Battery(capacity);
    expect(battery.currentCharge()).toEqual(0);
  });

  it("should use the provided initial capacity", function() {
    const battery = Battery(capacity, 123);
    expect(battery.currentCharge()).toEqual(123);
  });
});

describe("Battery.chargeToLimit", function() {
  it("should not accept negative numbers", function() {
    const battery = Battery(capacity);
    expect(() => battery.chargeToLimit(-1)).toThrowError();
  });

  it("should return 0 when charged exactly to capacity", function() {
    const battery = Battery(capacity);
    expect(battery.chargeToLimit(capacity)).toEqual(0);
  });

  it("should return the excess charge when exceeding capacity", function() {
    const battery = Battery(capacity);
    expect(battery.chargeToLimit(capacity+1)).toEqual(1);
  });

  it("should return 0 when charging within capacity", function() {
    const battery = Battery(capacity);
    expect(battery.chargeToLimit(capacity-1)).toEqual(0);
  });

  it("should charge the battery", function() {
    const battery = Battery(capacity);
    battery.chargeToLimit(1);
    expect(battery.currentCharge()).toEqual(1);
  });

});

describe("Battery.dischargeToLimit", function() {
  it("should not accept negative numbers", function() {
    const battery = Battery(capacity, capacity);
    expect(() => battery.dischargeToLimit(-1)).toThrowError();
  });

  it("should return 0 when discharged exactly to capacity", function() {
    const battery = Battery(capacity, capacity);
    expect(battery.dischargeToLimit(capacity)).toEqual(0);
  });

  it("should return the (negative) deficit when exceeding available charge", function() {
    const battery = Battery(capacity, capacity);
    expect(battery.dischargeToLimit(capacity+1)).toEqual(-1);
  });

  it("should return 0 when discharging within capacity", function() {
    const battery = Battery(capacity, capacity);
    expect(battery.dischargeToLimit(capacity-1)).toEqual(0);
  });

  it("should discharge the battery", function() {
    const battery = Battery(capacity, capacity);
    battery.dischargeToLimit(capacity-1);
    expect(battery.currentCharge()).toEqual(1);
  });

});

describe("Battery.addDiffToLimit", function() {
  it("should return a positive number when adding too much", function() {
    const battery = Battery(capacity, 0);
    expect(battery.addDiffToLimit(capacity+1)).toEqual(1);
  });

  it("should return 0 when adding within capacity", function() {
    const battery = Battery(capacity, 0);
    expect(battery.addDiffToLimit(10)).toEqual(0);
  });

  it("should return a negative number when removing too much", function() {
    const battery = Battery(capacity, 0);
    expect(battery.addDiffToLimit(-1)).toEqual(-1);
  });

  it("should return 0 when removing within capacity", function() {
    const battery = Battery(capacity, capacity);
    expect(battery.addDiffToLimit(-1)).toEqual(0);
  });
});

describe("Battery.charge", function() {
  it("should not accept negative numbers", function() {
    const battery = Battery(capacity);
    expect(() => battery.charge(-1)).toThrowError();
  });

  it("should not accept a charge in excess of capacity", function() {
    const battery = Battery(capacity);
    expect(() => battery.charge(capacity+1)).toThrowError();
  });

  it("should charge the battery", function() {
    const battery = Battery(capacity);
    expect(battery.charge(1)).toEqual(1);
  });
});

describe("Battery.discharge", function() {
  it("should not accept negative numbers", function() {
    const battery = Battery(capacity, capacity);
    expect(() => battery.discharge(-1)).toThrowError();
  });

  it("should not accept a load in excess of available charge", function() {
    const battery = Battery(capacity, capacity);
    expect(() => battery.discharge(capacity+1)).toThrowError();
  });

  it("should discharge the battery", function() {
    const battery = Battery(capacity, capacity);
    expect(battery.discharge(capacity-1)).toEqual(1);
  });
});
