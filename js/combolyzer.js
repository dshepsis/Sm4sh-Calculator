'use strict';

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
  var hitstun = Math.floor(kb * parameters.hitstun) - 1;
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

function VSKB(percent, base_damage, damage, weight, kbg, bkb, gravity, fall_speed, r, timesInQueue, ignoreStale, attacker_percent, angle, in_air, windbox, electric, set_weight, stick, launch_rate) {
  var staleness = StaleNegation(timesInQueue, ignoreStale);
  //return new Knockback((((((((percent + damage * staleness) / 10 + (((percent + damage * staleness) * base_damage * (1 - (1 - staleness) * 0.3)) / 20)) * 1.4 * (200 / (weight + 100))) + 18) * (kbg / 100)) + bkb)) * (r * Rage(attacker_percent)), angle, gravity, fall_speed, in_air, windbox, electric, percent + (damage * staleness), set_weight, stick, launch_rate);

  return new Knockback(
  	(((((((percent + damage * staleness) / 10 + (((percent + damage * staleness) * base_damage * (1 - (1 - staleness) * 0.3)) / 20)) * 1.4 * (200 / (weight + 100))) + 18) * (kbg / 100)) + bkb)) * (r * Rage(attacker_percent)),
  	angle,
  	gravity,
  	fall_speed,
  	in_air,
  	windbox,
  	electric,
  	percent + (damage * staleness),
  	set_weight,
  	stick,
  	launch_rate
  );
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
  if (kb == 60) {
    return (kb - 59.9999) / 0.7
  }
  return (kb - 60) / 0.7;
}

