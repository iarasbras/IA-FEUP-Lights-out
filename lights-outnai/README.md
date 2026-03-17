# IA-FEUP-Lights-out

A modular web implementation of the **Lights Out** puzzle game developed for the **Artificial Intelligence** course at **FEUP**.

## Project Overview

Lights Out is a one-player puzzle game played on a square grid of lights.  
When the player clicks a cell, that cell and its orthogonal neighbors (up, down, left, right) toggle their state.

The objective is to turn **all lights off**.

This version of the project focuses on a **clean playable implementation** with:
- progressive difficulty
- modular code structure
- dark mode interface
- solvable generated puzzles

The current version does **not yet include AI solving features**.  
Its purpose is to provide a solid and organized foundation for future development of search-based solving methods.

---

## Game Rules

- The board is a square grid.
- Each light can be either **ON** or **OFF**.
- Clicking one cell toggles:
  - the clicked cell
  - the cell above
  - the cell below
  - the cell to the left
  - the cell to the right
- The player wins when **all lights are OFF**.

---

## Current Features

- Playable Lights Out game in the browser
- Progressive levels with increasing difficulty
- Solvable puzzle generation
- Restart current level
- Generate a new puzzle for the current level
- Responsive dark mode UI
- Modular JavaScript architecture

---

## Difficulty Progression

The game starts with smaller boards and lower scramble values, then increases in difficulty automatically as the player clears levels.

Examples of progression:
- 3×3 boards
- 4×4 boards
- 5×5 boards
- higher scramble values in later stages

After the predefined levels are completed, the game continues in a harder endless mode.

---

## Project Structure

```text
lights-outnai/
├─ README.md
├─ index.html
├─ assets/
│  └─ styles/
│     └─ main.css
└─ js/
   ├─ app.js
   ├─ config/
   │  └─ levels.js
   ├─ core/
   │  ├─ board.js
   │  └─ game.js
   └─ ui/
      ├─ controls.js
      ├─ dom.js
      └─ renderer.js