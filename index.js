var _ = require('lodash');
var _s = require('underscore.string');


//var within = function within(value, min, max) {
//  return Math.min(Math.max(value, min), max);
//}


var formatters = {};


/**
 * @param {object} obj
 * @param {string} propName
 * @param {any} defaultValue
 * @param {object|undefined} options
 */
var defineParameter = function defineParameter(obj, propName, defaultValue, options) {
  options = _.assign({
    validate: function(value) {
      return true;
    },
    format: function(value) {
      return value.toString();
    }
  }, options || {});

  var privatePropName = '_' + propName;
  var capitalizedPropName = _s.capitalize(propName);

  var get = function get() {
    return this[privatePropName];
  };

  var set = function set(value) {
    if (!options.validate(value)) {
      throw new Error('`' + value + '` is invalid parameter');
    }
    this[privatePropName] = value;
  };

  // obj.maxHp .. getter, setter
  // obj._maxHp .. raw data
  Object.defineProperty(obj, propName, {
    get: get,
    set: set
  });

  // validateMaxHp
  obj['validate' + capitalizedPropName] = options.validate;

  // displayMaxHp
  obj['display' + capitalizedPropName] = function display() {
    return options.format(this[propName]);
  };

  // set default value with validation
  obj[propName] = defaultValue;
};

var defineNumberParameter = function defineNumberParameter(obj, propName, options) {
  options = _.assign({
    default: 0.0,
    min: null,
    max: null
  }, options || {});

  var customOptionKeys = ['default', 'min', 'max'];
  var customOptions = _.pick(options, customOptionKeys);
  options = _.omit(options, customOptionKeys);

  options.validate = function validate(value) {
    return (
      _.isNumber(value) && !_.isNaN(value) &&
      (customOptions.min === null || customOptions.min <= value) &&
      (customOptions.max === null || customOptions.max >= value)
    );
  };

  defineParameter(obj, propName, customOptions.default, options);
};


var aggregators = {};


module.exports = {
  defineParameter: defineParameter,
  defineNumberParameter: defineNumberParameter,
  formatters: formatters,
  aggregators: aggregators
};


