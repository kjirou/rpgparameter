var assert = require('assert');

var aggregators = require('../../lib/aggregators');


describe('rpgparameter aggregators module', function() {

  it('should be defined as object', function() {
    assert.strictEqual(typeof aggregators, 'object');
  });

  it('aggregateNumbers', function() {
    assert.strictEqual(aggregators.aggregateNumbers([]), 0.0);
    assert.strictEqual(aggregators.aggregateNumbers([0.4, 0.5]), 0.9);
    assert(-0.201 < aggregators.aggregateNumbers([0.1, -0.3]));
    assert(-0.199 > aggregators.aggregateNumbers([0.1, -0.3]));
    assert.throws(function() {
      aggregators.aggregateNumbers(['not_a_number']);
    }, /not_a_number/);
  });

  it('aggregateIntegers', function() {
    assert.strictEqual(aggregators.aggregateIntegers([]), 0);
    assert.strictEqual(aggregators.aggregateIntegers([4, 5]), 9);
    assert.strictEqual(aggregators.aggregateIntegers([1, -3]), -2);
    assert.throws(function() {
      aggregators.aggregateIntegers(['not_a_number']);
    }, /not_a_number/);
    assert.throws(function() {
      aggregators.aggregateIntegers([1.1]);
    }, /1\.1/);
  });

  it('aggregateRates', function() {
    assert.strictEqual(aggregators.aggregateRates([]), 1.0);
    assert.strictEqual(aggregators.aggregateRates([0.4, 0.5]), 0.2);
    assert.throws(function() {
      aggregators.aggregateRates([-0.01]);
    }, /-0.01/);
  });

  it('aggregateChances', function() {
    assert.strictEqual(aggregators.aggregateChances([]), 0.0);
    assert(0.439 < aggregators.aggregateChances([0.2, 0.3]));
    assert(0.441 > aggregators.aggregateChances([0.2, 0.3]));
    assert.strictEqual(aggregators.aggregateChances([1.0, 0.5]), 1.0);
    assert.throws(function() {
      aggregators.aggregateChances([1.01]);
    }, /1.01/);
    assert.throws(function() {
      aggregators.aggregateChances([-0.01]);
    }, /-0.01/);
  });
});
