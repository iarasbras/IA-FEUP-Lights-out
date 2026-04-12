import { idx, popcount } from "../core/board.js";

export const HEURISTIC_OPTIONS = [
  { value: "lights-on", label: "Lights ON" },
  { value: "active-lines", label: "Active Rows + Cols" },
  { value: "center-weighted", label: "Center Weighted" },
];

export function getHeuristicLabel(name) {
  return (
    HEURISTIC_OPTIONS.find((option) => option.value === name)?.label ||
    "Lights ON"
  );
}

export function evaluateHeuristic(board, n, heuristicName = "lights-on") {
  switch (heuristicName) {
    case "active-lines":
      return countActiveLines(board, n);
    case "center-weighted":
      return centerWeighted(board, n);
    case "lights-on":
    default:
      return popcount(board);
  }
}

function countActiveLines(board, n) {
  let activeRows = 0;
  let activeCols = 0;

  for (let r = 0; r < n; r++) {
    let rowHasLight = false;
    for (let c = 0; c < n; c++) {
      if (((board >>> idx(n, r, c)) & 1) === 1) {
        rowHasLight = true;
        break;
      }
    }
    if (rowHasLight) activeRows += 1;
  }

  for (let c = 0; c < n; c++) {
    let colHasLight = false;
    for (let r = 0; r < n; r++) {
      if (((board >>> idx(n, r, c)) & 1) === 1) {
        colHasLight = true;
        break;
      }
    }
    if (colHasLight) activeCols += 1;
  }

  return activeRows + activeCols;
}

function centerWeighted(board, n) {
  const center = (n - 1) / 2;
  let score = 0;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (((board >>> idx(n, r, c)) & 1) === 0) continue;

      const distance = Math.abs(r - center) + Math.abs(c - center);
      const weight = 1 + ((n - distance) / (n + 1));
      score += weight;
    }
  }

  return Number(score.toFixed(3));
}