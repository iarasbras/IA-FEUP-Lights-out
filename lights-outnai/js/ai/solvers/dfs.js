import { applyMask } from "../../core/board.js";

const METHOD = "DFS";
const GOAL_STATE = 0;
const APPROX_BYTES_PER_VISITED = 28;
const APPROX_BYTES_PER_FRONTIER = 8;

const REASON = {
  FOUND: "found",
  ALREADY_SOLVED: "already_solved",
  EXHAUSTED: "exhausted_without_solution",
};

export function solveDFS({
  board,
  toggleMasks,
  maskAll,
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

  const stack = [board];
  const visited = new Map([[board, { parent: null, move: null }]]);

  let expandedStates = 0;
  let maxQueueSize = 1;
  let maxFrontierSize = 1;
  let solved = false;
  let goalState = null;

  while (stack.length > 0) {
    const current = stack.pop();
    expandedStates += 1;

    if (current === GOAL_STATE) {
      solved = true;
      goalState = current;
      break;
    }

    for (let i = 0; i < toggleMasks.length; i++) {
      const next = applyMask(current, toggleMasks[i], maskAll);

      if (visited.has(next)) {
        continue;
      }

      visited.set(next, { parent: current, move: i });
      stack.push(next);

      maxQueueSize = Math.max(maxQueueSize, visited.size);
      maxFrontierSize = Math.max(maxFrontierSize, stack.length);
    }
  }

  const endTime = performance.now();
  const moves = solved ? reconstructMoves(goalState, visited) : [];

  return makeResult({
    solved,
    reason: solved ? REASON.FOUND : REASON.EXHAUSTED,
    startTime,
    endTime,
    visitedStates: visited.size,
    expandedStates,
    maxQueueSize,
    maxFrontierSize,
    moves,
  });
}

function reconstructMoves(goalState, visited) {
  const moves = [];
  let cursor = goalState;

  while (visited.get(cursor).parent !== null) {
    const entry = visited.get(cursor);
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