var isInteger = require('is-integer');
var assign = require('object-assign');
var _s = require('underscore.string');

var aggregators = require('./lib/aggregators');
var utils = require('./lib/utils');


var PARAMETER_SHAPE_TYPES = {
  BOOLEAN: 'BOOLEAN',
  CHANCE: 'CHANCE',
  INTEGER: 'INTEGER',
  NUMBER: 'NUMBER',
  PARAMETER: 'PARAMETER',
  RATE: 'RATE'
};

var createParameterShapeDefaultOptions = function createParameterShapeDefaultOptions() {
  return {
    type: PARAMETER_SHAPE_TYPES.PARAMETER,

    defaultValue: null,

    validateValue: function validateValueAsParameter(value) {
      return true;
    },

    displayValue: function displayValue(value) {
      return value.toString();
    }
  };
};

/**
 * @return {{type, defaultValue, displayValue, validateValue}}
 */
var createParameterShape = function createParameterShape(options) {
  var defaultedOptions = assign(createParameterShapeDefaultOptions(), options || {});

  if (
    defaultedOptions.defaultValue !== null &&
    defaultedOptions.defaultValue !== undefined &&
    defaultedOptions.validateValue(defaultedOptions.defaultValue) === false
  ) {
    throw new Error('Invalid defaultValue');
  }

  return {
    type: defaultedOptions.type,

    defaultValue: defaultedOptions.defaultValue,

    validateValue: function validateValue(value) {
      return defaultedOptions.validateValue(value);
    },

    displayValue: function displayValue(value) {
      return defaultedOptions.displayValue(value);
    }
  };
};

/**
 * @return {{type, getDisplayName, validateValue, clampValue}}
 */
var createNumberParameterShape = function createNumberParameterShape(options) {
  var defaultedOptions = assign({
    min: null,
    max: null,
    isIntegerOnly: false,
    defaultValue: 0.0
  }, options || {});

  var keys = Object.keys(createParameterShapeDefaultOptions());
  var parameterOptions = assign(utils.pickKeys(defaultedOptions, keys), {
    validateValue: function validateValueAsNumber(value) {
      return (
        typeof value === 'number' && !isNaN(value) &&
        (defaultedOptions.min === null || defaultedOptions.min <= value) &&
        (defaultedOptions.max === null || defaultedOptions.max >= value) &&
        (!defaultedOptions.isIntegerOnly || isInteger(value))
      );
    }
  });

  var parameterShape = createParameterShape(parameterOptions);

  return assign(parameterShape, {
    min: defaultedOptions.min,
    max: defaultedOptions.max,
    clampValue: function clampValue(value) {
      var clampedValue = value;

      if (defaultedOptions.min !== null) {
        clampedValue = Math.max(defaultedOptions.min, clampedValue);
      }

      if (defaultedOptions.max !== null) {
        clampedValue = Math.min(defaultedOptions.max, clampedValue);
      }

      return clampedValue;
    }
  });
};

var createIntegerParameterShape = function createIntegerParameterShape(options) {
  return createNumberParameterShape(
    assign({
      type: PARAMETER_SHAPE_TYPES.INTEGER,
      isIntegerOnly: true,
      defaultValue: 0
    }, options || {})
  );
};

var createRateParameterShape = function createRateParameterShape(options) {
  return createNumberParameterShape(
    assign({
      type: PARAMETER_SHAPE_TYPES.RATE,
      min: 0.0,
      defaultValue: 1.0
    }, options || {})
  );
};

var createChanceParameterShape = function createChanceParameterShape(options) {
  return createNumberParameterShape(
    assign({
      type: PARAMETER_SHAPE_TYPES.CHANCE,
      min: 0.0,
      max: 1.0,
      defaultValue: 0.0
    }, options || {})
  );
};

