// The game rules. Pure data in, data out, so it is easy to test and save.
import { createRng, nextFloat, shuffleInPlace, randomSeed } from './rng.js';
import { generateLetter, countLetters, addToCounts, letterText, letterLength, WILD } from './letters.js';
import { emptyBoard, applyGravity, emptyCells, isValidPath, allTiles } from './board.js';
import { scoreWord, rewardsForLength } from './scoring.js';
import { levelConfig, makeGoals, updateGoals, isGoalDone, SPECIAL_KINDS } from './levels.js';
import { findBestWord } from './solver.js';
import { createBattle, wordDamage, enemyTurn, battleSpawnConfig } from './battle.js';
import { ENEMIES, GLITCH_DAMAGE, SNACK_HEAL } from './story.js';

export const SAVE_VERSION = 1;
export const MAX_HEARTS = 3;

export function newGame(seed = randomSeed()) {
  const state = {
    version: SAVE_VERSION,
    seed,
    rng: createRng(seed),
    nextId: 1,
    level: 1,
    score: 0,
    levelScore: 0,
    hearts: MAX_HEARTS,
    shuffles: 2,
    hints: 2,
    streak: 0,
    turn: 0,
    goals: [],
    board: emptyBoard(),
    stats: { words: 0, longest: '', bestWord: '', bestPoints: 0 },
    levelComplete: false,
    gameOver: false,
  };
  state.goals = makeGoals(1, state.rng);
  refill(state, []);
  return state;
}

/** A story battle: same board, but you fight an enemy instead of chasing goals. */
export function newBattle(enemyId, { seed = randomSeed(), snacks = 0, chapter = null, index = 0 } = {}) {
  const state = newGame(seed);
  state.mode = 'battle';
  state.goals = [];
  state.hearts = 0;
  state.shuffles = 2;
  state.hints = 1;
  state.snacks = snacks;
  state.story = { chapter, index };
  state.battle = createBattle(enemyId);
  return state;
}

function countKind(board, kind) {
  return allTiles(board).filter(({ tile }) => tile.kind === kind).length;
}

function boardHasLetter(board, letter) {
  return allTiles(board).some(({ tile }) => tile.letter === letter);
}

/** Fills empty cells with new tiles. `rewards` are special tile kinds to place first. */
export function refill(state, rewards = []) {
  const { board, rng } = state;
  const cfg = state.battle ? battleSpawnConfig(state.battle) : levelConfig(state.level);
  const empties = shuffleInPlace(rng, emptyCells(board));
  const counts = countLetters(board);
  let glitches = countKind(board, 'glitch');
  const active = (type) => state.goals.find((g) => g.type === type && !isGoalDone(g));

  // Make sure goals stay possible.
  const letterGoal = active('letter');
  let forceLetter = letterGoal && !boardHasLetter(board, letterGoal.letter) ? letterGoal.letter : null;
  const glitchChance = active('glitch') && glitches === 0 ? Math.max(cfg.glitchChance, 0.15) : cfg.glitchChance;
  const hasSpecial = allTiles(board).some(({ tile }) => SPECIAL_KINDS.has(tile.kind));
  const goldChance = active('special') && !hasSpecial ? 0.1 : cfg.goldChance;
  const maxGlitches = Math.max(cfg.maxGlitches, active('glitch') ? 1 : 0);

  const placed = [];
  let rewardIdx = 0;
  for (const [r, c] of empties) {
    let kind = 'normal';
    if (rewardIdx < rewards.length) kind = rewards[rewardIdx++];
    else if (glitches < maxGlitches && nextFloat(rng) < glitchChance) { kind = 'glitch'; glitches++; }
    else if (nextFloat(rng) < goldChance) kind = 'gold';

    let letter;
    if (kind === 'wild') letter = WILD;
    else if (forceLetter && kind === 'normal') { letter = forceLetter; forceLetter = null; }
    else letter = generateLetter(rng, counts);
    addToCounts(counts, letter);

    const tile = { id: state.nextId++, letter, kind };
    if (kind === 'glitch') tile.timer = cfg.glitchTimer;
    board[r][c] = tile;
    placed.push({ id: tile.id, r, c });
  }
  return placed;
}

// The first-time tutorial: a word laid out in a zigzag (diagonal, up, diagonal)
// so new players see that words can go in any direction.
export const TUTORIAL_PATH = [[4, 2], [3, 3], [2, 3], [3, 4]];
export const TUTORIAL_WORD = 'WORM';

/** Puts the tutorial word on the board as plain tiles. Returns the path to trace. */
export function placeTutorialWord(state) {
  TUTORIAL_PATH.forEach(([r, c], i) => {
    const tile = state.board[r][c];
    tile.letter = TUTORIAL_WORD[i];
    tile.kind = 'normal';
    delete tile.timer;
  });
  return TUTORIAL_PATH.map((p) => [...p]);
}

