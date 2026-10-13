import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  AlertTriangle,
  Clock,
  Plus,
  Send,
  Calendar,
  Settings,
  RefreshCw,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { OfficeMessage } from '../../types.ts';

interface SmsViewProps {
  messages: OfficeMessage[];
  onDistillMessage: (msg: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
  onConfigureSms?: () => void;
  onSimulateSmsPing?: () => void;
}

export const SmsView: React.FC<SmsViewProps> = ({
  messages,
  onDistillMessage,
  isAnalyzing,
  onOpenNewMessageModal,
  onConfigureSms,
  onSimulateSmsPing,
}) => {
  const [selectedSmsId, setSelectedSmsId] = useState<string>(
    messages[0]?.id || ''
  );
  const [replyInput, setReplyInput] = useState('');
  const [smsReplies, setSmsReplies] = useState<Record<string, Array<{ text: string; time: string }>>>({});

  const selectedSms = messages.find((m) => m.id === selectedSmsId) || messages[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedSms) return;

    const reply = {
      text: replyInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSmsReplies((prev) => ({
      ...prev,
      [selectedSms.id]: [...(prev[selectedSms.id] || []), reply],
    }));

    setReplyInput('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Google SMS & Messages Gateway
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Pixel 9 Pro (RCS Active)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synced with Android Google Messages, on-call pager gateways, and verified customer SMS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConfigureSms && (
            <button
              type="button"
              onClick={onConfigureSms}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>SMS Settings</span>
            </button>
          )}

          {onSimulateSmsPing && (
            <button
              type="button"
              onClick={onSimulateSmsPing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Simulate receiving an urgent incoming SMS alert"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate SMS Ping</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewMessageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest SMS / Alert</span>
          </button>
        </div>
      </div>

      {/* Two-Pane SMS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
        {/* Left Pane: SMS Tickets List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Google SMS Feed ({messages.length})</span>
            <span className="text-[11px] text-amber-700 font-mono">Gateway Paired</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[620px]">
            {messages.map((sms) => {
              const isSelected = selectedSms?.id === sms.id;

              return (
                <div
                  key={sms.id}
                  onClick={() => setSelectedSmsId(sms.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/70 border-l-3 border-amber-600'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {sms.sender}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(sms.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {sms.rawText}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sms.senderContact}
                    </span>
                    {sms.status === 'distilled' && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        AI Extracted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: SMS Inspector & AI Action Pane (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          {selectedSms ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                      Priority SMS / RCS Ticket
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedSms.sender}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Origin: {selectedSms.senderContact}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(selectedSms.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* SMS Raw Content */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedSms.rawText}
                </div>

                {/* SMS Replies Stream */}
                {(smsReplies[selectedSms.id] || []).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {smsReplies[selectedSms.id].map((rep, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-start text-xs">
                        <div>
                          <span className="font-semibold text-slate-700 block text-[11px]">Sent via Google Messages:</span>
                          <span className="text-slate-800">{rep.text}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{rep.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions & Reply Form */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder={`Send SMS reply to ${selectedSms.senderContact}...`}
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!replyInput.trim()}
                    className="px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </button>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ticket status: {selectedSms.status.toUpperCase()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDistillMessage(selectedSms)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isAnalyzing ? 'Distilling...' : 'AI Distill SMS & Extract Tasks'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Smartphone className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
              <p className="text-xs">Select an SMS ticket to inspect and extract tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
