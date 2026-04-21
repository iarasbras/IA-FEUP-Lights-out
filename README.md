# IA-FEUP-Lights-out

A modular web implementation of the **Lights Out** puzzle game developed for the **Artificial Intelligence** course at **FEUP**.


## Team

- **Ali Perez** - up202512122@up.pt
- **Iara Brás** - up202208825@up.pt


## Install & Setup

Clone the repository:
```bash
git clone https://github.com/iarasbras/IA-FEUP-Lights-out.git
cd lights-outnai
```

Run with Live Server:
```bash
# Option 1: Using VS Code Live Server extension
# Right-click on homepage.html and select "Open with Live Server"

# Option 2: Using Python 
python -m http.server 8000
# Then open http://localhost:8000/homepage.html

```

Open in your browser and start playing!



## Project Overview

Lights Out is a one-player puzzle game played on a square grid of lights.  
When the player clicks a cell, that cell and its orthogonal neighbors (up, down, left, right) toggle their state.

The objective is to turn **all lights off**.

This version includes:
- Progressive difficulty levels
- Modular JavaScript architecture
- Dark mode interface
- Solvable puzzle generation
- Support for 7 different AI solving algorithms (A*, BFS, DFS, Greedy, IDS, Uniform Cost, Weighted A*)
- Human hint system
- Step-by-step AI solution replay



## Game Rules

- The board is a square grid (3×3, 4×4, or 5×5)
- Each light is either **ON** or **OFF**
- Clicking a cell toggles:
  - the clicked cell
  - the cell above
  - the cell below
  - the cell to the left
  - the cell to the right
- **Win condition**: Turn all lights OFF


## Current Features

### Gameplay
- Start menu with selectable board sizes (3×3, 4×4, 5×5)
- Playable Lights Out mode with human controls
- Hint system via "Ask Hint" button (suggests next optimal move using A*)
- Solvable puzzle generation
- Restart and New Puzzle buttons
- Progressive difficulty levels with auto-advancement
- Dark mode interface

### AI Solvers (7 algorithms)

- **A\***: Optimal heuristic search using popcount admissible heuristic; balances speed with guaranteed optimal solutions
- **BFS**: Bidirectional breadth-first search; explores equally in both directions for optimal solutions with minimal overhead
- **DFS**: Depth-first search using stack-based exploration; explores deeply but trades solution quality for memory efficiency (can be slow)
- **Greedy**: Fast heuristic-only search (f=h); prioritizes speed over optimality by ignoring path cost
- **IDS**: Iterative deepening search; memory-efficient approach that repeats depth-limited searches with increasing limits to guarantee optimality
- **Uniform Cost (UCS)**: Unbiased cost-based exploration; finds optimal solutions without heuristic guidance (slower but thorough)
- **Weighted A\***: Weighted heuristic variant (f=g+2h); sacrifices some optimality for faster exploration compared to A*

### Solution Analysis & Metrics

After running an AI solver, detailed metrics are displayed:

- **Time (ms)**: Wall-clock computation time in milliseconds; measure of algorithm speed
- **Memory**: Estimated memory usage in bytes (B/KB/MB); indicates frontier/queue overhead during search
- **Visited States**: Total number of states examined; shows search breadth
- **Expanded States**: Number of states expanded from the frontier; indicates actual computation cost
- **Max Queue**: Peak frontier size during execution; shows memory pressure and search tree branching
- **AI Moves**: Number of moves in the computed solution; lower is better (optimality)

### Visualization & Interaction

- Solution replay with step-by-step controls (Previous/Next AI Move)
- Board state updates during replay
- Real-time metrics display with algorithm comparison
- Performance tracking across multiple solvers



## Project Structure

```text
lights-outnai/
├─ README.md
├─ homepage.html              # Game menu
├─ index.html                 # Main game board
├─ assets/
│  └─ styles/
│     └─ main.css             # Styling
└─ js/
   ├─ app.js                  # Main game logic
   ├─ homepage.js             # Menu logic
   ├─ ai/
   │  ├─ tracker.js           # AI metrics tracking
   │  └─ solvers/
   │     ├─ astar.js          # A* solver
   │     ├─ bfs.js            # BFS solver
   │     ├─ dfs.js            # DFS solver
   │     ├─ greedy.js         # Greedy solver
   │     ├─ ids.js            # IDS solver
   │     ├─ ucs.js            # Uniform Cost solver
   │     └─ weighted-astar.js # Weighted A* solver
   ├─ config/
   │  └─ levels.js            # Difficulty progression
   ├─ core/
   │  ├─ board.js             # Board logic and state
   │  └─ game.js              # Game mechanics
   └─ ui/
      ├─ controls.js          # User input handling
      ├─ dom.js               # DOM element bindings
      └─ renderer.js          # UI rendering
```


