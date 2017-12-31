﻿var parameters = {
    di: 0.17,
    lsi_max: 1.095,
    lsi_min: 0.92,
    decay: 0.051,
    gravity:{
        mult: 5,
        constant: 0.075
    },
    bounce: 0.8,
    crouch_cancelling: 0.85,
    crouch_hitlag: 0.67,
	interrupted_smash: 1.2,
	buried_kb_mult: 0.7,
	buried_kb_threshold: 70,
    hitstun: 0.4,
    launch_speed: 0.03,
    tumble_threshold: 32,
    hitlag: {
        mult: 0.3846154,
        constant: 5
    },
    hitstunCancel: {
        frames: {
            aerial: 45,
            airdodge: 40
        },
        launchSpeed: {
            aerial: 2,
            airdodge: 2.5
        }
    },
    paralyzer: {
        constant: 14,
        mult: 0.025
    }
};

function TrainingKB(percent, base_damage, damage, weight, kbg, bkb, gravity, fall_speed, r, angle, in_air, windbox, electric, set_weight, stick, launch_rate) {
	return new Knockback((((((((percent + damage) / 10) + (((percent + damage) * base_damage) / 20)) * (200 / (weight + 100)) * 1.4) + 18) * (kbg / 100)) + bkb) * r, angle, gravity, fall_speed, in_air, windbox, electric, percent + damage, set_weight, stick, 1);
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

function Aura(percent, stock_dif, game_format) {
    if(stock_dif == undefined){
        stock_dif = "0";
    }
    if(game_format == undefined){
        game_format = "Singles";
    }
    var aura = 0;
    if (percent <= 70) {
        aura = (66 + ((17.0 / 35.0) * percent)) / 100;
    }else if (percent <= 190) {
        aura = (100 + ((7.0 / 12.0) * (percent - 70))) / 100;
    }else{
        aura = 1.7;
    }
    //Stock difference data by KuroganeHammer, @A2E_smash and @Rmenaut, https://twitter.com/KuroganeHammer/status/784017200721965057
    //For Doubles https://twitter.com/KuroganeHammer/status/784372918331383808
    var m = 1;
    var min = 0.6;
    var max = 1.7;
    if(stock_dif == "0"){
        return aura;
    }
    if(game_format == "Singles"){
        switch(stock_dif){
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
        }
    }else{
        switch(stock_dif){
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
        }
    }
    aura *= m;
    if(aura < min){
        aura = min;
    }else if(aura > max){
        aura = max;
    }
    return aura;
}

function StaleNegation(queue, ignoreStale) {
  if (ignoreStale) {
    debugger;
    return 1;
  }
  //if (timesInQueue > 9) {
  //    timesInQueue = 9;
  //}
  //if (timesInQueue == 0) {
  //    return 1.05;
  //}
  var S = [0.08, 0.07594, 0.06782, 0.06028, 0.05274, 0.04462, 0.03766, 0.02954, 0.022];
  var s = 1;
  for (var i = 0; i < queue.length; i++) {
    if (queue[i]) {
      s -= S[i];
    }
  }
  if (s == 1) {
    return 1.05;
  }
  return s;
}

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

function LumaHitstun(kb, windbox, electric) {
	if (windbox) {
		return 0;
	}
	var hitstun = Math.floor(kb * 0.27) - 1;
	//Electric moves deal +1 hitstun https://twitter.com/Meshima_/status/786780420817899521
	if (electric) {
		hitstun++;
	}
	if (hitstun < 0) {
		return 0;
	}
	return hitstun;
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

function VSKB(percent, base_damage, damage, weight, kbg, bkb, gravity, fall_speed, r, timesInQueue, ignoreStale, attacker_percent, angle, in_air, windbox, electric, set_weight, stick, launch_rate) {
    var s = StaleNegation(timesInQueue, ignoreStale);
    return new Knockback((((((((percent + damage * s) / 10 + (((percent + damage * s) * base_damage * (1 - (1 - s) * 0.3)) / 20)) * 1.4 * (200 / (weight + 100))) + 18) * (kbg / 100)) + bkb)) * (r * Rage(attacker_percent)), angle, gravity, fall_speed, in_air, windbox, electric, percent + (damage * s), set_weight, stick, launch_rate);
}

function WeightBasedKB(weight, bkb, wbkb, kbg, gravity, fall_speed, r, target_percent, damage, attacker_percent, angle, in_air, windbox, electric, set_weight, stick, launch_rate) {
	return new Knockback((((((1 + (wbkb / 2)) * (200 / (weight + 100)) * 1.4) + 18) * (kbg / 100)) + bkb) * (r * Rage(attacker_percent)), angle, gravity, fall_speed, in_air, windbox, electric, target_percent + damage, set_weight, stick, launch_rate);
}

function StaleDamage(base_damage, timesInQueue, ignoreStale) {
    return base_damage * StaleNegation(timesInQueue, ignoreStale);
}

function FirstActionableFrame(kb, windbox, electric, ignoreReeling) {
    var hitstun = Hitstun(kb, windbox, electric, ignoreReeling);
    if (hitstun == 0) {
        return 0;
    }
    return hitstun + 1;
}

function HitstunCancel(kb, launch_speed_x, launch_speed_y, angle, windbox, electric) {
    var res = { 'airdodge': 0, 'aerial': 0 };
    if (windbox) {
        return res;
    }
    var hitstun = Hitstun(kb, windbox, electric);
    var res = { 'airdodge': hitstun + 1, 'aerial': hitstun + 1 };
    var airdodge = false;
    var aerial = false;
    var launch_speed = { 'x': launch_speed_x, 'y': launch_speed_y };
    var decay = { 'x': parameters.decay * Math.cos(angle * Math.PI / 180), 'y': parameters.decay * Math.sin(angle * Math.PI / 180) };
	var ec = electric ? 1 : 0;
    for (var i = 0; i < hitstun; i++) {
        if (launch_speed.x != 0) {
            var x_dir = launch_speed.x / Math.abs(launch_speed.x);
            launch_speed.x -= decay.x;
            if (x_dir == -1 && launch_speed.x > 0) {
                launch_speed.x = 0;
            } else if (x_dir == 1 && launch_speed.x < 0) {
                launch_speed.x = 0;
            }
        }
        if (launch_speed.y != 0) {
            var y_dir = launch_speed.y / Math.abs(launch_speed.y);
            launch_speed.y -= decay.y;
            if (y_dir == -1 && launch_speed.y > 0) {
                launch_speed.y = 0;
            } else if (y_dir == 1 && launch_speed.y < 0) {
                launch_speed.y = 0;
            }
        }
        var lc = Math.sqrt(Math.pow(launch_speed.x, 2) + Math.pow(launch_speed.y, 2));
        if (lc < parameters.hitstunCancel.launchSpeed.airdodge && !airdodge) {
            airdodge = true;
            res.airdodge = Math.max(i + 2, parameters.hitstunCancel.frames.airdodge + 1 + ec);
        }
        if (lc < parameters.hitstunCancel.launchSpeed.aerial && !aerial) {
            aerial = true;
            res.aerial = Math.max(i + 2, parameters.hitstunCancel.frames.aerial + 1 + ec);
        }
    }

    if (res.airdodge > hitstun) {
        res.airdodge = hitstun + 1;
    }
    if (res.aerial > hitstun) {
        res.aerial = hitstun + 1;
    }

    return res;
}

function Hitlag(base_damage, hitlag_mult, electric, crouch) {
	var electric_mult = 1;
	if (electric) {
		electric_mult = 1.5;
	}
	var h = Math.floor((((base_damage * parameters.hitlag.mult + parameters.hitlag.constant) * electric_mult) * hitlag_mult) * crouch) - 1;
    if (h > 30) {
        return 30;
    }
    if (h < 0) {
        return 0;
    }
    return h;
}

function ChargeSmash(base_damage, frames, megaman_fsmash, witch_time) {
    if (megaman_fsmash) {
        return base_damage * (1 + (frames / 86));
    }
    if(witch_time){
        return base_damage * (1 + (frames * 0.5 / 150));
    }
    return base_damage * (1 + (frames / 150));
}

function ChargeSmashMultiplier(frames, megaman_fsmash, witch_time) {
    if (megaman_fsmash) {
        return (1 + (frames / 86));
    }
    if(witch_time){
        return (1 + (frames * 0.5 / 150));
    }
    return (1 + (frames / 150));
}

function ShieldStun(damage, is_projectile, powershield) {
	var projectileMult = is_projectile ? 0.5 : 1;
	var powershieldMult = powershield ? 0.66 : 1;
	return Math.floor((damage * 0.58 * projectileMult * powershieldMult) + 3) - 1;
}

function ShieldHitlag(damage, hitlag, electric) {
	if (hitlag > 1) {
		hitlag *= 0.8;
		if (hitlag < 1)
			hitlag = 1;
	}
    return Hitlag(damage, hitlag, electric, 1);
}

function AttackerShieldHitlag(damage, hitlag, electric) {
    return ShieldHitlag(damage, hitlag, electric);
}

function ShieldAdvantage(damage, hitlag, hitframe, FAF, is_projectile, electric, powershield ) {
    return hitframe - (FAF - 1) + ShieldStun(damage, is_projectile, powershield) + ShieldHitlag(damage,hitlag,electric) - (is_projectile ? 0 : AttackerShieldHitlag(damage, hitlag, electric));
}

//Formula by Arthur https://twitter.com/BenArthur_7/status/926918804466225152
function ShieldPushback(damage, projectile, powershield) {
	var projectileMult = projectile ? 0.5 : 1;
	var powershieldMult = powershield ? 0.66 : 1;
	var powershieldMult2 = powershield ? 0.15 : 1;

	var pushback = ((damage * 0.58 * projectileMult * powershieldMult) + 4) * 0.09 * powershieldMult2;
	if (pushback > 1.3)
		pushback = 1.3;

	return pushback;
}

function AttackerShieldPushback(damage, projectile = false) {
	if (projectile)
		return 0;

	return (damage * 0.04) + 0.025;
}

function DIAngleDeadzones(angle) {
	var deadzone = 11;
	if (angle <= deadzone || angle >= 360 - deadzone)
		angle = 0;
	else if (angle <= 90 + deadzone && angle >= 90 - deadzone)
		angle = 90;
	else if (angle <= 180 + deadzone && angle >= 180 - deadzone)
		angle = 180;
	else if (angle <= 270 + deadzone && angle >= 270 - deadzone)
		angle = 270;
	return angle;
}

function StickSensibilityPosition(value) {
	if (value < 24 && value > -24)
		return 0;
	if (value > 128)
		return 1;
	if (value < -128)
		return -1;
	return value / 128;
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

	var X = StickSensibility(stick.X);
	var Y = StickSensibility(stick.Y);

	var check = Y * launchSpeed.X - X * launchSpeed.Y < 0;

	var variation = Math.abs(X * launchSpeed.Y - Y * launchSpeed.X) / totalLaunchSpeed;

	var di = parameters.di * variation;

	var angle = 0;

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

	var Y = StickSensibility(stickY);
	if (Y >= 0)
		return 1 + (parameters.lsi_max - 1) * Y;
	return 1 - (1 - parameters.lsi_min) * -Y;
}

function LaunchSpeed(kb){
    return kb * parameters.launch_speed;
}

function HitAdvantage(hitstun, hitframe, faf) {
    return hitstun - (faf - (hitframe + 1));
}

//Effect formulas
function ParalyzerHitlag(base_damage, hitlag_mult, crouch) {
	var h = Math.floor(((base_damage * parameters.hitlag.mult + parameters.paralyzer.constant)) * hitlag_mult * crouch * parameters.paralyzer.mult);
	if (h < 0) {
		return 0;
	}
	return h;
}

function ParalysisTime(kb, base_damage, hitlag_mult, crouch) {
	var p = Math.floor((((base_damage * parameters.hitlag.mult + parameters.paralyzer.constant)) * hitlag_mult) * crouch * parameters.paralyzer.mult * kb);
	if (p > 76) {
		return 76;
	}
	if (p < 0) {
		return 0;
	}
	return p;
}

function FlowerTime(damage) {
	return Math.min(Math.floor(20 + (damage * 40)),3000);
}

function BuriedTime(percent, damage, kb) {
	if (kb == 0)
		return 0;
	return Math.ceil(55 + (Math.min(percent + damage, 999)*0.5) + (kb * 1.5));
}

//Sleep time formula by Meshima https://twitter.com/Meshima_/status/908375931101650945
function SleepTime(percent, damage, kb) {
	if (kb == 0)
		return 0;
	return Math.ceil(70 + (Math.min(percent + damage, 999) * 1) + (kb * 25));
}

//Freeze time formula by Meshima https://twitter.com/Meshima_/status/908383003675471872
function FreezeTime(damage, kb) {
	if (kb < 52.5)
		return 0;
	return Math.ceil(damage * 12);
}

//Stun time formula by Meshima https://twitter.com/Meshima_/status/908383383486578688
function StunTime(kb) {
	return Math.ceil(121 + kb);
}

//Disable time formula by Meshima https://twitter.com/Meshima_/status/908383535265804288
function DisableTime(percent, damage, kb) {
	if (kb == 0)
		return 0;
	return Math.ceil(kb + (Math.min(percent + damage, 999) * 1.1));
}

function PinnedTime(percent) {
	return Math.ceil(280 + (percent * 1.5));
}

//Stick gate formulas

function InsideStickGate(r, X, Y) {
	var d = Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2));
	return d <= r;
}

