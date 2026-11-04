// Finds the best word on the board (used for hints and to detect a stuck board).
import { letterText } from './letters.js';
import { MAX_WORD } from './dictionary.js';
import { neighbours } from './board.js';
import { scoreWord } from './scoring.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Returns { path, word, length, points } for the highest scoring word found,
 * or null. With { first: true } it stops at the first word (fast "any word?" check).
 */
export function findBestWord(board, dict, { first = false, maxNodes = 200000 } = {}) {
  const rows = board.length;
  const cols = board[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path = [];
  let best = null;
  let nodes = 0;
  let stop = false;

  const consider = (word) => {
    const tiles = path.map(([r, c]) => board[r][c]);
    const { points } = scoreWord(tiles, word.length);
    if (!best || points > best.points || (points === best.points && word.length > best.length)) {
      best = { path: path.map((p) => [...p]), word, length: word.length, points };
    }
    if (first) stop = true;
  };

  const dfs = (r, c, prefix) => {
    if (stop || nodes++ > maxNodes) return;
    const tile = board[r][c];
    if (!tile) return;
    const options = tile.letter === '?' ? ALPHABET : [letterText(tile.letter)];
    visited[r][c] = true;
    path.push([r, c]);
    for (const s of options) {
      const p = prefix + s;
      if (p.length > MAX_WORD || !dict.hasPrefix(p)) continue;
      if (p.length >= 3 && dict.has(p)) consider(p);
      if (stop) break;
      for (const [nr, nc] of neighbours(board, r, c)) {
        if (!visited[nr][nc]) dfs(nr, nc, p);
        if (stop) break;
      }
    }
    path.pop();
    visited[r][c] = false;
  };

  for (let r = 0; r < rows && !stop; r++) {
    for (let c = 0; c < cols && !stop; c++) dfs(r, c, '');
  }
  return best;
}

export function hasAnyWord(board, dict) {
  return findBestWord(board, dict, { first: true }) !== null;
}
