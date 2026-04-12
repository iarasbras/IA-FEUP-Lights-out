import {
  backBtn,
  restartBtn,
  hintBtn,
  newBtn,
  solveBfsBtn,
  compareAllBtn,
  exportResultsBtn,
  loadBoardBtn,
  aiPrevBtn,
  aiNextBtn,
  nextLevelBtn,
} from "./dom.js";

export function bindControls({
  onBackToMenu,
  onRestart,
  onHint,
  onNewPuzzle,
  onSolveBFS,
  onCompareAll,
  onExportResults,
  onLoadBoard,
  onAIPrevMove,
  onAINextMove,
  onNextLevel,
}) {
  if (onBackToMenu) {
    backBtn.addEventListener("click", onBackToMenu);
  }

  restartBtn.addEventListener("click", onRestart);

  if (onHint) {
    hintBtn.addEventListener("click", onHint);
  }

  newBtn.addEventListener("click", onNewPuzzle);

  if (onSolveBFS) {
    solveBfsBtn.addEventListener("click", onSolveBFS);
  }

  if (onCompareAll) {
    compareAllBtn?.addEventListener("click", onCompareAll);
  }

  if (onExportResults) {
    exportResultsBtn?.addEventListener("click", onExportResults);
  }

  if (onLoadBoard) {
    loadBoardBtn?.addEventListener("click", onLoadBoard);
  }

  if (onAIPrevMove) {
    aiPrevBtn.addEventListener("click", onAIPrevMove);
  }

  if (onAINextMove) {
    aiNextBtn.addEventListener("click", onAINextMove);
  }

  if (onNextLevel) {
    nextLevelBtn?.addEventListener("click", onNextLevel);
  }
}