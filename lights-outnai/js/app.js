import { LightsOutGame } from "./core/game.js";
import { render, setToast, setSolvedStatus, clearSolvedStatus } from "./ui/renderer.js";
import { bindControls } from "./ui/controls.js";

const game = new LightsOutGame();

function update() {
  render(game, handlePress);
}

function handlePress(i) {
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
  clearSolvedStatus();

  setToast(`Board selected: ${size}x${size}. Turn everything OFF.`);
  update();
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
    goBackToMenu();
  },
  onRestart: () => {
    game.restartLevel();
    setToast(`Restarted Level ${game.level + 1}.`);
    update();
  },
  onNewPuzzle: () => {
    game.newPuzzle();
    setToast(`New solvable puzzle generated for Level ${game.level + 1}.`);
    update();
  },
});

startGame(getStartSize());