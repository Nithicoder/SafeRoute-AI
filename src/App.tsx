import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AboutModal } from './components/AboutModal';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { ControlPanel } from './components/ControlPanel';
import { ExplanationModal } from './components/ExplanationModal';
import { Header } from './components/Header';
import { InfoPanel } from './components/InfoPanel';
import { Legend } from './components/Legend';
import { SaveLayoutModal } from './components/SaveLayoutModal';
import { SimulationGrid } from './components/SimulationGrid';
import { generateRandomBuildingLayout, PRESETS } from './simulation/presets';
import {
  calculateEvacuationRoute,
  createInitialSimulationState,
  createLogItem,
  SimulationState,
  stepSimulation,
} from './simulation/simulationEngine';
import {
  AlgorithmResult,
  AlgorithmType,
  CellType,
  Coordinate,
  Exit,
  ToolMode,
} from './types';
import {
  areCoordsEqual,
  cloneGrid,
  coordKey,
  createEmptyGrid,
} from './utils/gridHelpers';
import {
  loadUserPreferences,
  saveCustomLayout,
  SavedLayout,
  saveUserPreferences,
} from './utils/storage';

const DEFAULT_WIDTH = 24;
const DEFAULT_HEIGHT = 16;

export const App: React.FC = () => {
  // Load initial preferences
  const prefs = loadUserPreferences();

  // Grid & Layout State
  const [grid, setGrid] = useState<CellType[][]>(() => {
    const preset = PRESETS[0];
    const initialGrid = createEmptyGrid(preset.width, preset.height);
    for (const w of preset.walls) {
      if (w.y < preset.height && w.x < preset.width) initialGrid[w.y][w.x] = 'wall';
    }
    for (const h of preset.hazards) {
      if (h.y < preset.height && h.x < preset.width) initialGrid[h.y][h.x] = 'hazard';
    }
    if (preset.weights) {
      for (const wt of preset.weights) {
        if (wt.y < preset.height && wt.x < preset.width) initialGrid[wt.y][wt.x] = 'weight';
      }
    }
    return initialGrid;
  });

  const [startPos, setStartPos] = useState<Coordinate>(PRESETS[0].start);
  const [exits, setExits] = useState<Exit[]>(PRESETS[0].exits);

  // Search & Simulation State
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(prefs.algorithm);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(prefs.speedMs);
  const [allowDiagonal, setAllowDiagonal] = useState<boolean>(prefs.allowDiagonal);
  const [activeTool, setActiveTool] = useState<ToolMode>('wall');

  // Simulation Engine State
  const [simState, setSimState] = useState<SimulationState>(() =>
    createInitialSimulationState(PRESETS[0].start, prefs.algorithm, prefs.speedMs)
  );

  // Modals
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Active preview route when idle
  const [previewResult, setPreviewResult] = useState<AlgorithmResult | null>(null);

  // Compute or update route preview whenever grid, start, exits, algorithm, or diagonal change
  const recalculatePreview = useCallback(() => {
    const res = calculateEvacuationRoute(
      simState.agent.position,
      grid,
      exits,
      selectedAlgorithm,
      allowDiagonal
    );
    setPreviewResult(res);
  }, [simState.agent.position, grid, exits, selectedAlgorithm, allowDiagonal]);

  useEffect(() => {
    recalculatePreview();
  }, [recalculatePreview]);

  // Persist preferences on change
  useEffect(() => {
    saveUserPreferences(selectedAlgorithm, simulationSpeed, allowDiagonal);
  }, [selectedAlgorithm, simulationSpeed, allowDiagonal]);

  // Simulation Loop Timer Ref
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Run simulation interval
  useEffect(() => {
    if (simState.status === 'running') {
      clearTimer();
      timerRef.current = window.setInterval(() => {
        setSimState((prevState) => {
          const nextState = stepSimulation(prevState, grid, exits);
          if (nextState.status === 'completed' || nextState.status === 'failed') {
            clearTimer();
          }
          return nextState;
        });
      }, simulationSpeed);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [simState.status, simulationSpeed, grid, exits, clearTimer]);

  // Simulation Controls
  const handleStartSimulation = () => {
    if (simState.status === 'completed' || simState.status === 'failed') return;

    setSimState((prev) => ({
      ...prev,
      status: 'running',
      algorithm: selectedAlgorithm,
      allowDiagonal,
      speedMs: simulationSpeed,
      logs: [
        createLogItem(
          'info',
          prev.totalStepsTaken,
          'Evacuation simulation started.',
          `Algorithm: ${selectedAlgorithm.toUpperCase()}`
        ),
        ...prev.logs,
      ],
    }));
  };

  const handlePauseSimulation = () => {
    clearTimer();
    setSimState((prev) => ({
      ...prev,
      status: 'paused',
      logs: [
        createLogItem(
          'info',
          prev.totalStepsTaken,
          'Evacuation simulation paused.',
          `Agent holding at (${prev.agent.position.x}, ${prev.agent.position.y}).`
        ),
        ...prev.logs,
      ],
    }));
  };

  const handleStepSimulation = () => {
    if (simState.status === 'completed' || simState.status === 'failed') return;
    setSimState((prev) => stepSimulation(prev, grid, exits));
  };

  const handleResetSimulation = () => {
    clearTimer();
    const freshState = createInitialSimulationState(startPos, selectedAlgorithm, simulationSpeed);
    setSimState(freshState);
  };

  // Algorithm Selection
  const handleSelectAlgorithm = (algo: AlgorithmType) => {
    setSelectedAlgorithm(algo);
    setSimState((prev) => ({
      ...prev,
      algorithm: algo,
      logs: [
        createLogItem(
          'info',
          prev.totalStepsTaken,
          `Active search algorithm changed to ${algo.toUpperCase()}.`
        ),
        ...prev.logs,
      ],
    }));
  };

  // Grid Cell Interaction (Click / Drag)
  const handleCellClickOrDrag = (c: Coordinate, isDrag = false) => {
    // Prevent modifying cell if agent is currently occupying it
    if (areCoordsEqual(c, simState.agent.position)) return;

    // Prevent modifying cell if an exit is located there (unless using exit tool)
    if (exits.some((e) => areCoordsEqual(e, c))) return;

    setGrid((prevGrid) => {
      const nextGrid = cloneGrid(prevGrid);
      const currentCell = nextGrid[c.y][c.x];

      if (activeTool === 'wall') {
        nextGrid[c.y][c.x] = isDrag ? 'wall' : currentCell === 'wall' ? 'empty' : 'wall';
      } else if (activeTool === 'hazard') {
        nextGrid[c.y][c.x] = isDrag ? 'hazard' : currentCell === 'hazard' ? 'empty' : 'hazard';
      } else if (activeTool === 'weight') {
        nextGrid[c.y][c.x] = isDrag ? 'weight' : currentCell === 'weight' ? 'empty' : 'weight';
      } else if (activeTool === 'eraser') {
        nextGrid[c.y][c.x] = 'empty';
      }

      return nextGrid;
    });
  };

  // Reposition Start Pos
  const handleSetStart = (c: Coordinate) => {
    if (grid[c.y][c.x] === 'wall') return;
    if (exits.some((e) => areCoordsEqual(e, c))) return;

    setStartPos(c);
    setSimState((prev) => ({
      ...prev,
      agent: {
        ...prev.agent,
        position: c,
        stepIndex: 0,
        currentRoute: [],
      },
      status: 'idle',
      totalStepsTaken: 0,
      replanningCount: 0,
      logs: [
        createLogItem(
          'info',
          0,
          `Evacuee start location relocated to (${c.x}, ${c.y}).`
        ),
        ...prev.logs,
      ],
    }));
  };

  // Add / Relocate Exit
  const handleAddExit = (c: Coordinate) => {
    if (areCoordsEqual(c, startPos) || areCoordsEqual(c, simState.agent.position)) return;

    setExits((prevExits) => {
      const existingIdx = prevExits.findIndex((e) => areCoordsEqual(e, c));
      if (existingIdx >= 0) {
        // Toggle blocked status or remove if more than 1 exit exists
        if (prevExits.length > 1) {
          return prevExits.filter((_, i) => i !== existingIdx);
        }
        return prevExits;
      } else {
        // Ensure cell is passable
        setGrid((g) => {
          const next = cloneGrid(g);
          next[c.y][c.x] = 'empty';
          return next;
        });
        const newExit: Exit = {
          id: `exit-${Date.now()}`,
          name: `Exit ${prevExits.length + 1}`,
          x: c.x,
          y: c.y,
        };
        return [...prevExits, newExit];
      }
    });
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    clearTimer();
    const newGrid = createEmptyGrid(preset.width, preset.height);
    for (const w of preset.walls) {
      if (w.y < preset.height && w.x < preset.width) newGrid[w.y][w.x] = 'wall';
    }
    for (const h of preset.hazards) {
      if (h.y < preset.height && h.x < preset.width) newGrid[h.y][h.x] = 'hazard';
    }
    if (preset.weights) {
      for (const wt of preset.weights) {
        if (wt.y < preset.height && wt.x < preset.width) newGrid[wt.y][wt.x] = 'weight';
      }
    }

    setGrid(newGrid);
    setStartPos(preset.start);
    setExits(preset.exits);

    const freshState = createInitialSimulationState(preset.start, selectedAlgorithm, simulationSpeed);
    freshState.logs = [
      createLogItem(
        'info',
        0,
        `Loaded scenario preset: ${preset.name}.`,
        preset.description
      ),
    ];
    setSimState(freshState);
  };

  // Generate Procedural Floorplan
  const handleGenerateRandom = () => {
    clearTimer();
    const randomPlan = generateRandomBuildingLayout(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    const newGrid = createEmptyGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT);

    for (const w of randomPlan.walls) {
      newGrid[w.y][w.x] = 'wall';
    }
    for (const h of randomPlan.hazards) {
      newGrid[h.y][h.x] = 'hazard';
    }
    for (const wt of randomPlan.weights) {
      newGrid[wt.y][wt.x] = 'weight';
    }

    setGrid(newGrid);
    setStartPos(randomPlan.start);
    setExits(randomPlan.exits);

    const freshState = createInitialSimulationState(
      randomPlan.start,
      selectedAlgorithm,
      simulationSpeed
    );
    freshState.logs = [
      createLogItem(
        'info',
        0,
        'Procedural office floorplan generated.',
        'Rooms, corridors, and 2 emergency exits synthesized.'
      ),
    ];
    setSimState(freshState);
  };

  // Clear Obstacles
  const handleClearObstacles = () => {
    setGrid((prev) => {
      const next = createEmptyGrid(prev[0].length, prev.length);
      return next;
    });
    setSimState((prev) => ({
      ...prev,
      logs: [
        createLogItem(
          'info',
          prev.totalStepsTaken,
          'Cleared all walls, hazards, and debris.'
        ),
        ...prev.logs,
      ],
    }));
  };

  // Reset Map to Empty
  const handleResetGrid = () => {
    clearTimer();
    const empty = createEmptyGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    const defaultStart = { x: 2, y: 2 };
    const defaultExits: Exit[] = [
      { id: 'exit-1', name: 'Exit 1', x: DEFAULT_WIDTH - 2, y: 1 },
      { id: 'exit-2', name: 'Exit 2', x: DEFAULT_WIDTH - 2, y: DEFAULT_HEIGHT - 2 },
    ];
    setGrid(empty);
    setStartPos(defaultStart);
    setExits(defaultExits);
    setSimState(createInitialSimulationState(defaultStart, selectedAlgorithm, simulationSpeed));
  };

  // Save current layout
  const handleSaveCurrentLayout = (name: string) => {
    const walls: Coordinate[] = [];
    const hazards: Coordinate[] = [];
    const weights: Coordinate[] = [];

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const cell = grid[r][c];
        if (cell === 'wall') walls.push({ x: c, y: r });
        if (cell === 'hazard') hazards.push({ x: c, y: r });
        if (cell === 'weight') weights.push({ x: c, y: r });
      }
    }

    const layout: SavedLayout = {
      id: `layout-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      width: grid[0].length,
      height: grid.length,
      start: startPos,
      exits,
      walls,
      hazards,
      weights,
    };

    saveCustomLayout(layout);
  };

  const handleLoadSavedLayout = (layout: SavedLayout) => {
    clearTimer();
    const newGrid = createEmptyGrid(layout.width, layout.height);
    for (const w of layout.walls) newGrid[w.y][w.x] = 'wall';
    for (const h of layout.hazards) newGrid[h.y][h.x] = 'hazard';
    if (layout.weights) {
      for (const wt of layout.weights) newGrid[wt.y][wt.x] = 'weight';
    }

    setGrid(newGrid);
    setStartPos(layout.start);
    setExits(layout.exits);
    const fresh = createInitialSimulationState(layout.start, selectedAlgorithm, simulationSpeed);
    fresh.logs = [
      createLogItem(
        'info',
        0,
        `Loaded custom layout: ${layout.name}.`
      ),
    ];
    setSimState(fresh);
  };

  // Active path to visualize: either the simulation engine's active route or the preview result
  const activePathResult = simState.pathResult || previewResult;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex flex-col selection:bg-cyan-100 selection:text-cyan-900">
      {/* 1. Header */}
      <Header
        status={simState.status}
        onOpenExplanation={() => setIsExplanationOpen(true)}
        onResetGrid={handleResetGrid}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Control Panel (3 cols) */}
          <div className="lg:col-span-3">
            <ControlPanel
              selectedAlgorithm={selectedAlgorithm}
              onSelectAlgorithm={handleSelectAlgorithm}
              simulationStatus={simState.status}
              onStartSimulation={handleStartSimulation}
              onPauseSimulation={handlePauseSimulation}
              onStepSimulation={handleStepSimulation}
              onResetSimulation={handleResetSimulation}
              simulationSpeed={simulationSpeed}
              onChangeSpeed={setSimulationSpeed}
              allowDiagonal={allowDiagonal}
              onToggleDiagonal={setAllowDiagonal}
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              onClearObstacles={handleClearObstacles}
              onLoadPreset={handleLoadPreset}
              onGenerateRandom={handleGenerateRandom}
              onSaveLayout={() => setIsSaveModalOpen(true)}
            />
          </div>

          {/* Central Interactive Map & Legend (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <SimulationGrid
              grid={grid}
              start={startPos}
              exits={exits}
              agent={simState.agent}
              pathResult={activePathResult}
              activeTool={activeTool}
              onCellClick={(c) => handleCellClickOrDrag(c, false)}
              onCellDrag={(c) => handleCellClickOrDrag(c, true)}
              onAddExit={handleAddExit}
              onSetStart={handleSetStart}
            />

            <Legend />
          </div>

          {/* Right Telemetry & Incident Log Panel (3 cols) */}
          <div className="lg:col-span-3">
            <InfoPanel
              algorithm={selectedAlgorithm}
              status={simState.status}
              pathResult={activePathResult}
              replanningCount={simState.replanningCount}
              totalStepsTaken={simState.totalStepsTaken}
              logs={simState.logs}
              onClearLogs={() =>
                setSimState((prev) => ({
                  ...prev,
                  logs: [createLogItem('info', prev.totalStepsTaken, 'Log feed cleared by operator.')],
                }))
              }
            />
          </div>
        </div>

        {/* Bottom Benchmarking & Performance Comparison Dashboard */}
        <section>
          <ComparisonDashboard
            grid={grid}
            start={simState.agent.position}
            exits={exits}
            allowDiagonal={allowDiagonal}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            SafeRoute AI — Educational Simulation of Classical AI Search & Dynamic Replanning Techniques.
          </p>
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-slate-500 hover:text-cyan-700 underline font-medium transition-colors cursor-pointer"
          >
            Project Documentation & Academic Rubric
          </button>
        </div>
      </footer>

      {/* Modals */}
      <ExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        initialAlgorithm={selectedAlgorithm}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <SaveLayoutModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveCurrent={handleSaveCurrentLayout}
        onLoadSaved={handleLoadSavedLayout}
      />
    </div>
  );
};

export default App;
