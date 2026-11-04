// Story battles: damage, enemy turns and enemy attacks.
import { shuffleInPlace } from './rng.js';
import { allTiles } from './board.js';
import { generateLetter, countLetters, addToCounts } from './letters.js';
import { wordInTheme } from './wordthemes.js';
import { ENEMIES, PLAYER_MAX_HP } from './story.js';

export function createBattle(enemyId) {
  const enemy = ENEMIES[enemyId];
  if (!enemy) throw new Error(`Unknown enemy ${enemyId}`);
  return {
    enemyId,
    enemyHp: enemy.hp,
    enemyMax: enemy.hp,
    playerHp: PLAYER_MAX_HP,
    playerMax: PLAYER_MAX_HP,
    attackIn: enemy.attack.every,
    enraged: false,
    result: null, // 'won' | 'lost'
  };
}

/** Word damage: one tenth of the word's points, doubled on a weak spot, halved if resisted. */
export function wordDamage(word, points, enemy) {
  let mult = 1;
  let kind = 'normal';
  if (enemy.weak && wordInTheme(word, enemy.weak)) { mult = 2; kind = 'weak'; }
  else if (enemy.resist && wordInTheme(word, enemy.resist)) { mult = 0.5; kind = 'resist'; }
  return { damage: Math.max(1, Math.round((points / 10) * mult)), kind, mult };
}

export function attackEvery(battle) {
  const enemy = ENEMIES[battle.enemyId];
  return battle.enraged && enemy.enraged ? enemy.enraged.every : enemy.attack.every;
}

/** Called after each word (or shuffle). Counts down and attacks when ready. Returns events. */
export function enemyTurn(state) {
  const b = state.battle;
  const enemy = ENEMIES[b.enemyId];
  const events = [];
  if (b.result) return events;
  if (enemy.enraged && !b.enraged && b.enemyHp <= b.enemyMax * enemy.enraged.below) {
    b.enraged = true;
    b.attackIn = Math.min(b.attackIn, enemy.enraged.every);
    events.push({ type: 'enraged', line: enemy.enraged.line });
  }
  b.attackIn--;
  if (b.attackIn > 0) return events;
  b.attackIn = attackEvery(b);
  b.playerHp = Math.max(0, b.playerHp - enemy.attack.damage);
  const attack = { type: 'enemyAttack', damage: enemy.attack.damage, effect: enemy.attack.effect?.type || null, ids: [] };
  const effect = enemy.attack.effect;
  if (effect?.type === 'glitch') {
    const targets = shuffleInPlace(state.rng, allTiles(state.board).filter(({ tile }) => tile.kind === 'normal'));
    for (const { tile } of targets.slice(0, effect.count)) {
      tile.kind = 'glitch';
      tile.timer = effect.timer;
      attack.ids.push(tile.id);
    }
  } else if (effect?.type === 'scramble') {
    const targets = shuffleInPlace(state.rng, allTiles(state.board).filter(({ tile }) => tile.kind === 'normal'));
    const counts = countLetters(state.board);
    for (const { tile } of targets.slice(0, effect.count)) {
      tile.letter = generateLetter(state.rng, counts);
      addToCounts(counts, tile.letter);
      attack.ids.push(tile.id);
    }
  }
  events.push(attack);
  if (b.playerHp <= 0) {
    b.result = 'lost';
    events.push({ type: 'battleLost' });
  }
  return events;
}

/** Natural glitch spawning during a battle (only bosses). */
export function battleSpawnConfig(battle) {
  const enemy = ENEMIES[battle.enemyId];
  return {
    glitchChance: enemy.boss ? 0.04 : 0,
    glitchTimer: 6,
    maxGlitches: enemy.boss ? 3 : 0,
    goldChance: 0.03,
  };
}

