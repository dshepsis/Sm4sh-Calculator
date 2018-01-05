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
 * A class for storing attributes of attacks and other actions such as jumps.
 * Contains only static data, not state (e.g. charged frames).
 */
const Action = (function() {
  const PROPERTIES = {
    name: 'string',
    id: 'string',
    classification: 'string', //Normal, aerial, special, throw, etc.
    baseDamage: 'number',
    knockbackGrowth: 'number',
    baseKnockBack: 'number',
    hitboxActive: 'object', //Array
    faf: 'number',
    landingLag: 'number', //Maybe find a way to make this kind of thing optional
    autoCancel: 'number',
    weightDependent: 'boolean',
  };

  return class Action {
    constructor(actionObj) {
      validateProperties(
        actionObj,
        PROPERTIES,
        {varName: "Parameter to Action Constructor"}
      );
      Object.assign(this, actionObj);
      Object.freeze(this);
    }
  };
}());

/* Attach to global object: */
(function() {
  this.Action = Action;
}());
