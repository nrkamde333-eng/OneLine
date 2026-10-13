import React, { useState } from 'react';
import {
  Hash,
  Sparkles,
  Send,
  Plus,
  RefreshCw,
  Settings,
  Users,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { OfficeMessage } from '../../types.ts';

interface SlackViewProps {
  messages: OfficeMessage[];
  onDistillMessage: (msg: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
  onSimulateSlackPing?: () => void;
  onConfigureSlack?: () => void;
}

export const SlackView: React.FC<SlackViewProps> = ({
  messages,
  onDistillMessage,
  isAnalyzing,
  onOpenNewMessageModal,
  onSimulateSlackPing,
  onConfigureSlack,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('#infra-migration');
  const [replyInput, setReplyInput] = useState('');
  const [customReplies, setCustomReplies] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({});

  // Get slack messages
  const slackMessages = messages.filter((m) => m.channel === 'slack');

  // Find active message by matching subject or channel, or fallback to first
  const activeMessage =
    slackMessages.find((m) => m.subject?.includes(selectedChannel)) ||
    slackMessages.find((m) => m.rawText.includes(selectedChannel)) ||
    slackMessages[0];

  const channels = [
    { name: '#infra-migration', unread: 1, topic: 'Weekend Aurora cluster migration & failover checklist' },
    { name: '#client-escalations', unread: 1, topic: 'Global Retail & Enterprise SLA escalations' },
    { name: '#engineering', unread: 0, topic: 'General engineering squad updates & RFC reviews' },
    { name: '#devops-alerts', unread: 0, topic: 'Automated PagerDuty & Kubernetes cluster alerts' },
    { name: '#general', unread: 0, topic: 'Company-wide announcements and office syncs' },
  ];

  const teamMembers = [
    { name: 'Marcus Chen', role: 'Staff DBA', status: 'online', avatar: 'MC' },
    { name: 'Sarah Jenkins', role: 'VP Operations', status: 'away', avatar: 'SJ' },
    { name: 'Liam O\'Connor', role: 'Lead SRE', status: 'online', avatar: 'LO' },
    { name: 'Elena Rostova', role: 'Principal Architect', status: 'online', avatar: 'ER' },
  ];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const newReply = {
      sender: 'You (nrkamde333@gmail.com)',
      text: replyInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCustomReplies((prev) => ({
      ...prev,
      [selectedChannel]: [...(prev[selectedChannel] || []), newReply],
    }));

    setReplyInput('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold text-base shadow-xs">
            <span className="text-amber-300">#</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Slack Workspace Connect
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>acme-corp.slack.com</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time workspace ingestion for engineering channels, incident rooms, and client escalations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConfigureSlack && (
            <button
              type="button"
              onClick={onConfigureSlack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Slack Settings</span>
            </button>
          )}

          {onSimulateSlackPing && (
            <button
              type="button"
              onClick={onSimulateSlackPing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 hover:bg-violet-100 text-violet-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Simulate receiving an urgent incoming message in Slack"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Slack Ping</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewMessageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Channel Thread</span>
          </button>
        </div>
      </div>

      {/* Two-Pane Slack Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
        {/* Left Pane: Channels & Direct Messages (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          {/* Workspace info */}
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-xs font-bold">
                AC
              </div>
              <span className="text-xs font-bold truncate">Acme Corp HQ</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              Bot Active
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {/* Channels list */}
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Channels
              </span>
              {channels.map((ch) => {
                const isSelected = selectedChannel === ch.name;
                return (
                  <button
                    key={ch.name}
                    type="button"
                    onClick={() => setSelectedChannel(ch.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isSelected
                        ? 'bg-violet-100/70 text-violet-950 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-violet-800' : 'text-slate-400'}`} />
                      <span className="truncate">{ch.name.replace('#', '')}</span>
                    </div>
                    {ch.unread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Direct Messages */}
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Direct Messages
              </span>
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`rounded-full h-2 w-2 ${
                          member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </span>
                    <span className="truncate text-[11px] font-medium">{member.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>42 Team Members</span>
            </span>
            <span className="font-mono text-emerald-600 text-[10px]">● Live Sync</span>
          </div>
        </div>

        {/* Right Pane: Channel Thread & AI Distill Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl flex flex-col justify-between shadow-2xs overflow-hidden">
          {/* Channel Header */}
          <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-violet-700" />
                <h3 className="text-xs font-bold text-slate-900">{selectedChannel}</h3>
                <span className="text-[11px] text-slate-400 font-normal">|</span>
                <span className="text-[11px] text-slate-500">
                  {channels.find((c) => c.name === selectedChannel)?.topic}
                </span>
              </div>
            </div>

            {activeMessage && (
              <button
                type="button"
                onClick={() => onDistillMessage(activeMessage)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAnalyzing ? 'Distilling Channel...' : 'AI Distill This Channel'}</span>
              </button>
            )}
          </div>

          {/* Messages Feed */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[500px]">
            {activeMessage ? (
              <div className="space-y-4">
                {/* Main Ingested Message */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-800 text-white flex items-center justify-center font-bold text-xs">
                        {activeMessage.sender.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          {activeMessage.sender}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">
                          {activeMessage.senderContact}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(activeMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                    {activeMessage.rawText}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ingested from Slack Bot API</span>
                    </span>
                    {activeMessage.status === 'distilled' && (
                      <span className="text-violet-800 font-semibold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                        Distillation Generated
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom User Replies in Thread */}
                {(customReplies[selectedChannel] || []).map((reply, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 flex items-start gap-3 ml-6"
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      U
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-violet-950">{reply.sender}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{reply.time}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Hash className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No Slack messages in {selectedChannel} yet.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Simulate Slack Ping" or "Ingest Channel Thread" to add updates.
                </p>
              </div>
            )}
          </div>

          {/* Quick Reply Form */}
          <form
            onSubmit={handleSendReply}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder={`Send message to ${selectedChannel}...`}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!replyInput.trim()}
              className="px-3 py-2 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
