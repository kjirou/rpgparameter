var isInteger = require('is-integer');
var assign = require('object-assign');
var _s = require('underscore.string');

var aggregators = require('./lib/aggregators');
var utils = require('./lib/utils');


var PARAMETER_TYPES = {
  BOOLEAN: 'BOOLEAN',
  CHANCE: 'CHANCE',
  INTEGER: 'INTEGER',
  NUMBER: 'NUMBER',
  PARAMETER: 'PARAMETER',
  RATE: 'RATE'
};

/**
 * @return {{type, getDisplayName, validateValue}}
 */
var createParameterShape = function createParameterShape(options) {
  var defaultedOptions = assign({
    type: PARAMETER_TYPES.PARAMETER,

    defaultValue: null,

    validate: function validateAsParameter(value) {
      return true;
    },

    display: function format(value) {
      return value.toString();
    }
  }, options || {});

  if (
    defaultedOptions.defaultValue !== null &&
    defaultedOptions.defaultValue !== undefined &&
    defaultedOptions.validate(defaultedOptions.defaultValue) === false
  ) {
    throw new Error('Invalid defaultValue');
  }

  return {
    type: defaultedOptions.type,

    defaultValue: defaultedOptions.defaultValue,

    getDisplayName: function display(value) {
      return defaultedOptions.format(value);
    },

    validateValue: function validateValue(value) {
      return defaultedOptions.validate(value);
    }
  };
};

/**
 * @return {{type, getDisplayName, validateValue, clampValue}}
 */
var createNumberParameterShape = function createParameterShape(options) {
  var defaultedOptions = assign({
    min: null,
    max: null,
    isIntegerOnly: false
  }, options || {});

  var parameterOptions = assign(pickKeys(defaultedOptions, ['type', 'validate', 'format']), {
    validate: function validateAsNumber(value) {
      return (
        typeof value === 'number' && !isNaN(value) &&
        (defaultedOptions.min === null || defaultedOptions.min <= value) &&
        (defaultedOptions.max === null || defaultedOptions.max >= value) &&
        (!defaultedOptions.isIntegerOnly || isInteger(value))
      );
    }
  });

  var parameter = createParameterShape(parameterOptions);

  return assign({}, parameter, {
    clampValue: function clampValue(value) {
      var clampedValue = value;

      if (defaultedOptions.min !== null) {
        clampedValue = Math.min(defaultedOptions.min, value);
      }

      if (defaultedOptions.max !== null) {
        clampedValue = Math.max(defaultedOptions.max, value);
      }

      return value;
    }
  });
};

var createIntegerParameterShape = function createIntegerParameterShape(options) {
  return createNumberParameterShape(assign({}, options, {
    type: PARAMETER_TYPES.INTEGER,
    isIntegerOnly: true
  }));
};

var createRateParameterShape = function createRateParameterShape(options) {
  return createNumberParameterShape(assign({}, options, {
    type: PARAMETER_TYPES.RATE,
    min: 0.0
  }));
};

var createChanceParameterShape = function createChanceParameterShape(options) {
  return createNumberParameterShape(assign({}, options, {
    type: PARAMETER_TYPES.CHANCE,
    min: 0.0,
    max: 1.0
  }));
};

var createBooleanParameterShape = function createBooleanParameterShape(options) {
  return createParameterShape(assign({}, options, {
    type: PARAMETER_TYPES.BOOLEAN,
    validate: function validateAsBoolean(value) {
      return value === true || value === false;
    }
  }));
};

var generatePropertyNames = function generatePropertyNames(parameterName, options) {
  var defaultedOptions = assign({
    isHumanizedGetter: true
  }, options || {});

  var privatePropName = '_' + _s.camelize(parameterName, true);
  var classifiedPropName = _s.classify(parameterName);

  // e.g. 'maxHp'   -> 'getMaxHp'
  //      'isEnemy' -> 'isEnemy'
  var getterName = (
    defaultedOptions.isHumanizedGetter &&
    /^(is|has|can|should|will)/.test(parameterName)
  ) ? _s.camelize(parameterName, true) : 'get' + classifiedPropName;

  return {
    privatePropName: privatePropName,
    classifiedPropName: classifiedPropName,
    getterName: getterName,
    rawGetterName: 'getRaw' + classifiedPropName,
    setterName: 'set' + classifiedPropName,
    validatorName: 'validate' + classifiedPropName,
    displayerName: 'display' + classifiedPropName
  };
};

/**
 * @param {Object} obj
 * @param {string} parameterName
 * @param {*} defaultValue
 * @param {(Object|undefined)} options
 */
var defineParameter = function defineParameter(obj, parameterName, defaultValue, options) {
  var defaultedOptions = assign({
    validate: function(value) {
      return true;
    },
    format: function(value) {
      return value.toString();
    },
    isHumanizedGetter: true
  }, options || {});

  var propNames = generatePropertyNames(parameterName, {
    isHumanizedGetter: defaultedOptions.isHumanizedGetter
  });

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

  obj[propNames.rawGetterName] = function getRawParameterValue() {
    return this[propNames.privatePropName];
  };

  obj[propNames.getterName] = function getParameterValue() {
    return obj[propNames.rawGetterName]();
  };

  obj[propNames.setterName] = function setParameterValue(value) {
    if (!defaultedOptions.validate(value)) {
      throw new Error('`' + value + '` is invalid parameter');
    }
    this[propNames.privatePropName] = value;
  };

  obj[propNames.validatorName] = defaultedOptions.validate;

  obj[propNames.displayerName] = function displayPropName() {
    return defaultedOptions.format(obj[propNames.getterName]());
  };

  // set default value with validation
  obj[propNames.setterName](defaultValue);
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
  aggregators: aggregators,
  createBooleanParameterShape: createBooleanParameterShape,
  createChanceParameterShape: createChanceParameterShape,
  createIntegerParameterShape: createIntegerParameterShape,
  createNumberParameterShape: createNumberParameterShape,
  createRateParameterShape: createRateParameterShape,
  createParameterShape: createParameterShape,
  defineParameter: defineParameter,
  defineNumberParameter: defineNumberParameter,
  defineIntegerParameter: defineIntegerParameter,
  defineRateParameter: defineRateParameter,
  defineChanceParameter: defineChanceParameter,
  defineBooleanParameter: defineBooleanParameter,
  generatePropertyNames: generatePropertyNames
};