function GetAngle(X, Y) {
  var angle = Math.atan2(Y, X) * 180 / Math.PI;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

class Knockback {
  constructor(kb, angle, gravity, fall_speed, aerial, windbox, electric, percent, set_weight, stick, launch_rate) {
    this.base_kb = kb;
    if (this.base_kb > 2500) {
      //this.base_kb = 2500;
    }
    this.kb = this.base_kb;
    this.original_angle = angle;
    this.base_angle = angle;
    this.angle_with_di = angle;
    this.angle = angle;
    this.gravity = gravity;
    this.aerial = aerial;
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
    if (this.launch_rate == undefined) {
      this.launch_rate = 1;
    }
    this.hitstun = Hitstun(this.base_kb, this.windbox, this.electric);
    if (stick !== undefined) {
      this.stick = stick;
    } else {
      this.stick = {
        X: 0,
        Y: 0
      };
    }
    this.calculate = function () {
      this.kb = this.base_kb * this.launch_rate;
      if (this.original_angle == 361) {
        this.base_angle = SakuraiAngle(this.kb, this.aerial);
      }
      this.angle = this.base_angle;
      if (this.base_angle != 0 && this.base_angle != 180) {
        this.tumble = this.kb > 80 && !windbox;
      }
      if ((this.base_angle == 0 || this.base_angle == 180) && this.aerial) {
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

      if (this.windbox && !this.aerial)
        this.vertical_launch_speed = 0;

      this.di_able = this.tumble && Math.abs(Math.atan2(this.vertical_launch_speed, this.horizontal_launch_speed)) >= parameters.di;

      if (this.di_able && (this.stick.X != 0 || this.stick.Y != 0)) {

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
      if (this.angle == 0 || this.angle == 180 || this.angle == 360) {
        if (this.kb != 0 && !this.windbox && !this.aerial) {
          this.can_jablock = true;
        }
      }
      this.spike = this.angle >= 230 && this.angle <= 310;
      if (this.spike) {
        if (this.kb != 0 && !this.windbox && !this.aerial) {
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
    }
    this.calculate();
  }
};


/* Example Usages: */

var result = {
  'training': [],
  'vs': [],
  'shield': []
};

// if ($scope.charge_data == null && $scope.is_smash) {
//   base_damage = ChargeSmash(base_damage, charge_frames, megaman_fsmash, witch_time_smash_charge);
// }

if (attacker.name == "Lucario") {
  const auraMult = Aura(attacker_percent, stock_dif, game_format);
  base_damage *= auraMult;
  preDamage *= auraMult;
}
var damage = base_damage;
damage *= attacker.modifier.damage_dealt;
damage *= target.modifier.damage_taken;
preDamage *= attacker.modifier.damage_dealt;
preDamage *= target.modifier.damage_taken;

if (wbkb == 0) {
  trainingkb = TrainingKB(
  	target_percent + preDamage,
  	base_damage,
  	damage,
  	set_weight ? 100 : target.attributes.weight,
  	kbg,
  	bkb,
  	target.attributes.gravity * target.modifier.gravity,
  	target.attributes.fall_speed * target.modifier.fall_speed,
  	r,
  	angle,
  	in_air,
  	windbox,
  	electric,
  	set_weight,
  	stick
  );
  vskb = VSKB(
    target_percent + (preDamage * StaleNegation(stale, ignoreStale)),
    base_damage,
    damage,
    set_weight ? 100 : target.attributes.weight,
    kbg,
    bkb,
    target.attributes.gravity * target.modifier.gravity,
    target.attributes.fall_speed * target.modifier.fall_speed,
    r,
    stale,
    ignoreStale,
    attacker_percent,
    angle,
    in_air,
    windbox,
    electric,
    set_weight,
    stick,
    launch_rate
  );
  trainingkb.addModifier(attacker.modifier.kb_dealt);
  vskb.addModifier(attacker.modifier.kb_dealt);
  trainingkb.addModifier(target.modifier.kb_received);
  vskb.addModifier(target.modifier.kb_received);
} else {
  trainingkb = WeightBasedKB(
  	set_weight ? 100 : target.attributes.weight,
  	bkb,
  	wbkb,
  	kbg,
  	target.attributes.gravity * target.modifier.gravity,
  	target.attributes.fall_speed * target.modifier.fall_speed,
  	r,
  	target_percent,
  	damage,
  	0,
  	angle,
  	in_air,
  	windbox,
  	electric,
  	set_weight,
  	stick
  );
  vskb = WeightBasedKB(
  	set_weight ? 100 : target.attributes.weight,
  	bkb,
  	wbkb,
  	kbg,
  	target.attributes.gravity * target.modifier.gravity,
  	target.attributes.fall_speed * target.modifier.fall_speed,
  	r,
  	target_percent,
  	StaleDamage(
  		damage,
  		stale,
  		ignoreStale
  	),
  	attacker_percent,
  	angle,
  	in_air,
  	windbox,
  	electric,
  	set_weight,
  	stick,
  	launch_rate
  );
  trainingkb.addModifier(target.modifier.kb_received);
  vskb.addModifier(target.modifier.kb_received);
}

const distance = new Distance(
	vskb.kb,
	vskb.horizontal_launch_speed,
	vskb.vertical_launch_speed,
	vskb.hitstun,
	vskb.angle,
	target.attributes.gravity * target.modifier.gravity,
	(
		$scope.use_landing_lag == "yes" ? faf + landing_lag : $scope.use_landing_lag == "autocancel" ? faf + attacker.attributes.hard_landing_lag : faf
	) - hitframe,
	target.attributes.fall_speed * target.modifier.fall_speed,
	target.attributes.traction * target.modifier.traction,
	isFinishingTouch,
	inverseX,
	onSurface,
	position,
	stage,
	graph,
	parseFloat(
		$scope.extra_vis_frames
	)
);

//if(stage != null){
//    if(distance.bounce_speed >= 1){
//        //$scope.kb_modifier_bounce = distance.bounce;
//        //bounce = distance.bounce;
//    }
//}


let trainingDistance;
let vsDistance;
if (game_mode == "training") {
  vsDistance = new Distance(
  	vskb.kb,
  	vskb.horizontal_launch_speed,
  	vskb.vertical_launch_speed,
  	vskb.hitstun,
  	vskb.base_angle,
  	target.attributes.gravity * target.modifier.gravity,
  	(
  		$scope.use_landing_lag == "yes" ? faf + landing_lag : $scope.use_landing_lag == "autocancel" ? faf + attacker.attributes.hard_landing_lag : faf
  	) - hitframe,
  	target.attributes.fall_speed * target.modifier.fall_speed,
  	target.attributes.traction * target.modifier.traction,
  	isFinishingTouch,
  	inverseX,
  	onSurface,
  	position,
  	stage,
  	!graph,
  	parseFloat(
  		$scope.extra_vis_frames
  	)
  );
  trainingDistance = distance;
} else {
  vsDistance = distance;
  trainingDistance = new Distance(
  	trainingkb.kb,
  	trainingkb.horizontal_launch_speed,
  	trainingkb.vertical_launch_speed,
  	trainingkb.hitstun,
  	trainingkb.base_angle,
  	target.attributes.gravity * target.modifier.gravity,
  	(
  		$scope.use_landing_lag == "yes" ? faf + landing_lag : $scope.use_landing_lag == "autocancel" ? faf + attacker.attributes.hard_landing_lag : faf
  	) - hitframe,
  	target.attributes.fall_speed * target.modifier.fall_speed,
  	target.attributes.traction * target.modifier.traction,
  	isFinishingTouch,
  	inverseX,
  	onSurface,
  	position,
  	stage,
  	!graph,
  	parseFloat(
  		$scope.extra_vis_frames
  	)
  );
}
trainingkb.bounce(bounce);
vskb.bounce(bounce);
const t_hc = HitstunCancel(
	trainingkb.kb,
	trainingkb.horizontal_launch_speed,
	trainingkb.vertical_launch_speed,
	trainingkb.angle,
	windbox,
	electric
);
const v_hc = HitstunCancel(
	vskb.kb,
	vskb.horizontal_launch_speed,
	vskb.vertical_launch_speed,
	vskb.angle,
	windbox,
	electric
);

vskb = VSKB(
  target_percent + (preDamage * StaleNegation(stale, ignoreStale)),
  base_damage,
  damage,
  set_weight ? 100 : target.attributes.weight,
  kbg,
  bkb,
  target.attributes.gravity * target.modifier.gravity,
  target.attributes.fall_speed * target.modifier.fall_speed,
  r,
  stale,
  ignoreStale,
  attacker_percent,
  angle,
  in_air,
  windbox,
  electric,
  set_weight,
  stick,
  launch_rate
);

hitAdv = HitAdvantage(
  vskb.hitstun,
  hitframe,
  faf
);
