import React, { useRef } from 'react';
import { ArrowRight, Sparkles, Trash2, Clipboard, AlertCircle } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets.ts';

interface SourceInputProps {
  text: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  error: string | null;
  onDismissError: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const SourceInput: React.FC<SourceInputProps> = ({
  text,
  onChange,
  onClear,
  onSubmit,
  isAnalyzing,
  error,
  onDismissError,
  onSelectPreset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isAnalyzing && text.trim()) {
        onSubmit();
      }
    }
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText);
        textareaRef.current?.focus();
      }
    } catch {
      // Clipboard permissions denied; textarea can be pasted into naturally
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Top bar of input */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 tracking-tight">Source Message</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded transition-colors"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>
          {text.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              disabled={isAnalyzing}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSubmit}
              className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700 transition-colors shadow-2xs"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onDismissError}
              className="text-rose-500 hover:text-rose-800 font-bold px-1 text-sm"
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Large Input Area */}
      <div className="flex-1 p-4 flex flex-col min-h-[380px]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste long emails, project updates, executive announcements, Slack threads, or messy meeting notes here...&#10;&#10;Tip: Press ⌘+Enter to distill instantly."
          className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-hidden font-normal"
          disabled={isAnalyzing}
        />
      </div>

      {/* Mobile preset pills when screen is smaller than lg */}
      <div className="lg:hidden px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] text-slate-400 font-medium shrink-0">Sample:</span>
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            disabled={isAnalyzing}
            className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 whitespace-nowrap shrink-0 hover:border-slate-300"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 hidden sm:block">
          Shortcut: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Enter</kbd>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isAnalyzing || !text.trim()}
          className={`ml-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs ${
            isAnalyzing || !text.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-violet-900 hover:bg-violet-800 active:bg-violet-950 text-white shadow-violet-950/10 hover:shadow-md cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Distilling...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-violet-200" />
              <span>Make it clear</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
