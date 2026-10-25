import { CellType, Coordinate, Exit } from '../types';

export const coordKey = (c: Coordinate): string => `${c.x},${c.y}`;

export const keyToCoord = (key: string): Coordinate => {
  const parts = key.split(',');
  return {
    x: parseInt(parts[0], 10),
    y: parseInt(parts[1], 10),
  };
};

export const areCoordsEqual = (a: Coordinate, b: Coordinate): boolean =>
  a.x === b.x && a.y === b.y;

export const isValidCoord = (grid: CellType[][], c: Coordinate): boolean => {
  if (!grid || grid.length === 0 || !grid[0]) return false;
  return c.y >= 0 && c.y < grid.length && c.x >= 0 && c.x < grid[0].length;
};

export const isPassable = (cell: CellType): boolean => {
  return cell !== 'wall';
};

export const getCellCost = (
  cell: CellType,
  hazardCost = 5,
  weightCost = 3
): number => {
  switch (cell) {
    case 'wall':
      return Infinity;
    case 'hazard':
      return hazardCost;
    case 'weight':
      return weightCost;
    case 'empty':
    default:
      return 1;
  }
};

/**
 * Returns 4-directional cardinal neighbors (orthogonal).
 * When allowDiagonal is explicitly true, includes 8-directional neighbors.
 */
export const getNeighbors = (
  grid: CellType[][],
  curr: Coordinate,
  allowDiagonal = false
): Coordinate[] => {
  const cardinalDirs: [number, number][] = [
    [0, -1], // North
    [1, 0],  // East
    [0, 1],  // South
    [-1, 0], // West
  ];

  const diagonalDirs: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];

  const dirs = allowDiagonal ? [...cardinalDirs, ...diagonalDirs] : cardinalDirs;
  const neighbors: Coordinate[] = [];

  for (const [dx, dy] of dirs) {
    const next: Coordinate = { x: curr.x + dx, y: curr.y + dy };
    if (isValidCoord(grid, next)) {
      neighbors.push(next);
    }
  }

  return neighbors;
};

export const manhattanDistance = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

export const euclideanDistance = (a: Coordinate, b: Coordinate): number => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

/**
 * Computes minimum Manhattan distance to any of the valid exits.
 * Strictly admissible for 4-directional grid where step cost >= 1.
 */
export const minManhattanDistanceToExits = (
  coord: Coordinate,
  exits: Exit[]
): number => {
  if (exits.length === 0) return 0;
  let min = Infinity;
  for (const exit of exits) {
    const dist = manhattanDistance(coord, exit);
    if (dist < min) {
      min = dist;
    }
  }
  return min;
};

/**
 * Reconstructs path from cameFrom map backwards from goal to start.
 */
export const reconstructPath = (
  cameFrom: Map<string, Coordinate>,
  current: Coordinate
): Coordinate[] => {
  const path: Coordinate[] = [current];
  let currKey = coordKey(current);

  while (cameFrom.has(currKey)) {
    const prev = cameFrom.get(currKey)!;
    path.unshift(prev);
    currKey = coordKey(prev);
  }

  return path;
};

/**
 * Calculates the total movement cost of a path.
 * The starting cell does not incur movement cost; each step into a target cell does.
 */
export const calculatePathCost = (
  path: Coordinate[],
  grid: CellType[][],
  hazardCost = 5,
  weightCost = 3
): number => {
  if (path.length <= 1) return 0;
  let totalCost = 0;
  for (let i = 1; i < path.length; i++) {
    const c = path[i];
    if (isValidCoord(grid, c)) {
      const cell = grid[c.y][c.x];
      totalCost += getCellCost(cell, hazardCost, weightCost);
    }
  }
  return totalCost;
};

export const createEmptyGrid = (width: number, height: number): CellType[][] => {
  const grid: CellType[][] = [];
  for (let y = 0; y < height; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < width; x++) {
      row.push('empty');
    }
    grid.push(row);
  }
  return grid;
};

export const cloneGrid = (grid: CellType[][]): CellType[][] => {
  return grid.map((row) => [...row]);
};
