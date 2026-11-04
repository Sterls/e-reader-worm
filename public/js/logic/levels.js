// Level difficulty and goals.
import { nextFloat, pick } from './rng.js';

export const GOAL_LETTERS = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'M', 'P', 'V', 'W', 'Y'];
export const SPECIAL_KINDS = new Set(['gold', 'crystal', 'wild', 'bolt']);

export function targetScore(level) {
  return Math.round((500 + 250 * (level - 1)) / 50) * 50;
}

export function levelConfig(level) {
  return {
    targetScore: targetScore(level),
    glitchChance: level < 2 ? 0 : Math.min(0.03 + 0.015 * (level - 2), 0.2),
    glitchTimer: Math.max(10 - Math.floor((level - 1) / 2), 5),
    maxGlitches: level < 2 ? 0 : Math.min(1 + Math.floor((level - 1) / 2), 6),
    goldChance: 0.03,
  };
}

function longWordsGoal(level) {
  const minLen = level <= 3 ? 4 : level <= 6 ? 5 : 6;
  let target;
  if (minLen === 4) target = level === 1 ? 2 : 3;
  else if (minLen === 5) target = 3;
  else target = level >= 12 ? 3 : 2;
  return { type: 'longWords', minLen, target, progress: 0 };
}

export function makeGoals(level, rng) {
  const goals = [{ type: 'score', target: targetScore(level), progress: 0 }];
  if (level === 1) {
    goals.push(longWordsGoal(1));
    return goals;
  }
  const pool = [
    () => longWordsGoal(level),
    () => ({ type: 'letter', letter: pick(rng, GOAL_LETTERS), target: 1, progress: 0 }),
    () => ({ type: 'glitch', target: Math.min(1 + Math.floor(level / 3), 5), progress: 0 }),
    () => ({ type: 'special', target: Math.min(1 + Math.floor(level / 4), 3), progress: 0 }),
  ];
  const extra = level < 5 ? 1 : 2;
  for (let i = 0; i < extra; i++) {
    const idx = Math.floor(nextFloat(rng) * pool.length);
    goals.push(pool.splice(idx, 1)[0]());
  }
  return goals;
}

export function goalText(goal) {
  switch (goal.type) {
    case 'score': return `Score ${goal.target.toLocaleString('en-GB')}`;
    case 'longWords': return `${goal.target} words, ${goal.minLen}+ letters`;
    case 'letter': return `A word with ${goal.letter}`;
    case 'glitch': return `Clear ${goal.target} glitch${goal.target > 1 ? 'es' : ''}`;
    case 'special': return `Use ${goal.target} bonus tile${goal.target > 1 ? 's' : ''}`;
    default: return '';
  }
}

export function isGoalDone(goal) {
  return goal.progress >= goal.target;
}

/**
 * info: { levelScore, length, letters, glitches, specials }
 * Returns the goals that became complete with this word.
 */
export function updateGoals(goals, info) {
  const completed = [];
  for (const goal of goals) {
    const before = isGoalDone(goal);
    switch (goal.type) {
      case 'score': goal.progress = Math.min(info.levelScore, goal.target); break;
      case 'longWords': if (info.length >= goal.minLen) goal.progress++; break;
      case 'letter': if (info.letters.includes(goal.letter)) goal.progress = 1; break;
      case 'glitch': goal.progress += info.glitches; break;
      case 'special': goal.progress += info.specials; break;
    }
    goal.progress = Math.min(goal.progress, goal.target);
    if (!before && isGoalDone(goal)) completed.push(goal);
  }
  return completed;
}
