// Board shape, neighbours and falling tiles.

export const COLS = 7;
export const ROWS = 8;

export function emptyBoard(rows = ROWS, cols = COLS) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function inBounds(board, r, c) {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length;
}

/** Tiles touch if they are next to each other, including diagonally. */
export function isAdjacent(a, b) {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr || dc) && dr <= 1 && dc <= 1;
}

export function samePos(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/** A path is valid if each tile is used once and each step goes to a neighbour. */
export function isValidPath(board, path) {
  if (!Array.isArray(path) || path.length === 0) return false;
  const seen = new Set();
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i];
    if (!inBounds(board, r, c) || !board[r][c]) return false;
    const key = r * 100 + c;
    if (seen.has(key)) return false;
    seen.add(key);
    if (i > 0 && !isAdjacent(path[i - 1], path[i])) return false;
  }
  return true;
}

/** Drops tiles down to fill gaps. Empty cells end up at the top of each column. */
export function applyGravity(board) {
  const rows = board.length;
  const cols = board[0].length;
  for (let c = 0; c < cols; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const tile = board[r][c];
      if (tile) {
        board[r][c] = null;
        board[write][c] = tile;
        write--;
      }
    }
  }
  return board;
}

export function emptyCells(board) {
  const cells = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) if (!board[r][c]) cells.push([r, c]);
  }
  return cells;
}

export function allTiles(board) {
  const tiles = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) if (board[r][c]) tiles.push({ tile: board[r][c], r, c });
  }
  return tiles;
}

export function neighbours(board, r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if ((dr || dc) && inBounds(board, r + dr, c + dc)) out.push([r + dr, c + dc]);
    }
  }
  return out;
}
