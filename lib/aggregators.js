var isInteger = require('is-integer');


//
// NOTE: use array.{every|some} in the case of booleans
//

exports.aggregateNumbers = function aggregateNumbers(numbers) {
  return numbers.reduce(function(m, v) {
    v = Number(v);
    if (typeof v !== 'number' || isNaN(v)) {
      throw new Error(numbers + ' is invalid numbers');
    }
    return m + v;
  }, 0.0);
};

exports.aggregateIntegers = function aggregateIntegers(integers) {
  return integers.reduce(function(m, v) {
    v = Number(v);
    if (typeof v !== 'number' || isNaN(v) || !isInteger(v)) {
      throw new Error(integers + ' is invalid integers');
    }
    return m + v;
  }, 0);
};

exports.aggregateRates = function aggregateRates(rates) {
  var rate = rates.reduce(function(m, v) {
    if (v < 0.0) {
      throw new Error(rates + ' is invalid rates');
    }
    return m * v;
  }, 1.0);
  return Math.max(rate, 0.0);
};

/**
 * @example
 *   ([0.2, 0.3])
 *   = 1.0 - ((1.0 - 0.2) * (1.0 - 0.3))
 *   = 1.0 - 0.56 = 0.44
 */
exports.aggregateChances = function aggregateChances(chances) {
  var exclusiveProb = chances.reduce(function(m, v) {
    if (v < 0 || v > 1.0) {
      throw new Error(chances + ' is invalid chances');
    }
    return m * (1.0 - v);
  }, 1.0);
  return 1.0 - exclusiveProb;
};
