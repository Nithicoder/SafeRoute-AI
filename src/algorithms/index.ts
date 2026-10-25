import {
  AlgorithmInfo,
  AlgorithmResult,
  AlgorithmType,
  ComparisonMetric,
  SearchOptions,
} from '../types';
import { runAStar } from './astar';
import { runBFS } from './bfs';
import { runDijkstra } from './dijkstra';
import { runGreedyBestFirst } from './greedyBestFirst';

export { runBFS } from './bfs';
export { runDijkstra } from './dijkstra';
export { runAStar } from './astar';
export { runGreedyBestFirst } from './greedyBestFirst';

export const ALGORITHMS_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  astar: {
    id: 'astar',
    name: 'A* Search',
    shortName: 'A*',
    description:
      'Informed heuristic search balancing accumulated cost g(n) with estimated distance h(n) to find the guaranteed optimal evacuation path while pruning suboptimal branches.',
    guaranteesOptimal: true,
    timeComplexity: 'O(|E| + |V| log |V|)',
    spaceComplexity: 'O(|V|)',
    heuristicType: 'Manhattan Distance (Admissible & Consistent)',
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    shortName: 'Dijkstra',
    description:
      'Uniform-cost search exploring outward radially in order of total path cost. Guarantees the absolute lowest movement cost even through heterogeneous hazard terrain, but expands more nodes than A*.',
    guaranteesOptimal: true,
    timeComplexity: 'O(|E| + |V| log |V|)',
    spaceComplexity: 'O(|V|)',
    heuristicType: 'None (Uniform Cost)',
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    shortName: 'BFS',
    description:
      'Level-by-level exhaustive queue exploration. Guarantees the shortest path by step count in unweighted grids, but ignores terrain hazard movement costs.',
    guaranteesOptimal: true, // In unweighted grid
    timeComplexity: 'O(|V| + |E|)',
    spaceComplexity: 'O(|V|)',
    heuristicType: 'None (FIFO Queue)',
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    shortName: 'Greedy',
    description:
      'Heuristic-only search prioritizing nodes strictly closest to the target exit by Manhattan distance. Highly fast in open spaces, but can get trapped in dead-ends and does NOT guarantee an optimal route.',
    guaranteesOptimal: false,
    timeComplexity: 'O(|V| log |V|)',
    spaceComplexity: 'O(|V|)',
    heuristicType: 'Manhattan Distance (Pure Heuristic)',
  },
};

export const runSearch = (
  algorithm: AlgorithmType,
  options: SearchOptions
): AlgorithmResult => {
  switch (algorithm) {
    case 'bfs':
      return runBFS(options);
    case 'dijkstra':
      return runDijkstra(options);
    case 'astar':
      return runAStar(options);
    case 'greedy':
      return runGreedyBestFirst(options);
    default:
      return runAStar(options);
  }
};

/**
 * Runs all 4 algorithms on identical copies of the grid state and compares performance metrics.
 */
export const runComparison = (options: SearchOptions): ComparisonMetric[] => {
  const algorithms: AlgorithmType[] = ['astar', 'dijkstra', 'bfs', 'greedy'];

  return algorithms.map((algo) => {
    // Clone options and grid to guarantee independent, identical execution
    const clonedOptions: SearchOptions = {
      ...options,
      grid: options.grid.map((r) => [...r]),
      exits: options.exits.map((e) => ({ ...e })),
    };

    const res = runSearch(algo, clonedOptions);

    return {
      algorithm: algo,
      name: ALGORITHMS_INFO[algo].name,
      found: res.found,
      pathLength: res.pathLength,
      pathCost: res.pathCost,
      nodesExplored: res.nodesExploredCount,
      nodeExpansions: res.nodeExpansionsCount,
      executionTimeMs: res.executionTimeMs,
      targetExitName: res.targetExit ? res.targetExit.name : 'None',
    };
  });
};
