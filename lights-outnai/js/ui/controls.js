import { restartBtn, newBtn } from "./dom.js";

export function bindControls({ onRestart, onNewPuzzle }) {
  restartBtn.addEventListener("click", onRestart);
  newBtn.addEventListener("click", onNewPuzzle);
}