var assert = require('assert');

var rpgparameter = require('../index');
var defineParameter = rpgparameter.defineParameter;
var defineNumberParameter = rpgparameter.defineNumberParameter;
var defineIntegerParameter = rpgparameter.defineIntegerParameter;
var defineRateParameter = rpgparameter.defineRateParameter;
var defineChanceParameter = rpgparameter.defineChanceParameter;
var defineBooleanParameter = rpgparameter.defineBooleanParameter;
var aggregators = rpgparameter.aggregators;


describe('rpgparameter', function() {
  it('should be defined as an object', function() {
    assert.strictEqual(typeof rpgparameter, 'object');
  });

  it('should have aggregators', function() {
    assert.strictEqual(typeof aggregators, 'object');
  });

  describe('defineParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineParameter(creature, 'maxHp', {
        defaultValue: 1
      });

      assert.strictEqual(creature._maxHp, 1);
      assert.strictEqual(creature.getMaxHp(), 1);

      creature.setMaxHp(2);
      assert.strictEqual(creature._maxHp, 2);
      assert.strictEqual(creature.getMaxHp(), 2);
    });

    it('format option', function() {
      var creature = {};
      defineParameter(creature, 'attackPower', {
        displayValue: function(value) {
          if (value > 1) {
            return value + 'pts';
          } else {
            return value + 'pt';
          }
        },
        defaultValue: 10
      });
      assert.strictEqual(creature.displayAttackPower(), '10pts');

      creature.setAttackPower(1);
      assert.strictEqual(creature.displayAttackPower(), '1pt');
    });

    it('validate option', function() {
      var creature = {};
      defineParameter(creature, 'defenseRate', {
        validateValue: function(value) {
          return 0.0 <= value && value <= 1.0;
        },
        defaultValue: 0.0
      });

      assert.strictEqual(creature.validateDefenseRate(1.0), true);
      assert.strictEqual(creature.validateDefenseRate(1.01), false);

      creature.setDefenseRate(1.0);
      assert.strictEqual(creature.getDefenseRate(), 1.0);
      assert.throws(function() {
        creature.setDefenseRate(-0.01);
      }, /-0\.01/);
    });

    it('isEnabledHumanizedGetter option', function() {
      var creature;
      creature = {};
      defineParameter(creature, 'isUnique', {
        defaultValue: false
      });

      assert.strictEqual(creature.isUnique(), false);
      assert.strictEqual(creature.getIsUnique(), false);

      creature.setIsUnique(true);
      assert.strictEqual(creature.isUnique(), true);
      assert.strictEqual(creature.getIsUnique(), true);

      creature = {};
      defineParameter(creature, 'isUnique', {
        isEnabledHumanizedGetter: false,
        defaultValue: false
      });

      assert.strictEqual(creature.getIsUnique(), false);
      assert.strictEqual('isUnique' in creature, false);
    });
  });

  describe('defineNumberParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineNumberParameter(creature, 'money');
      assert.strictEqual(creature.getMoney(), 0);
      creature.setMoney(100);
      creature.setMoney(-100);
    });

    it('default option', function() {
      var creature = {};
      defineNumberParameter(creature, 'maxHp', {
        defaultValue: 5
      });
      assert.strictEqual(creature.getMaxHp(), 5);
    });

    it('min option', function() {
      var creature = {};
      defineNumberParameter(creature, 'money', {
        min: 0
      });
      creature.setMoney(10);
      creature.setMoney(0);
      assert.throws(function() {
        creature.setMoney(-1);
      }, /-1/);
    });

    it('max option', function() {
      var creature = {};
      defineNumberParameter(creature, 'money', {
        max: 10
      });
      creature.getMoney(-10);
      creature.getMoney(10);
      assert.throws(function() {
        creature.setMoney(11);
      }, /11/);
    });
  });

  describe('defineIntegerParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineIntegerParameter(creature, 'level');

      assert.strictEqual(creature.getLevel(), 0);

      creature.setLevel(99);
      assert.strictEqual(creature.getLevel(), 99);
      creature.setLevel(-99);
      assert.strictEqual(creature.getLevel(), -99);

      assert.throws(function() {
        creature.setLevel(1.01);
      }, /1.01/);
    });
  });

  describe('defineRateParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineRateParameter(creature, 'damageRate');

      assert.strictEqual(creature.getDamageRate(), 1.0);

      creature.setDamageRate(0.0);
      assert.strictEqual(creature.getDamageRate(), 0.0);
      creature.setDamageRate(99.9);
      assert.strictEqual(creature.getDamageRate(), 99.9);

      assert.throws(function() {
        creature.setDamageRate(-0.01);
      }, /-0.01/);
    });
  });

  describe('defineChanceParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineChanceParameter(creature, 'guardChance');

      assert.strictEqual(creature.getGuardChance(), 0.0);
      assert.strictEqual(creature.displayGuardChance(), '0');

      creature.setGuardChance(0.0);
      creature.setGuardChance(1.0);
      assert.strictEqual(creature.getGuardChance(), 1.0);

      assert.throws(function() {
        creature.setGuardChance(-0.01);
      }, /-0.01/);
      assert.throws(function() {
        creature.setGuardChance(1.01);
      }, /1.01/);
    });

    it('options', function() {
      var creature = {};
      defineChanceParameter(creature, 'antiMagicChance', {
        defaultValue: 0.5,
        displayValue: function() { return 'Foo'; }
      });

      assert.strictEqual(creature.getAntiMagicChance(), 0.5);
      assert.strictEqual(creature.displayAntiMagicChance(), 'Foo');
    });
  });

  describe('defineBooleanParameter', function() {
    it('can execute correctly', function() {
      var creature = {};
      defineBooleanParameter(creature, 'isEnemy');

      assert.strictEqual(creature.isEnemy(), false);
      assert.strictEqual(creature.displayIsEnemy(), 'false');

      creature.setIsEnemy(true);
      assert.strictEqual(creature.isEnemy(), true);

      assert.throws(function() {
        creature.setIsEnemy(1);
      }, /1/);
    });

    it('options', function() {
      var creature = {};
      defineBooleanParameter(creature, 'canFly', {
        defaultValue: true,
        displayValue: function() { return 'Foo'; }
      });

      assert.strictEqual(creature.canFly(), true);
      assert.strictEqual(creature.displayCanFly(), 'Foo');
    });
  });
});
