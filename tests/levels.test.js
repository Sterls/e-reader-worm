import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../public/js/logic/rng.js';
import { makeGoals, levelConfig, updateGoals, goalText, targetScore } from '../public/js/logic/levels.js';

test('levels get harder', () => {
  for (let l = 2; l <= 30; l++) {
    const a = levelConfig(l - 1);
    const b = levelConfig(l);
    assert.ok(b.targetScore > a.targetScore);
    assert.ok(b.glitchChance >= a.glitchChance);
    assert.ok(b.glitchTimer <= a.glitchTimer);
  }
  assert.equal(levelConfig(1).glitchChance, 0, 'no hazards on level 1');
});

test('every level has a score goal plus at least one more, with readable text', () => {
  for (let l = 1; l <= 40; l++) {
    const goals = makeGoals(l, createRng(l));
    assert.equal(goals[0].type, 'score');
    assert.equal(goals[0].target, targetScore(l));
    assert.ok(goals.length >= 2 && goals.length <= 3);
    assert.equal(new Set(goals.map((g) => g.type)).size, goals.length, 'no duplicate goal types');
    goals.forEach((g) => assert.ok(goalText(g).length > 3));
  }
});

test('goal progress', () => {
  const goals = [
    { type: 'score', target: 500, progress: 0 },
    { type: 'longWords', minLen: 5, target: 2, progress: 0 },
    { type: 'letter', letter: 'K', target: 1, progress: 0 },
  ];
  let done = updateGoals(goals, { levelScore: 200, length: 5, letters: ['S', 'T', 'A', 'R', 'E'], glitches: 0, specials: 0 });
  assert.equal(done.length, 0);
  done = updateGoals(goals, { levelScore: 600, length: 6, letters: ['K', 'I', 'T', 'T', 'E', 'N'], glitches: 0, specials: 0 });
  assert.equal(done.length, 3);
  assert.equal(goals[0].progress, 500);
});
