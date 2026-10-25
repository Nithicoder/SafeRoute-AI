import { AlgorithmResult, Coordinate, Exit, SearchOptions } from '../types';
import {
  calculatePathCost,
  coordKey,
  getNeighbors,
  isPassable,
  isValidCoord,
  minManhattanDistanceToExits,
  reconstructPath,
} from '../utils/gridHelpers';
import { PriorityQueue } from '../utils/priorityQueue';

export const runGreedyBestFirst = (options: SearchOptions): AlgorithmResult => {
  const startTime = performance.now();
  const {
    grid,
    start,
    exits,
    allowDiagonal = false,
    hazardCost = 5,
    weightCost = 3,
  } = options;

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
      algorithm: 'greedy',
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

  const startKey = coordKey(start);
  if (exitMap.has(startKey)) {
    const targetExit = exitMap.get(startKey)!;
    return {
      algorithm: 'greedy',
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

  const pq = new PriorityQueue<Coordinate>();
  const visited = new Set<string>();
  const cameFrom = new Map<string, Coordinate>();
  const exploredNodes: Coordinate[] = [];
  let nodeExpansionsCount = 0;

  visited.add(startKey);
  const initialH = minManhattanDistanceToExits(start, validExits);
  pq.enqueue(start, initialH);

  let foundExit: Exit | null = null;
  let targetNode: Coordinate | null = null;

  while (!pq.isEmpty()) {
    const item = pq.dequeue();
    if (!item) break;
    const current = item.element;
    const currentKey = coordKey(current);

    nodeExpansionsCount++;
    exploredNodes.push(current);

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

      const h = minManhattanDistanceToExits(neighbor, validExits);
      pq.enqueue(neighbor, h);
    }
  }

  const frontierNodes = pq.getElements();
  const executionTimeMs = performance.now() - startTime;

  if (foundExit && targetNode) {
    const path = reconstructPath(cameFrom, targetNode);
    const pathCost = calculatePathCost(path, grid, hazardCost, weightCost);

    return {
      algorithm: 'greedy',
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
    algorithm: 'greedy',
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
