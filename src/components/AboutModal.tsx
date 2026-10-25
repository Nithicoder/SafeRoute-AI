import React from 'react';
import {
  AlertTriangle,
  Award,
  BookCheck,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Course Project Information
              </h2>
              <p className="text-xs text-slate-500">
                SafeRoute AI — Intelligent Emergency Evacuation & Dynamic Path-Replanning Simulator
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs leading-relaxed">
          {/* Project Overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" /> Academic Objective
            </h3>
            <p className="text-slate-700">
              To demonstrate how classical Artificial Intelligence search and planning algorithms find optimal or satisfactory routes through a discrete 2D spatial state space, and how an intelligent agent dynamically adapts its plan when newly placed hazards invalidate previously calculated solutions.
            </p>
          </div>

          {/* Core AI Concepts Covered */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-2 flex items-center gap-1.5">
              <BookCheck className="w-4 h-4 text-cyan-600" /> Core AI Curriculum Concepts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Intelligent Agents:</strong> Perceive-Act loop with local goal state</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>State-Space Representation:</strong> Discrete grid graph model G=(V,E)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Breadth-First Search (BFS):</strong> Unweighted shortest hop path</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Dijkstra's Algorithm:</strong> Least-cost uniform cost search</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>A* Search:</strong> Admissible Manhattan heuristic guided f = g + h</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Greedy Best-First:</strong> Heuristic-only selection and suboptimality</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Dynamic Replanning:</strong> Real-time path invalidation & state recovery</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span><strong>Multi-Goal Planning:</strong> Concurrent evaluation of multiple exits</span>
              </div>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-600" /> Academic Evaluation Criteria
            </h3>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
              <li><strong>Algorithm Correctness:</strong> Clean TypeScript implementations verified via unit tests.</li>
              <li><strong>Path Validity & Safety:</strong> Strictly zero collisions with solid walls or impassable barriers.</li>
              <li><strong>Dynamic Replanning:</strong> Immediate rerouting when corridors or exits become blocked.</li>
              <li><strong>Empirical Benchmark:</strong> Accurate, reproducible metrics on identical grid topologies.</li>
              <li><strong>UI/UX Usability:</strong> Interactive Canvas map with full telemetry and accessible controls.</li>
            </ul>
          </div>

          {/* Educational Disclaimer */}
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Educational Simulation Notice & Safety Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              SafeRoute AI is an educational computer science course project developed to demonstrate classical search algorithms and dynamic replanning. It is an algorithmic simulation and is <strong>not</strong> certified or intended for real-life architectural emergency evacuation, life-safety guidance, or building code compliance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
