const assert = require('assert');

// TODO: use Wh or Ws ???
// Doesn't matter. Rename to something neutral.

// TODO: neat idea: add an efficiency constant (that could be lower than 1)
// so that some power is lost when charging (and discharging?).

/*
 * Models a battery with a certain charge.
 * Does not take into account that a real battery can only a charge and
 * discharge at a limited rate.
 * In other words, it can deliver or accept infinite power.
 */
exports.Battery = Battery;

function Battery(capacity, initialCharge=0) {

  const batteryCapacity = capacity;
  let batteryCharge = initialCharge;

  assert(batteryCapacity >= 0);
  enforceInvariants();

  const obj = {
    capacity() { return batteryCapacity; },
    currentCharge() { return batteryCharge; },
    currentChargePercent() { return (batteryCharge/batteryCapacity)*100; },
    remainingCapacity() { return batteryCapacity - batteryCharge; },

    /* Add some charge to the battery and return new battery charge.
     * Wh must be non-negative.
     * Wh must not exceed available capacity.
     */
    charge(Wh) {
      assert(Wh >= 0);
      const chargeCap = batteryCapacity - batteryCharge;
      assert(Wh <= chargeCap);
      batteryCharge += Wh;
      enforceInvariants();
      return batteryCharge;
    },

    /* Charge the battery as much as possible and return the excess, if any.
     * Result is always non-negative.
     * Wh must be non-negative.
     * Never charges beyond max capacity.
     */
    chargeToLimit(Wh) {
      assert(Wh >= 0);
      const chargeCap = batteryCapacity - batteryCharge;
      const excess = Wh - chargeCap;  // positive if too much to accept
      batteryCharge += Math.min(Wh, chargeCap);
      enforceInvariants();
      return Math.max(0, excess);
    },

    /* Remove some charge from the battery and return new battery charge.
     * Wh must be non-negative.
     * Wh must not exceed available charge.
     */
    discharge(Wh) {
      assert(Wh >= 0);
      assert(Wh <= batteryCharge);
      batteryCharge -= Wh;
      enforceInvariants();
      return batteryCharge;
    },

    /* Drain the battery as much as possible and return the charge deficit,
     * if any.
     * Result is always non-positive.
     * Wh must be non-negative.
     * Never discharges the battery beyond available charge.
     */
    dischargeToLimit(Wh) {
      assert(Wh >= 0);
      const deficit = batteryCharge - Wh;  // positive if too much to deliver
      batteryCharge -= Math.min(Wh, batteryCharge);
      enforceInvariants();
      if (deficit == -0) {
        return 0; // because -0 ≠ 0
      }
      return Math.min(0, deficit);
    },

    fill() {
      batteryCharge = batteryCapacity;
    },

    drain() {
      batteryCharge = 0;
    },

    /* Charge or discharge, depending on sign.
     * Adding a charge that is too positive yields a positive value.
     * Adding a charge that is too negative yields a negative value.
     */
    addDiffToLimit(Wh) {
      if (Wh < 0) {
        return this.dischargeToLimit(Math.abs(Wh));
      } else if (Wh > 0) {
        return this.chargeToLimit(Math.abs(Wh));
      }
      return 0; // No change.
    },
  };

  function enforceInvariants() {
    assert(batteryCharge <= batteryCapacity);
    assert(batteryCharge >= 0);
  }

  return obj;
}

