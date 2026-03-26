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

    this.n = 3;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);

    this.board = 0;
    this.moves = 0;
    this.lastPuzzleBoard = 0;
  }

  startFromSize(size) {
    const idx = this.allLevels.findIndex((lvl) => lvl.n === size);
    this.levels = idx === -1 ? this.allLevels : this.allLevels.slice(idx);

    this.wins = 0;
    this.best = 0;

    this.loadLevel(0);
  }

  loadLevel(k) {
    this.level = Math.max(0, Math.min(k, this.levels.length - 1));
    this.n = this.levels[this.level].n;
    this.maskAll = computeMaskAll(this.n);
    this.toggleMasks = computeToggleMasks(this.n);

    this.board = makeSolvablePuzzle(
      this.n,
      this.levels[this.level].scramble,
      this.toggleMasks,
      this.maskAll
    );

    this.moves = 0;
    this.lastPuzzleBoard = this.board;
  }

  press(i) {
    this.board = applyMask(this.board, this.toggleMasks[i], this.maskAll);
    this.moves += 1;
  }

  restartLevel() {
    this.board = this.lastPuzzleBoard;
    this.moves = 0;
  }

  newPuzzle() {
    this.board = makeSolvablePuzzle(
      this.n,
      this.levels[this.level].scramble,
      this.toggleMasks,
      this.maskAll
    );

    this.moves = 0;
    this.lastPuzzleBoard = this.board;
  }

  isSolved() {
    return this.board === 0;
  }

  advanceLevel() {
    this.wins += 1;
    this.best = Math.max(this.best, this.wins);

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
  }

  getLightsOn() {
    return popcount(this.board);
  }

  getLevelConfig() {
    if (this.level < this.levels.length) {
      return this.levels[this.level];
    }
    return { n: this.n, scramble: 24 };
  }
}