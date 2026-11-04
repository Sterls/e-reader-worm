// Letter values, letter generation and balancing.
// "Qu" is a single tile (Q is almost always followed by U in English).
import { nextFloat } from './rng.js';

export const WILD = '?';
export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
export const RARE = new Set(['J', 'Qu', 'X', 'Z']);

// Points per letter: common letters are cheap, rare letters are valuable.
export const LETTER_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 3, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Qu: 8, R: 1, S: 1, T: 1, U: 1, V: 5, W: 4, X: 8, Y: 4, Z: 10,
};

const VOWEL_WEIGHTS = { A: 9, E: 12, I: 8, O: 8, U: 4 };
const CONSONANT_WEIGHTS = {
  B: 2, C: 3, D: 4, F: 2, G: 3, H: 3, J: 0.6, K: 1.2, L: 5, M: 3, N: 6, P: 3,
  Qu: 0.6, R: 6, S: 6, T: 7, V: 1.5, W: 2, X: 0.6, Y: 2, Z: 0.6,
};

function toTable(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  return { entries, total };
}
const VOWEL_TABLE = toTable(VOWEL_WEIGHTS);
const CONSONANT_TABLE = toTable(CONSONANT_WEIGHTS);
const FALLBACK_ORDER = Object.entries({ ...VOWEL_WEIGHTS, ...CONSONANT_WEIGHTS })
  .sort((a, b) => b[1] - a[1])
  .map(([letter]) => letter);

function weightedPick(rng, table) {
  let roll = nextFloat(rng) * table.total;
  for (const [letter, w] of table.entries) {
    roll -= w;
    if (roll < 0) return letter;
  }
  return table.entries[table.entries.length - 1][0];
}

export function letterValue(letter) {
  return LETTER_VALUES[letter] ?? 0;
}

/** Lower-case text a tile contributes to a word ('Qu' -> 'qu', '?' -> '?'). */
export function letterText(letter) {
  return letter.toLowerCase();
}

/** How many letters a tile adds to the word length. */
export function letterLength(letter) {
  return letter === 'Qu' ? 2 : 1;
}

export function isVowel(letter) {
  return VOWELS.has(letter) || letter === WILD;
}

export function emptyCounts() {
  return { total: 0, vowels: 0, rare: 0, per: {} };
}

export function addToCounts(counts, letter) {
  counts.total++;
  if (isVowel(letter)) counts.vowels++;
  if (RARE.has(letter)) counts.rare++;
  counts.per[letter] = (counts.per[letter] || 0) + 1;
  return counts;
}

export function countLetters(board) {
  const counts = emptyCounts();
  for (const row of board) for (const tile of row) if (tile) addToCounts(counts, tile.letter);
  return counts;
}

function maxSame(letter) {
  if (RARE.has(letter)) return 1;
  if (letter === 'E') return 5;
  if (VOWELS.has(letter)) return 4;
  return 3;
}

function allowed(letter, counts) {
  if (RARE.has(letter) && counts.rare >= 2) return false;
  return (counts.per[letter] || 0) < maxSame(letter);
}

/**
 * Picks a new letter, keeping the board playable:
 * roughly 40% vowels, no more than 2 rare letters, and no big piles of one letter.
 */
export function generateLetter(rng, counts = emptyCounts()) {
  const ratio = counts.total > 0 ? counts.vowels / counts.total : 0.4;
  let vowelProb = 0.4;
  if (counts.total >= 6 && ratio < 0.32) vowelProb = 0.8;
  else if (counts.total >= 6 && ratio > 0.48) vowelProb = 0.12;
  for (let attempt = 0; attempt < 10; attempt++) {
    const useVowel = nextFloat(rng) < vowelProb;
    const letter = weightedPick(rng, useVowel ? VOWEL_TABLE : CONSONANT_TABLE);
    if (allowed(letter, counts)) return letter;
  }
  // Rare fallback: take the most common letter that is still allowed.
  for (const letter of FALLBACK_ORDER) {
    if (allowed(letter, counts)) return letter;
  }
  return 'E';
}
