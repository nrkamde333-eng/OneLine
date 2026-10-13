import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  Calendar,
  Clock,
  Radio,
  Plus,
  RotateCcw,
  Smartphone,
  MessageSquare,
  Mail,
  PhoneCall,
  Shield,
  Eye,
  EyeOff,
  User,
  ExternalLink,
} from 'lucide-react';
import { ActiveView, ConnectorConfig, UserProfile } from '../types.ts';
import { maskEmail } from '../utils/authStorage.ts';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onToggleMasking: () => void;
  emailCount: number;
  whatsappCount: number;
  smsCount: number;
  slackCount: number;
  callsCount: number;
  allInboxCount: number;
  todayTaskCount: number;
  upcomingEventCount: number;
  seeLaterCount: number;
  connectors: ConnectorConfig[];
  onOpenNewMessage: () => void;
  onResetDefaults: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  currentUser,
  onOpenAuthModal,
  onToggleMasking,
  emailCount,
  whatsappCount,
  smsCount,
  slackCount,
  callsCount,
  allInboxCount,
  todayTaskCount,
  upcomingEventCount,
  seeLaterCount,
  connectors,
  onOpenNewMessage,
  onResetDefaults,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  // Group 1: Communication Channels (Email, Slack, WhatsApp, SMS, VoIP, All Feeds)
  const communicationChannels = [
    {
      id: 'emails' as ActiveView,
      label: 'Gmail & Email',
      icon: Mail,
      count: emailCount,
      countColor: 'bg-violet-100 text-violet-800',
      description: 'Google Workspace & Inbound Emails',
    },
    {
      id: 'slack' as ActiveView,
      label: 'Slack Channels',
      icon: MessageSquare,
      count: slackCount,
      countColor: 'bg-emerald-100 text-emerald-950',
      description: 'Acme Corp Slack Workspace & Threads',
    },
    {
      id: 'whatsapp' as ActiveView,
      label: 'WhatsApp Care',
      icon: MessageSquare,
      count: whatsappCount,
      countColor: 'bg-emerald-100 text-emerald-800',
      description: 'Customer Care & WhatsApp Web',
    },
    {
      id: 'sms' as ActiveView,
      label: 'Google SMS & Pager',
      icon: Smartphone,
      count: smsCount,
      countColor: 'bg-amber-100 text-amber-800',
      description: 'Google Messages, Android SMS & Alerts',
    },
    {
      id: 'calls' as ActiveView,
      label: 'VoIP Phone Calls',
      icon: PhoneCall,
      count: callsCount,
      countColor: 'bg-indigo-100 text-indigo-800',
      description: 'Transcripts & Recordings',
    },
    {
      id: 'all_inbox' as ActiveView,
      label: 'Unified Inbox Feed',
      icon: Inbox,
      count: allInboxCount,
      countColor: 'bg-slate-100 text-slate-800',
      description: 'All Channels Stream',
    },
  ];

  // Group 2: Action, Schedule & Follow-up
  const workflowViews = [
    {
      id: 'today' as ActiveView,
      label: "Today's Tasks",
      icon: CheckCircle2,
      count: todayTaskCount,
      countColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'calendar' as ActiveView,
      label: 'Calendar & Deadlines',
      icon: Calendar,
      count: upcomingEventCount,
      countColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'see_later' as ActiveView,
      label: 'See Later / Watch',
      icon: Clock,
      count: seeLaterCount,
      countColor: 'bg-amber-100 text-amber-800',
    },
  ];

  const handleResetClick = () => {
    if (confirmReset) {
      onResetDefaults();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen shrink-0 select-none">
      {/* Brand & Workspace Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            1L
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              OneLine AI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              Unified Communications Hub
            </p>
          </div>
        </div>
      </div>

      {/* Primary Ingest CTA */}
      <div className="p-3">
        <button
          type="button"
          onClick={onOpenNewMessage}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest & Distill Message</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-1 space-y-4 overflow-y-auto">
        {/* 1. Dedicated Communication Channels */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
            Communication Channels
          </span>
          <div className="space-y-0.5 mt-1">
            {communicationChannels.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-violet-50 text-violet-950 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={item.description}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-violet-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums font-semibold shrink-0 ${item.countColor}`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Tasks & Deadlines (Full Primary Workspace Views) */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
            Actions & Schedule
          </span>
          <div className="space-y-0.5 mt-1">
            {workflowViews.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-violet-50 text-violet-950 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-violet-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums font-semibold shrink-0 ${item.countColor}`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Connectors & Integrations */}
        <div>
          <button
            type="button"
            onClick={() => onViewChange('connectors')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
              activeView === 'connectors'
                ? 'bg-violet-50 text-violet-950 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Radio
                className={`w-4 h-4 shrink-0 ${
                  activeView === 'connectors' ? 'text-violet-700' : 'text-slate-400'
                }`}
              />
              <span className="truncate">Connectors Hub</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
              {connectors.filter((c) => c.connected).length}/{connectors.length}
            </span>
          </button>
        </div>
      </nav>

      {/* User Account & Privacy Card */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/70">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-500/20 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-violet-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.avatarInitials}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                    {currentUser.name}
                  </span>
                  {currentUser.isGoogleAuthenticated && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1 rounded font-bold shrink-0">
                      Gmail
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono block truncate leading-tight mt-0.5">
                  {currentUser.isEmailMasked
                    ? maskEmail(currentUser.email)
                    : currentUser.email}
                </span>
              </div>
            </div>

            {/* Mask/Unmask toggle */}
            <button
              type="button"
              onClick={onToggleMasking}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title={
                currentUser.isEmailMasked
                  ? 'Email is masked for privacy. Click to reveal.'
                  : 'Click to mask email from others.'
              }
            >
              {currentUser.isEmailMasked ? (
                <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Shield className="w-3 h-3" />
              <span>Isolated Private</span>
            </span>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-violet-700 font-semibold hover:underline cursor-pointer"
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Demo reset button */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="font-mono">Oct 2026</span>
          <button
            type="button"
            onClick={handleResetClick}
            className={`flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${
              confirmReset
                ? 'bg-rose-100 text-rose-800 font-bold'
                : 'hover:text-slate-700'
            }`}
            title="Reset sample feeds and schedule to initial state"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{confirmReset ? 'Confirm Reset?' : 'Reset demo'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
