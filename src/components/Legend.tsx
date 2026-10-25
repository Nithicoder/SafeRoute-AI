import React from 'react';
import { Eye, Flame, LogOut, User, Weight } from 'lucide-react';

export const Legend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3.5 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-2xs">
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-cyan-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
          <User className="w-3 h-3" />
        </span>
        <span className="font-medium text-slate-800">Evacuee / Agent</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-500 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
          <LogOut className="w-3 h-3" />
        </span>
        <span className="font-medium text-slate-800">Emergency Exit</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-slate-500 border border-slate-600 flex items-center justify-center">
          <span className="w-2 h-2 bg-slate-300 rounded-xs" />
        </span>
        <span>Solid Wall (Blocked)</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-red-100 border border-red-500 text-red-600 flex items-center justify-center">
          <Flame className="w-3 h-3" />
        </span>
        <span>Hazard / Fire (Cost: 5)</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-amber-100 border border-amber-500 text-amber-700 flex items-center justify-center">
          <Weight className="w-3 h-3" />
        </span>
        <span>Debris / Crowd (Cost: 3)</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-sky-100 border border-sky-400 flex items-center justify-center">
          <Eye className="w-2.5 h-2.5 text-sky-700" />
        </span>
        <span>Explored Wavefront</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-indigo-50 border border-dashed border-indigo-500 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </span>
        <span>Frontier / Open Set</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-cyan-600 shadow-xs flex items-center justify-center">
          <span className="w-2 h-0.5 bg-white rounded-full" />
        </span>
        <span className="font-semibold text-cyan-800">Active Evacuation Route</span>
      </div>
    </div>
  );
};
