const Battery = require('./battery.js').Battery;
const util = require('./util.js');
const assert = require('assert');

exports.Powerplant = Powerplant;

// TODO: can the plant only be on/off? Or 0-100 % on?
const OFF = 0;
const ON = 1;

function Powerplant(capacity, transitionDelay, initiallyOn=false, battery=Battery(0,0)) {

  let state = initiallyOn ? ON : OFF;
  let currentPower = state == ON ? capacity : 0;
  let transition = {
    state: undefined,
    when: undefined,
  };
  let production = undefined;
  let currentTime = undefined;

  const obj = {
    currentPowerProduction() { return currentPower; },
    offeringToGrid() { return electricityProduced; },
    currentBatteryCharge() { return battery.currentCharge(); },
    isTurningOn() { return state == OFF && transition.state == ON; },
    isTurningOff() { return state == ON && transition.state == OFF; },
    isOn() { return state == ON; },
    isOff() { return state == OFF; },
    transitionPoint() { return transition.when; },
    transitionDelay() { return transitionDelay; },
    transitionLeft() { return transition.when ? transition.when - currentTime : transition.when; },

    // TODO: Taking a time here might make sense, as a convenience, because
    // turning the plant on/off inherently depends on the current time.
    // But there's a risk it looks like we can specify "when" here.
    turnOn() {
      transition = computeStateTransition(ON);
      return this;
    },

    turnOff() {
      transition = computeStateTransition(OFF);
      return this;
    },

    // TODO: consider renaming!
    /*
     * Can take the current time in milliseconds or as a Date object.
     */
    setTime(time=now()) {
      time = util.toMilliseconds(time);
      initCurrentTime(time);
      assert(time >= currentTime);
      if (!(currentTime === undefined || time > currentTime)) {
        return this;
      }
      const duration = time - currentTime;
      currentTime = time;
      updateState(duration);
      return this;
    },

  };

  function initCurrentTime(time) {
    if (currentTime === undefined) {
      currentTime = time;
    }
  }

  /*
   * Note that the current power production is used, before calculating any
   * on/off transitions. In effect, the most recent state is used to compute the
   * production for the duration since the previous update.
   */
  function updateState(duration) {
    production = currentPower * duration;
    if (transitioning()) {
      executeTransition();
    }
  }

  function computeStateTransition(nextState) {
    assert(nextState == ON || nextState == OFF);
    assert(currentTime !== undefined);
    if (transitionPending()) {
      return transition;  // Transition already pending. Don't start a new one.
    }
    if (nopTransition(state, transition.state, nextState))  {
      return transition;  // Transition pointless. Don't start a new one.
    }
    // Looks like we're starting a transition.
    const when = currentTime + transitionDelay;
    return {state: nextState, when};
  }

  function executeTransition() {
    assert(transition.when !== undefined);
    assert(transition.state !== undefined);
    assert(state !== undefined);
    assert(transition.state !== state);
    assert(currentTime >= transition.when);
    state = transition.state;
    // Clear transition.
    transition.state = undefined;
    transition.when = undefined;
    if (state == ON) {
      currentPower = capacity;
    } else {
      currentPower = 0;
    }
  }

  function transitioning() {
    return transitionPending() && (currentTime >= transition.when);
  }

  function transitionPending() {
    // new state != current state should be impossible
    return transition.when !== undefined;
  }

  return obj;
}

// Is the desired state a NOP transition?
function nopTransition(currentState, currentTransition, desiredState) {
  // Already in that state or already transitioning to it.
  return currentState === desiredState || currentTransition === desiredState;
}
