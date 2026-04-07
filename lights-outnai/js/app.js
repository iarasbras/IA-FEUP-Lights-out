import { LightsOutGame } from "./core/game.js";
import {
  render,
  setToast,
  setSolvedStatus,
  clearSolvedStatus,
  setAIResultsVisible,
  setBFSSolvedState,
  renderAIResult,
  renderAIReviewState,
  setNextLevelVisible,
} from "./ui/renderer.js";
import { bindControls } from "./ui/controls.js";
import { solveWithBFS } from "./ai/solvers/bfs.js";
import { solveDFS } from "./ai/solvers/dfs.js";
import { solveIDS } from "./ai/solvers/ids.js";
import { solveWithUCS } from "./ai/solvers/ucs.js";
import { solveGreedy } from "./ai/solvers/greedy.js";
import { AISolverTracker } from "./ai/tracker.js";

const game = new LightsOutGame();
const aiTracker = new AISolverTracker();
let aiBusy = false;
let hintCell = null;
let hintsUsedInLevel = 0;
const AI_REPLAY_DELAY_MS = 320;

const aiReview = {
  active: false,
  moves: [],
  cursor: 0,
};

function update() {
  render(game, handlePress, hintCell, hintsUsedInLevel);
  renderAIResult(aiTracker.latest());
  renderAIReviewState(aiReview);
}

function handlePress(i) {
  if (aiBusy) {
    return;
  }

  if (aiReview.active) {
    resetAIReview();
  }

  hintCell = null;

  game.press(i);
  update();

  if (game.isSolved()) {
    setSolvedStatus();
    setToast(`<span class="ok">Solved!</span> Moving to the next level…`);

    setTimeout(() => {
      clearSolvedStatus();
      game.advanceLevel();
      hintsUsedInLevel = 0;
      hintCell = null;
      setNextLevelVisible(false);

      if (game.level < game.levels.length) {
        setToast(`Beat a level to increase difficulty automatically.`);
      } else {
        setToast(`<span class="ok">Boss cleared.</span> Endless mode: 5×5, scramble keeps increasing.`);
      }

      update();
    }, 700);
  } else {
    setToast(`Keep going. Turn everything OFF.`);
  }
}

function startGame(size) {
  game.startFromSize(size);
  aiTracker.clear();
  resetAIReview();
  hintCell = null;
  hintsUsedInLevel = 0;
  clearSolvedStatus();
  setAIResultsVisible(false);
  setBFSSolvedState(false);
  setNextLevelVisible(false);
  syncSolveButtonLabel();

  setToast(`Board selected: ${size}x${size}. Turn everything OFF.`);
  update();
}

function getSelectedAlgorithm() {
  const select = document.getElementById("algorithmSelect");
  return select ? select.value : "bfs";
}

function syncSolveButtonLabel() {
  const algorithm = getSelectedAlgorithm();
  const labels = {
    bfs: "Solve with BFS",
    dfs: "Solve with DFS",
    ids: "Solve with IDS",
    ucs: "Solve with UCS",
    greedy: "Solve with Greedy",
  };

  const button = document.getElementById("solveBfsBtn");
  if (button) {
    button.textContent = labels[algorithm] || "Solve Selected";
  }
}

