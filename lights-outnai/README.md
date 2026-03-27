# IA-FEUP-Lights-out

A modular web implementation of the **Lights Out** puzzle game developed for the **Artificial Intelligence** course at **FEUP**.

## Project Overview

Lights Out is a one-player puzzle game played on a square grid of lights.  
When the player clicks a cell, that cell and its orthogonal neighbors (up, down, left, right) toggle their state.

The objective is to turn **all lights off**.

This version of the project now includes a **complete playable implementation** with:
- progressive difficulty
- modular code structure
- dark mode interface
- solvable generated puzzles
- integrated AI solving support (BFS)

The current focus is to support both **human play** and **AI-based solving analysis**.

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

- Start menu with selectable board sizes (3x3, 4x4, 5x5)
- Human playable Lights Out mode in the browser
- Progressive levels with increasing difficulty
- Solvable puzzle generation
- Difficulty smoothing with level constraints
- Restart current level
- Generate a new puzzle for the current level
- AI Solver section with BFS integration
- BFS solution replay on the board with metricts 
- Step-by-step review of AI solution (`Previous AI Move` / `Next AI Move`)
- Modular JavaScript architecture

---

## Difficulty Progression

The game starts with easier constrained levels and increases in difficulty automatically as the player clears levels.

Progression is configured in `lights-outnai/js/config/levels.js` using:
- board size (`n`)
- scramble intensity (`scramble`)
- optional ON-light cap (`maxOn`)

After the predefined levels are completed, the game continues in a harder endless mode.

---

## Project Structure

```text
lights-outnai/
├─ README.md
├─ homepage.html
├─ index.html
├─ assets/
│  └─ styles/
│     └─ main.css
└─ js/
   ├─ app.js
   ├─ homepage.js
   ├─ ai/
   │  ├─ tracker.js
   │  └─ solvers/
   │     └─ bfs.js
   ├─ config/
   │  └─ levels.js
   ├─ core/
   │  ├─ board.js
   │  └─ game.js
   └─ ui/
      ├─ controls.js
      ├─ dom.js
      └─ renderer.js
```

---

## Team

- Ali Perez, up202512122
- Iara Brás, up202208825
