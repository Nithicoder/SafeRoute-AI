import {
  AgentState,
  AlgorithmResult,
  AlgorithmType,
  CellType,
  Coordinate,
  EventLogItem,
  Exit,
  LogLevel,
  SimulationStatus,
} from '../types';
import { runSearch } from '../algorithms';
import { areCoordsEqual, coordKey, isPassable, isValidCoord } from '../utils/gridHelpers';

export interface SimulationState {
  status: SimulationStatus;
  algorithm: AlgorithmType;
  agent: AgentState;
  pathResult: AlgorithmResult | null;
  replanningCount: number;
  totalStepsTaken: number;
  logs: EventLogItem[];
  allowDiagonal: boolean;
  speedMs: number;
}

export const createInitialSimulationState = (
  start: Coordinate,
  algorithm: AlgorithmType = 'astar',
  speedMs = 300
): SimulationState => {
  return {
    status: 'idle',
    algorithm,
    agent: {
      position: { ...start },
      stepIndex: 0,
      currentRoute: [],
      targetExitId: null,
    },
    pathResult: null,
    replanningCount: 0,
    totalStepsTaken: 0,
    logs: [
      createLogItem(
        'info',
        0,
        'Simulation initialized.',
        `Start at (${start.x}, ${start.y}). Ready for search.`
      ),
    ],
    allowDiagonal: false,
    speedMs,
  };
};

let logCounter = 1;

export const createLogItem = (
  type: LogLevel,
  stepNumber: number,
  message: string,
  details?: string
): EventLogItem => {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  return {
    id: `log-${Date.now()}-${logCounter++}`,
    timestamp,
    stepNumber,
    type,
    message,
    details,
  };
};

/**
 * Validates if the remaining path from the agent's current position is still valid
 * against the current grid state.
 */
export const isRouteValid = (
  currentPosition: Coordinate,
  route: Coordinate[],
  currentStepIndex: number,
  grid: CellType[][],
  exits: Exit[]
): boolean => {
  if (!route || route.length === 0) return false;
  if (currentStepIndex >= route.length) return false;

  // Verify current position
  if (
    !isValidCoord(grid, currentPosition) ||
    !isPassable(grid[currentPosition.y][currentPosition.x])
  ) {
    return false;
  }

  // Check all remaining steps along the route
  for (let i = currentStepIndex; i < route.length; i++) {
    const node = route[i];
    if (!isValidCoord(grid, node) || !isPassable(grid[node.y][node.x])) {
      return false;
    }
  }

  // Check destination exit
  const goal = route[route.length - 1];
  const matchingExit = exits.find(
    (e) => areCoordsEqual(e, goal) && !e.isBlocked
  );
  if (!matchingExit) return false;

  return true;
};

/**
 * Calculates a fresh route from the given start coordinate to the best available exit.
 */
export const calculateEvacuationRoute = (
  from: Coordinate,
  grid: CellType[][],
  exits: Exit[],
  algorithm: AlgorithmType,
  allowDiagonal = false,
  hazardCost = 5,
  weightCost = 3
): AlgorithmResult => {
  return runSearch(algorithm, {
    grid,
    start: from,
    exits,
    allowDiagonal,
    hazardCost,
    weightCost,
  });
};

/**
 * Advances the simulation by exactly one step.
 * Returns the updated simulation state.
 */
