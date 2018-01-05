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
        `${errMsgOptions.varName} must have a property called '${propName}.'`
      );
    }
    const expectedType = propTypes[propName];
    const givenPropValue = obj[propName];
    const givenType = (typeof givenPropValue);
    if (expectedType !== givenType) {
      throw new TypeError(
        `${errMsgOptions.varName} had an invalid type for property `+
        `'${propName}'. Expected ${expectedType}. Received ${givenType}.`
      );
    }
  }
  /* Check that obj has no additional keys: */
  for (const propName of Object.keys(obj)) {
    if (!hasProperty(propTypes, propName)) {
      throw new TypeError(
        `${errMsgOptions.varName} has an unrecognized property '${propName}.'`
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
    runSpeed: 'number',
    walkSpeed: 'number',
    airSpeed: 'number',
    fallSpeed: 'number',
    fastFallSpeed: 'number',
    baseAirAcceleration: 'number',
    maxAdditionalAirAcceleration: 'number',
    gravity: 'number',
    shAirTime: 'number',
    jumps: 'number',
    wallJump: 'boolean',
    wallCling: 'boolean',
    crawl: 'boolean',
    tether: 'boolean',
    jumpsquat: 'number',
    softLandingLag: 'number',
    hardLandingLag: 'number',
    fhAirTime: 'number',
    traction: 'number',
    airFriction: 'number',
    initialDash: 'number',
    runAcceleration: 'number',
    runDeceleration: 'number',
    jumpHeight: 'number',
    hopHeight: 'number',
    airJumpHeight: 'number'
  };

  return class Fighter {
    constructor(fighterObj) {
      validateProperties(
        fighterObj,
        PROPERTIES,
        {varName: "Parameter to Fighter Constructor"}
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