function runSelectedAlgorithm() {
  const algorithm = getSelectedAlgorithm();

  switch (algorithm) {
    case "bfs":
      return solveWithBFS({
        board: game.board,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    case "dfs":
      return solveDFS({
        board: game.board,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    case "ids":
      return solveIDS({
        board: game.board,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    case "ucs":
      return solveWithUCS({
        board: game.board,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    case "greedy":
      return solveGreedy({
        board: game.board,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

async function runSelectedSolver() {
  if (aiBusy) {
    return;
  }

  aiBusy = true;
  resetAIReview();
  hintCell = null;
  setAIResultsVisible(true);
  setBFSSolvedState(false);
  setNextLevelVisible(false);

  const algorithm = getSelectedAlgorithm();
  setToast(`Running ${algorithm.toUpperCase()}...`);
  await pause();

  const run = runSelectedAlgorithm();

  aiTracker.record(run);
  update();

  if (!run.solved) {
    setToast(`${run.method} stopped: ${run.reason}.`);
    aiBusy = false;
    return;
  }

  setToast(`${run.method} found a solution in ${run.depth} moves. Replaying now...`);
  await replayAIMoves(run.moves);

  aiReview.active = true;
  aiReview.moves = run.moves.slice();
  aiReview.cursor = run.moves.length;
  setBFSSolvedState(true);
  setNextLevelVisible(true);
  update();

  clearSolvedStatus();
  setToast(`${run.method} replay finished. Use Previous/Next AI Move to inspect the solution.`);
  aiBusy = false;
}

function replayAIMoves(moves) {
  return new Promise((resolve) => {
    if (moves.length === 0) {
      resolve();
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      game.press(moves[index], false);
      update();

      index += 1;
      if (index >= moves.length) {
        clearInterval(timer);
        resolve();
      }
    }, AI_REPLAY_DELAY_MS);
  });
}

function pause() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function askHint() {
  if (aiBusy) {
    return;
  }

  if (game.isSolved()) {
    hintCell = null;
    setToast("Board is already solved.");
    update();
    return;
  }

  setToast("Computing hint...");
  await pause();

  const run = solveWithBFS({
    board: game.board,
    toggleMasks: game.toggleMasks,
    maskAll: game.maskAll,
  });

  if (!run.solved || run.moves.length === 0) {
    hintCell = null;
    setToast(`No hint available (${run.reason}). Try another puzzle.`);
    update();
    return;
  }

  hintCell = run.moves[0];
  hintsUsedInLevel += 1;

  const row = Math.floor(hintCell / game.n) + 1;
  const col = (hintCell % game.n) + 1;
  setToast(`Hint: try row ${row}, column ${col}.`);
  update();
}

function stepAIPrevious() {
  if (aiBusy || !aiReview.active || aiReview.cursor <= 0) {
    return;
  }

  const moveIndex = aiReview.cursor - 1;
  game.press(aiReview.moves[moveIndex], false);
  aiReview.cursor -= 1;
  clearSolvedStatus();
  update();
}

function stepAINext() {
  if (aiBusy || !aiReview.active || aiReview.cursor >= aiReview.moves.length) {
    return;
  }

  game.press(aiReview.moves[aiReview.cursor], false);
  aiReview.cursor += 1;

  if (game.isSolved()) {
    setSolvedStatus();
  } else {
    clearSolvedStatus();
  }

  update();
}

function goToNextLevel() {
  if (aiBusy) {
    return;
  }

  clearSolvedStatus();
  game.advanceLevel();
  aiTracker.clear();
  resetAIReview();
  hintCell = null;
  hintsUsedInLevel = 0;
  setBFSSolvedState(false);
  setNextLevelVisible(false);
  syncSolveButtonLabel();

  if (game.level < game.levels.length) {
    setToast(`Advanced to Level ${game.level + 1}.`);
  } else {
    setToast(`<span class="ok">Boss cleared.</span> Endless mode: 5×5, scramble keeps increasing.`);
  }

  update();
}

function resetAIReview() {
  aiReview.active = false;
  aiReview.moves = [];
  aiReview.cursor = 0;
}

function goBackToMenu() {
  window.location.href = "./homepage.html";
}

function getStartSize() {
  const params = new URLSearchParams(window.location.search);
  const raw = Number(params.get("size"));

  if ([3, 4, 5].includes(raw)) {
    return raw;
  }

  return 3;
}

bindControls({
  onBackToMenu: () => {
    if (aiBusy) {
      return;
    }

    goBackToMenu();
  },
  onRestart: () => {
    if (aiBusy) {
      return;
    }

    game.restartLevel();
    aiTracker.clear();
    resetAIReview();
    hintCell = null;
    hintsUsedInLevel = 0;
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    syncSolveButtonLabel();
    setToast(`Restarted Level ${game.level + 1}.`);
    update();
  },
  onHint: askHint,
  onNewPuzzle: () => {
    if (aiBusy) {
      return;
    }

    game.newPuzzle();
    aiTracker.clear();
    resetAIReview();
    hintCell = null;
    hintsUsedInLevel = 0;
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    syncSolveButtonLabel();
    setToast(`New solvable puzzle generated for Level ${game.level + 1}.`);
    update();
  },
  onSolveBFS: runSelectedSolver,
  onAIPrevMove: stepAIPrevious,
  onAINextMove: stepAINext,
  onNextLevel: goToNextLevel,
});

document.getElementById("algorithmSelect")?.addEventListener("change", () => {
  syncSolveButtonLabel();
});

startGame(getStartSize());