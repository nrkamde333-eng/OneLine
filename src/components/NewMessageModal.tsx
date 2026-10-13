import React, { useState } from 'react';
import { X, Sparkles, Layers, Clipboard } from 'lucide-react';
import { ChannelType } from '../types.ts';
import { SAMPLE_PRESETS } from '../data/samplePresets.ts';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (channel: ChannelType, sender: string, text: string) => void;
  isAnalyzing: boolean;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isAnalyzing,
}) => {
  const [channel, setChannel] = useState<ChannelType>('email');
  const [sender, setSender] = useState('');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSubmit(
      channel,
      sender.trim() || `${channel.replace('_', ' ').toUpperCase()} Ingest`,
      text.trim()
    );
  };

  const handleApplyPreset = (presetContent: string, defaultChannel: ChannelType, defaultSender: string) => {
    setText(presetContent);
    setChannel(defaultChannel);
    setSender(defaultSender);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ingest & Distill Office Communication
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste email threads, WhatsApp messages, SMS alerts, or phone transcripts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Source Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
              >
                <option value="email">Gmail / Work Email Memo</option>
                <option value="slack">Slack Channel / Thread</option>
                <option value="whatsapp">WhatsApp Business Chat</option>
                <option value="sms">Google SMS / RCS Alert</option>
                <option value="call_transcript">Call Transcript / Zoom</option>
                <option value="manual">Manual Notes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sender / Meeting Room
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Sarah Jenkins (VP Ops)"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Message Content
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 text-[11px] text-violet-700 hover:underline"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste clipboard</span>
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full text here..."
              rows={8}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white resize-none leading-relaxed font-normal"
              required
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Quick insert sample:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    SAMPLE_PRESETS[1].content,
                    'whatsapp',
                    'Sarah Jenkins (Global Retail VP)'
                  )
                }
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Client Scope Change (WhatsApp)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    SAMPLE_PRESETS[0].content,
                    'sms',
                    'DevOps Cloud Migration Pager'
                  )
                }
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Database Failover (SMS)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    SAMPLE_PRESETS[2].content,
                    'call_transcript',
                    'Dr. Kenneth Patel (CTO)'
                  )
                }
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Tool Consolidation (Call)
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing || !text.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Distilling...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                  <span>Ingest & Distill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
