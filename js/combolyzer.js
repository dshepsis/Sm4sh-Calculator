'use strict';

function HitAdvantage(hitstun, hitframe, faf) {
  return hitstun - (faf - (hitframe + 1));
}

const parameters = Object.freeze({
  di: 0.17,
  lsi_max: 1.095,
  lsi_min: 0.92,
  decay: 0.051,
  gravity: Object.freeze({
    mult: 5,
    constant: 0.075
  }),
  bounce: 0.8,
  crouch_cancelling: 0.85,
  crouch_hitlag: 0.67,
  interrupted_smash: 1.2,
  buried_kb_mult: 0.7,
  buried_kb_threshold: 70,
  hitstun: 0.4,
  launch_speed: 0.03,
  tumble_threshold: 32,
  hitlag: Object.freeze({
    mult: 0.3846154,
    constant: 5
  }),
  hitstunCancel: Object.freeze({
    frames: Object.freeze({
      aerial: 45,
      airdodge: 40
    }),
    launchSpeed: Object.freeze({
      aerial: 2,
      airdodge: 2.5
    })
  }),
  paralyzer: Object.freeze({
    constant: 14,
    mult: 0.025
  })
});

function Hitstun(kb, windbox, electric, ignoreReeling) {
  if (windbox) {
    return 0;
  }
  let hitstun = Math.floor(kb * parameters.hitstun) - 1;
  if (!ignoreReeling) {
    if (kb * parameters.hitstun >= parameters.tumble_threshold) {
      hitstun++;
    }
  }
  //Electric moves deal +1 hitstun https://twitter.com/Meshima_/status/786780420817899521
  if (electric) {
    hitstun++;
  }
  if (hitstun < 0) {
    return 0;
  }
  return hitstun;
}

function StickSensibility(value) {
  if (value < 24 && value > -24)
    return 0;
  if (value > 118)
    return 1;
  if (value < -118)
    return -1;
  return value / 118;
}

function DI(stick, launchSpeed, totalLaunchSpeed) {
  if (totalLaunchSpeed < 0.00001) //There is an if on MSC but it shouldn't happen since it requires tumble for DI to work
    return Math.atan2(launchSpeed.Y, launchSpeed.X) * 180 / Math.PI;

  if (Math.abs(Math.atan2(launchSpeed.Y, launchSpeed.X)) < parameters.di) //Cannot DI if launch angle is less than DI angle change param
    return Math.atan2(launchSpeed.Y, launchSpeed.X) * 180 / Math.PI;

  const X = StickSensibility(stick.X);
  const Y = StickSensibility(stick.Y);

  const check = Y * launchSpeed.X - X * launchSpeed.Y < 0;

  const variation = Math.abs(X * launchSpeed.Y - Y * launchSpeed.X) / totalLaunchSpeed;

  const di = parameters.di * variation;

  let angle = 0;

  if (check)
    angle = (Math.atan2(launchSpeed.Y, launchSpeed.X) - di) * 180 / Math.PI;
  else
    angle = (Math.atan2(launchSpeed.Y, launchSpeed.X) + di) * 180 / Math.PI;

  if (angle < 0)
    angle += 360;

  return angle;
}

function LSI(stickY, launch_angle) {
  if (launch_angle > 65 && launch_angle < 115)
    return 1;
  if (launch_angle > 245 && launch_angle < 295)
    return 1;

  const Y = StickSensibility(stickY);
  if (Y >= 0)
    return 1 + (parameters.lsi_max - 1) * Y;
  return 1 - (1 - parameters.lsi_min) * -Y;
}

