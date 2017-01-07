/**
 * `lodash.pick` like method
 * @param {Object} obj
 * @param {string[]} keys
 * @return {Object}
 */
exports.pickKeys = function pickKeys(obj, keys) {
  const result = {};
  Object.keys(obj).forEach(function(key) {
    if (keys.indexOf(key) !== -1) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * `lodash.omit` like method
 * @param {Object} obj
 * @param {string[]} keys
 * @return {Object}
 */
exports.omitKeys = function omitKeys(obj, keys) {
  const result = {};
  Object.keys(obj).forEach(function(key) {
    if (keys.indexOf(key) === -1) {
      result[key] = obj[key];
    }
  });
  return result;
};
