import React from 'react';
import {
  BookOpen,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { SimulationStatus } from '../types';

interface HeaderProps {
  status: SimulationStatus;
  onOpenExplanation: () => void;
  onResetGrid: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onOpenExplanation,
  onResetGrid,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            SIMULATING
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            PAUSED
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-600" />
            EVACUATED
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            NO EXIT (TRAPPED)
          </span>
        );
      case 'replanning':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            REPLANNING ROUTE
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            STANDBY / READY
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 sticky top-0 z-30 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/15 border border-cyan-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                SafeRoute <span className="text-cyan-700 font-extrabold">AI</span>
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Intelligent Emergency Evacuation & Dynamic Path-Replanning Simulator
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExplanation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-cyan-700 hover:text-cyan-800 border border-slate-300 hover:border-cyan-500 rounded-lg transition-all shadow-2xs"
            title="Understand search algorithms, heuristics, and mathematical formulation"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            How the AI Thinks
          </button>

          <button
            onClick={onResetGrid}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-lg transition-all shadow-2xs"
            title="Reset grid map to blank"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Map
          </button>
        </div>
      </div>
    </header>
  );
};
