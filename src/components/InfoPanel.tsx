import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Info,
  LogOut,
  RefreshCw,
  Route,
  Search,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  AlgorithmResult,
  AlgorithmType,
  EventLogItem,
  LogLevel,
  SimulationStatus,
} from '../types';

interface InfoPanelProps {
  algorithm: AlgorithmType;
  status: SimulationStatus;
  pathResult: AlgorithmResult | null;
  replanningCount: number;
  totalStepsTaken: number;
  logs: EventLogItem[];
  onClearLogs: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  status,
  pathResult,
  replanningCount,
  totalStepsTaken,
  logs,
  onClearLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'replan') return log.type === 'replan' || log.type === 'blocked';
    if (filterLevel === 'move') return log.type === 'move';
    if (filterLevel === 'alert') return log.type === 'error' || log.type === 'warning';
    return true;
  });

  const handleExportLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [Step ${l.stepNumber}] [${l.type.toUpperCase()}] ${l.message} ${
            l.details ? `— ${l.details}` : ''
          }`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saferoute-ai-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (type: LogLevel) => {
    switch (type) {
      case 'replan':
        return <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />;
      case 'blocked':
        return <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />;
      case 'move':
        return <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'error':
        return <Flame className="w-3.5 h-3.5 text-red-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-800">
      {/* 1. Live Telemetry Summary */}
      <section>
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5 mb-2.5">
          <Activity className="w-4 h-4 text-cyan-600" /> Live Evacuation Telemetry
        </span>

        <div className="grid grid-cols-2 gap-2">
          {/* Target Exit */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <LogOut className="w-3 h-3 text-emerald-600" /> Target Exit
            </span>
            <div className="text-sm font-bold text-slate-800 truncate mt-0.5">
              {pathResult?.targetExit ? pathResult.targetExit.name : 'None (No Route)'}
            </div>
            {pathResult?.targetExit && (
              <span className="text-[10px] text-slate-500 font-mono">
                ({pathResult.targetExit.x}, {pathResult.targetExit.y})
              </span>
            )}
          </div>

          {/* Replanning Events */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-purple-600" /> Replannings
            </span>
            <div className="text-sm font-bold text-purple-800 mt-0.5">
              {replanningCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Dynamic Recalculations
            </span>
          </div>

          {/* Path Length */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <Route className="w-3 h-3 text-cyan-600" /> Path Length
            </span>
            <div className="text-sm font-bold text-cyan-800 mt-0.5">
              {pathResult?.found ? `${pathResult.pathLength} steps` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Current: Step {totalStepsTaken}
            </span>
          </div>

          {/* Path Cost */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-600" /> Total Cost
            </span>
            <div className="text-sm font-bold text-amber-800 mt-0.5">
              {pathResult?.found ? pathResult.pathCost : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Accumulated Weight
            </span>
          </div>

          {/* Explored Nodes */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-600" /> Explored Cells
            </span>
            <div className="text-sm font-bold text-indigo-800 mt-0.5">
              {pathResult?.nodesExploredCount || 0}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Frontier: {pathResult?.frontierNodes?.length || 0}
            </span>
          </div>

          {/* Execution Time */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" /> Compute Time
            </span>
            <div className="text-sm font-bold text-emerald-800 mt-0.5">
              {pathResult ? `${pathResult.executionTimeMs.toFixed(2)} ms` : '0.00 ms'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Search Latency
            </span>
          </div>
        </div>
      </section>

      {/* 2. Real-Time Sequential Event Log */}
      <section className="flex flex-col flex-1 min-h-[300px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
            <Route className="w-4 h-4 text-cyan-600" /> Incident & Movement Log
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportLogs}
              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-cyan-700 rounded transition-all"
              title="Download event log"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClearLogs}
              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded transition-all"
              title="Clear event log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 text-[10px]">
          {['all', 'replan', 'move', 'alert'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterLevel(f)}
              className={`px-2 py-0.5 rounded-md font-semibold capitalize border transition-all ${
                filterLevel === f
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f === 'replan' ? 'Replans' : f}
            </button>
          ))}
        </div>

        {/* Scrollable Log Container */}
        <div className="flex-1 overflow-y-auto max-h-[340px] space-y-1.5 pr-1 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              No matching log events recorded.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded-lg border text-[11px] leading-relaxed transition-all ${
                  log.type === 'replan'
                    ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                    : log.type === 'blocked'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : log.type === 'success'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : log.type === 'error'
                    ? 'bg-red-50/80 border-red-200 text-red-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    {getLogIcon(log.type)}
                    Step {log.stepNumber}
                  </span>
                  <span className="text-slate-400">{log.timestamp}</span>
                </div>
                <div className="font-semibold text-slate-900">{log.message}</div>
                {log.details && (
                  <div className="text-[10px] text-slate-600 mt-0.5">{log.details}</div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
