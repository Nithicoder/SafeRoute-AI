import { AlgorithmResult, Coordinate, Exit, SearchOptions } from '../types';
import {
  calculatePathCost,
  coordKey,
  getCellCost,
  getNeighbors,
  isPassable,
  isValidCoord,
  reconstructPath,
} from '../utils/gridHelpers';
import { PriorityQueue } from '../utils/priorityQueue';

export const runDijkstra = (options: SearchOptions): AlgorithmResult => {
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
      algorithm: 'dijkstra',
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
      algorithm: 'dijkstra',
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
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, Coordinate>();
  const closedSet = new Set<string>();
  const exploredNodes: Coordinate[] = [];
  let nodeExpansionsCount = 0;

  gScore.set(startKey, 0);
  pq.enqueue(start, 0);

  let foundExit: Exit | null = null;
  let targetNode: Coordinate | null = null;

  while (!pq.isEmpty()) {
    const item = pq.dequeue();
    if (!item) break;
    const current = item.element;
    const currentKey = coordKey(current);

    // If already finalized with lower cost, skip
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    nodeExpansionsCount++;
    exploredNodes.push(current);

    // If an exit is popped, we have found the minimum cost path to an exit
    if (exitMap.has(currentKey)) {
      foundExit = exitMap.get(currentKey)!;
      targetNode = current;
      break;
    }

    const currentG = gScore.get(currentKey) ?? Infinity;
    const neighbors = getNeighbors(grid, current, allowDiagonal);

    for (const neighbor of neighbors) {
      const neighborKey = coordKey(neighbor);
      if (closedSet.has(neighborKey)) continue;

      const cell = grid[neighbor.y][neighbor.x];
      if (!isPassable(cell)) continue;

      const stepCost = getCellCost(cell, hazardCost, weightCost);
      const tentativeG = currentG + stepCost;

      const existingG = gScore.get(neighborKey) ?? Infinity;
      if (tentativeG < existingG) {
        gScore.set(neighborKey, tentativeG);
        cameFrom.set(neighborKey, current);
        pq.enqueue(neighbor, tentativeG);
      }
    }
  }

  const frontierNodes = pq.getElements();
  const executionTimeMs = performance.now() - startTime;

  if (foundExit && targetNode) {
    const path = reconstructPath(cameFrom, targetNode);
    const pathCost = calculatePathCost(path, grid, hazardCost, weightCost);

    return {
      algorithm: 'dijkstra',
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
    algorithm: 'dijkstra',
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
