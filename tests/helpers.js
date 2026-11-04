import { Dictionary } from '../public/js/logic/dictionary.js';
import { emptyBoard } from '../public/js/logic/board.js';
import { newGame } from '../public/js/logic/engine.js';

export const smallDict = new Dictionary([
  'cat', 'cats', 'coat', 'dog', 'dogs', 'quiz', 'quit', 'rate', 'rates', 'stare', 'tears',
  'garden', 'gardens', 'ear', 'eat', 'tea', 'ate', 'sea', 'set', 'tar', 'art', 'rat', 'star', 'stars',
]);

let nextId = 1000;
export function tile(letter, kind = 'normal', extra = {}) {
  return { id: nextId++, letter, kind, ...extra };
}

/** Builds a game whose board is given as rows of letters ('.' = filler 'Z'). */
export function gameWithRows(rows, seed = 1) {
  const state = newGame(seed);
  const board = emptyBoard();
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const ch = rows[r]?.[c];
      board[r][c] = tile(ch && ch !== '.' ? (ch === 'q' ? 'Qu' : ch) : 'Z');
    }
  }
  state.board = board;
  return state;
}
