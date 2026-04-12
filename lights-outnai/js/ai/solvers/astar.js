import { applyMask, popcount } from "../../core/board.js";
import { MinPriorityQueue } from "../priority-queue.js";

const METHOD = "A*";
const GOAL_STATE = 0;
const APPROX_BYTES_PER_VISITED = 28;
const APPROX_BYTES_PER_FRONTIER = 12;

const REASON = {
  FOUND: "found",
  ALREADY_SOLVED: "already_solved",
  MAX_VISITED: "max_visited_reached",
  EXHAUSTED: "exhausted_without_solution",
};

export function solveWithAStar({
  board,
  toggleMasks,
  maskAll,
  maxVisited = 1000000,
}) {
  const startTime = performance.now();

  if (board === GOAL_STATE) {
    return makeResult({
      solved: true,
      reason: REASON.ALREADY_SOLVED,
      startTime,
      endTime: startTime,
      visitedStates: 1,
      expandedStates: 0,
      maxQueueSize: 1,
      maxFrontierSize: 1,
      moves: [],
    });
  }

  const open = new MinPriorityQueue((a, b) => {
    if (a.f !== b.f) {
      return a.f - b.f;
    }
    return a.g - b.g;
  });
  open.push({ state: board, g: 0, f: heuristic(board) });
  const bestCost = new Map([[board, 0]]);
  const parents = new Map([[board, { parent: null, move: null }]]);

  let expandedStates = 0;
  let maxQueueSize = 1;
  let maxFrontierSize = 1;
  let reason = REASON.EXHAUSTED;
  let solved = false;
  let goalState = null;

  while (open.size > 0) {
    const current = open.pop();

    if (!current || current.g > bestCost.get(current.state)) {
      continue;
    }

    expandedStates += 1;

    if (current.state === GOAL_STATE) {
      solved = true;
      goalState = current.state;
      reason = REASON.FOUND;
      break;
    }

    for (let i = 0; i < toggleMasks.length; i++) {
      const next = applyMask(current.state, toggleMasks[i], maskAll);
      const nextG = current.g + 1;
      const known = bestCost.get(next);

      if (known !== undefined && known <= nextG) {
        continue;
      }

      bestCost.set(next, nextG);
      parents.set(next, { parent: current.state, move: i });
      open.push({
        state: next,
        g: nextG,
        f: nextG + heuristic(next),
      });

      const queueSize = open.size;
      maxQueueSize = Math.max(maxQueueSize, queueSize);
      maxFrontierSize = Math.max(maxFrontierSize, queueSize);

      if (bestCost.size >= maxVisited) {
        reason = REASON.MAX_VISITED;
        const endTime = performance.now();

        return makeResult({
          solved: false,
          reason,
          startTime,
          endTime,
          visitedStates: bestCost.size,
          expandedStates,
          maxQueueSize,
          maxFrontierSize,
          moves: [],
        });
      }
    }
  }

  const endTime = performance.now();
  const moves = solved ? reconstructMoves(goalState, parents) : [];

  return makeResult({
    solved,
    reason,
    startTime,
    endTime,
    visitedStates: bestCost.size,
    expandedStates,
    maxQueueSize,
    maxFrontierSize,
    moves,
  });
}

function heuristic(board) {
  return popcount(board);
}

function reconstructMoves(goalState, parents) {
  const moves = [];
  let cursor = goalState;

  while (parents.get(cursor).parent !== null) {
    const entry = parents.get(cursor);
    moves.push(entry.move);
    cursor = entry.parent;
  }

  return moves.reverse();
}

function makeResult({
  solved,
  reason,
  startTime,
  endTime,
  visitedStates,
  expandedStates,
  maxQueueSize,
  maxFrontierSize,
  moves,
}) {
  return {
    method: METHOD,
    solved,
    reason,
    timeMs: Number((endTime - startTime).toFixed(3)),
    visitedStates,
    expandedStates,
    maxQueueSize,
    maxFrontierSize,
    memoryEstimateBytes: estimateMemoryBytes(visitedStates, maxFrontierSize),
    depth: moves.length,
    moves,
  };
}

function estimateMemoryBytes(visitedStates, maxFrontierSize) {
  return (
    (visitedStates * APPROX_BYTES_PER_VISITED) +
    (maxFrontierSize * APPROX_BYTES_PER_FRONTIER)
  );
}