class Knockback {
  constructor(kb, angle, gravity, fall_speed, target_is_in_air, windbox, electric, percent, set_weight, stick, launch_rate) {
    this.base_kb = kb;
    this.kb = this.base_kb;
    this.original_angle = angle;
    this.base_angle = angle;
    this.angle_with_di = angle;
    this.angle = angle;
    this.gravity = gravity;
    this.target = target_is_in_air;
    this.windbox = windbox;
    this.set_weight = set_weight;
    this.tumble = false;
    this.can_jablock = false;
    this.di_able = false;
    this.fall_speed = fall_speed;
    this.add_gravity_speed = parameters.gravity.mult * (this.gravity - parameters.gravity.constant);
    this.percent = percent;
    this.reeling = false;
    this.spike = false;
    this.di_change = 0;
    this.launch_speed = LaunchSpeed(kb);
    this.lsi = 1;
    this.horizontal_launch_speed = 0;
    this.vertical_launch_speed = 0;
    this.launch_rate = launch_rate;
    this.electric = electric;
    if (this.launch_rate === undefined) {
      this.launch_rate = 1;
    }
    if (stick === undefined) {
      this.stick = {
        X: 0,
        Y: 0
      };
    } else {
      this.stick = stick;
    }
    this.calculate = function () {
      this.kb = this.base_kb * this.launch_rate;
      if (this.original_angle === 361) {
        this.base_angle = SakuraiAngle(this.kb, this.target);
      }
      this.angle = this.base_angle;
      if (this.base_angle !== 0 && this.base_angle !== 180) {
        this.tumble = this.kb > 80 && !windbox;
      }
      if ((this.base_angle === 0 || this.base_angle === 180) && this.target) {
        this.tumble = this.kb > 80 && !windbox;
      }

      this.add_gravity_speed = parameters.gravity.mult * (this.gravity - parameters.gravity.constant);
      if (!this.tumble || this.set_weight) {
        this.add_gravity_speed = 0;
      }

      this.x = Math.cos(this.angle * Math.PI / 180) * this.kb;
      this.y = Math.sin(this.angle * Math.PI / 180) * this.kb;
      this.launch_speed = LaunchSpeed(this.kb);
      this.horizontal_launch_speed = this.launch_speed * Math.cos(this.angle * Math.PI / 180);
      this.vertical_launch_speed = (this.launch_speed * Math.sin(this.angle * Math.PI / 180)) + this.add_gravity_speed;

      this.angle = GetAngle(this.horizontal_launch_speed, this.vertical_launch_speed);

      if (this.windbox && !this.target)
        this.vertical_launch_speed = 0;

      this.di_able = this.tumble && Math.abs(Math.atan2(this.vertical_launch_speed, this.horizontal_launch_speed)) >= parameters.di;

      if (this.di_able && (this.stick.X !== 0 || this.stick.Y !== 0)) {

        this.launch_speed = Math.sqrt(Math.pow(this.horizontal_launch_speed, 2) + Math.pow(this.vertical_launch_speed, 2)); //Include gravity boost to the new launch speed (yes this only happens when stick isn't on neutral)

        this.angle = DI(this.stick, {
          X: this.horizontal_launch_speed
          , Y: this.vertical_launch_speed
        }, this.launch_speed);

        this.angle_with_di = this.angle;

        this.lsi = LSI(this.stick.Y, this.angle);

        this.launch_speed *= this.lsi;

        this.horizontal_launch_speed = this.launch_speed * Math.cos(this.angle * Math.PI / 180);
        this.vertical_launch_speed = (this.launch_speed * Math.sin(this.angle * Math.PI / 180));

      }

      this.x = Math.abs(Math.cos(this.angle * Math.PI / 180) * this.kb);
      this.y = Math.abs(Math.sin(this.angle * Math.PI / 180) * this.kb);

      this.horizontal_launch_speed = Math.abs(this.horizontal_launch_speed);
      this.vertical_launch_speed = Math.abs(this.vertical_launch_speed);


      this.can_jablock = false;
      if (this.angle === 0 || this.angle === 180 || this.angle === 360) {
        if (this.kb !== 0 && !this.windbox && !this.target) {
          this.can_jablock = true;
        }
      }
      this.spike = this.angle >= 230 && this.angle <= 310;
      if (this.spike) {
        if (this.kb !== 0 && !this.windbox && !this.target) {
          this.can_jablock = !this.tumble;
        }
      }

      if (this.angle <= 70 || this.angle >= 110) {
        this.reeling = this.tumble && !this.windbox && this.percent >= 100;
      }

      this.hitstun = Hitstun(this.base_kb, this.windbox, this.electric);
    };
    this.addModifier = function (modifier) {
      this.base_kb *= modifier;
      this.calculate();
    };
    this.bounce = function (bounce) {
      if (bounce) {
        this.vertical_launch_speed *= parameters.bounce;
        this.horizontal_launch_speed *= parameters.bounce;
      }
    };
    this.calculate();
  }
}

