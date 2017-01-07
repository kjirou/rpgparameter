var assert = require('assert');

var utils = require('../../lib/utils');
var omitKeys = utils.omitKeys;
var pickKeys = utils.pickKeys;


describe('lib/utils', function() {
  it('pickKeys', () => {
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, []), {});
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x']), { x: 1 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x', 'y']), { x: 1, y: 2 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x', 'y', 'z']), { x: 1, y: 2, z: 3 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z']), { z: 3 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'y']), { y: 2, z: 3 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'y', 'x']), { x: 1, y: 2, z: 3 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'x']), { x: 1, z: 3 });
    assert.deepStrictEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['not_a_key', 'x', 'y', 'z']), { x: 1, y: 2, z: 3 });
  });

  it('omitKeys', () => {
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, []), { x: 1, y: 2, z: 3 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x']), { y: 2, z: 3 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x', 'y']), { z: 3 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x', 'y', 'z']), {});
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z']), { x: 1, y: 2 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'y']), { x: 1 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'y', 'x']), {});
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'x']), { y: 2 });
    assert.deepStrictEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['not_a_key']), { x: 1, y: 2, z: 3 });
  });
});
