export function popcount(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

export function idx(n, r, c) {
  return r * n + c;
}

export function inBounds(n, r, c) {
  return r >= 0 && r < n && c >= 0 && c < n;
}

export function computeMaskAll(n) {
  return (1 << (n * n)) - 1;
}

export function computeToggleMasks(n) {
  const toggleMasks = new Array(n * n).fill(0);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let m = 0;
      const cells = [
        [r, c],
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];

      for (const [rr, cc] of cells) {
        if (inBounds(n, rr, cc)) {
          m ^= (1 << idx(n, rr, cc));
        }
      }

      toggleMasks[idx(n, r, c)] = m;
    }
  }

  return toggleMasks;
}

export function applyMask(board, mask, maskAll) {
  let nextBoard = board ^ mask;
  nextBoard &= maskAll;
  return nextBoard;
}

export function makeSolvablePuzzle(n, scrambleMoves, toggleMasks, maskAll) {
  let board = 0;

  for (let t = 0; t < scrambleMoves; t++) {
    const a = (Math.random() * (n * n)) | 0;
    board = applyMask(board, toggleMasks[a], maskAll);
  }

  return board;
}

export function parseBoardText(text) {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/[,\s]+/g, ""));

  if (rows.length === 0) {
    throw new Error("Board text is empty.");
  }

  const n = rows.length;

  if (n < 3 || n > 5) {
    throw new Error("Board size must be between 3x3 and 5x5.");
  }

  if (!rows.every((row) => row.length === n)) {
    throw new Error("Board must be square. Each row must have the same length.");
  }

  let board = 0;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const ch = rows[r][c];

      if (!["0", "1", ".", "#"].includes(ch)) {
        throw new Error("Use only 0/1 or ./# to describe the board.");
      }

      const isOn = ch === "1" || ch === "#";
      if (isOn) {
        board |= (1 << idx(n, r, c));
      }
    }
  }

  return { board, n };
}

export function boardToText(board, n) {
  const lines = [];

  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) {
      row.push(((board >>> idx(n, r, c)) & 1) === 1 ? "1" : "0");
    }
    lines.push(row.join(" "));
  }

  return lines.join("\n");
}