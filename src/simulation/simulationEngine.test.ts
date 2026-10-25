import { describe, expect, it } from 'vitest';
import { CellType, Coordinate, Exit } from '../types';
import { createEmptyGrid } from '../utils/gridHelpers';
import {
  createInitialSimulationState,
  isRouteValid,
  stepSimulation,
} from './simulationEngine';

describe('Simulation Engine & Dynamic Replanning', () => {
  const start: Coordinate = { x: 0, y: 0 };
  const exitA: Exit = { id: 'exit-1', name: 'Exit 1', x: 4, y: 0 };
  const exitB: Exit = { id: 'exit-2', name: 'Exit 2', x: 0, y: 4 };

  it('1. Initializes simulation state cleanly', () => {
    const state = createInitialSimulationState(start, 'astar');
    expect(state.status).toBe('idle');
    expect(state.agent.position).toEqual(start);
    expect(state.replanningCount).toBe(0);
    expect(state.totalStepsTaken).toBe(0);
    expect(state.logs.length).toBeGreaterThan(0);
  });

  it('2. Detects route invalidation when obstacle is placed on planned path', () => {
    const grid = createEmptyGrid(5, 5);
    const route: Coordinate[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ];

    expect(isRouteValid({ x: 0, y: 0 }, route, 0, grid, [exitA])).toBe(true);

    // Place obstacle at (2, 0)
    grid[0][2] = 'wall';
    expect(isRouteValid({ x: 0, y: 0 }, route, 0, grid, [exitA])).toBe(false);
  });

  it('3. Dynamic blocking triggers successful replanning to alternative path/exit', () => {
    const grid = createEmptyGrid(5, 5);
    let state = createInitialSimulationState(start, 'astar');

    // Step 1: Initial planning and move to (1, 0)
    state = stepSimulation(state, grid, [exitA, exitB]);
    expect(state.agent.position).toEqual({ x: 1, y: 0 });
    expect(state.totalStepsTaken).toBe(1);

    // Now block the path directly in front of the agent towards Exit A
    grid[0][2] = 'wall';
    grid[0][3] = 'wall';

    // Next step: should detect blockage, trigger replan, and choose a valid alternate route
    state = stepSimulation(state, grid, [exitA, exitB]);

    // Agent must NOT have stepped on the wall at (2, 0)
    expect(state.agent.position).not.toEqual({ x: 2, y: 0 });
    expect(state.replanningCount).toBeGreaterThanOrEqual(1);
    expect(state.status).not.toBe('failed');
    // Verify route does not contain any wall
    for (const c of state.agent.currentRoute) {
      expect(grid[c.y][c.x]).not.toBe('wall');
    }
  });

  it('4. Replanning reports failure when all exits become unreachable', () => {
    const grid = createEmptyGrid(5, 5);
    let state = createInitialSimulationState(start, 'astar');

    // Step 1
    state = stepSimulation(state, grid, [exitA]);
    expect(state.agent.position).toEqual({ x: 1, y: 0 });

    // Completely box the agent in with walls
    grid[0][0] = 'wall';
    grid[0][2] = 'wall';
    grid[1][1] = 'wall';

    // Step: agent cannot move anywhere
    state = stepSimulation(state, grid, [exitA]);

    expect(state.status).toBe('failed');
    expect(state.logs.some((l) => l.type === 'error')).toBe(true);
  });

  it('5. Completes evacuation successfully when reaching an exit', () => {
    const grid = createEmptyGrid(3, 3);
    const closeExit: Exit = { id: 'close', name: 'Close Exit', x: 1, y: 0 };
    let state = createInitialSimulationState(start, 'astar');

    // 1 step from (0,0) to (1,0)
    state = stepSimulation(state, grid, [closeExit]);

    expect(state.status).toBe('completed');
    expect(state.agent.position).toEqual({ x: 1, y: 0 });
    expect(state.logs.some((l) => l.type === 'success')).toBe(true);
  });
});
