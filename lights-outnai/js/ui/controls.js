import {
  backBtn,
  restartBtn,
  newBtn,
  solveBfsBtn,
  aiPrevBtn,
  aiNextBtn,
} from "./dom.js";

export function bindControls({
  onBackToMenu,
  onRestart,
  onNewPuzzle,
  onSolveBFS,
  onAIPrevMove,
  onAINextMove,
}) {
  if (onBackToMenu) {
    backBtn.addEventListener("click", onBackToMenu);
  }

  restartBtn.addEventListener("click", onRestart);
  newBtn.addEventListener("click", onNewPuzzle);

  if (onSolveBFS) {
    solveBfsBtn.addEventListener("click", onSolveBFS);
  }

  if (onAIPrevMove) {
    aiPrevBtn.addEventListener("click", onAIPrevMove);
  }

  if (onAINextMove) {
    aiNextBtn.addEventListener("click", onAINextMove);
  }
}