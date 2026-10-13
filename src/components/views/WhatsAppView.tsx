import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Phone,
  Video,
  Send,
  User,
  CheckCheck,
  Plus,
} from 'lucide-react';
import { OfficeMessage } from '../../types.ts';

interface WhatsAppViewProps {
  messages: OfficeMessage[];
  onDistillMessage: (msg: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
  onConfigureWhatsApp?: () => void;
  onSimulateWhatsAppPing?: () => void;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  messages,
  onDistillMessage,
  isAnalyzing,
  onOpenNewMessageModal,
  onConfigureWhatsApp,
  onSimulateWhatsAppPing,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(
    messages[0]?.id || ''
  );
  const [replyInput, setReplyInput] = useState('');
  const [replies, setReplies] = useState<Record<string, string[]>>({});

  const selectedChat = messages.find((m) => m.id === selectedChatId) || messages[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedChat) return;

    setReplies((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), replyInput.trim()],
    }));
    setReplyInput('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                WhatsApp Business Customer Care
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>+1 (415) 890-2341 (Verified)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Client steering groups, direct WhatsApp customer care tickets, and delivery chats
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onConfigureWhatsApp && (
            <button
              type="button"
              onClick={onConfigureWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>WhatsApp Settings</span>
            </button>
          )}

          {onSimulateWhatsAppPing && (
            <button
              type="button"
              onClick={onSimulateWhatsAppPing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Simulate receiving a new client message in WhatsApp"
            >
              <span>Simulate WhatsApp Ping</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewMessageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New WhatsApp Thread</span>
          </button>
        </div>
      </div>

      {/* Two-Pane WhatsApp Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
        {/* Left Pane: Chat Contacts (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Conversations ({messages.length})</span>
            <span className="text-[11px] text-emerald-700 font-medium">WhatsApp Connected</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[620px]">
            {messages.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-l-3 border-emerald-600'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {chat.sender}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(chat.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {chat.rawText}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {chat.senderContact?.split('·')[0]}
                    </span>
                    {chat.status === 'distilled' && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        AI Analyzed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: WhatsApp Chat Window & AI Action Bar (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl flex flex-col justify-between shadow-2xs overflow-hidden">
          {selectedChat ? (
            <>
              {/* Chat Window Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedChat.sender.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {selectedChat.sender}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Active Customer Thread
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDistillMessage(selectedChat)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                  <span>
                    {selectedChat.status === 'distilled'
                      ? 'Review AI Analysis'
                      : 'AI Explain & Action'}
                  </span>
                </button>
              </div>

              {/* Chat Message Bubble History */}
              <div className="flex-1 p-4 bg-[#EFEAE2]/30 overflow-y-auto space-y-3 min-h-[350px] max-h-[420px]">
                {/* Incoming Message Bubble */}
                <div className="flex items-start max-w-md">
                  <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-2xs border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-emerald-800 block mb-1">
                      {selectedChat.sender}
                    </span>
                    {selectedChat.rawText}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                      <span>
                        {new Date(selectedChat.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Sent Replies */}
                {(replies[selectedChat.id] || []).map((reply, idx) => (
                  <div key={idx} className="flex items-end justify-end">
                    <div className="bg-[#D9FDD3] text-slate-900 rounded-2xl rounded-tr-xs p-3 shadow-2xs max-w-sm text-xs leading-relaxed">
                      {reply}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-700">
                        <span>Just now</span>
                        <CheckCheck className="w-3 h-3 text-emerald-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type a WhatsApp response..."
                  className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select a WhatsApp conversation to open the chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
