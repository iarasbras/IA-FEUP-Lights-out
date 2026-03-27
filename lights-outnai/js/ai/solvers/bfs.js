import { applyMask } from "../../core/board.js";

const METHOD = "BFS";
const GOAL_STATE = 0;
const APPROX_BYTES_PER_VISITED = 28;
const APPROX_BYTES_PER_FRONTIER = 8;

const REASON = {
  FOUND: "found",
  ALREADY_SOLVED: "already_solved",
  MAX_VISITED: "max_visited_reached",
  EXHAUSTED: "exhausted_without_solution",
};

export function solveWithBFS({
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

  const startFrontier = createFrontier(board);
  const goalFrontier = createFrontier(GOAL_STATE);

  let expandedStates = 0;
  let maxQueueSize = 2;
  let maxFrontierSize = 2;
  let meetState = null;
  let reason = REASON.FOUND;

  while (hasWork(startFrontier) && hasWork(goalFrontier)) {
    const first = expandLayer({
      frontier: startFrontier,
      opposite: goalFrontier,
      toggleMasks,
      maskAll,
      maxVisited,
    });

    expandedStates += first.expanded;
    ({ maxQueueSize, maxFrontierSize } = updatePeaks({
      startFrontier,
      goalFrontier,
      maxQueueSize,
      maxFrontierSize,
    }));

    if (first.hitMax) {
      reason = REASON.MAX_VISITED;
      break;
    }

    if (first.meetState !== null) {
      meetState = first.meetState;
      break;
    }

    const second = expandLayer({
      frontier: goalFrontier,
      opposite: startFrontier,
      toggleMasks,
      maskAll,
      maxVisited,
    });

    expandedStates += second.expanded;
    ({ maxQueueSize, maxFrontierSize } = updatePeaks({
      startFrontier,
      goalFrontier,
      maxQueueSize,
      maxFrontierSize,
    }));

    if (second.hitMax) {
      reason = REASON.MAX_VISITED;
      break;
    }

    if (second.meetState !== null) {
      meetState = second.meetState;
      break;
    }
  }

  if (meetState === null && reason === REASON.FOUND) {
    reason = REASON.EXHAUSTED;
  }

  const endTime = performance.now();
  const solved = meetState !== null;
  const moves = solved
    ? reconstructBidirectionalMoves(meetState, startFrontier.visited, goalFrontier.visited)
    : [];
  const visitedStates = startFrontier.visited.size + goalFrontier.visited.size;

  return makeResult({
    solved,
    reason,
    startTime,
    endTime,
    visitedStates,
    expandedStates,
    maxQueueSize,
    maxFrontierSize,
    moves,
  });
}

function createFrontier(seedState) {
  return {
    queue: [seedState],
    head: 0,
    visited: new Map([[seedState, { parent: null, move: null }]]),
  };
}

function hasWork(frontier) {
  return frontier.head < frontier.queue.length;
}

function updatePeaks({
  startFrontier,
  goalFrontier,
  maxQueueSize,
  maxFrontierSize,
}) {
  const queueSize = startFrontier.queue.length + goalFrontier.queue.length;
  const frontierSize =
    (startFrontier.queue.length - startFrontier.head) +
    (goalFrontier.queue.length - goalFrontier.head);

  return {
    maxQueueSize: Math.max(maxQueueSize, queueSize),
    maxFrontierSize: Math.max(maxFrontierSize, frontierSize),
  };
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

function expandLayer({ frontier, opposite, toggleMasks, maskAll, maxVisited }) {
  const layerSize = frontier.queue.length - frontier.head;
  let expandedStates = 0;
  for (let k = 0; k < layerSize; k++) {
    const state = frontier.queue[frontier.head++];
    expandedStates += 1;

    for (let i = 0; i < toggleMasks.length; i++) {
      const next = applyMask(state, toggleMasks[i], maskAll);

      if (frontier.visited.has(next)) {
        continue;
      }

      frontier.visited.set(next, { parent: state, move: i });
      frontier.queue.push(next);

      if (opposite.visited.has(next)) {
        return { expanded: expandedStates, hitMax: false, meetState: next };
      }

      if (frontier.visited.size + opposite.visited.size >= maxVisited) {
        return { expanded: expandedStates, hitMax: true, meetState: null };
      }
    }
  }

  return { expanded: expandedStates, hitMax: false, meetState: null };
}

function reconstructBidirectionalMoves(meetState, visitedStart, visitedGoal) {
  const fromStart = [];
  let cursor = meetState;

  while (visitedStart.get(cursor).parent !== null) {
    const entry = visitedStart.get(cursor);
    fromStart.push(entry.move);
    cursor = entry.parent;
  }

  fromStart.reverse();

  const toGoal = [];
  cursor = meetState;

  while (visitedGoal.get(cursor).parent !== null) {
    const entry = visitedGoal.get(cursor);
    toGoal.push(entry.move);
    cursor = entry.parent;
  }

  return fromStart.concat(toGoal);
}

function estimateMemoryBytes(visitedStates, maxFrontierSize) {
  return (
    (visitedStates * APPROX_BYTES_PER_VISITED) +
    (maxFrontierSize * APPROX_BYTES_PER_FRONTIER)
  );
}
