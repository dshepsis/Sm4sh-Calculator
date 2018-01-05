/* Note: this is similar to react-proptypes and I may replace it later. */
function validateProperties(obj, propTypes, errMsgOptions) {
  /* A prototype function is used here in-case obj does not
   * have Object as it's prototype (e.g. it was created using
   * `Object.create(null)`) */
  const hasProperty = (obj, prop)=>{
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  /* Check that obj has all of the keys that propTypes does: */
  for (const propName of Object.keys(propTypes)) {
    if (!hasProperty(obj, propName)) {
      throw new TypeError(
        `${errMsgOptions.name} must have a property called '${propName}.'`
      );
    }
    const expectedType = propTypes[propName];
    const givenPropValue = obj[propName];
    const givenType = (typeof givenPropValue);
    if (expectedType !== givenType) {
      throw new TypeError(
        `${errMsgOptions.name} had an invalid type for property '${propName}'. `+
        `Expected ${expectedType}. Received ${givenType}.`
      );
    }
  }
  /* Check that obj has no additional keys: */
  for (const propName of Object.keys(obj)) {
    if (!hasProperty(propTypes, propName)) {
      throw new TypeError(
        `${errMsgOptions.name} has an unrecognized property '${propName}.'`
      );
    }
  }
  return obj;
}

/**
 * A class for storing attributes of fighters. This is for data which is
 * inherent to a character, like weight or the ability to crawl. In-game
 * information like percent and velocity are stored in the Attacker class.
 */
const Fighter = (function() {
  const PROPERTIES = {
    name: 'string',
    weight: 'number',
    run_speed: 'number',
    walk_speed: 'number',
    air_speed: 'number',
    fall_speed: 'number',
    fast_fall_speed: 'number',
    base_air_acceleration: 'number',
    max_additional_air_acceleration: 'number',
    gravity: 'number',
    sh_air_time: 'number',
    jumps: 'number',
    wall_jump: 'boolean',
    wall_cling: 'boolean',
    crawl: 'boolean',
    tether: 'boolean',
    jumpsquat: 'number',
    soft_landing_lag: 'number',
    hard_landing_lag: 'number',
    fh_air_time: 'number',
    traction: 'number',
    air_friction: 'number',
    initial_dash: 'number',
    run_acceleration: 'number',
    run_deceleration: 'number',
    jump_height: 'number',
    hop_height: 'number',
    air_jump_height: 'number'
  };

  return class Fighter {
    constructor(fighterObj) {
      validateProperties(
        fighterObj,
        PROPERTIES,
        {name: "Parameter to Fighter Constructor"}
      );
      Object.assign(this, fighterObj);
      Object.freeze(this);
    }
  };
}());

/* Attach to global object: */
(function() {
  this.Fighter = Fighter;
}());
