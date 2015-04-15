var assert = require('assert');

var rpgparameter = require('../index');
var defineParameter = rpgparameter.defineParameter;
var defineNumberParameter = rpgparameter.defineNumberParameter;


describe('rpgparameter module', function() {

  it('should be defined as object', function() {
    assert.strictEqual(typeof rpgparameter, 'object');
  });


  context('defineParameter', function() {

    it('should be', function() {
      var creature = {};
      defineParameter(creature, 'maxHp', 1);
      assert.strictEqual(creature._maxHp, 1);
      assert.strictEqual(creature.maxHp, 1);

      creature.maxHp = 2;
      assert.strictEqual(creature._maxHp, 2);
      assert.strictEqual(creature.maxHp, 2);
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

      creature.attackPower = 1;
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

      creature.defenseRate = 1.0;
      assert.strictEqual(creature.defenseRate, 1.0);
      assert.throws(function() {
        creature.defenseRate = -0.01;
      }, /-0\.01/);
    });
  });

  context('defineNumberParameter', function() {

    it('should be', function() {
      var creature = {};
      defineNumberParameter(creature, 'money');
      assert.strictEqual(creature.money, 0);
      creature.money = 100;
      creature.money = -100;
    });

    it('default option', function() {
      var creature = {};
      defineNumberParameter(creature, 'maxHp', {
        default: 5
      });
      assert.strictEqual(creature.maxHp, 5);
    });

    it('min option', function() {
      var creature = {};
      defineNumberParameter(creature, 'money', {
        min: 0
      });
      creature.money = 10;
      creature.money = 0;
      assert.throws(function() {
        creature.money = -1;
      }, /-1/);
    });

    it('max option', function() {
      var creature = {};
      defineNumberParameter(creature, 'money', {
        max: 10
      });
      creature.money = -10;
      creature.money = 10;
      assert.throws(function() {
        creature.money = 11;
      }, /11/);
    });
  });
});
