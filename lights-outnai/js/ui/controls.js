import { backBtn, restartBtn, newBtn } from "./dom.js";

export function bindControls({ onBackToMenu, onRestart, onNewPuzzle }) {
  if (onBackToMenu) {
    backBtn.addEventListener("click", onBackToMenu);
  }

  restartBtn.addEventListener("click", onRestart);
  newBtn.addEventListener("click", onNewPuzzle);
}