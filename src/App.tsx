/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { RightUtilityPanel } from './components/RightUtilityPanel.tsx';
import { InboxView } from './components/views/InboxView.tsx';
import { EmailsView } from './components/views/EmailsView.tsx';
import { WhatsAppView } from './components/views/WhatsAppView.tsx';
import { SmsView } from './components/views/SmsView.tsx';
import { CallsView } from './components/views/CallsView.tsx';
import { TodayView } from './components/views/TodayView.tsx';
import { CalendarView } from './components/views/CalendarView.tsx';
import { SeeLaterView } from './components/views/SeeLaterView.tsx';
import { ConnectorsView } from './components/views/ConnectorsView.tsx';
import { SlackView } from './components/views/SlackView.tsx';
import { DistillModal } from './components/DistillModal.tsx';
import { NewMessageModal } from './components/NewMessageModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ConnectorModal } from './components/ConnectorModal.tsx';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Shield,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  OfficeMessage,
  ScheduledEvent,
  SeeLaterItem,
  ConnectorConfig,
  ExtractedTask,
  AnalysisResult,
  ChannelType,
  ActiveView,
  UserProfile,
} from './types.ts';
import {
  loadOfficeMessages,
  saveOfficeMessages,
  loadScheduledEvents,
  saveScheduledEvents,
  loadSeeLaterItems,
  saveSeeLaterItems,
  loadConnectors,
  saveConnectors,
  loadAllTasks,
  saveAllTasks,
} from './utils/officeStorage.ts';
import {
  getCurrentUser,
  setCurrentUser,
  getRegisteredUsers,
  signInWithEmail,
  toggleEmailMasking,
  maskEmail,
} from './utils/authStorage.ts';
import { getAccessToken } from './utils/firebaseAuth.ts';
import { fetchGmailInboxMessages } from './utils/gmailService.ts';
import { INITIAL_DEMO_RESULT } from './data/initialDemoResult.ts';