export const stepSimulation = (
  state: SimulationState,
  grid: CellType[][],
  exits: Exit[],
  hazardCost = 5,
  weightCost = 3
): SimulationState => {
  // If already finished or failed, do nothing
  if (state.status === 'completed' || state.status === 'failed') {
    return state;
  }

  const { agent, algorithm, allowDiagonal } = state;
  const currentPos = agent.position;

  // 1. Check if agent is already at an exit
  const reachedExit = exits.find(
    (e) => areCoordsEqual(e, currentPos) && !e.isBlocked
  );
  if (reachedExit && agent.stepIndex > 0) {
    return {
      ...state,
      status: 'completed',
      logs: [
        createLogItem(
          'success',
          state.totalStepsTaken,
          `Evacuation successful! Reached ${reachedExit.name}.`,
          `Total steps: ${state.totalStepsTaken}. Replannings: ${state.replanningCount}.`
        ),
        ...state.logs,
      ],
    };
  }

  // 2. Validate current route or calculate initial route
  let currentRoute = agent.currentRoute;
  let currentStepIndex = agent.stepIndex;
  let currentPathResult = state.pathResult;
  let replanned = false;
  const newLogs: EventLogItem[] = [];

  const routeUsable = isRouteValid(
    currentPos,
    currentRoute,
    currentStepIndex,
    grid,
    exits
  );

  if (!routeUsable) {
    if (currentRoute.length > 0) {
      newLogs.push(
        createLogItem(
          'blocked',
          state.totalStepsTaken,
          'Active path blocked! Recalculating route...',
          `Obstacle detected along planned route to ${
            state.pathResult?.targetExit?.name || 'exit'
          }.`
        )
      );
    }

    // Replan from current agent position
    const newSearchResult = calculateEvacuationRoute(
      currentPos,
      grid,
      exits,
      algorithm,
      allowDiagonal,
      hazardCost,
      weightCost
    );

    if (!newSearchResult.found || newSearchResult.path.length === 0) {
      newLogs.push(
        createLogItem(
          'error',
          state.totalStepsTaken,
          'Evacuation trapped! No reachable exit exists.',
          newSearchResult.unreachableReason || 'All egress paths are obstructed.'
        )
      );

      return {
        ...state,
        status: 'failed',
        pathResult: newSearchResult,
        agent: {
          ...agent,
          currentRoute: [],
          targetExitId: null,
        },
        logs: [...newLogs, ...state.logs],
      };
    }

    currentRoute = newSearchResult.path;
    currentStepIndex = 0; // Route begins at current position (index 0)
    currentPathResult = newSearchResult;
    replanned = currentRoute.length > 0 && state.totalStepsTaken > 0;

    newLogs.push(
      createLogItem(
        replanned ? 'replan' : 'info',
        state.totalStepsTaken,
        replanned
          ? `Route replanned to ${newSearchResult.targetExit?.name}.`
          : `Initial route planned to ${newSearchResult.targetExit?.name}.`,
        `Algorithm: ${algorithm.toUpperCase()} | Cost: ${newSearchResult.pathCost} | Length: ${newSearchResult.pathLength}`
      )
    );
  }

  // 3. Move agent to next step in the route
  const nextStepIndex = currentStepIndex + 1;
  if (nextStepIndex >= currentRoute.length) {
    // Reached destination
    const destination = currentRoute[currentRoute.length - 1];
    const exitReached = exits.find((e) => areCoordsEqual(e, destination));

    return {
      ...state,
      status: 'completed',
      agent: {
        ...agent,
        position: destination,
        stepIndex: nextStepIndex,
        currentRoute,
        targetExitId: exitReached?.id || null,
      },
      pathResult: currentPathResult,
      replanningCount: state.replanningCount + (replanned ? 1 : 0),
      totalStepsTaken: state.totalStepsTaken + 1,
      logs: [
        createLogItem(
          'success',
          state.totalStepsTaken + 1,
          `Evacuee safely reached ${exitReached?.name || 'exit'}!`,
          `Safe exit completed at (${destination.x}, ${destination.y}).`
        ),
        ...newLogs,
        ...state.logs,
      ],
    };
  }

  const nextPos = currentRoute[nextStepIndex];

  // Safety check: verify next position is passable
  if (!isValidCoord(grid, nextPos) || !isPassable(grid[nextPos.y][nextPos.x])) {
    // If the immediate next cell is impassable, trigger replan on next step
    newLogs.push(
      createLogItem(
        'warning',
        state.totalStepsTaken,
        `Immediate cell (${nextPos.x}, ${nextPos.y}) impassable! Holding position for replan.`
      )
    );
    return {
      ...state,
      agent: {
        ...agent,
        currentRoute: [], // invalidate route so it recalculates immediately
      },
      logs: [...newLogs, ...state.logs],
    };
  }

  const stepNumber = state.totalStepsTaken + 1;
  newLogs.push(
    createLogItem(
      'move',
      stepNumber,
      `Evacuee moved to (${nextPos.x}, ${nextPos.y}).`,
      `Target: ${currentPathResult?.targetExit?.name || 'Exit'} (${currentRoute.length - 1 - nextStepIndex} steps remaining)`
    )
  );

  // Check if this step reached the exit
  const isGoal = areCoordsEqual(nextPos, currentRoute[currentRoute.length - 1]);
  const newStatus: SimulationStatus = isGoal ? 'completed' : state.status;

  if (isGoal) {
    const exitReached = exits.find((e) => areCoordsEqual(e, nextPos));
    newLogs.unshift(
      createLogItem(
        'success',
        stepNumber,
        `Evacuation successful! Safely exited via ${exitReached?.name || 'Exit'}.`,
        `Total steps: ${stepNumber}. Replannings: ${state.replanningCount + (replanned ? 1 : 0)}.`
      )
    );
  }

  return {
    ...state,
    status: newStatus,
    agent: {
      position: nextPos,
      stepIndex: nextStepIndex,
      currentRoute,
      targetExitId: currentPathResult?.targetExit?.id || null,
    },
    pathResult: currentPathResult,
    replanningCount: state.replanningCount + (replanned ? 1 : 0),
    totalStepsTaken: stepNumber,
    logs: [...newLogs, ...state.logs],
  };
};
