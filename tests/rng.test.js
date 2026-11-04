import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, nextFloat, nextInt, shuffleInPlace } from '../public/js/logic/rng.js';

test('same seed gives the same numbers', () => {
  const a = createRng(42);
  const b = createRng(42);
  for (let i = 0; i < 100; i++) assert.equal(nextFloat(a), nextFloat(b));
});

test('numbers stay in range', () => {
  const rng = createRng(7);
  for (let i = 0; i < 1000; i++) {
    const f = nextFloat(rng);
    assert.ok(f >= 0 && f < 1);
    const n = nextInt(rng, 6);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 6);
  }
});

test('shuffle keeps all items', () => {
  const arr = shuffleInPlace(createRng(3), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual([...arr].sort(), [1, 2, 3, 4, 5, 6, 7]);
});
