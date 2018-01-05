'use strict';

/* eslint-disable */
const lucarioUthrow = Object.freeze({
  LaunchFrame: 17,
  FAF: 48,
  BKB: 70,
  KBG: 70,
  Angle: 88,
  Base_DMG: [6, 7],
  Total_Base_DMG: 11,
});

const attacker = Object.freeze({
  name: "Lucario"
});
/* eslint-enable */

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
    //this.hitstun = Hitstun(this.base_kb, this.windbox, this.electric);
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

function VSKB(
  percent, base_damage, damage, weight, kbg, bkb, gravity, fall_speed, r,
  stalingQueue, ignoreStale, attacker_percent, angle, in_air, windbox,
  electric, set_weight, stick, launch_rate
) {
  const staleness = StaleNegation(stalingQueue, ignoreStale);

  const targetDamageAfterHit = percent + damage * staleness;
  let baseKB = targetDamageAfterHit * base_damage * (1 - (1 - staleness) * 0.3);
  baseKB /= 20;
  baseKB += targetDamageAfterHit / 10;
  baseKB *= 1.4 * (200 / (weight + 100));
  baseKB += 18;
  baseKB *= kbg / 100;
  baseKB += bkb;
  baseKB *= r * Rage(attacker_percent);

  return new Knockback(
    baseKB,
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

function Aura(percent, stock_dif, game_format) {
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

/*************\
|* DEMO BELOW *|
\*************/

/** @daniel
 * Moveset data is from $scope.moveset, which is an array.
 * The index of the move is given by $scope.move
 */

/* @daniel The MoveParser class in kuroganeAPI.js is used for decoding the api
 * call, which manually parses out the preDamage by adding up all the hitboxes
 * before the last one. */

const uthrowAPIReturn = {
  InstanceId: "598e70b44696590bf023d58a",
  Name: "Uthrow",
  OwnerId: 23,
  Owner: "Lucario",
  HitboxActive: null,
  FirstActionableFrame: null,
  BaseDamage: "5, 6",
  Angle: "88",
  BaseKnockBackSetKnockback: "70",
  LandingLag: null,
  AutoCancel: null,
  KnockbackGrowth: "70",
  MoveType: "throw",
  IsWeightDependent: false,
  Links: [
    {
      Rel: "self",
      Href: "https://beta-api-kuroganehammer.azurewebsites.net/api/moves/598e70b44696590bf023d58a"
    },
    {
      Rel: "character",
      Href: "https://beta-api-kuroganehammer.azurewebsites.net/api/characters/name/Lucario"
    }
  ]
};
const lucarioPercent = 0;
const oppStartingPercent = 0;
const damageAppliedBeforeThrowLauncher = 5; //uthrow does 5%, then launches with 6%

/* Move base damage * smash charge multiplier * aura multiplier */
const throwLauncherBaseDamage = 6 * Aura(lucarioPercent, 0, 'Singles');
/* base_damage * attacker damage dealt multiplier * target damage received multiplier: */
const throwLauncherRealDamage = throwLauncherBaseDamage * 1;


const throwLauncherKBG = Number(uthrowAPIReturn.KnockbackGrowth);
const throwLauncherBKB = Number(uthrowAPIReturn.BaseKnockBackSetKnockback);
const throwLauncherAngle = Number(uthrowAPIReturn.Angle);

/* The staling queue is an array of 9 boolean values. I asssume no staling: */
const stalingQueue = [false, false, false, false, false, false, false, false, false];
const ignoreStaling = false; //Never used

const set_weight = false;

/* This is ordinarily a "Character" object, which has its own class: */
const target = Object.freeze({
  "display_name": "Bayonetta",
  "modifier": {
    "name": "Normal",
    "damage_dealt": 1,
    "damage_taken": 1,
    "kb_dealt": 1,
    "kb_received": 1,
    "gravity": 1,
    "fall_speed": 1,
    "shield": 1,
    "air_friction": 1,
    "traction": 1
  },
  "modifiers": [],
  "name": "Bayonetta",
  "api_name": "Bayonetta",
  "attributes": {
    "name": "Bayonetta",
    "weight": 84,
    "run_speed": 1.6,
    "walk_speed": 0.9,
    "air_speed": 0.97,
    "fall_speed": 1.77,
    "fast_fall_speed": 2.832,
    "air_acceleration": 0.085,
    "gravity": 0.12,
    "sh_air_time": 38,
    "jumps": 2,
    "wall_jump": true,
    "wall_cling": true,
    "crawl": false,
    "tether": false,
    "jumpsquat": 4,
    "soft_landing_lag": 2,
    "hard_landing_lag": 4,
    "fh_air_time": 54,
    "traction": 0.055,
    "gravity2": 0.015,
    "air_friction": 0.008,
    "initial_dash": 1.7,
    "run_acceleration": 0.0942,
    "run_deceleration": 0.04,
    "jump_height": 39,
    "hop_height": 21.354742,
    "air_jump_height": 42
  },
  "icon": "./img/stock_icons/stock_90_bayonetta_01.png"
});

/* Copied from calculator.js: */
const vskb = VSKB(
  oppStartingPercent + (damageAppliedBeforeThrowLauncher * StaleNegation(stalingQueue, ignoreStaling)), //% before launcher damage
  throwLauncherBaseDamage, //Move Base damage * aura
  throwLauncherRealDamage,
  set_weight ? 100 : target.attributes.weight,
  throwLauncherKBG,
  throwLauncherBKB,
  target.attributes.gravity * target.modifier.gravity,
  target.attributes.fall_speed * target.modifier.fall_speed,
  1, // Knockback multiplier, 0.85 for crouch cancel, 1.2 for interrupted smash attack charge, 1 for anything else
  stalingQueue, // 9-element boolean array
  false, // Ignore staling, set to false.
  lucarioPercent, // Attacker %
  throwLauncherAngle,
  false, //Target is in air
  false, // Attack is a windbox
  false, // Attack has the electric effect
  set_weight, // Set to false by me above
  { X: 0, Y: 0 }, // Stick position
  1 // Launch rate. 1 unless it's Genesis
);

const uthrowHitFrame = 17;
const uthrowFAF = 38;
const hitAdv = HitAdvantage(
  vskb.hitstun,
  uthrowHitFrame,
  uthrowFAF
);
console.log(`Hitstun: ${vskb.hitstun}`);
console.log(`Hit Advantage: ${hitAdv}`);
