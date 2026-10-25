import React, { useMemo } from 'react';
import {
  BarChart3,
  CheckCircle,
  Info,
  Sparkles,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { runComparison } from '../algorithms';
import { CellType, Coordinate, Exit } from '../types';

interface ComparisonDashboardProps {
  grid: CellType[][];
  start: Coordinate;
  exits: Exit[];
  allowDiagonal: boolean;
  hazardCost?: number;
  weightCost?: number;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  grid,
  start,
  exits,
  allowDiagonal,
  hazardCost = 5,
  weightCost = 3,
}) => {
  // Execute comparison benchmark on the exact current state
  const metrics = useMemo(() => {
    return runComparison({
      grid,
      start,
      exits,
      allowDiagonal,
      hazardCost,
      weightCost,
    });
  }, [grid, start, exits, allowDiagonal, hazardCost, weightCost]);

  const maxExplored = Math.max(1, ...metrics.map((m) => m.nodesExplored));
  const maxCost = Math.max(1, ...metrics.map((m) => (m.found ? m.pathCost : 0)));

  // Determine pedagogical insight
  const astar = metrics.find((m) => m.algorithm === 'astar');
  const dijkstra = metrics.find((m) => m.algorithm === 'dijkstra');
  const greedy = metrics.find((m) => m.algorithm === 'greedy');

  const insight = useMemo(() => {
    if (!astar?.found) {
      return 'No egress route is currently open. Clear obstacles or add unblocked exits to restore evacuation capability.';
    }

    if (astar && dijkstra && dijkstra.nodesExplored > astar.nodesExplored) {
      const savedPercent = Math.round(
        ((dijkstra.nodesExplored - astar.nodesExplored) / dijkstra.nodesExplored) * 100
      );
      return `A* achieved the identical mathematically optimal cost (${astar.pathCost}) as Dijkstra, but pruned ${savedPercent}% of node explorations due to its admissible Manhattan heuristic directed toward the nearest exit.`;
    }

    if (greedy && astar && greedy.pathCost > astar.pathCost) {
      return `Greedy Best-First prioritized heuristic distance alone without accumulating path costs, resulting in a suboptimal route (Cost: ${greedy.pathCost} vs A*: ${astar.pathCost}).`;
    }

    return `All optimal algorithms converged on the closest exit with consistent path costs. Note that execution times reflect sub-millisecond in-browser evaluations.`;
  }, [astar, dijkstra, greedy]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 lg:p-6 shadow-xs text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-600" />
            Empirical Algorithm Benchmark & State-Space Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Real-time parallel execution of all 4 AI algorithms on the current facility layout.
          </p>
        </div>

        <div className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-cyan-600" />
          <span>Execution times measured via High-Resolution Performance API</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase font-mono bg-slate-50/80">
              <th className="py-2.5 px-3">Algorithm</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Target Exit</th>
              <th className="py-2.5 px-3 text-right">Path Length</th>
              <th className="py-2.5 px-3 text-right">Total Cost</th>
              <th className="py-2.5 px-3 text-right">Nodes Explored</th>
              <th className="py-2.5 px-3 text-right">Expansions</th>
              <th className="py-2.5 px-3 text-right">Time (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {metrics.map((m) => (
              <tr
                key={m.algorithm}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.algorithm === 'astar'
                        ? 'bg-cyan-600'
                        : m.algorithm === 'dijkstra'
                        ? 'bg-blue-600'
                        : m.algorithm === 'bfs'
                        ? 'bg-emerald-600'
                        : 'bg-amber-600'
                    }`}
                  />
                  {m.name}
                </td>
                <td className="py-2.5 px-3">
                  {m.found ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-sans font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-sans font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Blocked
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-700 font-sans">
                  {m.targetExitName}
                </td>
                <td className="py-2.5 px-3 text-right text-cyan-800 font-medium">
                  {m.found ? `${m.pathLength} steps` : '-'}
                </td>
                <td className="py-2.5 px-3 text-right text-amber-800 font-bold">
                  {m.found ? m.pathCost : '-'}
                </td>
                <td className="py-2.5 px-3 text-right text-indigo-800 font-medium">
                  {m.nodesExplored}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  {m.nodeExpansions}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-800 font-medium">
                  {m.executionTimeMs.toFixed(2)} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Bar Charts: Explored Nodes & Route Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Explored Nodes Bar Chart */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> State-Space Explored (Lower is More Efficient)
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {metrics.map((m) => {
              const pct = Math.max(8, Math.round((m.nodesExplored / maxExplored) * 100));
              return (
                <div key={m.algorithm} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-slate-600 font-sans">
                    <span>{m.name}</span>
                    <span className="font-mono text-cyan-800 font-semibold">{m.nodesExplored} cells</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.algorithm === 'astar'
                          ? 'bg-cyan-600'
                          : m.algorithm === 'dijkstra'
                          ? 'bg-blue-600'
                          : m.algorithm === 'bfs'
                          ? 'bg-emerald-600'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Cost Bar Chart */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" /> Total Route Movement Cost (Lower is Cheaper)
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {metrics.map((m) => {
              const cost = m.found ? m.pathCost : 0;
              const pct = maxCost > 0 ? Math.max(8, Math.round((cost / maxCost) * 100)) : 0;
              return (
                <div key={m.algorithm} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-slate-600 font-sans">
                    <span>{m.name}</span>
                    <span className="font-mono text-amber-800 font-semibold">{m.found ? `${cost} cost` : 'Unreachable'}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.algorithm === 'astar'
                          ? 'bg-cyan-600'
                          : m.algorithm === 'dijkstra'
                          ? 'bg-blue-600'
                          : m.algorithm === 'bfs'
                          ? 'bg-emerald-600'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Pedagogical Summary */}
      <div className="bg-cyan-50 border border-cyan-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-cyan-950 leading-relaxed">
        <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-900">AI Analysis: </span>
          <span className="text-slate-700">{insight}</span>
        </div>
      </div>
    </div>
  );
};
