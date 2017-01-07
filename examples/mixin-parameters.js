#!/usr/bin/env node

const assert = require('assert');

const rpgparameters = require('../index');
const aggregators = rpgparameters.aggregators;


const parametersMixin = {};
rpgparameters.defineRateParameter(parametersMixin, 'maxHpRate');
rpgparameters.defineNumberParameter(parametersMixin, 'attackPower');
rpgparameters.defineChanceParameter(parametersMixin, 'guardChance');


class Skill {}
Object.assign(Skill.prototype, parametersMixin);

class AttackUpSkill extends Skill {
  constructor() {
    super();
    this._attackPower = 5;
  }
}


class Equipment {}
Object.assign(Equipment.prototype, parametersMixin);

class ShieldEquipment extends Equipment {
  constructor() {
    super();
    this._guardChance = 0.25;
  }
}


class Buff {}
Object.assign(Buff.prototype, parametersMixin);

class BerserkBuff extends Equipment {
  constructor() {
    super();
    this._maxHpRate = 1.5;
    this._attackPower = 8;
  }
}


class PrototypeCreature {}
Object.assign(PrototypeCreature.prototype, parametersMixin);

class Creature extends PrototypeCreature {
  constructor() {
    super();
    this._skill = null;
    this._equipment = null;
    this._buff = null;
  }

  _getParameterModifiers() {
    const mods = [];
    if (this._skill) mods.push(this._skill);
    if (this._equipment) mods.push(this._equipment);
    if (this._buff) mods.push(this._buff);
    return mods;
  }

  getMaxHpRate() {
    return aggregators.aggregateRates([
      PrototypeCreature.prototype.getMaxHpRate.apply(this),
      ...this._getParameterModifiers().map(m => m.getMaxHpRate()),
    ]);
  }

  getAttackPower() {
    return aggregators.aggregateNumbers([
      PrototypeCreature.prototype.getAttackPower.apply(this),
      ...this._getParameterModifiers().map(m => m.getAttackPower()),
    ]);
  }

  getGuardChance() {
    return aggregators.aggregateChances([
      PrototypeCreature.prototype.getGuardChance.apply(this),
      ...this._getParameterModifiers().map(m => m.getGuardChance()),
    ]);
  }
}

class HumanCreature extends Creature {
  constructor() {
    super();
    this._maxHpRate = 1.0;
    this._attackPower = 3;
    this._guardChance = 0.0;
  }
}


// A human being
const human = new HumanCreature();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 3);
assert.strictEqual(human.getGuardChance(), 0.0);

// The human gets a skill
human._skill = new AttackUpSkill();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 8);  // 3(base) + 5(skill)
assert.strictEqual(human.getGuardChance(), 0.0);

// The human gets an equipment
human._equipment = new ShieldEquipment();
assert.strictEqual(human.getMaxHpRate(), 1.0);
assert.strictEqual(human.getAttackPower(), 8);  // 3(base) + 5(skill)
assert.strictEqual(human.getGuardChance(), 0.25);  // 0.25(equipment)

// The human is enchanced by a buff
human._buff = new BerserkBuff();
assert.strictEqual(human.getMaxHpRate(), 1.5);  // 1(base) * 1.5(buff)
assert.strictEqual(human.getAttackPower(), 16);  // 3(base) + 5(skill) + 8(buff)
assert.strictEqual(human.getGuardChance(), 0.25);  // 0.25(equipment)
