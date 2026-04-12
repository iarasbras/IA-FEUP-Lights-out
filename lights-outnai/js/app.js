import { LightsOutGame } from "./core/game.js";
import {
  boardToText,
  parseBoardText,
} from "./core/board.js";
import {
  render,
  setToast,
  setSolvedStatus,
  setFailedStatus,
  clearSolvedStatus,
  setAIResultsVisible,
  setBFSSolvedState,
  renderAIResult,
  renderAIReviewState,
  setNextLevelVisible,
  setComparisonVisible,
  renderComparisonResults,
} from "./ui/renderer.js";
import { bindControls } from "./ui/controls.js";
import { solveWithBFS } from "./ai/solvers/bfs.js";
import { solveWithAStar } from "./ai/solvers/astar.js";
import { solveWithWeightedAStar } from "./ai/solvers/weighted-astar.js";
import { solveDFS } from "./ai/solvers/dfs.js";
import { solveIDS } from "./ai/solvers/ids.js";
import { solveWithUCS } from "./ai/solvers/ucs.js";
import { solveGreedy } from "./ai/solvers/greedy.js";
import { getHeuristicLabel } from "./ai/heuristics.js";
import { AISolverTracker } from "./ai/tracker.js";
import {
  heuristicSelect,
  boardTextInput,
  boardFileInput,
} from "./ui/dom.js";

const game = new LightsOutGame();
const aiTracker = new AISolverTracker();
let aiBusy = false;
let humanDefeated = false;
let hintCell = null;
let hintsUsedInLevel = 0;
let aiReplayStartBoard = null;
let lastComparisonResults = [];
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

function getSelectedAlgorithm() {
  const select = document.getElementById("algorithmSelect");
  return select ? select.value : "bfs";
}

function getSelectedHeuristic() {
  return heuristicSelect?.value || "lights-on";
}

function handlePress(i) {
  if (aiBusy || humanDefeated) {
    return;
  }

  if (aiReview.active) {
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    resetAIReview();
  }

  hintCell = null;

  game.press(i);
  update();

  if (game.isSolved()) {
    game.registerWin({
      hintsUsed: hintsUsedInLevel,
      awardScore: true,
    });

    setSolvedStatus();
    setToast(`<span class="ok">Solved!</span> Score awarded. Moving to the next level…`);

    setTimeout(() => {
      clearSolvedStatus();
      game.advanceLevel();
      resetAISectionForFreshBoard();
      humanDefeated = false;
      hintsUsedInLevel = 0;
      hintCell = null;

      if (game.level < game.levels.length) {
        setToast(`Beat a level to increase difficulty automatically.`);
      } else {
        setToast(`<span class="ok">Boss cleared.</span> Endless mode: 5×5, scramble keeps increasing.`);
      }

      update();
    }, 700);
    return;
  }

  if (game.moves >= game.getMoveLimit()) {
    humanDefeated = true;
    setFailedStatus();
    setToast(`Move limit reached. This run is lost — restart, load another puzzle, or ask the AI to solve it.`);
    update();
    return;
  }

  setToast(`Keep going. Turn everything OFF.`);
}

function startGame(size) {
  game.startFromSize(size);
  aiTracker.clear();
  resetAIReview();
  hintCell = null;
  hintsUsedInLevel = 0;
  humanDefeated = false;
  clearSolvedStatus();
  setAIResultsVisible(false);
  setBFSSolvedState(false);
  setNextLevelVisible(false);
  setComparisonVisible(false);
  renderComparisonResults([]);
  lastComparisonResults = [];
  syncSolveButtonLabel();

  setToast(`Board selected: ${size}x${size}. Turn everything OFF.`);
  update();
}

function syncSolveButtonLabel() {
  const algorithm = getSelectedAlgorithm();
  const labels = {
    bfs: "Solve with BFS",
    astar: "Solve with A*",
    dfs: "Solve with DFS",
    ids: "Solve with IDS",
    ucs: "Solve with UCS",
    greedy: "Solve with Greedy",
    "weighted-astar": "Solve with Weighted A*",
  };

  const button = document.getElementById("solveBfsBtn");
  if (button) {
    button.textContent = labels[algorithm] || "Solve Selected";
  }
}

