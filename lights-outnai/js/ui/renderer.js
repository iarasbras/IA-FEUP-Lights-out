import {
  gridEl,
  statusEl,
  levelTitle,
  levelDesc,
  movesStat,
  onStat,
  winsStat,
  bestStat,
  toast,
} from "./dom.js";

export function setToast(html) {
  toast.innerHTML = html;
}

export function render(game, onPress) {
  const levelConfig = game.getLevelConfig();

  gridEl.style.setProperty("--n", game.n);
  statusEl.textContent = `Level ${game.level + 1}`;
  levelTitle.textContent = `Level ${game.level + 1}`;
  levelDesc.textContent = `Board: ${game.n}×${game.n} • Scramble: ${levelConfig.scramble} moves`;

  movesStat.textContent = game.moves;
  onStat.textContent = game.getLightsOn();
  winsStat.textContent = game.wins;
  bestStat.textContent = game.best;

  gridEl.innerHTML = "";

  for (let i = 0; i < game.n * game.n; i++) {
    const b = document.createElement("button");
    b.className = "cell" + (((game.board >>> i) & 1) ? " on" : "");
    b.setAttribute("aria-label", `cell ${i}`);
    b.addEventListener("click", () => onPress(i));
    gridEl.appendChild(b);
  }
}

export function setSolvedStatus() {
  statusEl.classList.add("good");
}

export function clearSolvedStatus() {
  statusEl.classList.remove("good");
}