var createBooleanParameterShape = function createBooleanParameterShape(options) {
  return createParameterShape(
    assign({
      type: PARAMETER_SHAPE_TYPES.BOOLEAN,
      validateValue: function validateValueAsBoolean(value) {
        return value === true || value === false;
      },
      defaultValue: false
    }, options || {})
  );
};

var generatePropertyNames = function generatePropertyNames(parameterName) {
  var privatePropName = '_' + _s.camelize(parameterName, true);
  var classifiedPropName = _s.classify(parameterName);

  return {
    privatePropName: privatePropName,
    classifiedPropName: classifiedPropName,
    getterName: 'get' + classifiedPropName,
    humanizedGetterName: _s.camelize(parameterName, true),
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
 * @param {Function} validateParameter
 * @param {Function} displayParameter
 * @param {(Object|undefined)} options
 */
var defineProperties = function defineProperties(
  obj, parameterName, defaultValue, validateParameter, displayParameter, options
) {
  var defaultedOptions = assign({
    isEnabledHumanizedGetter: true
  }, options || {});

  var propNames = generatePropertyNames(parameterName);

  //
  // NOTE: Can not use `Object.definePeoperty`,
  //         because defined accessors can not mix-in other object.
  //

  obj[propNames.rawGetterName] = function getRawParameterValue() {
    return this[propNames.privatePropName];
  };

  obj[propNames.getterName] = function getParameterValue() {
    return this[propNames.rawGetterName]();
  };

  if (
    defaultedOptions.isEnabledHumanizedGetter &&
    /^(is|has|can|should|will)/.test(parameterName)
  ) {
    obj[propNames.humanizedGetterName] = obj[propNames.getterName];
  }

  obj[propNames.setterName] = function setParameterValue(value) {
    if (!validateParameter(value)) {
      throw new Error('`' + value + '` is invalid parameter');
    }
    this[propNames.privatePropName] = value;
  };

  obj[propNames.validatorName] = validateParameter;

  obj[propNames.displayerName] = function displayParameterValue() {
    return displayParameter(obj[propNames.getterName]());
  };

  // set default value with validation
  obj[propNames.setterName](defaultValue);
};

var defineParameterViaShape = function defineParameterViaShape(obj, parameterName, shape, options) {
  var definitionOptions = utils.pickKeys(options || {}, ['isEnabledHumanizedGetter']);

  defineProperties(
    obj,
    parameterName,
    shape.defaultValue,
    shape.validateValue,
    shape.displayValue,
    definitionOptions
  );
};

var defineParameter = function defineParameter(obj, parameterName, options) {
  var shape = createParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};

var defineNumberParameter = function defineNumberParameter(obj, parameterName, options) {
  var shape = createNumberParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};

var defineIntegerParameter = function defineIntegerParameter(obj, parameterName, options) {
  var shape = createIntegerParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};

var defineRateParameter = function defineRateParameter(obj, parameterName, options) {
  var shape = createRateParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};

var defineChanceParameter = function defineChanceParameter(obj, parameterName, options) {
  var shape = createChanceParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};

var defineBooleanParameter = function defineBooleanParameter(obj, parameterName, options) {
  var shape = createBooleanParameterShape(options);
  defineParameterViaShape(obj, parameterName, shape, options);
};


module.exports = {
  PARAMETER_SHAPE_TYPES: PARAMETER_SHAPE_TYPES,
  aggregators: aggregators,
  createBooleanParameterShape: createBooleanParameterShape,
  createChanceParameterShape: createChanceParameterShape,
  createIntegerParameterShape: createIntegerParameterShape,
  createNumberParameterShape: createNumberParameterShape,
  createRateParameterShape: createRateParameterShape,
  createParameterShape: createParameterShape,
  defineBooleanParameter: defineBooleanParameter,
  defineChanceParameter: defineChanceParameter,
  defineIntegerParameter: defineIntegerParameter,
  defineNumberParameter: defineNumberParameter,
  defineParameter: defineParameter,
  defineRateParameter: defineRateParameter,
  generatePropertyNames: generatePropertyNames
};