function getSolverLimits(n) {
  if (n <= 3) {
    return { maxVisited: 180000, maxDepth: 24 };
  }

  if (n === 4) {
    return { maxVisited: 140000, maxDepth: 28 };
  }

  return { maxVisited: 100000, maxDepth: 32 };
}

function runAlgorithmByName(algorithm, boardOverride = game.board) {
  const limits = getSolverLimits(game.n);
  const heuristicName = getSelectedHeuristic();

  switch (algorithm) {
    case "bfs":
      return solveWithBFS({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        maxVisited: limits.maxVisited,
      });

    case "astar":
      return solveWithAStar({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        maxVisited: limits.maxVisited,
        heuristicName,
      });

    case "weighted-astar":
      return solveWithWeightedAStar({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        maxVisited: limits.maxVisited,
        heuristicName,
      });

    case "dfs":
      return solveDFS({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
      });

    case "ids":
      return solveIDS({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        maxDepth: limits.maxDepth,
      });

    case "ucs":
      return solveWithUCS({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        maxVisited: limits.maxVisited,
      });

    case "greedy":
      return solveGreedy({
        board: boardOverride,
        toggleMasks: game.toggleMasks,
        maskAll: game.maskAll,
        heuristicName,
      });

    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

function runSelectedAlgorithm() {
  return runAlgorithmByName(getSelectedAlgorithm(), game.board);
}

async function runSelectedSolver() {
  if (aiBusy) {
    return;
  }

  if (aiReview.active) {
    restoreBoardBeforeAIReplay();
  }

  aiBusy = true;
  resetAIReview();
  hintCell = null;
  setAIResultsVisible(true);
  setBFSSolvedState(false);
  setNextLevelVisible(false);

  aiReplayStartBoard = game.board;

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

async function compareAllAlgorithms() {
  if (aiBusy) {
    return;
  }

  if (aiReview.active) {
    restoreBoardBeforeAIReplay();
  }

  aiBusy = true;
  setComparisonVisible(true);
  renderComparisonResults([]);
  setToast("Running algorithm comparison on current board...");
  await pause();

  const boardSnapshot = game.board;
  const algorithms = [
    "bfs",
    "dfs",
    "ids",
    "ucs",
    "greedy",
    "astar",
    "weighted-astar",
  ];

  const results = algorithms.map((algorithm) =>
    runAlgorithmByName(algorithm, boardSnapshot)
  );

  lastComparisonResults = results;
  renderComparisonResults(results);
  setComparisonVisible(true);
  setToast("Comparison finished. Review the table below the AI controls.");
  aiBusy = false;
}

async function askHint() {
  if (aiBusy) {
    return;
  }

  if (humanDefeated) {
    setToast("This run is already lost. Restart or load a new puzzle.");
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

  const run = solveWithAStar({
    board: game.board,
    toggleMasks: game.toggleMasks,
    maskAll: game.maskAll,
    heuristicName: getSelectedHeuristic(),
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

function goToNextLevel() {
  if (aiBusy) {
    return;
  }

  game.registerWin({ awardScore: false });
  clearSolvedStatus();
  game.advanceLevel();
  resetAISectionForFreshBoard();
  humanDefeated = false;
  hintCell = null;
  hintsUsedInLevel = 0;

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

function resetAISectionForFreshBoard() {
  aiTracker.clear();
  resetAIReview();
  aiReplayStartBoard = null;
  setAIResultsVisible(false);
  setBFSSolvedState(false);
  setNextLevelVisible(false);
  setComparisonVisible(false);
  renderComparisonResults([]);
  lastComparisonResults = [];
  syncSolveButtonLabel();
}

function restoreBoardBeforeAIReplay() {
  setBFSSolvedState(false);
  setNextLevelVisible(false);

  if (aiReplayStartBoard === null) {
    return;
  }

  game.board = aiReplayStartBoard;
  clearSolvedStatus();
  resetAIReview();
}

function loadBoardFromInput() {
  try {
    const raw = boardTextInput?.value ?? "";
    const { board, n } = parseBoardText(raw);
    game.loadCustomBoard(board, n, "Imported Board");
    aiTracker.clear();
    resetAIReview();
    hintCell = null;
    hintsUsedInLevel = 0;
    humanDefeated = false;
    clearSolvedStatus();
    setAIResultsVisible(false);
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    setComparisonVisible(false);
    renderComparisonResults([]);
    lastComparisonResults = [];
    setToast(`Loaded a custom ${n}x${n} board from text.`);
    update();
  } catch (error) {
    setToast(`Could not load board: ${error.message}`);
  }
}

function exportResults() {
  const latest = aiTracker.latest();
  const heuristicLabel = getHeuristicLabel(getSelectedHeuristic());

  const lines = [
    "Lights Out Results Export",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Board size: ${game.n}x${game.n}`,
    `Current level label: ${game.getLevelConfig().label || `Level ${game.level + 1}`}`,
    `Move limit: ${game.getMoveLimit()}`,
    `Human moves: ${game.moves}`,
    `Hints used: ${hintsUsedInLevel}`,
    `Wins: ${game.wins}`,
    `Best streak: ${game.best}`,
    `Score: ${game.score}`,
    `Selected heuristic: ${heuristicLabel}`,
    "",
    "Current board:",
    boardToText(game.board, game.n),
    "",
  ];

  if (latest) {
    lines.push(
      "Latest AI run:",
      `Method: ${latest.method}`,
      `Solved: ${latest.solved}`,
      `Depth: ${latest.depth}`,
      `Time (ms): ${latest.timeMs}`,
      `Visited: ${latest.visitedStates}`,
      `Expanded: ${latest.expandedStates}`,
      `Max queue: ${latest.maxQueueSize}`,
      `Memory: ${formatMemoryForExport(latest.memoryEstimateBytes)}`,
      `Moves: ${latest.moves.join(", ") || "(none)"}`,
      ""
    );
  }

  if (lastComparisonResults.length > 0) {
    lines.push("Comparison table:");
    for (const run of lastComparisonResults) {
      lines.push(
        `${run.method} | solved=${run.solved} | depth=${run.depth} | timeMs=${run.timeMs} | visited=${run.visitedStates} | expanded=${run.expandedStates} | maxQueue=${run.maxQueueSize} | memory=${formatMemoryForExport(run.memoryEstimateBytes)}`
      );
    }
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lights-out-results-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setToast("Results exported to a text file.");
}

function formatMemoryForExport(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "-";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
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
    humanDefeated = false;
    clearSolvedStatus();
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    setComparisonVisible(false);
    renderComparisonResults([]);
    lastComparisonResults = [];
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
    humanDefeated = false;
    clearSolvedStatus();
    setBFSSolvedState(false);
    setNextLevelVisible(false);
    setComparisonVisible(false);
    renderComparisonResults([]);
    lastComparisonResults = [];
    syncSolveButtonLabel();
    setToast(`New solvable puzzle generated for ${game.n}x${game.n}.`);
    update();
  },
  onSolveBFS: runSelectedSolver,
  onCompareAll: compareAllAlgorithms,
  onExportResults: exportResults,
  onLoadBoard: loadBoardFromInput,
  onAIPrevMove: stepAIPrevious,
  onAINextMove: stepAINext,
  onNextLevel: goToNextLevel,
});

document.getElementById("algorithmSelect")?.addEventListener("change", () => {
  restoreBoardBeforeAIReplay();
  syncSolveButtonLabel();
  update();
});

heuristicSelect?.addEventListener("change", () => {
  if (aiTracker.latest()) {
    setToast(`Heuristic changed to ${getHeuristicLabel(getSelectedHeuristic())}.`);
  }
});

boardFileInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    if (boardTextInput) {
      boardTextInput.value = text;
    }
    setToast(`Loaded text from ${file.name}. Review it, then click "Load Board".`);
  } catch {
    setToast("Could not read the selected file.");
  }
});

startGame(getStartSize());