export default function App() {
  // Current user authentication & privacy state
  const [currentUser, setCurUser] = useState<UserProfile>(() => getCurrentUser());
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() =>
    getRegisteredUsers()
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState<boolean>(false);

  // Active navigation view (defaulting to emails or all_inbox)
  const [activeView, setActiveView] = useState<ActiveView>('emails');
  const [inboxChannelFilter, setInboxChannelFilter] = useState<ChannelType | 'all'>('all');

  // User-isolated communication & workflow data
  const [messages, setMessages] = useState<OfficeMessage[]>(() =>
    loadOfficeMessages(currentUser.email)
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(() => {
    const list = loadOfficeMessages(currentUser.email);
    return list[0]?.id || null;
  });
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>(() =>
    loadScheduledEvents(currentUser.email)
  );
  const [seeLaterItems, setSeeLaterItems] = useState<SeeLaterItem[]>(() =>
    loadSeeLaterItems(currentUser.email)
  );
  const [connectors, setConnectors] = useState<ConnectorConfig[]>(() =>
    loadConnectors(currentUser.email)
  );
  const [todayTasks, setTodayTasks] = useState<ExtractedTask[]>(() => {
    const saved = loadAllTasks(currentUser.email);
    return saved.length > 0 ? saved : INITIAL_DEMO_RESULT.tasks;
  });

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-13');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeAnalysisResult, setActiveAnalysisResult] = useState<AnalysisResult | null>(
    () => INITIAL_DEMO_RESULT
  );
  const [isDistillModalOpen, setIsDistillModalOpen] = useState<boolean>(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState<boolean>(false);
  const [configuredConnectorId, setConfiguredConnectorId] = useState<ChannelType | null>(null);

  const handleOpenConnectorModal = (id: ChannelType) => {
    setConfiguredConnectorId(id);
    setIsConnectorModalOpen(true);
  };

  // Responsive right panel toggle (default false so user gets full unobstructed workspace view)
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);

  // When current user changes (switch account / sign in), reload their isolated data
  const handleUserChange = (newUser: UserProfile) => {
    setCurUser(newUser);
    setCurrentUser(newUser);
    setRegisteredUsers(getRegisteredUsers());

    // Load user's private data
    const userMsgs = loadOfficeMessages(newUser.email);
    const userEvents = loadScheduledEvents(newUser.email);
    const userLater = loadSeeLaterItems(newUser.email);
    const userConn = loadConnectors(newUser.email);
    const userTasks = loadAllTasks(newUser.email);

    setMessages(userMsgs);
    setSelectedMessageId(userMsgs[0]?.id || null);
    setScheduledEvents(userEvents);
    setSeeLaterItems(userLater);
    setConnectors(userConn);
    setTodayTasks(userTasks.length > 0 ? userTasks : INITIAL_DEMO_RESULT.tasks);

    showToast(
      `Private workspace loaded for ${
        newUser.isEmailMasked ? maskEmail(newUser.email) : newUser.email
      }`
    );
  };

  // Sync state to local storage under current user's isolated partition
  useEffect(() => {
    saveOfficeMessages(messages, currentUser.email);
  }, [messages, currentUser.email]);

  useEffect(() => {
    saveScheduledEvents(scheduledEvents, currentUser.email);
  }, [scheduledEvents, currentUser.email]);

  useEffect(() => {
    saveSeeLaterItems(seeLaterItems, currentUser.email);
  }, [seeLaterItems, currentUser.email]);

  useEffect(() => {
    saveConnectors(connectors, currentUser.email);
  }, [connectors, currentUser.email]);

  useEffect(() => {
    saveAllTasks(todayTasks, currentUser.email);
  }, [todayTasks, currentUser.email]);

  // Live polling for inbound messages arriving via real webhooks (Slack, WhatsApp, SMS)
  useEffect(() => {
    let lastPolledTime = Date.now();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/webhooks/messages?since=${lastPolledTime}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            lastPolledTime = Date.now();
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newIncoming: OfficeMessage[] = data.messages
                .filter((m: any) => !existingIds.has(m.id))
                .map((m: any) => ({
                  id: m.id,
                  channel: m.channel,
                  sender: m.sender,
                  senderContact: m.senderContact,
                  timestamp: m.timestamp || Date.now(),
                  subject: m.subject || `${m.channel.toUpperCase()} Inbound`,
                  rawText: m.rawText,
                  status: 'unread' as const,
                }));

              if (newIncoming.length > 0) {
                showToast(`New live ${newIncoming[0].channel.toUpperCase()} message received!`);
                return [...newIncoming, ...prev];
              }
              return prev;
            });
          }
        }
      } catch {
        // Silently ignore background polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Privacy: Toggle email masking across the app
  const handleToggleMasking = () => {
    const updated = toggleEmailMasking(currentUser);
    setCurUser(updated);
    showToast(
      updated.isEmailMasked
        ? 'Privacy Shield ON: Email addresses masked'
        : 'Privacy Shield OFF: Email addresses visible'
    );
  };

  // Sign in with new email
  const handleSignIn = (
    email: string,
    name?: string,
    role?: string,
    maskEmailVal: boolean = true
  ) => {
    const user = signInWithEmail(email, name, role, maskEmailVal);
    handleUserChange(user);
  };

  // Switch between already registered users
  const handleSwitchUser = (user: UserProfile) => {
    handleUserChange(user);
  };

  // Real Gmail data loaded via Google OAuth or API sync
  const handleGmailDataLoaded = (
    updatedUser: UserProfile,
    newGmailMessages: OfficeMessage[]
  ) => {
    setCurUser(updatedUser);
    setCurrentUser(updatedUser);
    setRegisteredUsers(getRegisteredUsers());

    if (newGmailMessages.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const incoming = newGmailMessages.filter((m) => !existingIds.has(m.id));
        const merged = [...incoming, ...prev];
        saveOfficeMessages(merged, updatedUser.email);
        return merged;
      });
      setSelectedMessageId(newGmailMessages[0]?.id || null);
    }

    setConnectors((prev) =>
      prev.map((c) =>
        c.id === 'email'
          ? {
              ...c,
              connected: true,
              lastSync: Date.now(),
              unreadCount: newGmailMessages.filter((m) => m.status === 'unread').length,
            }
          : c
      )
    );

    setActiveView('emails');
    showToast(
      `Loaded ${newGmailMessages.length} Gmail messages for ${
        updatedUser.isEmailMasked ? maskEmail(updatedUser.email) : updatedUser.email
      }`
    );
  };

  // Sync recent Gmail inbox messages directly
  const handleSyncGmail = async () => {
    setIsSyncingGmail(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsAuthModalOpen(true);
        return;
      }

      const fetched = await fetchGmailInboxMessages(token, 15);
      handleGmailDataLoaded(currentUser, fetched);
    } catch (err: any) {
      console.error('Failed to sync Gmail inbox:', err);
      showToast(err?.message || 'Failed to sync Gmail inbox. Re-authorization may be needed.');
      setIsAuthModalOpen(true);
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const handleGoogleLogout = () => {
    const updated = {
      ...currentUser,
      isGoogleAuthenticated: false,
    };
    setCurUser(updated);
    setCurrentUser(updated);
    setRegisteredUsers(getRegisteredUsers());
    showToast('Signed out of Google session');
  };

  // Distill an office message via Gemini API
  const handleDistillMessage = async (msg: OfficeMessage) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.rawText }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to distill message.');
      }

      const result: AnalysisResult = data.data;
      setActiveAnalysisResult(result);

      // Update message status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, status: 'distilled', analysisResult: result }
            : m
        )
      );

      // Open distillation modal to inspect outcomes & triage
      setIsDistillModalOpen(true);
      showToast(`Distilled: "${result.title}"`);
    } catch (err: any) {
      console.error('Distill error:', err);
      showToast(err?.message || 'Error communicating with AI engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Ingest manual new message
  const handleIngestNewMessage = (
    channel: ChannelType,
    sender: string,
    rawText: string
  ) => {
    const newMsg: OfficeMessage = {
      id: `msg-custom-${Date.now()}`,
      channel,
      sender,
      timestamp: Date.now(),
      subject: `${channel.toUpperCase()} Inbound Item`,
      rawText,
      status: 'unread',
    };

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
    setIsNewMessageModalOpen(false);

    // Route directly to that channel's view
    if (channel === 'email') setActiveView('emails');
    else if (channel === 'slack') setActiveView('slack');
    else if (channel === 'whatsapp') setActiveView('whatsapp');
    else if (channel === 'sms') setActiveView('sms');
    else if (channel === 'call_transcript') setActiveView('calls');
    else setActiveView('all_inbox');

    showToast(`New ${channel.toUpperCase()} message added to private queue`);
    handleDistillMessage(newMsg);
  };

  // Task Management
  const handleCommitTasksToToday = (tasks: ExtractedTask[]) => {
    setTodayTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newTasks = tasks.filter((t) => !existingIds.has(t.id));
      return [...newTasks, ...prev];
    });
    showToast(`Added ${tasks.length} task(s) to Today's Focus`);
  };

  const handleToggleTask = (taskId: string) => {
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ExtractedTask>) => {
    setTodayTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task removed from queue');
  };

  const handleAddTask = (newTask: Omit<ExtractedTask, 'id'>) => {
    const task: ExtractedTask = {
      ...newTask,
      id: `task-manual-${Date.now()}`,
    };
    setTodayTasks((prev) => [task, ...prev]);
    showToast('Task added to Today');
  };

  const handleMoveTaskToSeeLater = (task: ExtractedTask) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== task.id));
    const seeLaterItem: SeeLaterItem = {
      id: `later-${Date.now()}`,
      title: task.task,
      reason: 'Moved from Today: pending confirmation of requirements.',
      triageState: 'see_later',
      createdAt: Date.now(),
      snoozedUntil: '2026-10-19',
      priority: task.priority || 'medium',
    };
    setSeeLaterItems((prev) => [seeLaterItem, ...prev]);
    showToast('Task quarantined in See Later tray');
  };

  const handleMoveTaskToCalendar = (task: ExtractedTask, dateStr: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== task.id));
    const event: ScheduledEvent = {
      id: `event-${Date.now()}`,
      title: task.task,
      dateStr,
      channel: 'manual',
      description: task.sourceQuote || 'Scheduled from Today queue',
      isCompleted: false,
      priority: task.priority,
    };
    setScheduledEvents((prev) => [...prev, event]);
    showToast(`Scheduled for ${dateStr}`);
  };

  // Schedule & Calendar
  const handleScheduleDeadline = (
    title: string,
    dateStr: string,
    timeStr?: string,
    desc?: string
  ) => {
    const newEvent: ScheduledEvent = {
      id: `event-${Date.now()}`,
      title,
      dateStr,
      timeStr,
      channel: 'manual',
      description: desc || 'Extracted deadline',
      isCompleted: false,
      priority: 'high',
    };
    setScheduledEvents((prev) => [...prev, newEvent]);
    showToast(`Added to Calendar (${dateStr})`);
  };

  const handleToggleEvent = (eventId: string) => {
    setScheduledEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e
      )
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    setScheduledEvents((prev) => prev.filter((e) => e.id !== eventId));
    showToast('Event removed from schedule');
  };

  const handleAddEvent = (event: Omit<ScheduledEvent, 'id'>) => {
    const newEvent: ScheduledEvent = {
      ...event,
      id: `event-manual-${Date.now()}`,
    };
    setScheduledEvents((prev) => [...prev, newEvent]);
    showToast('Event added to schedule');
  };

  // See Later / Next Checked Handlers
  const handleMoveAmbiguityToSeeLater = (
    title: string,
    reason: string,
    quote?: string
  ) => {
    const item: SeeLaterItem = {
      id: `later-amb-${Date.now()}`,
      title,
      reason,
      triageState: 'next_checked',
      createdAt: Date.now(),
      sourceQuote: quote,
      snoozedUntil: '2026-10-16',
    };
    setSeeLaterItems((prev) => [item, ...prev]);
    showToast('Added to Next Checked tray');
  };

  const handlePromoteSeeLaterToToday = (item: SeeLaterItem) => {
    setSeeLaterItems((prev) => prev.filter((i) => i.id !== item.id));
    const task: ExtractedTask = {
      id: `task-promoted-${Date.now()}`,
      task: item.title,
      priority: item.priority || 'medium',
      completed: false,
      triageState: 'today',
      sourceQuote: item.sourceQuote,
    };
    setTodayTasks((prev) => [task, ...prev]);
    showToast('Promoted to Today focus');
  };

  const handlePromoteSeeLaterToCalendar = (
    item: SeeLaterItem,
    dateStr: string
  ) => {
    setSeeLaterItems((prev) => prev.filter((i) => i.id !== item.id));
    const event: ScheduledEvent = {
      id: `event-from-later-${Date.now()}`,
      title: item.title,
      dateStr,
      channel: item.sourceChannel || 'manual',
      description: item.reason,
      isCompleted: false,
      priority: item.priority || 'medium',
    };
    setScheduledEvents((prev) => [...prev, event]);
    showToast(`Scheduled for ${dateStr}`);
  };

  const handleSnoozeSeeLater = (itemId: string, newDateStr: string) => {
    setSeeLaterItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, snoozedUntil: newDateStr } : i
      )
    );
    showToast(`Snoozed until ${newDateStr}`);
  };

  const handleDeleteSeeLater = (itemId: string) => {
    setSeeLaterItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item resolved and removed');
  };

  const handleUpdateSeeLaterPriority = (
    itemId: string,
    newPriority: 'high' | 'medium' | 'low'
  ) => {
    setSeeLaterItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, priority: newPriority } : i))
    );
    showToast(`Priority updated to ${newPriority.toUpperCase()}`);
  };

  const handleAddSeeLaterItem = (
    item: Omit<SeeLaterItem, 'id' | 'createdAt'>
  ) => {
    const newItem: SeeLaterItem = {
      ...item,
      priority: item.priority || 'medium',
      id: `later-manual-${Date.now()}`,
      createdAt: Date.now(),
    };
    setSeeLaterItems((prev) => [newItem, ...prev]);
    showToast('Added to watch tray');
  };

  // Connectors Simulation
  const handleToggleConnector = (id: ChannelType) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
    showToast(`Toggled ${id.toUpperCase()} connector status`);
  };

  const handleSimulateInbound = (channel: ChannelType) => {
    const sampleTexts: Record<string, { sender: string; text: string }> = {
      slack: {
        sender: 'Marcus Chen (#infra-migration)',
        text: '@channel Marcus Chen: Standup reminder for Postgres cluster failover. Health check begins at 15:00 UTC Friday. Ping with blockers ASAP. Front-end team please merge banner to staging before 17:00 UTC Thursday.',
      },
      whatsapp: {
        sender: 'Global Retail Steering Group',
        text: 'Sarah Jenkins: Reminder team, we need the signed SOW by 5 PM EST on Friday. Please ensure procurement is looped in.',
      },
      sms: {
        sender: '+1 (800) 555-0199',
        text: 'PagerDuty Alert: Secondary Postgres failover readiness test scheduled for Thursday 14:00 UTC. Confirm test script execution.',
      },
      email: {
        sender: 'Elena Rostova <elena.r@enterprise.internal>',
        text: 'Final check on Celery worker pause at 01:45 UTC Saturday. Marcus Chen please acknowledge read replica verification.',
      },
      call_transcript: {
        sender: 'Engineering All-Hands Zoom',
        text: 'Kenneth Patel: "All diagramming licenses discontinue Friday. Transition any remaining mockups to FigJam today."',
      },
    };

    const payload = sampleTexts[channel] || {
      sender: 'Customer Dispatch',
      text: 'Action required: Please review project timeline and respond before end of day.',
    };

    const newMsg: OfficeMessage = {
      id: `msg-sim-${Date.now()}`,
      channel,
      sender: payload.sender,
      timestamp: Date.now(),
      subject: `Inbound ${channel.toUpperCase()} Sync`,
      rawText: payload.text,
      status: 'unread',
    };

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === channel
          ? { ...c, lastSync: Date.now(), unreadCount: c.unreadCount + 1 }
          : c
      )
    );

    // Switch view directly to the channel
    if (channel === 'email') setActiveView('emails');
    else if (channel === 'slack') setActiveView('slack');
    else if (channel === 'whatsapp') setActiveView('whatsapp');
    else if (channel === 'sms') setActiveView('sms');
    else if (channel === 'call_transcript') setActiveView('calls');

    showToast(`New ${channel.toUpperCase()} message received!`);
  };

  const handleResetDefaults = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'emails':
        return 'Customer Care & Business Emails';
      case 'slack':
        return 'Slack Channels & Team Discussions';
      case 'whatsapp':
        return 'WhatsApp Business Care & Chat Threads';
      case 'sms':
        return 'Google SMS & Incident Pager Alerts';
      case 'calls':
        return 'VoIP Calls & Audio Meeting Transcripts';
      case 'all_inbox':
        return 'Unified Multi-Channel Communications Feed';
      case 'today':
        return "Today's Commitments & Action Queue";
      case 'calendar':
        return 'Calendar Deadlines & Milestones';
      case 'see_later':
        return 'See Later & Next Checked Tray';
      case 'connectors':
        return 'Connectors Hub & Channel Integrations';
      default:
        return 'Unified Communications';
    }
  };

  // Granular counts for sidebar items
  const emailMessages = messages.filter((m) => m.channel === 'email');
  const slackMessages = messages.filter((m) => m.channel === 'slack');
  const whatsappMessages = messages.filter((m) => m.channel === 'whatsapp');
  const smsMessages = messages.filter((m) => m.channel === 'sms');
  const callsMessages = messages.filter((m) => m.channel === 'call_transcript');

  return (
    <div className="flex h-screen bg-[#FBFBFC] text-slate-800 font-sans antialiased overflow-hidden">
      {/* 1. Left SaaS Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleMasking={handleToggleMasking}
        emailCount={emailMessages.filter((m) => m.status === 'unread').length}
        slackCount={slackMessages.filter((m) => m.status === 'unread').length}
        whatsappCount={whatsappMessages.filter((m) => m.status === 'unread').length}
        smsCount={smsMessages.filter((m) => m.status === 'unread').length}
        callsCount={callsMessages.filter((m) => m.status === 'unread').length}
        allInboxCount={messages.filter((m) => m.status === 'unread').length}
        todayTaskCount={todayTasks.filter((t) => !t.completed).length}
        upcomingEventCount={scheduledEvents.filter((e) => !e.isCompleted).length}
        seeLaterCount={seeLaterItems.length}
        connectors={connectors}
        onOpenNewMessage={() => setIsNewMessageModalOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* 2. Main Workspace Center Viewport */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto">
        {/* Top Header Bar for Workspace */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 font-medium">Workspaces</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {getViewTitle()}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* User Account & Privacy Shield Pill */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-violet-900 transition-colors cursor-pointer"
                title="Account profile and privacy settings"
              >
                <div className="w-5 h-5 rounded-md bg-violet-800 text-white flex items-center justify-center font-bold text-[10px]">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span>
                    {currentUser.isEmailMasked
                      ? maskEmail(currentUser.email)
                      : currentUser.email}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-sans font-bold bg-emerald-100/80 px-1 py-0.2 rounded ml-1">
                    🔒 Private
                  </span>
                </div>
              </button>

              {/* Fast Privacy Masking Toggle */}
              <button
                type="button"
                onClick={handleToggleMasking}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer ml-1"
                title={
                  currentUser.isEmailMasked
                    ? 'Email is masked for privacy. Click to show full email.'
                    : 'Click to mask email from other users.'
                }
              >
                {currentUser.isEmailMasked ? (
                  <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Quick Companion Drawer Toggle (Default closed, accessible on demand) */}
            <button
              type="button"
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showRightPanel
                  ? 'bg-violet-50 text-violet-900 border-violet-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={showRightPanel ? 'Hide quick side panel' : 'Open quick side panel'}
            >
              {showRightPanel ? (
                <PanelRightClose className="w-3.5 h-3.5 text-violet-700" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline">Quick Companion</span>
            </button>
          </div>
        </header>

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="sticky top-14 z-40 mx-auto max-w-sm px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-lg text-center animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Full Primary Workspace Viewports */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {/* 1. Dedicated Emails Workspace */}
          {activeView === 'emails' && (
            <EmailsView
              emails={emailMessages}
              onDistillEmail={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
              currentUser={currentUser}
              onSyncGmail={handleSyncGmail}
              onConnectGmail={() => setIsAuthModalOpen(true)}
              isSyncingGmail={isSyncingGmail}
            />
          )}

          {/* 2. Dedicated Slack Workspace */}
          {activeView === 'slack' && (
            <SlackView
              messages={messages}
              onDistillMessage={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
              onSimulateSlackPing={() => handleSimulateInbound('slack')}
              onConfigureSlack={() => handleOpenConnectorModal('slack')}
            />
          )}

          {/* 3. Dedicated WhatsApp Business Workspace */}
          {activeView === 'whatsapp' && (
            <WhatsAppView
              messages={whatsappMessages}
              onDistillMessage={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
              onConfigureWhatsApp={() => handleOpenConnectorModal('whatsapp')}
              onSimulateWhatsAppPing={() => handleSimulateInbound('whatsapp')}
            />
          )}

          {/* 4. Dedicated Google SMS & Messages Workspace */}
          {activeView === 'sms' && (
            <SmsView
              messages={smsMessages}
              onDistillMessage={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
              onConfigureSms={() => handleOpenConnectorModal('sms')}
              onSimulateSmsPing={() => handleSimulateInbound('sms')}
            />
          )}

          {/* 5. Dedicated VoIP Calls Workspace */}
          {activeView === 'calls' && (
            <CallsView
              messages={callsMessages}
              onDistillMessage={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
            />
          )}

          {/* 6. Unified All Channels Inbox Feed */}
          {activeView === 'all_inbox' && (
            <InboxView
              messages={messages}
              selectedMessageId={selectedMessageId}
              onSelectMessage={(msg) => setSelectedMessageId(msg.id)}
              channelFilter={inboxChannelFilter}
              onChannelFilterChange={setInboxChannelFilter}
              onDistillMessage={handleDistillMessage}
              isAnalyzing={isAnalyzing}
              onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
            />
          )}

          {/* 7. Today's Tasks Full Primary View */}
          {activeView === 'today' && (
            <TodayView
              tasks={todayTasks}
              onToggleTask={handleToggleTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onMoveToSeeLater={handleMoveTaskToSeeLater}
              onMoveToCalendar={handleMoveTaskToCalendar}
            />
          )}

          {/* 8. Calendar & Deadlines Full Primary View */}
          {activeView === 'calendar' && (
            <CalendarView
              events={scheduledEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleEvent={handleToggleEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddEvent={handleAddEvent}
            />
          )}

          {/* 9. See Later / Next Checked Full Primary View */}
          {activeView === 'see_later' && (
            <SeeLaterView
              items={seeLaterItems}
              onPromoteToToday={handlePromoteSeeLaterToToday}
              onPromoteToCalendar={handlePromoteSeeLaterToCalendar}
              onSnoozeItem={handleSnoozeSeeLater}
              onDeleteItem={handleDeleteSeeLater}
              onAddItem={handleAddSeeLaterItem}
              onUpdatePriority={handleUpdateSeeLaterPriority}
            />
          )}

          {/* 10. Connectors & Integrations Hub */}
          {activeView === 'connectors' && (
            <ConnectorsView
              connectors={connectors}
              onToggleConnector={handleToggleConnector}
              onSimulateInbound={handleSimulateInbound}
              onOpenConnectorModal={handleOpenConnectorModal}
              onSyncGmail={handleSyncGmail}
              isSyncingGmail={isSyncingGmail}
              userEmail={currentUser.email}
            />
          )}
        </main>
      </div>

      {/* 3. Optional Right Utility Panel (Drawer) */}
      {showRightPanel && (
        <RightUtilityPanel
          todayTasks={todayTasks}
          scheduledEvents={scheduledEvents}
          seeLaterItems={seeLaterItems}
          onToggleTask={handleToggleTask}
          onSelectDate={(dateStr) => {
            setSelectedDate(dateStr);
            setActiveView('calendar');
          }}
          selectedDate={selectedDate}
          onOpenSeeLaterView={() => setActiveView('see_later')}
          onOpenCalendarView={() => setActiveView('calendar')}
          onClose={() => setShowRightPanel(false)}
        />
      )}

      {/* 4. Distill Modal (Outcome & Triage Engine) */}
      <DistillModal
        isOpen={isDistillModalOpen}
        onClose={() => setIsDistillModalOpen(false)}
        result={activeAnalysisResult}
        onCommitTasksToToday={handleCommitTasksToToday}
        onScheduleDeadline={handleScheduleDeadline}
        onMoveAmbiguityToSeeLater={handleMoveAmbiguityToSeeLater}
      />

      {/* 5. New Message Ingest Modal */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSubmit={handleIngestNewMessage}
        isAnalyzing={isAnalyzing}
      />

      {/* 6. Account Sign-In & Privacy Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        registeredUsers={registeredUsers}
        onSignIn={handleSignIn}
        onSwitchUser={handleSwitchUser}
        onToggleMasking={handleToggleMasking}
        onGmailDataLoaded={handleGmailDataLoaded}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* 7. Dedicated Connector Configuration Modal */}
      <ConnectorModal
        isOpen={isConnectorModalOpen}
        onClose={() => {
          setIsConnectorModalOpen(false);
          setConfiguredConnectorId(null);
        }}
        connectorId={configuredConnectorId}
        connectors={connectors}
        onToggleConnector={handleToggleConnector}
        onSimulateInbound={handleSimulateInbound}
        onSyncGmail={handleSyncGmail}
        isSyncingGmail={isSyncingGmail}
      />
    </div>
  );
}
