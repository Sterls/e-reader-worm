import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../public/js/logic/rng.js';
import {
  generateLetter, emptyCounts, addToCounts, letterValue, letterLength, LETTER_VALUES, RARE, isVowel,
} from '../public/js/logic/letters.js';

test('every letter has a value, rare letters are worth more', () => {
  assert.equal(Object.keys(LETTER_VALUES).length, 26);
  assert.ok(letterValue('Z') > letterValue('E'));
  assert.ok(letterValue('Qu') > letterValue('S'));
  assert.equal(letterValue('?'), 0);
});

test('Qu counts as two letters', () => {
  assert.equal(letterLength('Qu'), 2);
  assert.equal(letterLength('A'), 1);
});

test('generated boards are balanced', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const rng = createRng(seed);
    const counts = emptyCounts();
    for (let i = 0; i < 56; i++) addToCounts(counts, generateLetter(rng, counts));
    const ratio = counts.vowels / counts.total;
    assert.ok(ratio >= 0.28 && ratio <= 0.55, `seed ${seed}: vowel ratio ${ratio}`);
    assert.ok(counts.rare <= 2, `seed ${seed}: ${counts.rare} rare letters`);
    for (const [letter, n] of Object.entries(counts.per)) {
      const limit = RARE.has(letter) ? 1 : letter === 'E' ? 5 : isVowel(letter) ? 4 : 3;
      assert.ok(n <= limit, `seed ${seed}: ${n} x ${letter}`);
    }
  }
});

test('uses a wide spread of letters', () => {
  const rng = createRng(99);
  const seen = new Set();
  for (let i = 0; i < 3000; i++) seen.add(generateLetter(rng, emptyCounts()));
  assert.ok(seen.size >= 24, `only saw ${seen.size} letters`);
});
