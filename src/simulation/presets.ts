import { Coordinate, Exit, PresetLayout } from '../types';

export const PRESETS: PresetLayout[] = [
  {
    id: 'simple-building',
    name: '1. Simple Building',
    description:
      'A corporate office floor with partition walls, central hallway, and two clear exit doors.',
    width: 24,
    height: 16,
    start: { x: 2, y: 2 },
    exits: [
      { id: 'exit-north', name: 'Exit 1 (North-East)', x: 21, y: 1 },
      { id: 'exit-south', name: 'Exit 2 (South-East)', x: 21, y: 14 },
    ],
    walls: [
      // Office partitions
      { x: 6, y: 0 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 },
      { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 },
      { x: 12, y: 3 }, { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 }, { x: 12, y: 7 },
      { x: 12, y: 10 }, { x: 12, y: 11 }, { x: 12, y: 12 }, { x: 12, y: 13 },
      { x: 17, y: 2 }, { x: 17, y: 3 }, { x: 17, y: 4 }, { x: 17, y: 5 },
      { x: 17, y: 8 }, { x: 17, y: 9 }, { x: 17, y: 10 }, { x: 17, y: 11 },
    ],
    hazards: [
      { x: 9, y: 4 }, { x: 9, y: 5 },
    ],
    weights: [
      { x: 15, y: 6 }, { x: 15, y: 7 },
    ],
  },
  {
    id: 'crowded-corridor',
    name: '2. Crowded Corridor',
    description:
      'Complex multi-wing facility with narrow corridors, congestion debris, and multiple route bifurcations.',
    width: 24,
    height: 16,
    start: { x: 1, y: 8 },
    exits: [
      { id: 'exit-east', name: 'Main East Exit', x: 22, y: 8 },
      { id: 'exit-north', name: 'North Stairwell', x: 12, y: 1 },
      { id: 'exit-south', name: 'South Fire Exit', x: 12, y: 14 },
    ],
    walls: [
      // Central structural dividing walls
      { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
      { x: 5, y: 10 }, { x: 5, y: 11 }, { x: 5, y: 12 }, { x: 5, y: 13 },
      { x: 8, y: 7 }, { x: 8, y: 8 }, { x: 8, y: 9 },
      // Central block
      { x: 11, y: 4 }, { x: 11, y: 5 }, { x: 11, y: 6 }, { x: 11, y: 7 }, { x: 11, y: 8 }, { x: 11, y: 9 }, { x: 11, y: 10 }, { x: 11, y: 11 },
      { x: 13, y: 4 }, { x: 13, y: 5 }, { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 8 }, { x: 13, y: 9 }, { x: 13, y: 10 }, { x: 13, y: 11 },
      { x: 12, y: 4 }, { x: 12, y: 11 },
      // East wings
      { x: 18, y: 1 }, { x: 18, y: 2 }, { x: 18, y: 3 }, { x: 18, y: 4 }, { x: 18, y: 5 },
      { x: 18, y: 11 }, { x: 18, y: 12 }, { x: 18, y: 13 }, { x: 18, y: 14 },
    ],
    hazards: [
      { x: 7, y: 8 }, { x: 9, y: 8 },
      { x: 15, y: 3 }, { x: 16, y: 3 },
    ],
    weights: [
      { x: 3, y: 8 }, { x: 4, y: 8 },
      { x: 15, y: 12 }, { x: 16, y: 12 },
    ],
  },
  {
    id: 'blocked-exit',
    name: '3. Blocked Exit (Replanning Demo)',
    description:
      'Primary Exit A is blocked by intense fire. Agent is forced to replan towards secondary Exit B.',
    width: 24,
    height: 16,
    start: { x: 2, y: 8 },
    exits: [
      { id: 'exit-primary', name: 'Primary Exit A (East)', x: 22, y: 8 },
      { id: 'exit-secondary', name: 'Secondary Exit B (North)', x: 12, y: 1 },
    ],
    walls: [
      // Hallway leading east
      { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 },
      { x: 14, y: 6 }, { x: 15, y: 6 }, { x: 16, y: 6 }, { x: 17, y: 6 }, { x: 18, y: 6 }, { x: 19, y: 6 },
      { x: 6, y: 10 }, { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 },
      { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }, { x: 18, y: 10 }, { x: 19, y: 10 },
      // Direct block right before Exit A
      { x: 20, y: 7 }, { x: 20, y: 8 }, { x: 20, y: 9 },
    ],
    hazards: [
      { x: 21, y: 7 }, { x: 21, y: 8 }, { x: 21, y: 9 },
    ],
    weights: [
      { x: 12, y: 4 }, { x: 12, y: 5 },
    ],
  },
];

/**
 * Procedurally generates a random building floorplan layout with rooms,
 * doors, and accessible exits.
 */
export const generateRandomBuildingLayout = (
  width = 24,
  height = 16
): {
  walls: Coordinate[];
  hazards: Coordinate[];
  weights: Coordinate[];
  start: Coordinate;
  exits: Exit[];
} => {
  const walls: Coordinate[] = [];
  const hazards: Coordinate[] = [];
  const weights: Coordinate[] = [];

  const start: Coordinate = { x: 2, y: Math.floor(height / 2) };
  const exits: Exit[] = [
    { id: 'exit-e1', name: 'Exit East', x: width - 2, y: Math.floor(height / 2) },
    { id: 'exit-e2', name: 'Exit North', x: Math.floor(width / 2), y: 1 },
  ];

  // Room grid dividing walls (vertical and horizontal slices with door openings)
  const vSlices = [Math.floor(width / 3), Math.floor((2 * width) / 3)];
  const hSlices = [Math.floor(height / 2)];

  // Reserved zones around start and exits
  const isReserved = (x: number, y: number): boolean => {
    if (Math.abs(x - start.x) <= 1 && Math.abs(y - start.y) <= 1) return true;
    for (const exit of exits) {
      if (Math.abs(x - exit.x) <= 1 && Math.abs(y - exit.y) <= 1) return true;
    }
    return false;
  };

  // Vertical walls
  for (const vx of vSlices) {
    const doorY1 = Math.floor(height * 0.25);
    const doorY2 = Math.floor(height * 0.75);
    for (let y = 1; y < height - 1; y++) {
      if (y !== doorY1 && y !== doorY2 && !isReserved(vx, y)) {
        // Leave room for passage
        if (Math.random() > 0.15) {
          walls.push({ x: vx, y });
        }
      }
    }
  }

  // Horizontal walls
  for (const hy of hSlices) {
    const doorX1 = Math.floor(width * 0.2);
    const doorX2 = Math.floor(width * 0.8);
    for (let x = 1; x < width - 1; x++) {
      if (x !== doorX1 && x !== doorX2 && !isReserved(x, hy)) {
        if (Math.random() > 0.3) {
          walls.push({ x, y: hy });
        }
      }
    }
  }

  // Random scattering of a few hazard and weight cells
  const wallKeys = new Set(walls.map((w) => `${w.x},${w.y}`));

  for (let i = 0; i < 6; i++) {
    const hx = Math.floor(Math.random() * (width - 4)) + 2;
    const hy = Math.floor(Math.random() * (height - 4)) + 2;
    const key = `${hx},${hy}`;
    if (!wallKeys.has(key) && !isReserved(hx, hy)) {
      hazards.push({ x: hx, y: hy });
    }
  }

  for (let i = 0; i < 8; i++) {
    const wx = Math.floor(Math.random() * (width - 4)) + 2;
    const wy = Math.floor(Math.random() * (height - 4)) + 2;
    const key = `${wx},${wy}`;
    if (
      !wallKeys.has(key) &&
      !isReserved(wx, wy) &&
      !hazards.some((h) => h.x === wx && h.y === wy)
    ) {
      weights.push({ x: wx, y: wy });
    }
  }

  return { walls, hazards, weights, start, exits };
};
