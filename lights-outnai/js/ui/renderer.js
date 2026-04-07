import {
  gridEl,
  statusEl,
  levelTitle,
  levelDesc,
  movesStat,
  onStat,
  winsStat,
  bestStat,
  hintsStat,
  toast,
  aiResultPanel,
  solveBfsBtn,
  aiPrevBtn,
  aiNextBtn,
  aiStepMeta,
  aiStatus,
  aiMethodStat,
  aiMovesStat,
  aiTimeStat,
  aiVisitedStat,
  aiExpandedStat,
  aiQueueStat,
  aiNextLevelRow,
} from "./dom.js";

export function setToast(html) {
  toast.innerHTML = html;
}

export function render(game, onPress, hintCellIndex = null, hintsUsed = 0) {
  const levelConfig = game.getLevelConfig();

  gridEl.style.setProperty("--n", game.n);
  statusEl.textContent = `Level ${game.level + 1}`;
  levelTitle.textContent = `Level ${game.level + 1}`;
  levelDesc.textContent = `Board: ${game.n}×${game.n} • Scramble: ${levelConfig.scramble} moves`;

  movesStat.textContent = game.moves;
  onStat.textContent = game.getLightsOn();
  winsStat.textContent = game.wins;
  bestStat.textContent = game.best;
  hintsStat.textContent = hintsUsed;

  gridEl.innerHTML = "";

  for (let i = 0; i < game.n * game.n; i++) {
    const b = document.createElement("button");
    const isOn = ((game.board >>> i) & 1) === 1;
    const isHint = i === hintCellIndex;

    b.className = "cell" + (isOn ? " on" : "") + (isHint ? " hint" : "");
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

export function setAIResultsVisible(visible) {
  if (visible) {
    aiResultPanel.classList.remove("hidden");
    return;
  }

  aiResultPanel.classList.add("hidden");
}

export function setBFSSolvedState(solved) {
  const select = document.getElementById("algorithmSelect");
  const currentAlgorithm = select ? select.value.toUpperCase() : "AI";

  if (solved) {
    solveBfsBtn.textContent = `Solved with ${currentAlgorithm}`;
    solveBfsBtn.disabled = true;
    return;
  }

  solveBfsBtn.disabled = false;
}

export function setNextLevelVisible(visible) {
  if (visible) {
    aiNextLevelRow?.classList.remove("hidden");
    return;
  }

  aiNextLevelRow?.classList.add("hidden");
}

export function renderAIReviewState(review) {
  if (!review || !review.active) {
    aiPrevBtn.disabled = true;
    aiNextBtn.disabled = true;
    aiStepMeta.textContent = "Step - / -";
    return;
  }

  aiPrevBtn.disabled = review.cursor <= 0;
  aiNextBtn.disabled = review.cursor >= review.moves.length;
  aiStepMeta.textContent = `Step ${review.cursor} / ${review.moves.length}`;
}

export function renderAIResult(run) {
  if (!run) {
    aiStatus.textContent = "";
    aiMethodStat.textContent = "-";
    aiMovesStat.textContent = "-";
    aiTimeStat.textContent = "-";
    aiVisitedStat.textContent = "-";
    aiExpandedStat.textContent = "-";
    aiQueueStat.textContent = "-";
    return;
  }

  if (run.solved) {
    aiStatus.innerHTML = `<span class="aiSolvedHighlight">Solved in ${run.depth} moves</span>`;
  } else {
    aiStatus.textContent = "";
  }

  aiMethodStat.textContent = run.method;
  aiMovesStat.textContent = String(run.depth);
  aiTimeStat.textContent = String(run.timeMs);
  aiVisitedStat.textContent = String(run.visitedStates);
  aiExpandedStat.textContent = String(run.expandedStates);
  aiQueueStat.textContent = String(run.maxQueueSize);
}