function GetAngle(X, Y) {
	var angle = Math.atan2(Y, X) * 180 / Math.PI;
	if (angle < 0)
		angle += 360;

	return angle;
}

function AngleToStickPosition(r, angle) {
	if (r != 0) {
		var x = Math.floor(r * Math.cos(angle * Math.PI / 180));
		var y = Math.floor(r * Math.sin(angle * Math.PI / 180));

		if (x < -127)
			x = -127;
		if (y < -127)
			y = -127;
		if (x > 128)
			x = 128;
		if (y > 128)
			y = 128;

		return { X: x, Y: y };
	} else {

		var x = Math.floor(128 * Math.cos(angle * Math.PI / 180));
		var y = Math.floor(128 * Math.sin(angle * Math.PI / 180));

		if (x < -24)
			x = -127;
		else if (x > 24)
			x = 128;
		else
			x = 0;

		if (y < -24)
			y = -127;
		else if (y > 24)
			y = 128;
		else
			y = 0;
		return { X: x, Y: y };
	}

}

//Launch visualizer formulas

function InvertXAngle(angle){
    if(angle < 180){
        return 180 - angle;
    }else{
        return 360 - (angle - 180);
    }
}

function InvertYAngle(angle){
    if(angle < 180){
        return (180 - angle) + 180;
    }else{
        return 180 - (angle - 180);
    }
}

