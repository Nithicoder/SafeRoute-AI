import React from 'react';
import {
  Compass,
  Cpu,
  Dices,
  Eraser,
  Flame,
  Gauge,
  Layers,
  LogOut,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Save,
  Square,
  StepForward,
  User,
  Weight,
  Zap,
} from 'lucide-react';
import { ALGORITHMS_INFO } from '../algorithms';
import { PRESETS } from '../simulation/presets';
import { AlgorithmType, SimulationStatus, ToolMode } from '../types';

interface ControlPanelProps {
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  simulationStatus: SimulationStatus;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onStepSimulation: () => void;
  onResetSimulation: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speedMs: number) => void;
  allowDiagonal: boolean;
  onToggleDiagonal: (allow: boolean) => void;
  activeTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  onClearObstacles: () => void;
  onLoadPreset: (presetId: string) => void;
  onGenerateRandom: () => void;
  onSaveLayout: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
  simulationStatus,
  onStartSimulation,
  onPauseSimulation,
  onStepSimulation,
  onResetSimulation,
  simulationSpeed,
  onChangeSpeed,
  allowDiagonal,
  onToggleDiagonal,
  activeTool,
  onSelectTool,
  onClearObstacles,
  onLoadPreset,
  onGenerateRandom,
  onSaveLayout,
}) => {
  const isRunning = simulationStatus === 'running';

  return (
    <div className="flex flex-col gap-5 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-800">
      {/* 1. Simulation Controls */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-600" /> Simulation Engine
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {simulationSpeed}ms / step
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {isRunning ? (
            <button
              onClick={onPauseSimulation}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm transition-all text-xs"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause
            </button>
          ) : (
            <button
              onClick={onStartSimulation}
              disabled={simulationStatus === 'completed' || simulationStatus === 'failed'}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm transition-all text-xs"
              title="Start or Resume Evacuation Simulation"
            >
              <Play className="w-4 h-4 fill-current" />
              {simulationStatus === 'paused' ? 'Resume' : 'Evacuate'}
            </button>
          )}

          <button
            onClick={onStepSimulation}
            disabled={isRunning || simulationStatus === 'completed' || simulationStatus === 'failed'}
            className="flex items-center justify-center gap-1 py-2.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-800 font-semibold rounded-lg border border-slate-200 text-xs transition-all shadow-2xs"
            title="Advance exactly one step"
          >
            <StepForward className="w-4 h-4" /> Step
          </button>

          <button
            onClick={onResetSimulation}
            className="flex items-center justify-center gap-1 py-2.5 px-2 bg-slate-100 hover:bg-rose-50 text-rose-700 font-semibold rounded-lg border border-slate-200 hover:border-rose-300 text-xs transition-all shadow-2xs"
            title="Reset Agent position to Start and clear active route"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Gauge className="w-3.5 h-3.5 text-cyan-600" /> Animation Speed
            </span>
            <span className="text-slate-800 font-semibold">
              {simulationSpeed <= 150 ? 'Fast' : simulationSpeed <= 400 ? 'Normal' : 'Slow'}
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="800"
            step="20"
            value={simulationSpeed}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>

        {/* Diagonal toggle */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <Compass className="w-3.5 h-3.5 text-slate-500" /> 8-Way Diagonal
          </span>
          <button
            onClick={() => onToggleDiagonal(!allowDiagonal)}
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
              allowDiagonal ? 'bg-cyan-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 bg-white rounded-full shadow-xs" />
          </button>
        </div>
      </section>

      {/* 2. AI Algorithm Selection */}
      <section>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5 mb-2">
          <Zap className="w-4 h-4 text-cyan-600" /> AI Search Algorithm
        </span>

        <div className="space-y-1.5">
          {(['astar', 'dijkstra', 'bfs', 'greedy'] as AlgorithmType[]).map((algoKey) => {
            const info = ALGORITHMS_INFO[algoKey];
            const isSelected = selectedAlgorithm === algoKey;

            return (
              <button
                key={algoKey}
                onClick={() => onSelectAlgorithm(algoKey)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-50/90 border-cyan-500 shadow-2xs ring-1 ring-cyan-500/30'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-cyan-900' : 'text-slate-800'
                    }`}
                  >
                    {info.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${
                      info.guaranteesOptimal
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {info.guaranteesOptimal ? 'Optimal' : 'Sub-optimal'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {info.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Map Editing Tools */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600" /> Map Editor
          </span>
          <span className="text-[10px] text-slate-500">Click or drag on map</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <button
            onClick={() => onSelectTool('wall')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'wall'
                ? 'bg-slate-200 border-slate-500 text-slate-900 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Square className="w-4 h-4 text-slate-600 fill-slate-400" />
            <span className="text-[10px] font-semibold">Wall</span>
          </button>

          <button
            onClick={() => onSelectTool('hazard')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'hazard'
                ? 'bg-red-50 border-red-500 text-red-800 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-semibold">Fire (5x)</span>
          </button>

          <button
            onClick={() => onSelectTool('weight')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'weight'
                ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Weight className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-semibold">Debris (3x)</span>
          </button>

          <button
            onClick={() => onSelectTool('start')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'start'
                ? 'bg-cyan-50 border-cyan-500 text-cyan-800 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 text-cyan-600" />
            <span className="text-[10px] font-semibold">Start Pos</span>
          </button>

          <button
            onClick={() => onSelectTool('exit')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'exit'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LogOut className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-semibold">Exit Gate</span>
          </button>

          <button
            onClick={() => onSelectTool('eraser')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
              activeTool === 'eraser'
                ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Eraser className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-semibold">Eraser</span>
          </button>
        </div>

        <button
          onClick={onClearObstacles}
          className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
        >
          Clear All Obstacles & Hazards
        </button>
      </section>

      {/* 4. Presets and Generator */}
      <section>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5 mb-2">
          <MapPin className="w-4 h-4 text-cyan-600" /> Scenarios & Presets
        </span>

        <div className="space-y-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onLoadPreset(p.id)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-xs transition-all flex flex-col"
            >
              <span className="font-semibold text-slate-800">{p.name}</span>
              <span className="text-[10px] text-slate-500 line-clamp-1">{p.description}</span>
            </button>
          ))}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onGenerateRandom}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Generate a procedural office floorplan"
            >
              <Dices className="w-3.5 h-3.5" /> Random Plan
            </button>

            <button
              onClick={onSaveLayout}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-emerald-800 border border-slate-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="Save current layout to local storage"
            >
              <Save className="w-3.5 h-3.5" /> Save Layout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
