/**
 * `lodash.pick` like method
 * @param {Object} obj
 * @param {string[]} keys
 * @return {Object}
 */
var pickKeys = function pickKeys(obj, keys) {
  const result = {};
  Object.keys(obj).forEach(key => {
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
var omitKeys = function omitKeys(obj, keys) {
  const result = {};
  Object.keys(obj).forEach(key => {
    if (keys.indexOf(key) === -1) {
      result[key] = obj[key];
    }
  });
  return result;
};


module.exports = {
  omitKeys: omitKeys,
  pickKeys: pickKeys
};