//Get the distance between a point and a line
function LineDistance(point, line) {
	return Math.abs(((line[1][1] - line[0][1]) * point[0]) - ((line[1][0] - line[0][0]) * point[1]) + (line[1][0] * line[0][1]) - (line[1][1] * line[0][0])) / Math.sqrt(Math.pow(line[1][1] - line[0][1], 2) + Math.pow(line[1][0] - line[0][0], 2));
}

//Get the closest line from a point
function closestLine(point, surface){
    var x = point[0];
    var y = point[1];

	var line = {i:-1, line:[]};
    var min_distance = null;

	for (var i = 0; i < surface.length - 1; i++){
		var x1 = surface[i][0];
		var x2 = surface[i + 1][0];
		var y1 = surface[i][1];
		var y2 = surface[i + 1][1];
        var distance = Math.abs(((y2-y1) * x) - ((x2-x1) * y) + (x2*y1) - (y2*x1)) / Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
		if (min_distance == null) {
			line.i = i;
			min_distance = distance;
			line.line = [[x1, y1], [x2, y2]];
        }else{
            if(distance < min_distance){
				min_distance = distance;
				line.i = i;
				line.line = [[x1, y1], [x2, y2]];
            }
        }
    }
    return line;
}

var LineTypes = {
	FLOOR : 1,
	WALL : 2,
	CEILING : 3
};

