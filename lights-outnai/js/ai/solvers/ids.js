import { applyMask } from "../../core/board.js";

const METHOD = "IDS";
const GOAL_STATE = 0;
const APPROX_BYTES_PER_VISITED = 28;
const APPROX_BYTES_PER_FRONTIER = 8;

const REASON = {
  FOUND: "found",
  ALREADY_SOLVED: "already_solved",
  EXHAUSTED: "exhausted_without_solution",
};

export function solveIDS({
  board,
  toggleMasks,
  maskAll,
  maxDepth = 30,
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

  let totalVisitedStates = 0;
  let totalExpandedStates = 0;
  let maxQueueSize = 1;
  let maxFrontierSize = 1;
  let solvedMoves = [];

  for (let limit = 0; limit <= maxDepth; limit++) {
    const result = depthLimitedSearch({
      board,
      toggleMasks,
      maskAll,
      limit,
    });

    totalVisitedStates += result.visitedStates;
    totalExpandedStates += result.expandedStates;
    maxQueueSize = Math.max(maxQueueSize, result.maxQueueSize);
    maxFrontierSize = Math.max(maxFrontierSize, result.maxFrontierSize);

    if (result.solved) {
      solvedMoves = result.moves;
      const endTime = performance.now();

      return makeResult({
        solved: true,
        reason: REASON.FOUND,
        startTime,
        endTime,
        visitedStates: totalVisitedStates,
        expandedStates: totalExpandedStates,
        maxQueueSize,
        maxFrontierSize,
        moves: solvedMoves,
      });
    }
  }

  const endTime = performance.now();

  return makeResult({
    solved: false,
    reason: REASON.EXHAUSTED,
    startTime,
    endTime,
    visitedStates: totalVisitedStates,
    expandedStates: totalExpandedStates,
    maxQueueSize,
    maxFrontierSize,
    moves: [],
  });
}

function depthLimitedSearch({
  board,
  toggleMasks,
  maskAll,
  limit,
}) {
  const stack = [{ state: board, depth: 0 }];
  const visited = new Map([[board, { parent: null, move: null, depth: 0 }]]);

  let expandedStates = 0;
  let maxQueueSize = 1;
  let maxFrontierSize = 1;

  while (stack.length > 0) {
    const current = stack.pop();
    expandedStates += 1;

    if (current.state === GOAL_STATE) {
      return {
        solved: true,
        moves: reconstructMoves(current.state, visited),
        visitedStates: visited.size,
        expandedStates,
        maxQueueSize,
        maxFrontierSize,
      };
    }

    if (current.depth >= limit) {
      continue;
    }

    for (let i = 0; i < toggleMasks.length; i++) {
      const next = applyMask(current.state, toggleMasks[i], maskAll);
      const nextDepth = current.depth + 1;

      if (visited.has(next) && visited.get(next).depth <= nextDepth) {
        continue;
      }

      visited.set(next, { parent: current.state, move: i, depth: nextDepth });
      stack.push({ state: next, depth: nextDepth });

      maxQueueSize = Math.max(maxQueueSize, visited.size);
      maxFrontierSize = Math.max(maxFrontierSize, stack.length);
    }
  }

  return {
    solved: false,
    moves: [],
    visitedStates: visited.size,
    expandedStates,
    maxQueueSize,
    maxFrontierSize,
  };
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