export function pathTiles(state, path) {
  return path.map(([r, c]) => state.board[r][c]);
}

export function wordLengthOf(tiles) {
  return tiles.reduce((s, t) => s + letterLength(t.letter), 0);
}

/** Checks a selection without changing anything (used for the live preview). */
export function evaluatePath(state, dict, path) {
  if (!isValidPath(state.board, path)) return { valid: false, word: '', length: 0, points: 0 };
  const tiles = pathTiles(state, path);
  const pattern = tiles.map((t) => letterText(t.letter)).join('');
  const length = pattern.length;
  const word = length >= 3 ? dict.match(pattern) : null;
  if (!word) return { valid: false, word: pattern, length, points: 0, tiles };
  const bonusStreak = length >= 5 ? state.streak : 0;
  const { points } = scoreWord(tiles, length, { streak: bonusStreak });
  return { valid: true, word, length, points, tiles };
}

/**
 * Plays a word. Returns { ok: false, reason } or { ok: true, events, ... }.
 * Events tell the screen what to animate.
 */
export function isPlaying(state) {
  return !state.gameOver && !state.levelComplete && !state.battle?.result;
}

export function submitWord(state, dict, path) {
  if (!isPlaying(state)) return { ok: false, reason: 'not-playing' };
  const evaluation = evaluatePath(state, dict, path);
  if (!evaluation.valid) return { ok: false, reason: 'not-a-word', word: evaluation.word };

  const { tiles, length, word } = evaluation;
  const bonusStreak = length >= 5 ? state.streak : 0;
  const scored = scoreWord(tiles, length, { streak: bonusStreak });
  state.streak = length >= 5 ? state.streak + 1 : 0;
  state.score += scored.points;
  state.levelScore += scored.points;
  state.turn++;
  state.stats.words++;
  if (word.length > state.stats.longest.length) state.stats.longest = word;
  if (scored.points > state.stats.bestPoints) {
    state.stats.bestPoints = scored.points;
    state.stats.bestWord = word;
  }

  const events = [];
  events.push({
    type: 'word', word, length, points: scored.points, streak: state.streak,
    ids: tiles.map((t) => t.id), path: path.map((p) => [...p]),
    kinds: tiles.map((t) => t.kind),
  });

  // Tiles to remove: the word, plus whole rows for bolt tiles.
  const remove = new Map();
  path.forEach(([r, c]) => remove.set(r * 100 + c, [r, c]));
  let glitchesCleared = scored.glitches;
  path.forEach(([r, c]) => {
    if (state.board[r][c].kind !== 'bolt') return;
    events.push({ type: 'bolt', row: r });
    for (let cc = 0; cc < state.board[r].length; cc++) {
      const key = r * 100 + cc;
      const t = state.board[r][cc];
      if (!t || remove.has(key)) continue;
      if (t.kind === 'glitch') glitchesCleared++;
      remove.set(key, [r, cc]);
      events.push({ type: 'cleared', id: t.id, kind: t.kind });
    }
  });

  // Story battles: the word hits the enemy.
  const battle = state.battle;
  if (battle) {
    const enemy = ENEMIES[battle.enemyId];
    const hit = wordDamage(word, scored.points, enemy);
    battle.enemyHp = Math.max(0, battle.enemyHp - hit.damage);
    events.push({ type: 'hit', damage: hit.damage, kind: hit.kind, enemyHp: battle.enemyHp });
    if (battle.enemyHp <= 0) {
      battle.result = 'won';
      events.push({ type: 'battleWon' });
    }
  }

  const completedGoals = battle ? [] : updateGoals(state.goals, {
    levelScore: state.levelScore,
    length,
    letters: tiles.map((t) => t.letter),
    glitches: glitchesCleared,
    specials: tiles.filter((t) => SPECIAL_KINDS.has(t.kind)).length,
  });
  completedGoals.forEach((g) => events.push({ type: 'goal', goal: g }));

  for (const [r, c] of remove.values()) state.board[r][c] = null;
  applyGravity(state.board);

  const levelDone = battle ? battle.result === 'won' : state.goals.every(isGoalDone);

  // Glitch tiles count down after each word. When one reaches zero you lose a heart.
  if (!levelDone) {
    for (const { tile, r, c } of allTiles(state.board)) {
      if (tile.kind !== 'glitch') continue;
      tile.timer--;
      if (tile.timer <= 0) {
        if (battle) battle.playerHp = Math.max(0, battle.playerHp - GLITCH_DAMAGE);
        else state.hearts--;
        state.board[r][c] = null;
        events.push({ type: 'glitchExpired', id: tile.id, hearts: state.hearts, damage: battle ? GLITCH_DAMAGE : 0 });
      }
    }
    applyGravity(state.board);
  }

  const rewards = rewardsForLength(length);
  rewards.forEach((kind) => events.push({ type: 'reward', kind }));
  refill(state, rewards);

  if (battle) {
    if (!battle.result && battle.playerHp <= 0) {
      battle.result = 'lost';
      events.push({ type: 'battleLost' });
    }
    if (!battle.result) events.push(...enemyTurn(state));
    return { ok: true, events, word, points: scored.points, length };
  }

  if (levelDone) {
    state.levelComplete = true;
    events.push({ type: 'levelComplete', level: state.level });
  } else if (state.hearts <= 0) {
    state.hearts = 0;
    state.gameOver = true;
    events.push({ type: 'gameOver' });
  }
  return { ok: true, events, word, points: scored.points, length };
}

