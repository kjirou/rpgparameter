var assert = require('assert');

var rpgparameter = require('../index');
var defineParameter = rpgparameter.defineParameter;
var defineNumberParameter = rpgparameter.defineNumberParameter;
var defineIntegerParameter = rpgparameter.defineIntegerParameter;
var defineRateParameter = rpgparameter.defineRateParameter;
var defineChanceParameter = rpgparameter.defineChanceParameter;
var defineBooleanParameter = rpgparameter.defineBooleanParameter;
var aggregators = rpgparameter.aggregators;


describe('rpgparameter module', function() {

  it('should be defined as object', function() {
    assert.strictEqual(typeof rpgparameter, 'object');
  });

  it('should aggregators exist', function() {
    assert.strictEqual(typeof aggregators, 'object');
  });


  context('defineParameter', function() {

    it('should be', function() {
      var creature = {};
      defineParameter(creature, 'maxHp', 1);
      assert.strictEqual(creature._maxHp, 1);
      assert.strictEqual(creature.getMaxHp(), 1);

      creature.setMaxHp(2);
      assert.strictEqual(creature._maxHp, 2);
      assert.strictEqual(creature.getMaxHp(), 2);
    });

    it('format option', function() {
      var creature = {};
      defineParameter(creature, 'attackPower', 10, {
        format: function(value) {
          if (value > 1) {
            return value + 'pts';
          } else {
            return value + 'pt';
          }
        }
      });
      assert.strictEqual(creature.displayAttackPower(), '10pts');

      creature.setAttackPower(1);
      assert.strictEqual(creature.displayAttackPower(), '1pt');
    });

    it('validate option', function() {
      var creature = {};
      defineParameter(creature, 'defenseRate', 0.0, {
        validate: function(value) {
          return 0.0 <= value && value <= 1.0;
        }
      });
      assert.strictEqual(creature.validateDefenseRate(1.0), true);
      assert.strictEqual(creature.validateDefenseRate(1.01), false);

      creature.setDefenseRate(1.0);
      assert.strictEqual(creature.getDefenseRate(), 1.0);
      assert.throws(function() {
        creature.setDefenseRate(-0.01);
      }, /-0\.01/);
    });

    it('isHumanizedGetter option', function() {
      var creature;
      creature = {};
      defineParameter(creature, 'isUnique', false);
      assert.strictEqual(creature.isUnique(), false);
      creature.setIsUnique(true);
      assert.strictEqual(creature.isUnique(), true);

      creature = {};
      defineParameter(creature, 'isUnique', false, {
        isHumanizedGetter: false
      });
      assert.strictEqual(creature.getIsUnique(), false);
    });
  });


  context('defineNumberParameter', function() {

    it('should be', function() {
      var creature = {};
      defineNumberParameter(creature, 'money');
      assert.strictEqual(creature.getMoney(), 0);
      creature.setMoney(100);
      creature.setMoney(-100);
    });

    it('default option', function() {
      var creature = {};
      defineNumberParameter(creature, 'maxHp', {
        default: 5
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


  context('defineIntegerParameter', function() {

    it('should be', function() {
      var creature = {};
      defineIntegerParameter(creature, 'level');
      assert.strictEqual(creature.getLevel(), 0);
      creature.setLevel(99);
      creature.setLevel(-99);
      assert.throws(function() {
        creature.setLevel(1.01);
      }, /1.01/);
    });
  });


  context('defineRateParameter', function() {

    it('should be', function() {
      var creature = {};
      defineRateParameter(creature, 'damageRate');
      assert.strictEqual(creature.getDamageRate(), 1.0);
      creature.setDamageRate(0.0);
      creature.setDamageRate(99.9);
      assert.throws(function() {
        creature.setDamageRate(-0.01);
      }, /-0.01/);
    });
  });


  context('defineChanceParameter', function() {

    it('should be', function() {
      var creature = {};
      defineChanceParameter(creature, 'guardChance');
      assert.strictEqual(creature.getGuardChance(), 0.0);
      creature.setGuardChance(0.0);
      creature.setGuardChance(1.0);
      assert.throws(function() {
        creature.setGuardChance(-0.01);
      }, /-0.01/);
      assert.throws(function() {
        creature.setGuardChance(1.01);
      }, /1.01/);
    });
  });

  context('defineBooleanParameter', function() {

    it('should be', function() {
      var creature = {};
      defineBooleanParameter(creature, 'isEnemy');
      assert.strictEqual(creature.isEnemy(), false);
      creature.setIsEnemy(true);
      assert.throws(function() {
        creature.setIsEnemy(1);
      }, /1/);
    });
  });
});
