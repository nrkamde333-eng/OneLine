import React, { useState } from 'react';
import {
  PhoneCall,
  Sparkles,
  Play,
  Pause,
  Clock,
  User,
  Plus,
  Volume2,
} from 'lucide-react';
import { OfficeMessage } from '../../types.ts';

interface CallsViewProps {
  messages: OfficeMessage[];
  onDistillMessage: (msg: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  messages,
  onDistillMessage,
  isAnalyzing,
  onOpenNewMessageModal,
}) => {
  const [selectedCallId, setSelectedCallId] = useState<string>(
    messages[0]?.id || ''
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedCall = messages.find((m) => m.id === selectedCallId) || messages[0];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              VoIP Phone & Call Transcripts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer support call recordings, Zoom meetings, and executive telephone reviews
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNewMessageModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload / Ingest Transcript</span>
        </button>
      </div>

      {/* Two-Pane VoIP Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
        {/* Left Pane: Call Recordings List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Call Recordings ({messages.length})</span>
            <span className="text-[11px] text-indigo-700 font-mono">VoIP Recorder Live</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[620px]">
            {messages.map((call) => {
              const isSelected = selectedCall?.id === call.id;

              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-l-3 border-indigo-700'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {call.sender.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(call.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-slate-700 truncate">
                    {call.subject}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {call.rawText}
                  </p>

                  <div className="flex items-center justify-between mt-2 text-[10px]">
                    <span className="text-slate-400 font-mono">
                      {call.senderContact}
                    </span>
                    {call.status === 'distilled' && (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        AI Minutes Extracted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Audio Player Simulator & Transcript Inspector (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          {selectedCall ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedCall.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Participants:</span>
                      <span>{selectedCall.sender}</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(selectedCall.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Simulated Audio Player Strip */}
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-indigo-900 hover:bg-indigo-800 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{isPlaying ? '02:14' : '00:00'}</span>
                      <span>18:42</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: isPlaying ? '35%' : '0%' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[11px] font-mono">HD</span>
                  </div>
                </div>

                {/* Diarized Transcript Body */}
                <div className="mt-3 p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedCall.rawText}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  AI extracts meeting commitments, decision points & deadlines
                </span>

                <button
                  type="button"
                  onClick={() => onDistillMessage(selectedCall)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                  <span>
                    {selectedCall.status === 'distilled'
                      ? 'Review Meeting Minutes'
                      : 'AI Extract Minutes & Actions'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a phone recording to inspect transcript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
