import React, { useEffect, useState } from 'react';

const LOADING_HINTS = [
  'Extracting the core single-sentence crux...',
  'Verifying explicitly stated commitments and dates...',
  'Isolating direct tasks from general background...',
  'Flagging ambiguities and unassigned dependencies...',
  'Synthesizing evidence quotes from original text...',
];

export const SkeletonLoader: React.FC = () => {
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % LOADING_HINTS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs animate-pulse space-y-6">
      {/* Status hint indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-ping" />
          <span className="text-xs font-medium text-violet-900 tracking-tight">
            {LOADING_HINTS[hintIndex]}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Gemini 3.8 Flash</span>
      </div>

      {/* Summary Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="p-4 bg-slate-50 rounded-lg space-y-2.5 border border-slate-100">
          <div className="h-4.5 bg-slate-300 rounded w-11/12" />
          <div className="h-4.5 bg-slate-300 rounded w-4/5" />
        </div>
      </div>

      {/* Deadlines Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-10 bg-slate-100 rounded-lg border border-slate-200/60 w-full" />
      </div>

      {/* Facts Skeleton */}
      <div className="space-y-2.5">
        <div className="h-3 w-32 bg-slate-200 rounded" />
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-100 rounded w-full" />
          <div className="h-3.5 bg-slate-100 rounded w-5/6" />
          <div className="h-3.5 bg-slate-100 rounded w-4/6" />
        </div>
      </div>

      {/* Tasks Queue Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-3 w-36 bg-slate-200 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-4 h-4 rounded bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
