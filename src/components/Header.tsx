import React from 'react';
import { History, Sparkles, Layers } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets.ts';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onSelectPreset,
  activePresetId,
  isAnalyzing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBFC]/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-violet-900 text-white flex items-center justify-center shadow-xs font-semibold text-sm tracking-tight">
            1L
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              OneLine AI
            </span>
            <span className="text-[11px] font-medium text-slate-400 block leading-none">
              Distill · Decide · Execute
            </span>
          </div>
        </div>

        {/* Zone 2: Preset Sample Pickers */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Samples:
          </span>
          {SAMPLE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                disabled={isAnalyzing}
                className={`text-xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap shrink-0 transition-all border ${
                  isActive
                    ? 'bg-violet-50 text-violet-900 border-violet-200 font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title={preset.description}
              >
                {preset.title}
              </button>
            );
          })}
        </div>

        {/* Zone 3: History Drawer Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs"
            title="View saved analyses and task queues"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="whitespace-nowrap">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-violet-100 text-violet-800 rounded text-[10px] font-semibold tabular-nums">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
