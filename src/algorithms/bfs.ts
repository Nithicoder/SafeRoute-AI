import { AlgorithmResult, Coordinate, Exit, SearchOptions } from '../types';
import {
  areCoordsEqual,
  calculatePathCost,
  coordKey,
  getNeighbors,
  isPassable,
  isValidCoord,
  reconstructPath,
} from '../utils/gridHelpers';

export const runBFS = (options: SearchOptions): AlgorithmResult => {
  const startTime = performance.now();
  const { grid, start, exits, allowDiagonal = false } = options;

  const validExits = exits.filter((e) => !e.isBlocked && isValidCoord(grid, e));
  const exitMap = new Map<string, Exit>();
  for (const exit of validExits) {
    exitMap.set(coordKey(exit), exit);
  }

  // Safety checks
  if (
    !isValidCoord(grid, start) ||
    !isPassable(grid[start.y][start.x]) ||
    validExits.length === 0
  ) {
    const unreachableReason = !isValidCoord(grid, start)
      ? 'Start position is outside grid bounds.'
      : !isPassable(grid[start.y][start.x])
      ? 'Start position is blocked by an obstacle.'
      : 'No unblocked exits available on the grid.';

    return {
      algorithm: 'bfs',
      path: [],
      exploredNodes: [],
      frontierNodes: [],
      pathCost: 0,
      pathLength: 0,
      nodesExploredCount: 0,
      nodeExpansionsCount: 0,
      executionTimeMs: Math.max(0.01, performance.now() - startTime),
      targetExit: null,
      found: false,
      unreachableReason,
    };
  }

  // If start is already an exit
  const startKey = coordKey(start);
  if (exitMap.has(startKey)) {
    const targetExit = exitMap.get(startKey)!;
    return {
      algorithm: 'bfs',
      path: [start],
      exploredNodes: [start],
      frontierNodes: [],
      pathCost: 0,
      pathLength: 0,
      nodesExploredCount: 1,
      nodeExpansionsCount: 1,
      executionTimeMs: Math.max(0.01, performance.now() - startTime),
      targetExit,
      found: true,
    };
  }

  const queue: Coordinate[] = [start];
  let queueHead = 0; // O(1) dequeue with array index pointer
  const visited = new Set<string>([startKey]);
  const cameFrom = new Map<string, Coordinate>();
  const exploredNodes: Coordinate[] = [];
  let nodeExpansionsCount = 0;

  let foundExit: Exit | null = null;
  let targetNode: Coordinate | null = null;

  while (queueHead < queue.length) {
    const current = queue[queueHead++];
    nodeExpansionsCount++;
    exploredNodes.push(current);

    const currentKey = coordKey(current);
    if (exitMap.has(currentKey)) {
      foundExit = exitMap.get(currentKey)!;
      targetNode = current;
      break;
    }

    const neighbors = getNeighbors(grid, current, allowDiagonal);
    for (const neighbor of neighbors) {
      const neighborKey = coordKey(neighbor);
      if (visited.has(neighborKey)) continue;

      const cell = grid[neighbor.y][neighbor.x];
      if (!isPassable(cell)) continue;

      visited.add(neighborKey);
      cameFrom.set(neighborKey, current);
      queue.push(neighbor);
    }
  }

  const frontierNodes = queue.slice(queueHead);
  const executionTimeMs = performance.now() - startTime;

  if (foundExit && targetNode) {
    const path = reconstructPath(cameFrom, targetNode);
    const pathCost = calculatePathCost(
      path,
      grid,
      options.hazardCost,
      options.weightCost
    );

    return {
      algorithm: 'bfs',
      path,
      exploredNodes,
      frontierNodes,
      pathCost,
      pathLength: Math.max(0, path.length - 1),
      nodesExploredCount: exploredNodes.length,
      nodeExpansionsCount,
      executionTimeMs: Math.max(0.01, executionTimeMs),
      targetExit: foundExit,
      found: true,
    };
  }

  return {
    algorithm: 'bfs',
    path: [],
    exploredNodes,
    frontierNodes: [],
    pathCost: 0,
    pathLength: 0,
    nodesExploredCount: exploredNodes.length,
    nodeExpansionsCount,
    executionTimeMs: Math.max(0.01, executionTimeMs),
    targetExit: null,
    found: false,
    unreachableReason: 'No reachable path exists from start to any available exit.',
  };
};
