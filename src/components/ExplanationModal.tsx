import React, { useState } from 'react';
import {
  Brain,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react';
import { AlgorithmType } from '../types';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAlgorithm?: AlgorithmType;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  initialAlgorithm = 'astar',
}) => {
  const [activeTab, setActiveTab] = useState<AlgorithmType>(initialAlgorithm);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialAlgorithm);
    }
  }, [isOpen, initialAlgorithm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center border border-cyan-200">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                How the AI Thinks
                <span className="text-xs font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  Search & Planning Theory
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Mathematical foundations of classical Artificial Intelligence search algorithms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-5 pt-3 gap-2 overflow-x-auto">
          {(
            [
              { id: 'astar', label: 'A* Search' },
              { id: 'dijkstra', label: "Dijkstra's Algorithm" },
              { id: 'bfs', label: 'Breadth-First Search (BFS)' },
              { id: 'greedy', label: 'Greedy Best-First' },
            ] as { id: AlgorithmType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs leading-relaxed">
          {/* Active Algorithm Explanation */}
          {activeTab === 'astar' && (
            <div className="space-y-4">
              <div className="bg-cyan-50/70 border border-cyan-200 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-cyan-900 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" /> A* Search (Informed Heuristic Search)
                </h3>
                <p className="text-slate-700">
                  A* combines the guaranteed optimality of Dijkstra's algorithm with the goal-oriented efficiency of Greedy Best-First Search. It uses an evaluation function:
                </p>

                {/* Mathematical Formula Card */}
                <div className="my-3 p-3 bg-white rounded-lg border border-cyan-300 font-mono text-center text-sm text-cyan-900 shadow-2xs">
                  <span className="font-bold text-cyan-950 text-base">f(n) = g(n) + h(n)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <span className="font-bold text-cyan-700 block mb-1">g(n): Accumulated Cost</span>
                    <span className="text-slate-600">
                      The exact known movement cost incurred from the start position to the current cell <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">n</code>.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <span className="font-bold text-indigo-700 block mb-1">h(n): Heuristic Estimate</span>
                    <span className="text-slate-600">
                      The estimated remaining cost from node <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">n</code> to the closest exit. SafeRoute uses Manhattan distance: <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">|x₁ - x₂| + |y₁ - y₂|</code>.
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                    <span className="font-bold text-emerald-700 block mb-1">f(n): Total Priority</span>
                    <span className="text-slate-600">
                      Estimated total cost of the complete route through node <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">n</code>. Lower values are expanded first from the Min-Priority Queue.
                    </span>
                  </div>
                </div>
              </div>

              {/* Admissibility & Consistency */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800">Why A* Guarantees an Optimal Route Here:</h4>
                <p className="text-slate-600">
                  In a four-directional grid with step costs <code className="text-slate-800 font-semibold">≥ 1</code>, Manhattan distance is strictly <strong className="text-slate-800">admissible</strong> (it never overestimates the actual distance to the goal, i.e., <code className="text-slate-800">h(n) ≤ h*(n)</code>) and <strong className="text-slate-800">consistent</strong> (satisfies the triangle inequality <code className="text-slate-800">h(n) ≤ c(n, n') + h(n')</code>). Therefore, the first time an exit node is dequeued, its path is guaranteed to have minimal cost.
                </p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <span className="font-bold text-emerald-900 block mb-1">Advantages</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Mathematically optimal path guaranteed.</li>
                    <li>Prunes massive swathes of state space compared to Dijkstra.</li>
                    <li>Balances hazard avoidance with path length.</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <span className="font-bold text-amber-900 block mb-1">Limitations</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Requires admissible heuristic design.</li>
                    <li>Maintains open set in memory (space complexity O(|V|)).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dijkstra' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-blue-900">
                  Dijkstra's Algorithm (Uniform-Cost Search)
                </h3>
                <p className="text-slate-700">
                  Dijkstra explores nodes in strict non-decreasing order of their accumulated cost <code className="text-cyan-800 font-semibold">g(n)</code> from the start. It behaves like expanding concentric cost contours radially outward.
                </p>
                <div className="p-3 bg-white rounded border border-slate-200 font-mono text-center text-slate-800 shadow-2xs">
                  Evaluation: <span className="font-bold text-blue-700">f(n) = g(n)</span> (where h(n) = 0)
                </div>
                <p className="text-slate-600">
                  Because edge weights represent physical traversal difficulty (Normal = 1, Crowd = 3, Fire Hazard = 5), Dijkstra accurately detours around high-cost hazard zones when a clear alternative corridor exists.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <span className="font-bold text-emerald-900 block mb-1">Advantages</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Always guarantees the absolute lowest-cost path.</li>
                    <li>Does not require any domain heuristic knowledge.</li>
                    <li>Naturally handles multiple target exits simultaneously.</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <span className="font-bold text-amber-900 block mb-1">Limitations</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Expands blind in all directions, exploring unnecessary nodes.</li>
                    <li>Significantly slower in large open spaces than A*.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bfs' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900">
                  Breadth-First Search (BFS)
                </h3>
                <p className="text-slate-700">
                  BFS explores the grid level by level using a First-In, First-Out (FIFO) queue. It visits all immediate 1-hop neighbors, then 2-hop neighbors, and so on.
                </p>
                <div className="p-3 bg-white rounded border border-slate-200 font-mono text-center text-slate-800 shadow-2xs">
                  Data Structure: <span className="font-bold text-emerald-700">FIFO Queue</span> (All steps cost = 1)
                </div>
                <p className="text-slate-600">
                  In an <strong className="text-slate-800">unweighted grid</strong> (where every step has identical cost 1), BFS is mathematically guaranteed to find the shortest path in number of steps. However, BFS cannot distinguish between an empty corridor and a smoke-filled room!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <span className="font-bold text-emerald-900 block mb-1">Advantages</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Guaranteed shortest path in number of hops.</li>
                    <li>Very fast O(|V| + |E|) runtime without priority queue overhead.</li>
                    <li>Simple and intuitive queue model.</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <span className="font-bold text-amber-900 block mb-1">Limitations</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Blind to weighted terrain costs (fire, debris).</li>
                    <li>Explores exhaustively in all directions.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'greedy' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-amber-900">
                  Greedy Best-First Search
                </h3>
                <p className="text-slate-700">
                  Greedy Best-First prioritizes nodes based <strong className="text-slate-800">solely on their heuristic distance to the goal</strong>, completely disregarding the cost already incurred to reach them.
                </p>
                <div className="p-3 bg-white rounded border border-slate-200 font-mono text-center text-slate-800 shadow-2xs">
                  Evaluation: <span className="font-bold text-amber-700">f(n) = h(n)</span> (where g(n) is ignored)
                </div>
                <p className="text-slate-600">
                  It rushes headlong towards the goal. When encountering a wall or obstacle, it may snake along dead ends or choose a route that plunges through heavy hazards simply because they are geometrically closer to the exit.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <span className="font-bold text-emerald-900 block mb-1">Advantages</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li>Expands very few nodes in unobstructed environments.</li>
                    <li>Fast heuristic-only candidate ranking.</li>
                  </ul>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg">
                  <span className="font-bold text-rose-900 block mb-1">Limitations</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><strong className="text-rose-700">Not optimal:</strong> frequently yields sub-optimal route costs.</li>
                    <li>Vulnerable to local minima and maze traps.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Replanning Case Study */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-2">
            <h4 className="font-bold text-purple-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600" /> Dynamic Route Replanning in SafeRoute AI
            </h4>
            <p className="text-slate-700">
              In real emergency evacuations, structural collapses, debris, or advancing fire fronts can block a planned route while an evacuee is en route. SafeRoute AI demonstrates real-time dynamic replanning:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 ml-1">
              <li>The simulation tracks the evacuee's discrete spatial coordinate <code className="text-slate-800 font-semibold bg-white px-1 py-0.5 rounded border border-purple-200">(x, y)</code> along the active route.</li>
              <li>When the user introduces an obstacle or fire onto the path, the route validator flags invalidation.</li>
              <li>The agent initiates an instantaneous search rooted at its current coordinates.</li>
              <li>If the primary exit is blocked, the multi-goal heuristic automatically pivots toward the next best reachable exit.</li>
              <li>If all exits are cut off, the agent halts safely and records a trapped warning.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
