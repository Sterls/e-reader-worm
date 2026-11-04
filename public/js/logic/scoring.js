// How many points a word is worth.
import { letterValue } from './letters.js';

export const GLITCH_BONUS = 50;
export const MAX_STREAK_BONUS = 5;

const LENGTH_MULT = [0, 0, 0, 1, 1.5, 2, 3, 4, 5, 6.5, 8];

/** Longer words are worth much more per letter. */
export function lengthMultiplier(length) {
  if (length < 3) return 0;
  if (length < LENGTH_MULT.length) return LENGTH_MULT[length];
  return 8 + (length - 10) * 2;
}

export function tileMultiplier(tiles) {
  let mult = 1;
  for (const t of tiles) {
    if (t.kind === 'gold') mult *= 2;
    else if (t.kind === 'crystal') mult *= 3;
  }
  return mult;
}

/**
 * points = letter values x length multiplier x bonus tiles x streak bonus, times 10,
 * plus a flat bonus for each glitch tile cleared.
 * streak = how many 5+ letter words were made in a row before this one.
 */
export function scoreWord(tiles, length, { streak = 0 } = {}) {
  const base = tiles.reduce((s, t) => s + (t.kind === 'wild' ? 0 : letterValue(t.letter)), 0);
  const lengthMult = lengthMultiplier(length);
  const tileMult = tileMultiplier(tiles);
  const streakBonus = 1 + Math.min(streak, MAX_STREAK_BONUS) * 0.1;
  const glitches = tiles.filter((t) => t.kind === 'glitch').length;
  const points = Math.round(base * lengthMult * tileMult * streakBonus) * 10 + glitches * GLITCH_BONUS;
  return { points, base, lengthMult, tileMult, streakBonus, glitches };
}

/** Reward tiles that appear after a long word. */
export function rewardsForLength(length) {
  if (length >= 8) return ['bolt', 'crystal'];
  if (length === 7) return ['crystal'];
  if (length === 6) return ['wild'];
  if (length === 5) return ['gold'];
  return [];
}

export function praiseForLength(length) {
  if (length >= 9) return 'Legendary!';
  if (length === 8) return 'Amazing!';
  if (length === 7) return 'Brilliant!';
  if (length === 6) return 'Great!';
  if (length === 5) return 'Nice!';
  return null;
}
