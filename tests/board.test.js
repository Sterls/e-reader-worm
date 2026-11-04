import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGravity, isAdjacent, isValidPath, emptyBoard, emptyCells, ROWS, COLS } from '../public/js/logic/board.js';
import { tile } from './helpers.js';

function fullBoard() {
  const b = emptyBoard();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) b[r][c] = tile('A');
  return b;
}

test('adjacency includes diagonals but not self or far tiles', () => {
  assert.ok(isAdjacent([2, 2], [3, 3]));
  assert.ok(isAdjacent([2, 2], [2, 1]));
  assert.ok(!isAdjacent([2, 2], [2, 2]));
  assert.ok(!isAdjacent([2, 2], [4, 2]));
});

test('path rules', () => {
  const b = fullBoard();
  assert.ok(isValidPath(b, [[0, 0], [1, 1], [1, 2]]));
  assert.ok(!isValidPath(b, [[0, 0], [0, 2]]), 'gap');
  assert.ok(!isValidPath(b, [[0, 0], [0, 1], [0, 0]]), 'reuse');
  assert.ok(!isValidPath(b, [[0, 0], [-1, 0]]), 'off board');
  assert.ok(!isValidPath(b, []));
});

test('gravity drops tiles and keeps their order', () => {
  const b = fullBoard();
  const top = b[0][3];
  const mid = b[4][3];
  b[5][3] = null;
  b[7][3] = null;
  applyGravity(b);
  assert.equal(b[0][3], null);
  assert.equal(b[1][3], null);
  assert.equal(b[2][3], top);
  assert.equal(b[6][3], mid);
  assert.deepEqual(emptyCells(b), [[0, 3], [1, 3]]);
});
