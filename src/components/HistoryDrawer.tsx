import React from 'react';
import { X, Trash2, Calendar, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../types.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Saved Analyses
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stored privately in your browser ({history.length} items)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No saved analyses yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  When you distill messages with OneLine AI, they will appear here so you can revisit them anytime.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="text-xs font-bold text-slate-900 hover:text-violet-900 cursor-pointer leading-snug"
                    >
                      {item.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p
                    onClick={() => {
                      onSelectHistory(item);
                      onClose();
                    }}
                    className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed cursor-pointer"
                  >
                    {item.oneSentenceSummary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {new Date(item.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>·</span>
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <CheckSquare className="w-3 h-3 text-violet-700" />
                        <span>
                          {item.completedTaskCount}/{item.taskCount} tasks
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="text-violet-900 font-semibold flex items-center gap-0.5 hover:underline"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Clear All */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Local browser storage</span>
              <button
                onClick={() => {
                  if (confirm('Clear all saved analyses from local browser storage?')) {
                    onClearAllHistory();
                  }
                }}
                className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
              >
                Clear all history
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
