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
 * A class for storing in-game properties of a fighter, including percent,
 * position, animation, etc.
 */
const Player = (function() {
  const PROPERTIES = {
    name: 'string', //Player 1, 2, etc. Maybe let people enter their tags
    fighter: 'object', //Instance of Fighter class
    currentAction: 'object', //Instance of Action class.
    port: 'number', //Determines things like simultaneous footstools and ledge grabs
    /* I'm not exactly sure what will be animation and what will be state, or if
     * we should even have both, but what I'm looking to cover here are
     * conditions like "in the air" "dash start" or "jab endlag". Frame counts
     * into those animations may also need to be stored. */
    animation: 'string',
    frameOfAnimation: 'number',
    state: 'object',

    percent: 'number',
    stalingQueue: 'object',

    position: 'object',
    velocity: 'object',

    analogueStickPosition: 'object'
  };

  return class Player {
    constructor(playerObj) {
      validateProperties(
        playerObj,
        PROPERTIES,
        {varName: "Parameter to Player Constructor"}
      );
      Object.assign(this, playerObj);
      /* All properties are mutable */
    }
  };
}());

/* Attach to global object: */
(function() {
  this.Player = Player;
}());
