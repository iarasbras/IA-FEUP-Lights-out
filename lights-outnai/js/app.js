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
} from "./ui/renderer.js";
import { bindControls } from "./ui/controls.js";
import { solveWithBFS } from "./ai/solvers/bfs.js";
import { AISolverTracker } from "./ai/tracker.js";

const game = new LightsOutGame();
const aiTracker = new AISolverTracker();
let aiBusy = false;
const AI_REPLAY_DELAY_MS = 320;
const aiReview = {
  active: false,
  moves: [],
  cursor: 0,
};

function update() {
  render(game, handlePress);
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

  game.press(i);
  update();

  if (game.isSolved()) {
    setSolvedStatus();
    setToast(`<span class="ok">Solved!</span> Moving to the next level…`);

    setTimeout(() => {
      clearSolvedStatus();
      game.advanceLevel();

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
  clearSolvedStatus();
  setAIResultsVisible(false);
  setBFSSolvedState(false);

  setToast(`Board selected: ${size}x${size}. Turn everything OFF.`);
  update();
}

async function runBFS() {
  if (aiBusy) {
    return;
  }

  aiBusy = true;
  resetAIReview();
  setAIResultsVisible(true);

  setToast("Running BFS... this can take longer on larger boards.");

  await pause();

  const run = solveWithBFS({
    board: game.board,
    toggleMasks: game.toggleMasks,
    maskAll: game.maskAll,
  });

  aiTracker.record(run);
  update();

  if (!run.solved) {
    setToast(`BFS stopped: ${run.reason}. Try a smaller board or a fresh puzzle.`);
    aiBusy = false;
    return;
  }

  setToast(`BFS found a solution in ${run.depth} moves. Replaying now...`);
  await replayAIMoves(run.moves);

  aiReview.active = true;
  aiReview.moves = run.moves.slice();
  aiReview.cursor = run.moves.length;
  setBFSSolvedState(true);
  update();

  clearSolvedStatus();
  setToast(`BFS replay finished. Use Previous/Next AI Move to inspect the solution.`);
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
    setBFSSolvedState(false);
    setToast(`Restarted Level ${game.level + 1}.`);
    update();
  },
  onNewPuzzle: () => {
    if (aiBusy) {
      return;
    }

    game.newPuzzle();
    aiTracker.clear();
    resetAIReview();
    setBFSSolvedState(false);
    setToast(`New solvable puzzle generated for Level ${game.level + 1}.`);
    update();
  },
  onSolveBFS: runBFS,
  onAIPrevMove: stepAIPrevious,
  onAINextMove: stepAINext,
});

startGame(getStartSize());