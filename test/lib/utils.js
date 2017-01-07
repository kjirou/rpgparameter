var assert = require('assert');

var utils = require('../../lib/utils');
var omitKeys = utils.omitKeys;
var pickKeys = utils.pickKeys;


describe('lib/utils', function() {
  it('pickKeys', function() {
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, []), {});
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x']), { x: 1 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x', 'y']), { x: 1, y: 2 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['x', 'y', 'z']), { x: 1, y: 2, z: 3 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z']), { z: 3 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'y']), { y: 2, z: 3 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'y', 'x']), { x: 1, y: 2, z: 3 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['z', 'x']), { x: 1, z: 3 });
    assert.deepEqual(pickKeys({ x: 1, y: 2, z: 3 }, ['not_a_key', 'x', 'y', 'z']), { x: 1, y: 2, z: 3 });
  });

  it('omitKeys', function() {
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, []), { x: 1, y: 2, z: 3 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x']), { y: 2, z: 3 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x', 'y']), { z: 3 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['x', 'y', 'z']), {});
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z']), { x: 1, y: 2 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'y']), { x: 1 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'y', 'x']), {});
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['z', 'x']), { y: 2 });
    assert.deepEqual(omitKeys({ x: 1, y: 2, z: 3 }, ['not_a_key']), { x: 1, y: 2, z: 3 });
  });
});
