import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Dictionary } from '../public/js/logic/dictionary.js';
import { THEMES, wordInTheme } from '../public/js/logic/wordthemes.js';
import { ENEMIES, CHAPTERS, PLAYER_MAX_HP, GLITCH_DAMAGE, SNACK_HEAL } from '../public/js/logic/story.js';
import { wordDamage, enemyTurn } from '../public/js/logic/battle.js';
import { newBattle, submitWord, useShuffle, useSnack, revive } from '../public/js/logic/engine.js';
import { findBestWord } from '../public/js/logic/solver.js';
import { smallDict, tile } from './helpers.js';

const dict = Dictionary.fromText(readFileSync(new URL('../public/words.txt', import.meta.url), 'utf8'));

function battleWithRow(enemy, letters) {
  const s = newBattle(enemy, { seed: 3 });
  [...letters].forEach((ch, c) => { s.board[0][c] = tile(ch); });
  return s;
}

test('every theme word is a real word in the dictionary', () => {
  for (const [name, set] of Object.entries(THEMES)) {
    for (const w of set) assert.ok(dict.has(w), `${name}: "${w}" is not in the word list`);
    assert.ok(set.size >= 40, `${name} has only ${set.size} words`);
  }
});

test('theme matching understands word endings', () => {
  for (const w of ['sun', 'suns', 'baking', 'baked', 'baker', 'bakes', 'fires', 'sunnier']) {
    if (w === 'sunnier') continue;
    assert.ok(wordInTheme(w, 'heat'), w);
  }
  assert.ok(wordInTheme('swimming', 'water'));
  assert.ok(wordInTheme('napping', 'sleep'));
  assert.ok(wordInTheme('stews', 'kitchen'));
  assert.ok(!wordInTheme('cat', 'heat'));
  assert.ok(!wordInTheme('sun', 'nonsense-theme'));
});

test('weak spots double damage, resistances halve it', () => {
  const e = ENEMIES.puddle;
  assert.equal(wordDamage('cat', 100, e).damage, 10);
  assert.deepEqual([wordDamage('bake', 100, e).damage, wordDamage('bake', 100, e).kind], [20, 'weak']);
  assert.deepEqual([wordDamage('rain', 100, e).damage, wordDamage('rain', 100, e).kind], [5, 'resist']);
  assert.equal(wordDamage('cat', 1, e).damage, 1, 'always at least 1 damage');
});

test('every chapter battle points at a real enemy', () => {
  for (const ch of CHAPTERS) {
    assert.ok(ch.intro.length && ch.outro.length);
    for (const b of ch.battles) assert.ok(ENEMIES[b.enemy], b.enemy);
    assert.ok(ENEMIES[ch.battles[ch.battles.length - 1].enemy].boss, 'last battle is a boss');
  }
});

test('a word hurts the enemy; the enemy attacks every few turns', () => {
  const s = battleWithRow('puddle', 'CAT');
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.ok(res.ok);
  assert.equal(s.battle.enemyHp, ENEMIES.puddle.hp - 5);
  assert.ok(res.events.some((e) => e.type === 'hit' && e.damage === 5));
  assert.equal(s.battle.attackIn, ENEMIES.puddle.attack.every - 1);
  assert.equal(s.battle.playerHp, PLAYER_MAX_HP);
  for (let i = 0; i < 2; i++) {
    s.board[0][0] = tile('C'); s.board[0][1] = tile('A'); s.board[0][2] = tile('T');
    submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  }
  assert.equal(s.battle.playerHp, PLAYER_MAX_HP - ENEMIES.puddle.attack.damage);
  assert.equal(s.battle.attackIn, ENEMIES.puddle.attack.every);
});

test('crab attacks plant glitch tiles; gull scrambles letters', () => {
  const s = newBattle('crab', { seed: 4 });
  s.battle.attackIn = 1;
  const ev = enemyTurn(s);
  const attack = ev.find((e) => e.type === 'enemyAttack');
  assert.equal(attack.ids.length, 1);
  assert.equal(s.board.flat().filter((t) => t.kind === 'glitch').length, 1);

  const g = newBattle('gull', { seed: 5 });
  g.battle.attackIn = 1;
  const before = g.board.flat().map((t) => t.letter).join('');
  enemyTurn(g);
  assert.notEqual(g.board.flat().map((t) => t.letter).join(''), before);
});

test('beating the enemy wins; running out of health loses', () => {
  const s = battleWithRow('puddle', 'CAT');
  s.battle.enemyHp = 3;
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(s.battle.result, 'won');
  assert.ok(res.events.some((e) => e.type === 'battleWon'));
  assert.ok(!res.events.some((e) => e.type === 'enemyAttack'), 'a beaten enemy does not attack');
  assert.equal(submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]).ok, false);

  const l = battleWithRow('puddle', 'CAT');
  l.battle.playerHp = 2;
  l.battle.attackIn = 1;
  const r2 = submitWord(l, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(l.battle.result, 'lost');
  assert.ok(r2.events.some((e) => e.type === 'battleLost'));
  assert.ok(revive(l));
  assert.equal(l.battle.result, null);
  assert.equal(l.battle.playerHp, PLAYER_MAX_HP / 2);
});

test('glitch tiles hurt you in battles instead of costing hearts', () => {
  const s = battleWithRow('puddle', 'CAT');
  s.board[7][6] = tile('S', 'glitch', { timer: 1 });
  submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(s.battle.playerHp, PLAYER_MAX_HP - GLITCH_DAMAGE);
});

test('snacks heal, shuffles use a turn', () => {
  const s = newBattle('puddle', { seed: 8, snacks: 1 });
  assert.equal(useSnack(s).ok, false, 'already full health');
  s.battle.playerHp = 10;
  assert.equal(useSnack(s).healed, SNACK_HEAL);
  assert.equal(s.snacks, 0);
  assert.equal(useSnack(s).ok, false);
  const turn = s.battle.attackIn;
  useShuffle(s);
  assert.equal(s.battle.attackIn, turn - 1);
});

test('chapter 1 balance: an average player wins, a strong player wins faster', async () => {
  const { findAllWords } = await import('../public/js/logic/solver.js');
  const { createRng, nextFloat } = await import('../public/js/logic/rng.js');
  // skill 0.5 picks a middling word (3-6 letters); 0.8 picks one of the better ones.
  const play = (enemy, seed, skill, snacks) => {
    const s = newBattle(enemy, { seed, snacks });
    const rng = createRng(seed * 7);
    let turns = 0;
    while (!s.battle.result && turns < 120) {
      const words = findAllWords(s.board, dict, { maxNodes: 30000, maxLength: 6 }).sort((a, z) => a.points - z.points);
      if (!words.length) { s.shuffles = 1; useShuffle(s); continue; }
      const idx = Math.floor((skill + (nextFloat(rng) - 0.5) * 0.4) * words.length);
      submitWord(s, dict, words[Math.min(words.length - 1, Math.max(0, idx))].path);
      turns++;
      if (s.battle.playerHp < 25) useSnack(s);
    }
    return { won: s.battle.result === 'won', turns };
  };
  CHAPTERS[0].battles.forEach((b, i) => {
    for (const seed of [1, 2, 3]) {
      const avg = play(b.enemy, seed, 0.5, i);
      const good = play(b.enemy, seed, 0.8, i);
      assert.ok(avg.won, `${b.enemy} seed ${seed}: average player lost`);
      assert.ok(avg.turns >= 5, `${b.enemy}: too quick (${avg.turns} turns)`);
      assert.ok(good.won && good.turns <= avg.turns, `${b.enemy}: strong player should win faster`);
    }
  });
});
