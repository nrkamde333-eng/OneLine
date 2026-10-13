import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Quote,
  Lightbulb,
  Plus,
  ArrowRight,
  Download,
  Check,
} from 'lucide-react';
import { AnalysisResult, ExtractedTask } from '../types.ts';
import { downloadTasksCsv, downloadTasksIcs } from '../utils/export.ts';

interface DistillModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  onCommitTasksToToday: (tasks: ExtractedTask[]) => void;
  onScheduleDeadline: (title: string, dateStr: string, timeStr?: string, desc?: string) => void;
  onMoveAmbiguityToSeeLater: (title: string, reason: string, quote?: string) => void;
}

export const DistillModal: React.FC<DistillModalProps> = ({
  isOpen,
  onClose,
  result,
  onCommitTasksToToday,
  onScheduleDeadline,
  onMoveAmbiguityToSeeLater,
}) => {
  const [committedTasks, setCommittedTasks] = useState<Record<string, boolean>>({});
  const [committedAmbiguities, setCommittedAmbiguities] = useState<Record<number, boolean>>({});

  if (!isOpen || !result) return null;

  const handleAddAllToToday = () => {
    onCommitTasksToToday(result.tasks);
    const updated: Record<string, boolean> = {};
    result.tasks.forEach((t) => (updated[t.id] = true));
    setCommittedTasks(updated);
  };

  const handleAddSingleTask = (task: ExtractedTask) => {
    onCommitTasksToToday([task]);
    setCommittedTasks((prev) => ({ ...prev, [task.id]: true }));
  };

  const handleTriageAmbiguity = (ambiguity: string, idx: number) => {
    onMoveAmbiguityToSeeLater(
      `Unclear requirement: ${ambiguity.slice(0, 45)}...`,
      ambiguity,
      result.evidenceSnippets[0]
    );
    setCommittedAmbiguities((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Sparkles className="w-4 h-4 text-violet-200" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                {result.title}
              </h2>
              <span className="text-[11px] text-slate-400">
                Distilled Output · Verified Ground Truth
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. Executive One-Sentence Crux */}
          <div className="bg-violet-50/80 border border-violet-100 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] font-bold text-violet-900 uppercase tracking-wider block mb-1">
              Executive One-Sentence Summary
            </span>
            <p className="text-sm sm:text-base font-semibold text-violet-950 leading-relaxed">
              {result.oneSentenceSummary}
            </p>
          </div>

          {/* 2. Deadlines Banner */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-violet-800" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Extracted Deadlines & Schedule
              </span>
            </div>

            <div className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              {result.deadlines.deadlineSummary}
            </div>

            {result.deadlines.items && result.deadlines.items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {result.deadlines.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[11px] font-mono font-bold text-violet-900 block">
                        {item.dateOrTime}
                      </span>
                      <span className="text-xs text-slate-600 block mt-0.5 leading-snug">
                        {item.description}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onScheduleDeadline(
                          item.description,
                          '2026-10-17',
                          item.dateOrTime,
                          `Extracted from ${result.title}`
                        )
                      }
                      className="text-[10px] font-semibold text-violet-700 hover:underline shrink-0"
                    >
                      + Calendar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Extracted Action Queue with 1-Click Triage */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Extracted Action Items ({result.tasks.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddAllToToday}
                className="text-xs font-bold text-violet-800 hover:text-violet-950 underline"
              >
                Add all to Today's Tasks
              </button>
            </div>

            <div className="space-y-2">
              {result.tasks.map((task) => {
                const isCommitted = committedTasks[task.id];

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          {task.priority}
                        </span>
                        {task.assignee && <span>👤 {task.assignee}</span>}
                        {task.deadline && (
                          <span className="font-mono">Due: {task.deadline}</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSingleTask(task)}
                      disabled={isCommitted}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors shrink-0 ${
                        isCommitted
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-violet-900 hover:text-white'
                      }`}
                    >
                      {isCommitted ? '✓ Added' : '+ Add to Today'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Ambiguities & Missing Information -> Move to See Later */}
          {result.ambiguities && result.ambiguities.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Ambiguities & Unconfirmed Requirements
                </span>
              </div>

              <div className="space-y-2">
                {result.ambiguities.map((amb, idx) => {
                  const isTriaged = committedAmbiguities[idx];

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white/80 border border-amber-200/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <span className="text-amber-950 leading-relaxed">
                        ⚠️ {amb}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTriageAmbiguity(amb, idx)}
                        disabled={isTriaged}
                        className={`text-[11px] font-bold px-2 py-1 rounded transition-colors shrink-0 ${
                          isTriaged
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                        }`}
                      >
                        {isTriaged ? '✓ In See Later' : '+ Move to See Later'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Key Verified Facts */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Key Verified Facts
            </span>
            <ul className="space-y-1.5">
              {result.keyFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadTasksCsv(result.tasks, result.title)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => downloadTasksIcs(result.tasks, result.title)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
            >
              Export .ICS
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
