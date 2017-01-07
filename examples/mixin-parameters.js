#!/usr/bin/env node

var assert = require('assert');
var util = require('util');

var rpgparameters = require('../index');
var aggregators = rpgparameters.aggregators;


var ParametersMixin = {};
rpgparameters.defineRateParameter(ParametersMixin, 'maxHpRate');
rpgparameters.defineNumberParameter(ParametersMixin, 'attackPower');
rpgparameters.defineChanceParameter(ParametersMixin, 'guardChance');


// skill
var Skill = function() {};
Object.assign(Skill.prototype, ParametersMixin);

var AttackUpSkill = function() {
  Skill.apply(this);
  this._attackPower = 5;
};
util.inherits(AttackUpSkill, Skill);

// equipment
var Equipment = function Equipment() {};
Object.assign(Equipment.prototype, ParametersMixin);

var ShieldEquipment = function() {
  Equipment.apply(this);
  this._guardChance = 0.25;
};
util.inherits(ShieldEquipment, Equipment);

// buff
var Buff = function Buff() {};
Object.assign(Buff.prototype, ParametersMixin);

var BerserkBuff = function() {
  Buff.apply(this);
  this._maxHpRate = 1.5;
  this._attackPower = 8;
};
util.inherits(BerserkBuff, Buff);

// creature
var Creature = function() {
  this._skill = null;
  this._equipment = null;
  this._buff = null;
};
Object.assign(Creature.prototype, ParametersMixin);

Creature.prototype.getMaxHpRate = function() {
  var parameters = [this.getRawMaxHpRate()];
  [
    this._skill, this._equipment, this._buff
  ].filter(function(v) {
    return !!v;
  }).forEach(function(v) {
    parameters.push(v.getMaxHpRate());
  });
  return aggregators.aggregateRates(parameters);
};

Creature.prototype.getAttackPower = function() {
  var parameters = [this.getRawAttackPower()];
  [
    this._skill, this._equipment, this._buff
  ].filter(function(v) {
    return !!v;
  }).forEach(function(v) {
    parameters.push(v.getAttackPower());
  });
  return aggregators.aggregateNumbers(parameters);
};

Creature.prototype.getGuardChance = function() {
  var parameters = [this.getRawGuardChance()];
  [
    this._skill, this._equipment, this._buff
  ].filter(function(v) {
    return !!v;
  }).forEach(function(v) {
    parameters.push(v.getGuardChance());
  });
  return aggregators.aggregateChances(parameters);
};

var HumanCreature = function() {
  Creature.apply(this);
  this._maxHpRate = 1.0;
  this._attackPower = 3;
  this._guardChance = 0.0;
};
util.inherits(HumanCreature, Creature);


// human being
var human = new HumanCreature();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 3);
assert.strictEqual(human.getGuardChance(), 0.0);

// human gets a skill
human._skill = new AttackUpSkill();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 8);  // 3(base) + 5(skill)
assert.strictEqual(human.getGuardChance(), 0.0);

// human gets a equipment
human._equipment = new ShieldEquipment();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 8);  // 3(base) + 5(skill)
assert.strictEqual(human.getGuardChance(), 0.25);  // 0.25(equipment)

// human is enchanced by buff
human._buff = new BerserkBuff();
assert.strictEqual(human.getMaxHpRate(), 1.5);  // 1(base) * 1.5(buff)
assert.strictEqual(human.getAttackPower(), 16);  // 3(base) + 5(skill) + 8(buff)
assert.strictEqual(human.getGuardChance(), 0.25);  // 0.25(equipment)
