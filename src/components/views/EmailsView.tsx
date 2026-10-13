import React, { useState } from 'react';
import {
  Mail,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  Send,
  User,
  Paperclip,
  Check,
  Bot,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { OfficeMessage, UserProfile } from '../../types.ts';
import { maskEmail } from '../../utils/authStorage.ts';

interface EmailsViewProps {
  emails: OfficeMessage[];
  onDistillEmail: (email: OfficeMessage) => void;
  isAnalyzing: boolean;
  onOpenNewMessageModal: () => void;
  currentUser?: UserProfile;
  onSyncGmail?: () => void;
  onConnectGmail?: () => void;
  isSyncingGmail?: boolean;
}

export const EmailsView: React.FC<EmailsViewProps> = ({
  emails,
  onDistillEmail,
  isAnalyzing,
  onOpenNewMessageModal,
  currentUser,
  onSyncGmail,
  onConnectGmail,
  isSyncingGmail = false,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(
    emails[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [isDraftingReply, setIsDraftingReply] = useState(false);
  const [sentReplies, setSentReplies] = useState<Record<string, string[]>>({});

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    setSentReplies((prev) => ({
      ...prev,
      [selectedEmail.id]: [...(prev[selectedEmail.id] || []), replyText.trim()],
    }));
    setReplyText('');
  };

  const handleAiDraftReply = () => {
    if (!selectedEmail) return;
    setIsDraftingReply(true);

    setTimeout(() => {
      let draft = '';
      if (selectedEmail.subject?.toLowerCase().includes('database') || selectedEmail.rawText.toLowerCase().includes('failover')) {
        draft = `Hi Elena,\n\nAcknowledging the planned Postgres maintenance window for this Saturday. Non-critical deployments will be frozen by Friday 18:00 UTC, and Marcus Chen has been notified to run the read replica verification checklist.\n\nBest regards,\n${currentUser?.name || 'Customer Care & Operations'}`;
      } else if (selectedEmail.subject?.toLowerCase().includes('contract') || selectedEmail.rawText.toLowerCase().includes('milestone')) {
        draft = `Hi Jonathan,\n\nWe received the steering committee update. We are preparing the amended SOW line item for the $24,500 adjustment and will have the draft submitted before Friday 5:00 PM EST as requested.\n\nBest regards,\n${currentUser?.name || 'Customer Care & Operations'}`;
      } else {
        draft = `Thank you for reaching out regarding "${selectedEmail.subject}". We have logged your request and prioritized the required action items. Our team will review the deadlines and confirm the schedule shortly.\n\nBest regards,\n${currentUser?.name || 'Customer Care & Operations'}`;
      }
      setReplyText(draft);
      setIsDraftingReply(false);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-800 flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Customer Care & Business Emails
              </h2>
              {currentUser?.isEmailMasked && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Privacy Shield Active</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {emails.length} active email threads with AI deadline and task extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.connectedGmail || currentUser?.isGoogleAuthenticated ? (
            <button
              type="button"
              onClick={onSyncGmail}
              disabled={isSyncingGmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
              title="Sync latest emails from your Gmail inbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGmail ? 'animate-spin' : ''}`} />
              <span>{isSyncingGmail ? 'Syncing Gmail...' : 'Sync Gmail Inbox'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectGmail}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Connect real Gmail account with Google OAuth"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Connect Gmail</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewMessageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Compose / Ingest</span>
          </button>
        </div>
      </div>

      {/* Two-Column Email Client */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
        {/* Left Column: Email Thread List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Inbox ({emails.length})</span>
            <span className="text-[11px] text-slate-400 font-mono">Sync Active</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[620px]">
            {emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-50/70 border-l-3 border-violet-900'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {email.sender.split('(')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(email.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-slate-700 truncate">
                    {email.subject || 'No Subject'}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {email.rawText}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    {email.id.startsWith('gmail-') && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        Gmail API
                      </span>
                    )}
                    {email.status === 'distilled' ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        ✓ AI Distilled
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Email Reading Pane & AI Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between shadow-2xs">
          {selectedEmail ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
                {/* Email Header */}
                <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">From:</span>
                      <span>{selectedEmail.sender}</span>
                      {selectedEmail.senderContact && (
                        <span className="text-slate-400 font-mono text-[11px]">
                          &lt;
                          {currentUser?.isEmailMasked
                            ? maskEmail(selectedEmail.senderContact)
                            : selectedEmail.senderContact}
                          &gt;
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {new Date(selectedEmail.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Email Body */}
                <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedEmail.rawText}
                </div>

                {/* Sent Replies History */}
                {(sentReplies[selectedEmail.id] || []).map((rep, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-violet-50/70 border border-violet-200 text-xs text-violet-950 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-violet-800 font-semibold">
                      <span>Reply from You ({currentUser?.isEmailMasked ? maskEmail(currentUser.email) : currentUser?.email || 'You'})</span>
                      <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{rep}</p>
                  </div>
                ))}

                {/* Inline Quick Reply Box */}
                <form onSubmit={handleSendReply} className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Reply to Sender
                    </span>
                    <button
                      type="button"
                      onClick={handleAiDraftReply}
                      disabled={isDraftingReply}
                      className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{isDraftingReply ? 'Drafting...' : 'AI Draft Reply'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a response or click 'AI Draft Reply'..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-violet-600 bg-white"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                <span className="text-[11px] text-slate-400 font-medium">
                  AI extracts 1-sentence crux, explicit deadlines & action queue
                </span>

                <button
                  type="button"
                  onClick={() => onDistillEmail(selectedEmail)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-900 hover:bg-violet-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
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
                        {selectedEmail.status === 'distilled'
                          ? 'Review / Re-Distill Email'
                          : 'Explain & Distill with AI'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400">
              Select an email thread from the left to read.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
