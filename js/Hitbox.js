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
 * A class for storing attributes of hitboxes
 */
const Hitbox = (function() {
  const PROPERTIES = {
    id: 'number', //Lower ID takes priority
    prevLocation: 'object', //XY coordinate of hitbox center last frame
    currLocation: 'object', //Coordinate this frame
    classification: 'string', //Normal, aerial, special, throw, etc.
    baseDamage: 'number',
    baseKnockback: 'number',
    knockbackGrowth: 'number',
    angle: 'number',
    weightDependent: 'boolean',
    effects: 'object', //Electric, Fire, etc.
    properties: 'object', //Unblockable, disabled hitlag, etc.
  };

  return class Hitbox {
    constructor(hitboxObj) {
      validateProperties(
        hitboxObj,
        PROPERTIES,
        {varName: "Parameter to Hitbox Constructor"}
      );
      Object.assign(this, hitboxObj);
      Object.freeze(this);
    }
  };
}());

/* Attach to global object: */
(function() {
  this.Hitbox = Hitbox;
}());
