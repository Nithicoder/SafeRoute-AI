import { AlgorithmType, Coordinate, Exit, PresetLayout } from '../types';

const STORAGE_KEYS = {
  CUSTOM_LAYOUTS: 'saferoute_custom_layouts',
  ACTIVE_ALGORITHM: 'saferoute_active_algorithm',
  SIMULATION_SPEED: 'saferoute_simulation_speed',
  ALLOW_DIAGONAL: 'saferoute_allow_diagonal',
};

export interface SavedLayout {
  id: string;
  name: string;
  createdAt: string;
  width: number;
  height: number;
  start: Coordinate;
  exits: Exit[];
  walls: Coordinate[];
  hazards: Coordinate[];
  weights?: Coordinate[];
}

export const loadCustomLayouts = (): SavedLayout[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_LAYOUTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load custom layouts from localStorage:', err);
    return [];
  }
};

export const saveCustomLayout = (layout: SavedLayout): void => {
  try {
    const layouts = loadCustomLayouts();
    const existingIndex = layouts.findIndex((l) => l.id === layout.id);
    if (existingIndex >= 0) {
      layouts[existingIndex] = layout;
    } else {
      layouts.unshift(layout);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
  } catch (err) {
    console.error('Failed to save layout to localStorage:', err);
  }
};

export const deleteCustomLayout = (id: string): void => {
  try {
    const layouts = loadCustomLayouts().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_LAYOUTS, JSON.stringify(layouts));
  } catch (err) {
    console.error('Failed to delete layout from localStorage:', err);
  }
};

export const loadUserPreferences = (): {
  algorithm: AlgorithmType;
  speedMs: number;
  allowDiagonal: boolean;
} => {
  try {
    const algo = (localStorage.getItem(STORAGE_KEYS.ACTIVE_ALGORITHM) as AlgorithmType) || 'astar';
    const speed = parseInt(localStorage.getItem(STORAGE_KEYS.SIMULATION_SPEED) || '300', 10);
    const diag = localStorage.getItem(STORAGE_KEYS.ALLOW_DIAGONAL) === 'true';
    return {
      algorithm: ['astar', 'dijkstra', 'bfs', 'greedy'].includes(algo) ? algo : 'astar',
      speedMs: isNaN(speed) ? 300 : speed,
      allowDiagonal: diag,
    };
  } catch {
    return { algorithm: 'astar', speedMs: 300, allowDiagonal: false };
  }
};

export const saveUserPreferences = (
  algorithm: AlgorithmType,
  speedMs: number,
  allowDiagonal: boolean
): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ALGORITHM, algorithm);
    localStorage.setItem(STORAGE_KEYS.SIMULATION_SPEED, String(speedMs));
    localStorage.setItem(STORAGE_KEYS.ALLOW_DIAGONAL, String(allowDiagonal));
  } catch (err) {
    console.error('Failed to save user preferences:', err);
  }
};
