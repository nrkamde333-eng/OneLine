import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Quote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { AnalysisResult, ExtractedTask } from '../types.ts';
import { formatFullAnalysisMarkdown } from '../utils/export.ts';

interface AnalysisPanelProps {
  result: AnalysisResult;
  onAddSuggestedTask: (taskText: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  result,
  onAddSuggestedTask,
}) => {
  const [copiedFull, setCopiedFull] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Record<number, boolean>>({});

  const handleCopyFull = async () => {
    try {
      const markdown = formatFullAnalysisMarkdown(result);
      await navigator.clipboard.writeText(markdown);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePromoteSuggestion = (suggestion: string, idx: number) => {
    onAddSuggestedTask(suggestion);
    setAddedSuggestions((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="space-y-5">
      {/* Top Title & Copy Action */}
      <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {result.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Distilled from {result.originalText.trim().split(/\s+/).length} words</span>
            <span>·</span>
            <span>{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <button
          onClick={handleCopyFull}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs shrink-0"
          title="Copy full analysis report as Markdown"
        >
          {copiedFull ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy report</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Executive One-Sentence Summary */}
      <div className="bg-violet-50/70 border border-violet-100 rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-violet-900 uppercase tracking-wider">
            One-Sentence Summary
          </span>
          <span className="text-[11px] font-mono text-violet-600/70">Crux</span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-violet-950 leading-relaxed">
          {result.oneSentenceSummary}
        </p>
      </div>

      {/* 2. Deadlines & Timing */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-violet-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Deadlines & Schedule
          </span>
        </div>

        {result.deadlines.hasDeadline ? (
          <div className="space-y-2 mt-2">
            <div className="text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/70">
              {result.deadlines.deadlineSummary}
            </div>
            {result.deadlines.items && result.deadlines.items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {result.deadlines.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-mono font-semibold text-violet-900">
                      {item.dateOrTime}
                    </span>
                    <span className="text-xs text-slate-600 mt-1 leading-snug">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 px-3 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-500 font-medium">
            <span>No deadline specified.</span>
          </div>
        )}
      </div>

      {/* 3. Verified Key Facts */}
      {result.keyFacts && result.keyFacts.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Key Verified Facts
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Strictly explicit in source</span>
          </div>
          <ul className="space-y-2">
            {result.keyFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Ambiguities & Missing Info */}
      {result.ambiguities && result.ambiguities.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Ambiguities & Clarifications Needed
            </span>
          </div>
          <ul className="space-y-1.5 mt-2">
            {result.ambiguities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amber-900/90 leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0">?</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Suggested Next Steps (Recommendations) */}
      {result.suggestedNextSteps && result.suggestedNextSteps.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Suggested Next Steps
              </span>
            </div>
            <span className="text-[11px] text-slate-400">AI Recommendations</span>
          </div>
          <div className="space-y-2 mt-2">
            {result.suggestedNextSteps.map((step, idx) => {
              const isAdded = addedSuggestions[idx];
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <span className="text-xs text-slate-700 leading-snug">{step}</span>
                  <button
                    onClick={() => handlePromoteSuggestion(step, idx)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded transition-colors shrink-0 ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                    title="Promote this suggestion to your editable action queue"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>In Queue</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add to Queue</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Source Evidence Snippets (Collapsible) */}
      {result.evidenceSnippets && result.evidenceSnippets.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setEvidenceOpen(!evidenceOpen)}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Source Evidence Quotes ({result.evidenceSnippets.length})
              </span>
            </div>
            {evidenceOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {evidenceOpen && (
            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-100">
              {result.evidenceSnippets.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50/70 border-l-2 border-slate-300 text-xs text-slate-600 italic leading-relaxed"
                >
                  "{snippet}"
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