//Get if line is floor, wall or ceiling
function GetLineType(material) {

	if (!material.ceiling && !material.wall) {
		return LineTypes.FLOOR;
	}
	if (material.wall) {
		return LineTypes.WALL;
	}
	return LineTypes.CEILING;
}

//Find the point where two lines intersect when they expand through infinity
function IntersectionPoint(line_a, line_b) {
	var x1 = line_a[0][0];
	var x2 = line_a[1][0];
	var y1 = line_a[0][1];
	var y2 = line_a[1][1];
	var x3 = line_b[0][0];
	var x4 = line_b[1][0];
	var y3 = line_b[0][1];
	var y4 = line_b[1][1];
	var d = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));
	var x = (((x1 * y2) - (y1 * x2)) * (x3 - x4)) - ((x1 - x2) * ((x3 * y4) - (y3 * x4)));
	var y = (((x1 * y2) - (y1 * x2)) * (y3 - y4)) - ((y1 - y2) * ((x3 * y4) - (y3 * x4)));
	if (d != 0) {
		var xd = x / d;
		var yd = y / d;
		if (xd == -0)
			xd = 0;
		if (yd == -0)
			yd = 0;
		return [+xd.toFixed(6), +yd.toFixed(6)];
	}
	return null;
}

//Get if a point is on a line segment given by two points
function PointInLine(point, line) {
	var x = point[0];
	var y = point[1];
	var x1 = line[0][0];
	var x2 = line[1][0];
	var y1 = line[0][1];
	var y2 = line[1][1];

	var hx = Math.max(x1, x2);
	var lx = Math.min(x1, x2);
	var hy = Math.max(y1, y2);
	var ly = Math.min(y1, y2);

	var distance = Math.abs(((y2 - y1) * x) - ((x2 - x1) * y) + (x2 * y1) - (y2 * x1)) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
	if (distance < 0.001) {
		//lx,ly - 0.001, hx,hy + 0.001 for precision loss cases
		return (lx - 0.001) <= x && x <= (hx + 0.001) && (ly - 0.001) <= y && y <= (hy + 0.001);
	}
	return false;
}

