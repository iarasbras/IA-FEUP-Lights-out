import { levels } from "../config/levels.js";
import {
  computeMaskAll,
  computeToggleMasks,
  applyMask,
  makeSolvablePuzzle,
  popcount,
} from "./board.js";

export class LightsOutGame {
  constructor() {
    this.allLevels = levels;
    this.levels = this.allLevels;

    this.level = 0;
    this.wins = 0;
    this.best = 0;
    this.score = 0;

    this.n = 3;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);

    this.board = 0;
    this.moves = 0;
    this.lastPuzzleBoard = 0;
    this.moveLimit = 0;
    this.customBoardLabel = null;
  }

  startFromSize(size) {
    const idx = this.allLevels.findIndex((lvl) => lvl.n === size);
    this.levels = idx === -1 ? this.allLevels : this.allLevels.slice(idx);

    this.wins = 0;
    this.best = 0;
    this.score = 0;
    this.customBoardLabel = null;

    this.loadLevel(0);
  }

  loadLevel(k) {
    this.level = Math.max(0, Math.min(k, this.levels.length - 1));
    const config = this.levels[this.level];

    this.n = config.n;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);
    this.customBoardLabel = null;

    this.board = this.makePuzzleForConfig(config);
    this.moves = 0;
    this.lastPuzzleBoard = this.board;
    this.moveLimit = this.computeMoveLimit(config);
  }

  loadCustomBoard(board, n, label = "Imported Board") {
    this.n = n;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);

    this.board = board & this.maskAll;
    this.moves = 0;
    this.lastPuzzleBoard = this.board;
    this.customBoardLabel = label;
    this.level = 0;
    this.moveLimit = Math.max(this.n * this.n * 3, popcount(this.board) + this.n * this.n);
  }

  press(i, countMove = true) {
    this.board = applyMask(this.board, this.toggleMasks[i], this.maskAll);

    if (countMove) {
      this.moves += 1;
    }
  }

  restartLevel() {
    this.board = this.lastPuzzleBoard;
    this.moves = 0;
  }

  newPuzzle() {
    const config = this.getLevelConfig();
    this.board = this.makePuzzleForConfig(config);
    this.moves = 0;
    this.lastPuzzleBoard = this.board;
    this.moveLimit = this.computeMoveLimit(config);
  }

  isSolved() {
    return this.board === 0;
  }

  registerWin({ hintsUsed = 0, awardScore = true } = {}) {
    this.wins += 1;
    this.best = Math.max(this.best, this.wins);

    if (!awardScore) return;

    const config = this.getLevelConfig();
    const base = 100 + (config.scramble ?? popcount(this.lastPuzzleBoard)) * 20 + this.n * 25;
    const efficiencyBonus = Math.max(0, this.getMoveLimit() - this.moves) * 2;
    const penalties = (this.moves * 5) + (hintsUsed * 25);
    const gained = Math.max(10, base + efficiencyBonus - penalties);

    this.score += gained;
  }

  advanceLevel() {
    if (this.customBoardLabel) {
      const scramble = Math.max(4, popcount(this.lastPuzzleBoard) + 2);
      this.customBoardLabel = null;
      this.levels = [{ n: this.n, scramble, maxOn: Math.min(this.n * this.n, scramble + 4) }];
      this.loadLevel(0);
      return;
    }

    if (this.level < this.levels.length - 1) {
      this.loadLevel(this.level + 1);
      return;
    }

    this.n = 5;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);

    const extra = 6 + Math.min(60, this.wins * 2);

    this.board = makeSolvablePuzzle(
      this.n,
      24 + extra,
      this.toggleMasks,
      this.maskAll
    );

    this.moves = 0;
    this.lastPuzzleBoard = this.board;
    this.moveLimit = Math.max(this.n * this.n * 2, 24 + extra + 12);
  }

  getLightsOn() {
    return popcount(this.board);
  }

  getLevelConfig() {
    if (this.customBoardLabel) {
      return {
        n: this.n,
        scramble: Math.max(1, popcount(this.lastPuzzleBoard)),
        label: this.customBoardLabel,
        moveLimit: this.moveLimit,
      };
    }

    if (this.level < this.levels.length) {
      return this.levels[this.level];
    }

    return { n: this.n, scramble: 24, moveLimit: this.moveLimit };
  }

  getMoveLimit() {
    return this.moveLimit;
  }

  computeMoveLimit(config) {
    if (config.moveLimit) {
      return config.moveLimit;
    }

    return Math.max(
      Math.ceil(this.n * this.n * 1.75),
      (config.scramble ?? 4) * 2 + this.n + 2
    );
  }

  makePuzzleForConfig(config) {
    const attempts = 140;
    const minOn = config.minOn ?? 1;
    const maxOn = config.maxOn ?? null;

    let fallback = 0;

    for (let i = 0; i < attempts; i++) {
      const candidate = makeSolvablePuzzle(
        this.n,
        config.scramble,
        this.toggleMasks,
        this.maskAll
      );
      const lightsOn = popcount(candidate);

      fallback = candidate;

      if (lightsOn < minOn) continue;
      if (maxOn !== null && lightsOn > maxOn) continue;

      return candidate;
    }

    return fallback;
  }
}