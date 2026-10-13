import React, { useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Smartphone,
  PhoneCall,
  Sparkles,
  Plus,
  Clock,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { OfficeMessage, ChannelType } from '../../types.ts';

interface InboxViewProps {
  messages: OfficeMessage[];
  selectedMessageId: string | null;
  onSelectMessage: (msg: OfficeMessage) => void;
  channelFilter: ChannelType | 'all';
  onChannelFilterChange: (channel: ChannelType | 'all') => void;
  onDistillMessage: (msg: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  channelFilter,
  onChannelFilterChange,
  onDistillMessage,
  isAnalyzing,
  onOpenNewMessageModal,
}) => {
  const filteredMessages = messages.filter((m) => {
    if (channelFilter === 'all') return true;
    return m.channel === channelFilter;
  });

  // Always ensure selectedMessage is within the currently filtered messages list
  const selectedMessage =
    filteredMessages.find((m) => m.id === selectedMessageId) ||
    filteredMessages[0] ||
    null;

  // Whenever channelFilter changes and the previous selection is outside the new filter, update selection
  useEffect(() => {
    if (filteredMessages.length > 0) {
      const isCurrentInFiltered = filteredMessages.some((m) => m.id === selectedMessageId);
      if (!isCurrentInFiltered) {
        onSelectMessage(filteredMessages[0]);
      }
    }
  }, [channelFilter, messages]);

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'slack':
        return {
          label: 'Slack',
          icon: MessageSquare,
          color: 'text-emerald-950 bg-emerald-100 border-emerald-300',
        };
      case 'whatsapp':
        return {
          label: 'WhatsApp',
          icon: MessageSquare,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'sms':
        return {
          label: 'Google SMS',
          icon: Smartphone,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'call_transcript':
        return {
          label: 'Call Transcript',
          icon: PhoneCall,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        };
      case 'email':
      default:
        return {
          label: 'Email',
          icon: Mail,
          color: 'text-violet-700 bg-violet-50 border-violet-200',
        };
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Controls: Channel Filter Tabs & New Ingest Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(
            [
              { id: 'all', label: 'All Channels' },
              { id: 'slack', label: 'Slack' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'sms', label: 'Google SMS' },
              { id: 'call_transcript', label: 'Calls' },
              { id: 'email', label: 'Email' },
            ] as const
          ).map((tab) => {
            const isActive = channelFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChannelFilterChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenNewMessageModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Paste / Ingest Raw Text</span>
        </button>
      </div>

      {/* Split Ingest View: Left Messages List, Right Message Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">
        {/* Messages List (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>
              {channelFilter === 'all'
                ? 'All Inbound Messages'
                : `${channelFilter.toUpperCase().replace('_', ' ')} Queue`}{' '}
              ({filteredMessages.length})
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Click to preview</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[600px]">
            {filteredMessages.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <p>No messages found in this channel.</p>
                <button
                  onClick={() => onChannelFilterChange('all')}
                  className="mt-2 text-violet-700 underline font-medium cursor-pointer"
                >
                  View all channels
                </button>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const badge = getChannelBadge(msg.channel);
                const ChannelIcon = badge.icon;
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => onSelectMessage(msg)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-50/70 border-l-3 border-violet-900'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${badge.color}`}
                        >
                          <ChannelIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                        {msg.status === 'distilled' && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Distilled
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {msg.sender}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {msg.rawText}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Inspector & Distill Action (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          {selectedMessage ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                {/* Channel & Sender Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                          getChannelBadge(selectedMessage.channel).color
                        }`}
                      >
                        {getChannelBadge(selectedMessage.channel).label}
                      </span>
                      {selectedMessage.senderContact && (
                        <span className="text-xs text-slate-400 font-mono">
                          {selectedMessage.senderContact}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedMessage.sender}
                    </h3>
                    {selectedMessage.subject && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {selectedMessage.subject}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(selectedMessage.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Raw Body Content */}
                <div className="mt-4 p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                  {selectedMessage.rawText}
                </div>
              </div>

              {/* Action Banner */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Extracts 1-sentence crux, deadlines & action queue
                </span>

                <button
                  type="button"
                  onClick={() => onDistillMessage(selectedMessage)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Distilling with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-violet-200" />
                      <span>
                        {selectedMessage.status === 'distilled'
                          ? 'Review / Re-Distill'
                          : 'Make it clear (Distill)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a message from the queue or click "Paste / Ingest Raw Text".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
