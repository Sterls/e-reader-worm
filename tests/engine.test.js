import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newGame, submitWord, evaluatePath, useShuffle, useHint, startNextLevel, revive, serialize, deserialize, MAX_HEARTS,
} from '../public/js/logic/engine.js';
import { findBestWord, hasAnyWord } from '../public/js/logic/solver.js';
import { ROWS, COLS } from '../public/js/logic/board.js';
import { smallDict, gameWithRows, tile } from './helpers.js';

function allIds(state) {
  return state.board.flat().map((t) => t.id);
}

test('new game has a full board with unique tiles', () => {
  const s = newGame(123);
  assert.equal(s.board.length, ROWS);
  assert.equal(s.board[0].length, COLS);
  const ids = allIds(s);
  assert.equal(new Set(ids).size, ROWS * COLS);
  assert.equal(s.hearts, MAX_HEARTS);
  assert.ok(s.goals.length >= 2);
  assert.ok(s.board.flat().every((t) => t.kind !== 'glitch'), 'no glitches on level 1');
});

test('same seed gives the same board', () => {
  const a = newGame(5).board.flat().map((t) => t.letter).join('');
  const b = newGame(5).board.flat().map((t) => t.letter).join('');
  assert.equal(a, b);
});

test('playing a word scores, removes the tiles and refills the board', () => {
  const s = gameWithRows(['CAT']);
  const used = [s.board[0][0].id, s.board[0][1].id, s.board[0][2].id];
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.ok(res.ok);
  assert.equal(res.word, 'cat');
  assert.equal(s.score, 50);
  const ids = allIds(s);
  assert.equal(ids.length, ROWS * COLS, 'board is full again');
  used.forEach((id) => assert.ok(!ids.includes(id), 'used tiles are gone'));
  assert.equal(new Set(ids).size, ids.length);
});

test('not a word: nothing changes', () => {
  const s = gameWithRows(['CTA']);
  const before = serialize(s);
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'not-a-word');
  assert.equal(serialize(s), before);
});

test('rejects paths that skip tiles', () => {
  const s = gameWithRows(['C.AT']);
  const res = submitWord(s, smallDict, [[0, 0], [0, 2], [0, 3]]);
  assert.equal(res.ok, false);
});

test('Qu tile and wild tile', () => {
  const s = gameWithRows(['qIZ']);
  assert.equal(evaluatePath(s, smallDict, [[0, 0], [0, 1], [0, 2]]).word, 'quiz');
  s.board[1][0] = tile('?', 'wild');
  s.board[1][1] = tile('A');
  s.board[1][2] = tile('T');
  const ev = evaluatePath(s, smallDict, [[1, 0], [1, 1], [1, 2]]);
  assert.ok(ev.valid);
  assert.ok(smallDict.has(ev.word));
});

test('a 5-letter word earns a gold tile', () => {
  const s = gameWithRows(['STARE']);
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
  assert.ok(res.ok);
  assert.ok(res.events.some((e) => e.type === 'reward' && e.kind === 'gold'));
  assert.ok(s.board.flat().some((t) => t.kind === 'gold'));
});

test('glitch tiles count down and cost a heart when they run out', () => {
  const s = gameWithRows(['CAT', '', '', '', '', '', '', '...S']);
  s.goals = [{ type: 'score', target: 99999, progress: 0 }];
  s.board[7][3] = tile('S', 'glitch', { timer: 2 });
  submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(s.board[7][3].timer, 1);
  assert.equal(s.hearts, 3);
  s.board[0][0] = tile('C'); s.board[0][1] = tile('A'); s.board[0][2] = tile('T');
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(s.hearts, 2);
  assert.ok(res.events.some((e) => e.type === 'glitchExpired'));
});

test('using a glitch tile clears it for bonus points', () => {
  const s = gameWithRows(['CAT']);
  s.board[0][0] = tile('C', 'glitch', { timer: 3 });
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.equal(res.points, 100);
});