/**
 * Properties of the attack:
 * - base_damage
 * - damage
 * - kbg
 * - bkb
 * - angle
 * - windbox
 * - electric
 * - set_wiehgt
 *
 * Properties of the attacker:
 * - stalingQueue
 * - attacker_percent
 *
 * Properties of the target:
 * - percent
 * - weight
 * - gravity
 * - fall_speed
 * - r
 * - in_air
 * - stick
 *
 * Other (Game?):
 * - ignoreStale
 * - launch_rate
 */

/*function VSKB_OLD(
  percent, base_damage, damage, weight, kbg, bkb, gravity, fall_speed, r,
  stalingQueue, ignoreStale, attacker_percent, angle, in_air, windbox,
  electric, set_weight, stick, launch_rate
) {

  const staleness = StaleNegation(stalingQueue, ignoreStale);
  const targetDamageAfterHit = percent + damage * staleness;

  let initKB = targetDamageAfterHit * base_damage * (1 - (1 - staleness) * 0.3);
  initKB /= 20;
  initKB += targetDamageAfterHit / 10;
  initKB *= 1.4 * (200 / (weight + 100));
  initKB += 18;
  initKB *= kbg / 100;
  initKB += bkb;
  initKB *= r * Rage(attacker_percent);
  //r = 0.85 for crouch cancel, 1.2 for hitting someone charging a smash attack


  return new Knockback(
    initKB,
    angle,
    gravity,
    fall_speed,
    in_air,
    windbox,
    electric,
    targetDamageAfterHit,
    set_weight,
    stick,
    launch_rate
  );
}*/

function arrSum(arr, initVal=0) {
  const len = arr.length;
  let sum = initVal;
  for (let i = 0; i < len; ++i) sum += arr[i];
  return sum;
}

function VSKB(attackingPlayer, targetPlayer, game) {
  console.warn(attackingPlayer);
  const {
    stalingQueue,
    damageGivenMultiplier,
    percent: atkrPercent,
    currentAction: attack,
    fighter: atkrFighter,
  } = attackingPlayer;

  const {overrides: atkrOverrides} = atkrFighter;

  /* Lucario's Aura effect modifies the base damage of his attacks: */
  const hitboxDamages = attack.hitboxes.map(hbx=>{
    let dmg = hbx.baseDamage;
    if (atkrOverrides.baseDamage) {
      dmg = atkrOverrides.baseDamage(dmg, attackingPlayer, targetPlayer, game);
    }
    return dmg;
  });

  const {
    baseKnockback,
    knockbackGrowth,
    angle,
  } = lastValue(attack.hitboxes);

  const {
    damageTakenMultiplier,
    analogueStickPosition,
    percent: trgtPercent,
    fighter: trgtFighter,
    animation: trgtAnim,
    state: trgtState,
  } = targetPlayer;

  const {
    gravity,
    fallSpeed,
    weight: trgtWeight,
  } = trgtFighter;

  const {ignoreStaling, launchRate} = game;

  const staleness = StaleNegation(stalingQueue, ignoreStaling);
  const totalHitboxDmg = (
    arrSum(hitboxDamages)*
    damageGivenMultiplier*
    damageTakenMultiplier*
    staleness
  );
  const trgtPercentAfterHit = trgtPercent + totalHitboxDmg;
  const launchDamage = lastValue(hitboxDamages);

  let initKB = trgtPercentAfterHit * launchDamage * (1 - (1 - staleness) * 0.3);
  initKB /= 20;
  initKB += trgtPercentAfterHit / 10;
  initKB *= 1.4 * (200 / (trgtWeight + 100));
  initKB += 18;
  initKB *= knockbackGrowth / 100;
  initKB += baseKnockback;
  initKB *= Rage(atkrPercent);

  let overallMultiplier = 1;
  if (trgtAnim === 'crouching') overallMultiplier = 0.85;
  else if (trgtAnim === 'smashCharge') overallMultiplier = 1.2;
  initKB *= overallMultiplier;

  return new Knockback(
    initKB,
    angle,
    gravity,
    fallSpeed,
    trgtState.includes('inAir'),
    false, //Is this hitbox a windbox?
    false, //Is this hitbox electric?
    trgtPercentAfterHit,
    false, //Is this hitbox set_weight?
    analogueStickPosition,
    launchRate
  );
}

