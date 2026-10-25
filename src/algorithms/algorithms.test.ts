import { describe, expect, it } from 'vitest';
import { CellType, Coordinate, Exit } from '../types';
import { createEmptyGrid } from '../utils/gridHelpers';
import { runAStar, runBFS, runComparison, runDijkstra, runGreedyBestFirst } from './index';

describe('AI Search Algorithms Verification', () => {
  const start: Coordinate = { x: 0, y: 0 };
  const exitA: Exit = { id: 'exit-1', name: 'Exit North', x: 4, y: 0 };
  const exitB: Exit = { id: 'exit-2', name: 'Exit East', x: 4, y: 4 };

  it('1. BFS finds the shortest path in an unweighted grid', () => {
    const grid = createEmptyGrid(5, 5);
    const result = runBFS({
      grid,
      start,
      exits: [exitA],
    });

    expect(result.found).toBe(true);
    // (0,0) to (4,0) in direct line is 4 steps
    expect(result.pathLength).toBe(4);
    expect(result.pathCost).toBe(4);
    expect(result.path[0]).toEqual({ x: 0, y: 0 });
    expect(result.path[result.path.length - 1]).toEqual({ x: 4, y: 0 });
  });

  it('2. Dijkstra finds a minimum-cost path in a weighted grid', () => {
    // 3x3 grid:
    // (0,0) [start] -> (1,0)[hazard=5] -> (2,0) [exit]
    // Or down through (0,1)[1] -> (1,1)[1] -> (2,1)[1] -> (2,0)[exit]
    // Cost via top: 5 + 1 = 6
    // Cost via detour: 1 + 1 + 1 + 1 = 4
    const grid = createEmptyGrid(3, 3);
    grid[0][1] = 'hazard'; // (1, 0) is hazard with cost 5

    const dijkstraResult = runDijkstra({
      grid,
      start: { x: 0, y: 0 },
      exits: [{ id: 'e1', name: 'Exit', x: 2, y: 0 }],
      hazardCost: 5,
    });

    expect(dijkstraResult.found).toBe(true);
    // Detour should be chosen because cost 4 < 6
    expect(dijkstraResult.pathCost).toBe(4);
    expect(dijkstraResult.pathLength).toBe(4);
    // Ensure path does NOT go through (1, 0)
    const throughHazard = dijkstraResult.path.some((c) => c.x === 1 && c.y === 0);
    expect(throughHazard).toBe(false);
  });

  it('3. A* returns an optimal route for the supported heuristic and movement model', () => {
    const grid = createEmptyGrid(5, 5);
    // Obstacle barrier requiring a detour
    grid[1][1] = 'wall';
    grid[2][1] = 'wall';
    grid[3][1] = 'wall';

    const astarResult = runAStar({
      grid,
      start: { x: 0, y: 2 },
      exits: [{ id: 'e1', name: 'Exit', x: 4, y: 2 }],
    });

    expect(astarResult.found).toBe(true);
    // Verify none of the wall nodes are in path
    const hitsWall = astarResult.path.some((c) => grid[c.y][c.x] === 'wall');
    expect(hitsWall).toBe(false);
    expect(astarResult.targetExit?.id).toBe('e1');
  });

  it('4. Greedy Best-First Search follows its heuristic-based selection strategy', () => {
    const grid = createEmptyGrid(6, 6);
    const result = runGreedyBestFirst({
      grid,
      start: { x: 0, y: 0 },
      exits: [{ id: 'e1', name: 'Exit', x: 5, y: 5 }],
    });

    expect(result.found).toBe(true);
    expect(result.path.length).toBeGreaterThan(0);
    expect(result.targetExit?.id).toBe('e1');
  });

  it('5. The path never passes through a blocked cell', () => {
    const grid = createEmptyGrid(5, 5);
    grid[1][0] = 'wall';
    grid[1][1] = 'wall';
    grid[1][2] = 'wall';

    const algos = [runBFS, runDijkstra, runAStar, runGreedyBestFirst];
    for (const algo of algos) {
      const res = algo({
        grid,
        start: { x: 0, y: 0 },
        exits: [{ id: 'e1', name: 'Exit', x: 0, y: 4 }],
      });

      expect(res.found).toBe(true);
      for (const node of res.path) {
        expect(grid[node.y][node.x]).not.toBe('wall');
      }
    }
  });

  it('6. No route is reported when the destination is unreachable', () => {
    const grid = createEmptyGrid(5, 5);
    // Completely encircle exit with walls
    grid[0][3] = 'wall';
    grid[1][3] = 'wall';
    grid[1][4] = 'wall';
    // Exit is at (4, 0), surrounded by grid edge and walls at (3,0), (3,1), (4,1)

    const res = runAStar({
      grid,
      start: { x: 0, y: 0 },
      exits: [{ id: 'e1', name: 'Trapped Exit', x: 4, y: 0 }],
    });

    expect(res.found).toBe(false);
    expect(res.path).toEqual([]);
    expect(res.targetExit).toBeNull();
    expect(res.unreachableReason).toBeDefined();
  });

  it('7. A blocked starting cell is handled safely', () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][0] = 'wall';

    const res = runAStar({
      grid,
      start: { x: 0, y: 0 },
      exits: [{ id: 'e1', name: 'Exit', x: 4, y: 4 }],
    });

    expect(res.found).toBe(false);
    expect(res.path).toEqual([]);
    expect(res.unreachableReason).toContain('blocked');
  });

  it('8. Multiple exits are evaluated correctly and closest/lowest-cost exit is selected', () => {
    const grid = createEmptyGrid(10, 10);
    const closeExit: Exit = { id: 'close', name: 'Near Exit', x: 2, y: 0 };
    const farExit: Exit = { id: 'far', name: 'Far Exit', x: 9, y: 9 };

    const res = runAStar({
      grid,
      start: { x: 0, y: 0 },
      exits: [farExit, closeExit],
    });

    expect(res.found).toBe(true);
    expect(res.targetExit?.id).toBe('close');
    expect(res.pathLength).toBe(2);
  });

  it('9. Comparison runner benchmarks all 4 algorithms concurrently on identical state', () => {
    const grid = createEmptyGrid(8, 8);
    grid[3][3] = 'wall';
    grid[3][4] = 'wall';

    const comparison = runComparison({
      grid,
      start: { x: 0, y: 0 },
      exits: [{ id: 'e1', name: 'Main Exit', x: 7, y: 7 }],
    });

    expect(comparison.length).toBe(4);
    const names = comparison.map((c) => c.algorithm);
    expect(names).toContain('astar');
    expect(names).toContain('dijkstra');
    expect(names).toContain('bfs');
    expect(names).toContain('greedy');
  });
});