//_parameterNameToAccessorName = (parameterName) ->
//  if /^(can|does|is)/.test parameterName
//    parameterName
//  else
//    'get' + _.capitalize(parameterName)
//
//_parameterNameToDisplayerName = (parameterName) ->
//  _parameterNameToAccessorName(parameterName) + 'Display'
//
//_parameterNameToRowDisplayerName = (parameterName) ->
//  _parameterNameToAccessorName(parameterName) + 'RowDisplay'
//
//_getParameterLabel = (parameterName) ->
//  label = x18n.t('feature.parameterModifier.label.' + parameterName)
//  label ? parameterName
//
//
//# 定型パラメータの一式を定義する
//# - 表示が必要なパラメータの場合はこれで定義する必要がある
//# - 定義順が表示順になる
//_stereotypeParameterNames = []
//_defineParameter = (subject, parameterName, parameterType) ->
//  _stereotypeParameterNames.push parameterName
//  dataKey = '_' + parameterName
//  accessorName = _parameterNameToAccessorName parameterName
//  displayerName = _parameterNameToDisplayerName parameterName
//  rowDisplayerName = _parameterNameToRowDisplayerName parameterName
//
//  switch parameterType
//    when 'flag'
//      defaultValue = false
//      accessor = -> @[dataKey]
//      toDisplay = -> if @[accessorName]() then 'On' else 'Off'
//    when 'rate'
//      defaultValue = 1.0
//      accessor = -> @[dataKey]
//      toDisplay = -> (@_toPercentage @[accessorName]()).toString() + '%'
//    when 'chance'
//      defaultValue = 0.0
//      accessor = -> @[dataKey]
//      toDisplay = -> (@_toPercentage @[accessorName]()).toString() + '%'
//    when 'power'
//      defaultValue = 0.0
//      accessor = -> @[dataKey]
//      toDisplay = -> (@_toSignedPercentage @[accessorName]()).toString() + '%'
//    when 'integer'
//      defaultValue = 0
//      accessor = -> @[dataKey]
//      toDisplay = -> Util.toPlusMinusSigned @[accessorName]()
//    when 'attack_attributes'
//      defaultValue = null
//      accessor = -> @[dataKey] ? {}
//      toDisplay = -> @_formatAttackAttributes @[accessorName]()
//
//  # e.g. _maxHpRate
//  subject[dataKey] = defaultValue
//
//  # e.g. getMaxHpRate
//  subject[accessorName] = accessor
//
//  # e.g. getMaxHpRateDisplay
//  subject[displayerName] = toDisplay
//
//  # e.g. getMaxHpRateRowDisplay
//  subject[rowDisplayerName] = ->
//    label = _getParameterLabel parameterName
//    value = @[displayerName]()
//    "#{label}: #{value}"
//
//
//ParameterModifierMixin = {}
//
//
//# Notice: 追加したら、テキストの feature.parameterModifier.row と要同期
//_defineParameter ParameterModifierMixin, 'giftBonus', 'integer'
//_defineParameter ParameterModifierMixin, 'strength', 'integer'
//_defineParameter ParameterModifierMixin, 'agility', 'integer'
//_defineParameter ParameterModifierMixin, 'intelligence', 'integer'
//_defineParameter ParameterModifierMixin, 'maxHpRate', 'rate'
//_defineParameter ParameterModifierMixin, 'speedRate', 'rate'
//_defineParameter ParameterModifierMixin, 'firstCastTimeRate', 'rate'
//_defineParameter ParameterModifierMixin, 'hitPower', 'power'
//_defineParameter ParameterModifierMixin, 'dodgePower', 'power'
//_defineParameter ParameterModifierMixin, 'commandPower', 'power'
//_defineParameter ParameterModifierMixin, 'resistancePower', 'power'
//_defineParameter ParameterModifierMixin, 'guardChance', 'chance'
//_defineParameter ParameterModifierMixin, 'antimagicChance', 'chance'
//_defineParameter ParameterModifierMixin, 'cannotGuard', 'flag'
//_defineParameter ParameterModifierMixin, 'cannotAntimagic', 'flag'
//_defineParameter ParameterModifierMixin, 'physicalAttackPowerRate', 'rate'
//_defineParameter ParameterModifierMixin, 'magicalAttackPowerRate', 'rate'
//_defineParameter ParameterModifierMixin, 'physicalCriticalHitChance', 'chance'
//_defineParameter ParameterModifierMixin, 'magicalCriticalHitChance', 'chance'
//_defineParameter ParameterModifierMixin, 'physicalDamageReductionRate', 'rate'
//_defineParameter ParameterModifierMixin, 'magicalDamageReductionRate', 'rate'
//_defineParameter ParameterModifierMixin, 'physicalCounterChance', 'chance'
//_defineParameter ParameterModifierMixin, 'magicalCounterChance', 'chance'
//_defineParameter ParameterModifierMixin, 'regenerationPower', 'power'
//_defineParameter ParameterModifierMixin, 'cureSpeedRate', 'rate'
//_defineParameter ParameterModifierMixin, 'gutsPower', 'power'
//_defineParameter ParameterModifierMixin, 'salienceRate', 'rate'
//_defineParameter ParameterModifierMixin, 'skillChargeRate', 'rate'
//_defineParameter ParameterModifierMixin, 'detectingPower', 'power'
//_defineParameter ParameterModifierMixin, 'unlockingPower', 'power'
//_defineParameter ParameterModifierMixin, 'avoidanceChance', 'chance'
//_defineParameter ParameterModifierMixin, 'chestDiscoveryRate', 'rate'
//_defineParameter ParameterModifierMixin, 'campDiscoveryRate', 'rate'
//_defineParameter ParameterModifierMixin, 'attackAttributes', 'attack_attributes'
//_defineParameter ParameterModifierMixin, 'defenseAttributes', 'attack_attributes'
//_defineParameter ParameterModifierMixin, 'isHiding', 'flag'
//_defineParameter ParameterModifierMixin, 'isUnactable', 'flag'
//_defineParameter ParameterModifierMixin, 'isConfused', 'flag'
//_defineParameter ParameterModifierMixin, 'cannotUseActiveSkill', 'flag'
//_defineParameter ParameterModifierMixin, 'isZombie', 'flag'
//
//ParameterModifierMixin.getPhysicalDamageReductionRateDisplay = ->
//  per = 100 - @_toPercentage(@getPhysicalDamageReductionRate())
//  per.toString() + '%'
//ParameterModifierMixin.getMagicalDamageReductionRateDisplay = ->
//  per = 100 - @_toPercentage(@getMagicalDamageReductionRate())
//  per.toString() + '%'
//# 再生率は値が細かいので小数点一桁を出す
//# e.g. -> '2.5', '-12.5'
//ParameterModifierMixin.getRegenerationPowerDisplay = ->
//  decimal = (Math.round @getRegenerationPower() * 1000) / 10
//  decimal.toFixed(1) + '%'
//# ガッツ率は値が大きいのでパーセント(切り捨て)表示
//ParameterModifierMixin.getGutsPowerDisplay = ->
//  Math.floor(@getGutsPower() * 100) + '%'
//
//
//App.ParameterModifierMixin = _.extend ParameterModifierMixin, {
//
//  _toPercentage: (rate) -> Util.numToPercentage rate
//
//  _toSignedPercentage: (rate) -> Util.toPlusMinusSigned @_toPercentage(rate), '+'
//
//  # e.g.
//  #   { heat:2, cold:-1 }
//  #   -> "He2, Co-1" or "熱2, 冷-1"
//  _formatAttackAttributes: (attackAttributes) ->
//    words = []
//    for attrType in Definition.ATTACK_ATTRIBUTES
//      value = attackAttributes[attrType]
//      if value? and (value > 0 or value < 0)
//        value = Util.within value, -4, 4
//        word = Definition.getAttackAttributeName attrType
//        word += "#{value}"
//        words.push word
//    if words.length > 0
//      words.join ', '
//    else
//      '-'
//
//  _isDefaultParameter: (parameterName) ->
//    accessorName = _parameterNameToAccessorName parameterName
//    defaultValue = ParameterModifierMixin[accessorName]()
//    _.isEqual defaultValue, @[accessorName]()
//
//  _procTypeIds: []
//  getProcTypeIds: -> @_procTypeIds
//
//  # 値が初期値から変更されている定型パラメータ名のみ抽出する
//  _extractModifiedParameterNames: ->
//    for parameterName in _stereotypeParameterNames
//      unless @_isDefaultParameter parameterName
//        parameterName
//      else
//        continue
//
//  getPassiveEffectDataList: ->
//    for parameterName in @_extractModifiedParameterNames()
//      {
//        name: parameterName
//        label: _getParameterLabel parameterName
//        value: @[_parameterNameToAccessorName parameterName]()
//        valueDisplay: @[_parameterNameToDisplayerName parameterName]()
//      }
//
//  # パッシブ効果表示用のテキストを返す, str or null=表示対象無し
//  # 修正がある項目のみが表示対象になる
//  toPassiveEffectsText: ->
//    rows = for parameterName in @_extractModifiedParameterNames()
//      methodName = _parameterNameToRowDisplayerName parameterName
//      @[methodName]()
//
//    if rows.length > 0
//      rows.join '\n'
//    else
//      null
//
//  toPassiveEffectsTextOrNoFeatureText: ->
//    passiveEffectText = @toPassiveEffectsText()
//    switch
//      when passiveEffectText? then passiveEffectText
//      else 'Have no features'
//}