import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreWord, lengthMultiplier, rewardsForLength, GLITCH_BONUS } from '../public/js/logic/scoring.js';
import { tile } from './helpers.js';

test('longer words score more per letter', () => {
  for (let n = 4; n <= 15; n++) assert.ok(lengthMultiplier(n) > lengthMultiplier(n - 1));
  assert.equal(lengthMultiplier(2), 0);
});

test('basic score: CAT = (3+1+1) x1 x10', () => {
  const { points } = scoreWord([tile('C'), tile('A'), tile('T')], 3);
  assert.equal(points, 50);
});

test('rare letters score more than common ones', () => {
  const zap = scoreWord([tile('Z'), tile('A'), tile('P')], 3).points;
  const tan = scoreWord([tile('T'), tile('A'), tile('N')], 3).points;
  assert.ok(zap > tan);
});

test('gold doubles, crystal triples, wild counts zero', () => {
  const plain = scoreWord([tile('C'), tile('A'), tile('T')], 3).points;
  assert.equal(scoreWord([tile('C', 'gold'), tile('A'), tile('T')], 3).points, plain * 2);
  assert.equal(scoreWord([tile('C', 'crystal'), tile('A', 'gold'), tile('T')], 3).points, plain * 6);
  assert.equal(scoreWord([tile('?', 'wild'), tile('A'), tile('T')], 3).points, 20);
});

test('glitch tiles add a bonus, streaks add 10% each', () => {
  const plain = scoreWord([tile('C'), tile('A'), tile('T')], 3).points;
  assert.equal(scoreWord([tile('C', 'glitch'), tile('A'), tile('T')], 3).points, plain + GLITCH_BONUS);
  const s = scoreWord([tile('S'), tile('T'), tile('A'), tile('R'), tile('E')], 5, { streak: 2 });
  assert.equal(s.points, Math.round(5 * 2 * 1.2) * 10);
});

test('long words earn reward tiles', () => {
  assert.deepEqual(rewardsForLength(4), []);
  assert.deepEqual(rewardsForLength(5), ['gold']);
  assert.deepEqual(rewardsForLength(6), ['wild']);
  assert.deepEqual(rewardsForLength(7), ['crystal']);
  assert.deepEqual(rewardsForLength(9), ['bolt', 'crystal']);
});