function GetPointFromSlide(point, speed, angle, line) {
	var x = point[0] + (Math.abs(speed.x) * Math.cos(angle * Math.PI / 180));
	var y = point[1] + (Math.abs(speed.y) * Math.sin(angle * Math.PI / 180));
	return [x, y];

}

//Used in sliding, to prevent float precision errors or random js stuff get the closest point of a line near to another point
function ClosestPointToLine(point, line) {
	var a = line[0];
	var b = line[1];

	var ap = [point[0] - a[0], point[1] - a[1]];
	var ab = [b[0] - a[0], b[1] - a[1]];

	var p = (ap[0] * ab[0]) + (ap[1] * ab[1]);
	var m = (Math.pow(ab[0], 2) + Math.pow(ab[1], 2));

	var distance = p / m;

	if (distance == -0) {
		distance = 0;
	}

	return [a[0] + (ab[0] * distance), a[1] + (ab[1] * distance)];

	//if (distance < 0)
	//	return a;
	//else if (distance > 1)
	//	return b;
	//else
	//	return [a[0] + (ab[0] * distance), a[1] + (ab[1] * distance)];
}

//Check if launch angle goes to the opposite direction of the line normal vector angle, returns false when the line is on the same direction or parallel
function LineCollision(launch_angle, line_angle) {
	var a = Math.cos(Math.abs(line_angle - launch_angle) * Math.PI / 180);
	if (a > 0) {
		return false;
	}
	return true;
}

//Check if launch angle goes to the same direction of the line normal vector angle
function LinePassthroughCollision(launch_angle, line_angle) {
	var a = Math.cos(Math.abs(line_angle - launch_angle) * Math.PI / 180);
	if (a <= 0) {
		return false;
	}
	return true;
}

//Get all lines that intersect with a line
function IntersectionLines(line, vertex) {
	var l = [];

	for (var i = 0; i < vertex.length - 1; i++) {
		var stageLine = [vertex[i], vertex[i + 1]];
		var p = IntersectionPoint(line, stageLine);
		if (p != null) {
			var f = PointInLine(p, line) && PointInLine(p, stageLine);
			if (f) {
				l.push({ "i": i, "point": p, "line": stageLine });
			}
		}
	}

	return l;
}

//Get line angle given by two points
function LineAngle(line) {
	return ((Math.atan2(line[1][1] - line[0][1], line[1][0] - line[0][0]) * 180 / Math.PI) + 360) % 360;
}
