var isInteger = require('is-integer');
var assign = require('object-assign');
var _s = require('underscore.string');

var aggregators = require('./lib/aggregators');
var utils = require('./lib/utils');


/**
 * @param {Object} obj
 * @param {string} parameterName
 * @param {*} defaultValue
 * @param {(Object|undefined)} options
 */
var defineParameter = function defineParameter(obj, parameterName, defaultValue, options) {
  options = assign({
    validate: function(value) {
      return true;
    },
    format: function(value) {
      return value.toString();
    },
    isHumanizedGetter: true
  }, options || {});

  var privatePropName = '_' + _s.camelize(parameterName, true);
  var classifiedPropName = _s.classify(parameterName);
  // e.g. 'maxHp'   -> 'getMaxHp'
  //      'isEnemy' -> 'isEnemy'
  var getterName = 'get' + classifiedPropName;
  if (
    options.isHumanizedGetter &&
    /^(is|has|can|should|will)/.test(parameterName)
  ) {
    getterName = _s.camelize(parameterName, true);
  }

  //
  // NOTE:
  //
  // Can not use Object.definePeoperty,
  //   because defined getter/setter can not mix-in other object.
  // I want to use like the following:
  //
  // ```
  // var parameters = {};
  // defineParameter(parameters, 'maxHp');
  // defineParameter(parameters, 'attack');
  // defineParameter(parameters, 'defense');
  //
  // var creature = {};
  // mixin(creature, mixin);
  // var skill = {};
  // mixin(skill, mixin);
  // var equipment = {};
  // mixin(equipment, mixin);
  // ```
  //

  // getRawMaxHp
  obj['getRaw' + classifiedPropName] = function getRaw() {
    return this[privatePropName];
  };

  // getMaxHp (or isFooBar or canFooBar etc)
  obj[getterName] = function get() {
    return this['getRaw' + classifiedPropName]();
  };

  // setMaxHp
  obj['set' + classifiedPropName] = function set(value) {
    if (!options.validate(value)) {
      throw new Error('`' + value + '` is invalid parameter');
    }
    this[privatePropName] = value;
  };

  // validateMaxHp
  obj['validate' + classifiedPropName] = options.validate;

  // displayMaxHp
  obj['display' + classifiedPropName] = function display() {
    return options.format(this[getterName]());
  };

  // set default value with validation
  obj['set' + classifiedPropName](defaultValue);
};

var defineNumberParameter = function defineNumberParameter(obj, parameterName, options) {
  options = assign({
    default: 0.0,
    min: null,
    max: null,
    isIntegerOnly: false
  }, options || {});

  var customOptionKeys = ['default', 'min', 'max', 'isIntegerOnly'];
  var customOptions = utils.pickKeys(options, customOptionKeys);
  options = utils.omitKeys(options, customOptionKeys);

  options.validate = function validate(value) {
    return (
      typeof value === 'number' && !isNaN(value) &&
      (customOptions.min === null || customOptions.min <= value) &&
      (customOptions.max === null || customOptions.max >= value) &&
      (!customOptions.isIntegerOnly || isInteger(value))
    );
  };

  defineParameter(obj, parameterName, customOptions.default, options);
};

var defineIntegerParameter = function defineIntegerParameter(obj, parameterName, options) {
  defineNumberParameter(obj, parameterName, assign({}, options, { isIntegerOnly: true }));
};

var defineRateParameter = function defineRateParameter(obj, parameterName, options) {
  options = assign({
    default: 1.0
  }, options || {}, {
    min: 0.0
  });
  defineNumberParameter(obj, parameterName, options);
};

var defineChanceParameter = function defineChanceParameter(obj, parameterName, options) {
  options = assign({
    default: 0.0,
  }, options || {}, {
    min: 0.0,
    max: 1.0
  });
  defineNumberParameter(obj, parameterName, options);
};

var defineBooleanParameter = function defineBooleanParameter(obj, parameterName, options) {
  options = assign({
    default: false
  }, options || {});

  var customOptionKeys = ['default'];
  var customOptions = utils.pickKeys(options, customOptionKeys);
  options = utils.omitKeys(options, customOptionKeys);

  options.validate = function validate(value) {
    return value === true || value === false;
  };

  defineParameter(obj, parameterName, customOptions.default, options);
};


module.exports = {
  defineParameter: defineParameter,
  defineNumberParameter: defineNumberParameter,
  defineIntegerParameter: defineIntegerParameter,
  defineRateParameter: defineRateParameter,
  defineChanceParameter: defineChanceParameter,
  defineBooleanParameter: defineBooleanParameter,
  aggregators: aggregators
};
