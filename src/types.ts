export type ChannelType = 'email' | 'sms' | 'whatsapp' | 'call_transcript' | 'slack' | 'manual';

export type ActiveView =
  | 'all_inbox'
  | 'emails'
  | 'whatsapp'
  | 'sms'
  | 'slack'
  | 'calls'
  | 'today'
  | 'calendar'
  | 'see_later'
  | 'connectors';

export type TaskTriageState = 'today' | 'upcoming' | 'next_checked' | 'see_later' | 'completed';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitials: string;
  avatarUrl?: string;
  isEmailMasked: boolean;
  isPrivateWorkspace: boolean;
  connectedGmail?: boolean;
  isGoogleAuthenticated?: boolean;
  lastGmailSync?: number;
}

export interface ExtractedTask {
  id: string;
  task: string;
  assignee?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  sourceQuote?: string;
  isSuggested?: boolean;
  triageState?: TaskTriageState;
  scheduledDate?: string;
}

export interface DeadlineItem {
  dateOrTime: string;
  description: string;
}

export interface DeadlinesData {
  hasDeadline: boolean;
  deadlineSummary: string;
  items: DeadlineItem[];
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  originalText: string;
  title: string;
  oneSentenceSummary: string;
  keyFacts: string[];
  deadlines: DeadlinesData;
  ambiguities: string[];
  tasks: ExtractedTask[];
  suggestedNextSteps: string[];
  evidenceSnippets: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  oneSentenceSummary: string;
  taskCount: number;
  completedTaskCount: number;
  hasDeadline: boolean;
  deadlineSummary?: string;
  result: AnalysisResult;
}

export interface OfficeMessage {
  id: string;
  channel: ChannelType;
  sender: string;
  senderContact?: string;
  timestamp: number;
  subject?: string;
  rawText: string;
  status: 'unread' | 'distilled' | 'archived';
  analysisResult?: AnalysisResult;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  dateStr: string;
  timeStr?: string;
  sourceMessageId?: string;
  channel: ChannelType;
  description: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface SeeLaterItem {
  id: string;
  title: string;
  reason: string;
  snoozedUntil?: string;
  triageState: 'next_checked' | 'see_later';
  sourceChannel?: ChannelType;
  sourceMessageId?: string;
  createdAt: number;
  sourceQuote?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ConnectorConfig {
  id: ChannelType;
  name: string;
  description: string;
  connected: boolean;
  lastSync: number;
  unreadCount: number;
  iconName: string;
  accountIdentifier?: string;
  syncStatus?: 'synced' | 'connecting' | 'idle' | 'error';
  configDetails?: Record<string, any>;
}

export interface SamplePreset {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
}