function Rage(percent) {
  if (percent <= 35) {
    return 1;
  }
  if (percent >= 150) {
    return 1.15;
  }
  return 1 + (percent - 35) * (1.15 - 1) / (150 - 35);
}

function LaunchSpeed(kb){
  return kb * parameters.launch_speed;
}

function SakuraiAngle(kb, aerial) {
  if (aerial) {
    return (.79 * 180 / Math.PI);
  }
  if (kb < 60) {
    return 0;
  }
  if (kb >= 88) {
    return 40;
  }
  if (kb === 60) {
    return (kb - 59.9999) / 0.7;
  }
  return (kb - 60) / 0.7;
}

function GetAngle(X, Y) {
  let angle = Math.atan2(Y, X) * 180 / Math.PI;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

/*
function Aura_Old(percent, stock_dif, game_format) {
  if (stock_dif === undefined) {
    stock_dif = "0";
  }
  if (game_format === undefined) {
    game_format = "Singles";
  }
  let aura = 0;
  if (percent <= 70) {
    aura = (66 + ((17.0 / 35.0) * percent)) / 100;
  } else if (percent <= 190) {
    aura = (100 + ((7.0 / 12.0) * (percent - 70))) / 100;
  } else {
    aura = 1.7;
  }
  //Stock difference data by KuroganeHammer, @A2E_smash and @Rmenaut, https://twitter.com/KuroganeHammer/status/784017200721965057
  //For Doubles https://twitter.com/KuroganeHammer/status/784372918331383808
  let m = 1;
  let min = 0.6;
  let max = 1.7;
  if (Number(stock_dif) === 0) {
    return aura;
  }
  if (game_format === "Singles") {
    switch (stock_dif) {
      case "-2":
        m = 1.3333;
        min = 0.88;
        max = 1.8;
        break;
      case "-1":
        m = 1.142;
        min = 0.753;
        max = 1.8;
        break;
      case "+1":
        m = 0.8888;
        max = 1.51;
        break;
      case "+2":
        m = 0.8;
        max = 1.36;
        break;
      default:
        throw new Error(
          "Got more than +- 2 stock difference in Aura calculation! "+
          `Stock difference was ${stock_dif}.`
        );
    }
  } else {
    switch (stock_dif) {
      case "-2":
        m = 2;
        min = 1.32;
        max = 1.8;
        break;
      case "-1":
        m = 1.3333;
        min = 0.88;
        max = 1.8;
        break;
      case "+1":
        m = 0.8;
        max = 1.36;
        break;
      case "+2":
        m = 0.6333;
        max = 1.076;
        break;
      default:
        throw new Error(
          "Got more than +- 2 stock difference in Aura calculation!"
        );
    }
  }
  aura *= m;
  if (aura < min) {
    aura = min;
  } else if (aura > max) {
    aura = max;
  }
  return aura;
}*/

function Aura(lucarioPlayer, game) {
  const lucStockCount = lucarioPlayer.stockCount;
  let highestOppStockCount = 0;
  for (const opp of game.players) {
    if (opp === lucarioPlayer) continue;
    const oppStockCount = opp.stockCount;
    if (oppStockCount > highestOppStockCount) {
      highestOppStockCount = oppStockCount;
    }
  }
  const stockDiff = lucStockCount - highestOppStockCount;
  const gameFormat = (game.players.length === 2) ? 'Singles' : 'Other';

  const lucPercent = lucarioPlayer.percent;
  let aura = 0;
  if (lucPercent <= 70) {
    aura = (66 + ((17.0 / 35.0) * lucPercent)) / 100;
  } else if (lucPercent <= 190) {
    aura = (100 + ((7.0 / 12.0) * (lucPercent - 70))) / 100;
  } else {
    aura = 1.7;
  }

  //Stock difference data by KuroganeHammer, @A2E_smash and @Rmenaut, https://twitter.com/KuroganeHammer/status/784017200721965057
  //For Doubles https://twitter.com/KuroganeHammer/status/784372918331383808
  let anubisMult = 1;
  let min = 0.6;
  let max = 1.7;
  if (stockDiff === 0) {
    return aura;
  }
  if (gameFormat === "Singles") {
    switch (stockDiff) {
      case -2:
        anubisMult = 1.3333;
        min = 0.88;
        max = 1.8;
        break;
      case -1:
        anubisMult = 1.142;
        min = 0.753;
        max = 1.8;
        break;
      case +1:
        anubisMult = 0.8888;
        max = 1.51;
        break;
      case +2:
        anubisMult = 0.8;
        max = 1.36;
        break;
      default:
        throw new Error(
          "Got more than +- 2 stock difference in Aura calculation! "+
          `Stock difference was ${stockDiff}.`
        );
    }
  } else {
    switch (stockDiff) {
      case -2:
        anubisMult = 2;
        min = 1.32;
        max = 1.8;
        break;
      case -1:
        anubisMult = 1.3333;
        min = 0.88;
        max = 1.8;
        break;
      case +1:
        anubisMult = 0.8;
        max = 1.36;
        break;
      case +2:
        anubisMult = 0.6333;
        max = 1.076;
        break;
      default:
        throw new Error(
          "Got more than +- 2 stock difference in Aura calculation!"
        );
    }
  }
  aura *= anubisMult;
  if (aura < min) {
    aura = min;
  } else if (aura > max) {
    aura = max;
  }
  return aura;
}

function StaleNegation(queue, ignoreStale) {
  if (ignoreStale) {
    return 1;
  }
  const S = [0.08, 0.07594, 0.06782, 0.06028, 0.05274, 0.04462, 0.03766, 0.02954, 0.022];
  let s = 1;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i]) {
      s -= S[i];
    }
  }
  if (s === 1) {
    return 1.05;
  }
  return s;
}

