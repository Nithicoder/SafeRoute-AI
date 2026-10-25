/**
 * SafeRoute AI - Core Type Definitions
 * Data structures for grid state, search algorithms, simulation, and telemetry.
 */

export type CellType = 'empty' | 'wall' | 'hazard' | 'weight';

export interface Coordinate {
  x: number;
  y: number;
}

export interface GridConfig {
  width: number;
  height: number;
}

export interface Exit {
  id: string;
  name: string;
  x: number;
  y: number;
  isBlocked?: boolean;
}

export type AlgorithmType = 'bfs' | 'dijkstra' | 'astar' | 'greedy';

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  shortName: string;
  description: string;
  guaranteesOptimal: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  heuristicType: string;
}

export interface SearchOptions {
  grid: CellType[][];
  start: Coordinate;
  exits: Exit[];
  allowDiagonal?: boolean;
  heuristicWeight?: number;
  hazardCost?: number; // Movement cost for hazard cells (default: 5)
  weightCost?: number; // Movement cost for weighted debris cells (default: 3)
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  path: Coordinate[];
  exploredNodes: Coordinate[];
  frontierNodes: Coordinate[];
  pathCost: number;
  pathLength: number;
  nodesExploredCount: number;
  nodeExpansionsCount: number;
  executionTimeMs: number;
  targetExit: Exit | null;
  found: boolean;
  unreachableReason?: string;
}

export type SimulationStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'replanning';

export interface AgentState {
  position: Coordinate;
  stepIndex: number;
  currentRoute: Coordinate[];
  targetExitId: string | null;
}

export type LogLevel = 'info' | 'move' | 'blocked' | 'replan' | 'success' | 'warning' | 'error';

export interface EventLogItem {
  id: string;
  timestamp: string;
  stepNumber: number;
  type: LogLevel;
  message: string;
  details?: string;
}

export type ToolMode = 'wall' | 'hazard' | 'weight' | 'start' | 'exit' | 'eraser';

export interface PresetLayout {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  start: Coordinate;
  exits: Exit[];
  walls: Coordinate[];
  hazards: Coordinate[];
  weights?: Coordinate[];
}

export interface ComparisonMetric {
  algorithm: AlgorithmType;
  name: string;
  found: boolean;
  pathLength: number;
  pathCost: number;
  nodesExplored: number;
  nodeExpansions: number;
  executionTimeMs: number;
  targetExitName: string;
}