test('game over when hearts run out', () => {
  const s = gameWithRows(['CAT']);
  s.goals = [{ type: 'score', target: 99999, progress: 0 }];
  s.hearts = 1;
  s.board[7][6] = tile('S', 'glitch', { timer: 1 });
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.ok(s.gameOver);
  assert.ok(res.events.some((e) => e.type === 'gameOver'));
  assert.equal(submitWord(s, smallDict, [[1, 0], [1, 1], [1, 2]]).ok, false);
  assert.ok(revive(s));
  assert.equal(s.hearts, 1);
  assert.ok(s.board.flat().every((t) => t.kind !== 'glitch'));
});

test('level complete, then next level', () => {
  const s = gameWithRows(['CAT']);
  s.goals = [{ type: 'score', target: 50, progress: 0 }];
  const res = submitWord(s, smallDict, [[0, 0], [0, 1], [0, 2]]);
  assert.ok(res.events.some((e) => e.type === 'levelComplete'));
  assert.ok(s.levelComplete);
  const hints = s.hints;
  startNextLevel(s);
  assert.equal(s.level, 2);
  assert.equal(s.levelScore, 0);
  assert.equal(s.hints, hints + 1);
  assert.equal(s.score, 150, 'level bonus added');
  assert.ok(!s.levelComplete);
});

test('bolt tile clears its whole row', () => {
  const s = gameWithRows(['', '', '', '', '', '', '', 'CATSTAR']);
  s.board[7][0] = tile('C', 'bolt');
  const rowIds = s.board[7].map((t) => t.id);
  const res = submitWord(s, smallDict, [[7, 0], [7, 1], [7, 2]]);
  assert.ok(res.events.some((e) => e.type === 'bolt'));
  const ids = allIds(s);
  rowIds.forEach((id) => assert.ok(!ids.includes(id)));
});

test('shuffle changes letters and uses a shuffle', () => {
  const s = newGame(9);
  const before = s.board.flat().map((t) => t.letter).join('');
  const n = s.shuffles;
  assert.ok(useShuffle(s).ok);
  assert.equal(s.shuffles, n - 1);
  assert.notEqual(s.board.flat().map((t) => t.letter).join(''), before);
  s.shuffles = 0;
  assert.equal(useShuffle(s).ok, false);
});

test('hint finds the best word on the board', () => {
  const s = gameWithRows(['GARDENS']);
  const best = findBestWord(s.board, smallDict);
  assert.equal(best.word, 'gardens');
  const hint = useHint(s, smallDict);
  assert.ok(hint.ok);
  assert.equal(evaluatePath(s, smallDict, hint.path).word, 'gardens');
  assert.ok(!hasAnyWord(gameWithRows([]).board, smallDict), 'all Z board has no words');
});

test('save and load', () => {
  const s = newGame(77);
  const copy = deserialize(serialize(s));
  assert.deepEqual(copy, s);
  assert.equal(deserialize('not json'), null);
  assert.equal(deserialize('{"version":999}'), null);
});

test('long simulated games stay healthy', async () => {
  const { readFileSync } = await import('node:fs');
  const { Dictionary } = await import('../public/js/logic/dictionary.js');
  const dict = Dictionary.fromText(readFileSync(new URL('../public/words.txt', import.meta.url), 'utf8'));
  for (let seed = 1; seed <= 5; seed++) {
    const s = newGame(seed);
    for (let turn = 0; turn < 60 && !s.gameOver; turn++) {
      if (s.levelComplete) startNextLevel(s);
      const best = findBestWord(s.board, dict, { maxNodes: 50000 });
      if (!best) { s.shuffles++; useShuffle(s); continue; }
      const res = submitWord(s, dict, best.path);
      assert.ok(res.ok, `seed ${seed} turn ${turn}`);
      const ids = allIds(s);
      assert.equal(ids.length, ROWS * COLS);
      assert.equal(new Set(ids).size, ids.length);
    }
    assert.ok(s.level >= 3, `seed ${seed} only reached level ${s.level}`);
  }
});