/* Returns an array of given length with every index set to the given value */
function fillArr(value, length) {
  const arr = [];
  for (let i = 0; i < length; ++i) arr[i] = value;
  return arr;
}

/*************\
|* DEMO BELOW *|
\*************/

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
    airFriction: 'number',
    gravity: 'number',
    shAirTime: 'number',
    fhAirTime: 'number',
    jumps: 'number',
    wallJump: 'boolean',
    wallCling: 'boolean',
    crawl: 'boolean',
    tether: 'boolean',
    jumpsquat: 'number',
    softLandingLag: 'number',
    hardLandingLag: 'number',
    traction: 'number',
    initialDash: 'number',
    runAcceleration: 'number',
    runDeceleration: 'number',
    jumpHeight: 'number',
    hopHeight: 'number',
    airJumpHeight: 'number',

    overrides: 'object', //Object containing functions which cover special cases
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

/**
 * A class for storing attributes of attacks and other actions such as jumps.
 * Contains only static data, not state (e.g. charged frames).
 */
const Action = (function() {
  const PROPERTIES = {
    name: 'string',
    id: 'string', //Idk what these should be yet
    hitboxActive: 'object', //Array of frame numbers
    hitboxes: 'object', //Array of Hitbox objects
    faf: 'number',
    landingLag: 'number', //Maybe find a way to make this kind of thing optional
    autoCancel: 'number',
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
    stockCount: 'number', //Used for Lucario's Aura effect
    damageGivenMultiplier: 'number',
    damageTakenMultiplier: 'number',

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

/** @daniel
 * Moveset data is from $scope.moveset, which is an array.
 * The index of the move is given by $scope.move
 */

/* @daniel The MoveParser class in kuroganeAPI.js is used for decoding the api
 * call, which manually parses out the preDamage by adding up all the hitboxes
 * before the last one. */

const Lucario = new Fighter({
  name: 'Lucario',
  weight: 99,
  runSpeed: 1.55,
  walkSpeed: 1.05,
  airSpeed: 1.09,
  fallSpeed: 1.68,
  fastFallSpeed: 2.688,
  gravity: 0.084,
  baseAirAcceleration: 0,
  maxAdditionalAirAcceleration: 0.7,
  airFriction: 0.005,
  shAirTime: 41, //Frames
  fhAirTime: 62,
  jumps: 2,
  wallJump: true,
  wallCling: true,
  crawl: true,
  tether: false,
  jumpsquat: 5, //Frames
  softLandingLag: 2,
  hardLandingLag: 4,
  traction: 0.0736,
  initialDash: 1.8,
  runAcceleration: 0.15,
  runDeceleration: 0.04,
  jumpHeight: 37.619999,
  hopHeight: 18.193617,
  airJumpHeight: 37.619999,

  overrides: {},
});

/* This may be the syntax for non-standard formulas, like Lucario's aura:
 * Fighter.overrides.modifiedProperty = function (
 *   property, fighterPlayer, opponentPlayer, Game
 * )
 */
Lucario.overrides.baseDamage = function (
  origBaseDamage, LucarioPlayer, targetPlayer, game
) {
  const aura = Aura(LucarioPlayer, game);
  return (origBaseDamage * aura);
};

const Marth = new Fighter({
  name: 'Marth',
  weight: 90,
  runSpeed: 1.785,
  walkSpeed: 1.5,
  airSpeed: 1.02,
  fallSpeed: 1.58,
  fastFallSpeed: 2.528,
  gravity: 0.075,
  baseAirAcceleration: 0.1,
  maxAdditionalAirAcceleration: 0.7,
  airFriction: 0.005,
  shAirTime: 41, //Frames
  fhAirTime: 61,
  jumps: 2,
  wallJump: false,
  wallCling: false,
  crawl: false,
  tether: false,
  jumpsquat: 5, //Frames
  softLandingLag: 2,
  hardLandingLag: 4,
  traction: 0.055,
  initialDash: 1.5,
  runAcceleration: 0.082,
  runDeceleration: 0.01,
  jumpHeight: 33.660133,
  hopHeight: 16.263107,
  airJumpHeight: 33.660133,

  overrides: {},
});

const lucarioUthrowPreThrowHitbox = new Hitbox({
  id: 0,
  prevLocation: [0, 0], //I don't know locations yet
  currLocation: [0, 0],
  classification: 'pre-throw',
  baseDamage: 5,
  baseKnockback: 60,
  knockbackGrowth: 180,
  angle: 361,
  weightDependent: false,
  effects: ['Aura'],
  properties: ['Cannot Clank', 'Cannot rebound'],
});

const lucarioUthrowLauncherHitbox = new Hitbox({
  id: 0,
  prevLocation: [0, 0], //I don't know locations yet
  currLocation: [0, 0],
  classification: 'throw',
  baseDamage: 6,
  baseKnockback: 70,
  knockbackGrowth: 70,
  angle: 88,
  weightDependent: false,
  effects: ['Aura'],
  properties: [],
});

const lucarioUthrow = new Action({
  name: 'Up Throw',
  id: 'UTHROW_ID', //Idk what these should be yet
  hitboxActive: [16, 17],
  hitboxes: [lucarioUthrowPreThrowHitbox, lucarioUthrowLauncherHitbox],
  faf: 38,
  landingLag: NaN,
  autoCancel: NaN,
});

/* The staling queue is an array of 9 boolean values. I asssume no staling: */
const stalingQueue = fillArr(false, 9);

const p1Lucario = new Player({
  name: 'Player 1 - Lucario',
  fighter: Lucario,
  currentAction: lucarioUthrow,
  port: 1,
  stockCount: 2,
  damageGivenMultiplier: 1,
  damageTakenMultiplier: 1,
  animation: 'uthrow',
  frameOfAnimation: NaN,
  state: null,

  percent: 0,
  stalingQueue: stalingQueue,

  position: [0, 0],
  velocity: [0, 0],

  analogueStickPosition: [0, 0],
});

const p2Marth = new Player({
  name: 'Player 2 - Marth',
  fighter: Marth,
  currentAction: null,
  port: 1,
  stockCount: 2,
  damageGivenMultiplier: 1,
  damageTakenMultiplier: 1,
  animation: 'STANDING_ERRRRRRRRRRRR',
  frameOfAnimation: NaN,
  state: [],

  percent: 0,
  stalingQueue: stalingQueue,

  position: [0, 0],
  velocity: [0, 0],

  analogueStickPosition: [0, 0],
});

const gameSetup = new Game({
  players: [p1Lucario, p2Marth],
  mode: 'Singles',
  launchRate: 1,
  ignoreStaling: false,
});

function lastValue(arr, fromLast = 0) {
  return arr[arr.length-fromLast-1];
}

/* Copied from calculator.js: */
const vskb = VSKB(p1Lucario, p2Marth, gameSetup);
const hitAdv = HitAdvantage(
  vskb.hitstun,
  lastValue(lucarioUthrow.hitboxActive),
  lucarioUthrow.faf
);
console.log(`Hitstun: ${vskb.hitstun}`);
console.log(`Hit Advantage: ${hitAdv}`);
