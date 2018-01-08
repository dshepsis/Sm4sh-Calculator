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
 * A class for storing data which affects gameplay but isn't part of a player or
 * action. e.g. launch-rate.
 */
const Game = (function() {
  const PROPERTIES = {
    players: 'object', //An array of Player instances
    mode: 'string', //Stock / Time / Coin, etc.
    launchRate: 'number', //Genesis 0.9x lul
    ignoreStaling: 'boolean'
  };

  return class Game {
    constructor(gameObj) {
      validateProperties(
        gameObj,
        PROPERTIES,
        {varName: "Parameter to Game Constructor"}
      );
      Object.assign(this, gameObj);
      /* All properties are mutable */
    }
  };
}());

/* Attach to global object: */
(function() {
  this.Game = Game;
}());