/** Gives normal tiles new letters. Bonus and glitch tiles stay. */
export function rerollLetters(state) {
  const counts = countLetters(state.board);
  const normal = allTiles(state.board).filter(({ tile }) => tile.kind === 'normal');
  for (const { tile } of normal) {
    counts.total--;
    if (/^[AEIOU]$/.test(tile.letter)) counts.vowels--;
    if (['J', 'Qu', 'X', 'Z'].includes(tile.letter)) counts.rare--;
    counts.per[tile.letter]--;
  }
  const changed = [];
  for (const { tile } of normal) {
    tile.letter = generateLetter(state.rng, counts);
    addToCounts(counts, tile.letter);
    changed.push(tile.id);
  }
  state.streak = 0;
  return changed;
}

export function useShuffle(state) {
  if (state.shuffles <= 0 || !isPlaying(state)) return { ok: false };
  state.shuffles--;
  const changed = rerollLetters(state);
  // In a battle, shuffling uses up your turn.
  const events = state.battle ? enemyTurn(state) : [];
  return { ok: true, changed, events };
}

/** Story battles: eat a snack to heal. Doesn't use up your turn. */
export function useSnack(state) {
  const b = state.battle;
  if (!b || !isPlaying(state) || state.snacks <= 0 || b.playerHp >= b.playerMax) return { ok: false };
  state.snacks--;
  const before = b.playerHp;
  b.playerHp = Math.min(b.playerMax, b.playerHp + SNACK_HEAL);
  return { ok: true, healed: b.playerHp - before };
}

export function useHint(state, dict) {
  if (state.hints <= 0 || !isPlaying(state)) return { ok: false };
  const best = findBestWord(state.board, dict);
  if (!best) return { ok: false, reason: 'no-words' };
  state.hints--;
  return { ok: true, ...best };
}

export function startNextLevel(state) {
  if (!state.levelComplete) return false;
  const bonus = 100 * state.level;
  state.score += bonus;
  state.level++;
  state.levelScore = 0;
  state.levelComplete = false;
  state.hearts = Math.min(MAX_HEARTS, state.hearts + 1);
  state.shuffles++;
  state.hints++;
  state.goals = makeGoals(state.level, state.rng);
  // Make sure letter goals are possible on the current board.
  const letterGoal = state.goals.find((g) => g.type === 'letter');
  if (letterGoal && !boardHasLetter(state.board, letterGoal.letter)) {
    const normal = allTiles(state.board).filter(({ tile }) => tile.kind === 'normal');
    if (normal.length) normal[Math.floor(nextFloat(state.rng) * normal.length)].tile.letter = letterGoal.letter;
  }
  return bonus;
}

/** Continue after game over (for example after a rewarded ad in the app). */
export function revive(state) {
  if (state.battle) {
    if (state.battle.result !== 'lost') return false;
    state.battle.result = null;
    state.battle.playerHp = Math.round(state.battle.playerMax / 2);
    state.battle.attackIn = ENEMIES[state.battle.enemyId].attack.every;
    for (const { tile } of allTiles(state.board)) {
      if (tile.kind === 'glitch') { tile.kind = 'normal'; delete tile.timer; }
    }
    return true;
  }
  if (!state.gameOver) return false;
  state.gameOver = false;
  state.hearts = 1;
  for (const { tile } of allTiles(state.board)) {
    if (tile.kind === 'glitch') { tile.kind = 'normal'; delete tile.timer; }
  }
  return true;
}

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(json) {
  try {
    const state = JSON.parse(json);
    if (!state || state.version !== SAVE_VERSION || !Array.isArray(state.board)) return null;
    return state;
  } catch {
    return null;
  }
}
