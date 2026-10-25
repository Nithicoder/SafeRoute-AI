import React, { useState } from 'react';
import { Save, Trash2, X } from 'lucide-react';
import { deleteCustomLayout, loadCustomLayouts, SavedLayout } from '../utils/storage';

interface SaveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCurrent: (name: string) => void;
  onLoadSaved: (layout: SavedLayout) => void;
}

export const SaveLayoutModal: React.FC<SaveLayoutModalProps> = ({
  isOpen,
  onClose,
  onSaveCurrent,
  onLoadSaved,
}) => {
  const [layoutName, setLayoutName] = useState('');
  const [savedList, setSavedList] = useState<SavedLayout[]>(loadCustomLayouts());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!layoutName.trim()) return;
    onSaveCurrent(layoutName.trim());
    setLayoutName('');
    setSavedList(loadCustomLayouts());
  };

  const handleDelete = (id: string) => {
    deleteCustomLayout(id);
    setSavedList(loadCustomLayouts());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl text-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Save className="w-4 h-4 text-cyan-600" /> Save & Load Custom Layouts
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save current form */}
        <form onSubmit={handleSave} className="space-y-2">
          <label className="text-xs text-slate-600 font-medium block">
            Save Current Grid Topology:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Lab Complex Wing B"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!layoutName.trim()}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs"
            >
              Save
            </button>
          </div>
        </form>

        {/* Saved List */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block">
            Previously Saved Maps ({savedList.length}):
          </span>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {savedList.length === 0 ? (
              <p className="text-slate-400 italic text-[11px] py-2">
                No custom layouts saved in browser storage yet.
              </p>
            ) : (
              savedList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
                >
                  <button
                    onClick={() => {
                      onLoadSaved(item);
                      onClose();
                    }}
                    className="text-left font-medium text-slate-800 hover:text-cyan-700 transition-colors flex-1 truncate mr-2"
                  >
                    {item.name}
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete layout"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
