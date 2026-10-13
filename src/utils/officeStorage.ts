import { OfficeMessage, ScheduledEvent, SeeLaterItem, ConnectorConfig, ExtractedTask } from '../types.ts';
import {
  INITIAL_CONNECTORS,
  INITIAL_OFFICE_MESSAGES,
  INITIAL_SCHEDULED_EVENTS,
  INITIAL_SEE_LATER_ITEMS,
} from '../data/mockOfficeData.ts';

const BASE_KEYS = {
  MESSAGES: 'oneline_office_messages',
  SCHEDULE: 'oneline_office_schedule',
  SEE_LATER: 'oneline_office_see_later',
  CONNECTORS: 'oneline_office_connectors',
  TASKS: 'oneline_office_tasks',
};

function getKey(base: string, userEmail?: string): string {
  if (!userEmail) return base;
  const safeEmail = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${base}_${safeEmail}`;
}

export function loadOfficeMessages(userEmail?: string): OfficeMessage[] {
  try {
    const key = getKey(BASE_KEYS.MESSAGES, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // If primary user or first load, populate with initial demo messages
      if (!userEmail || userEmail === 'nrkamde333@gmail.com') {
        return INITIAL_OFFICE_MESSAGES;
      }
      // For any other new user, provide a clean isolated welcome message for their account
      const userWelcome: OfficeMessage[] = [
        {
          id: `msg-welcome-${Date.now()}`,
          channel: 'email',
          sender: `Account Setup Robot`,
          senderContact: 'setup@oneline-ai.internal',
          timestamp: Date.now(),
          subject: `Private Workspace Active for ${userEmail}`,
          rawText: `Welcome to your private OneLine AI workspace!\n\nThis workspace is end-to-end isolated for ${userEmail}. No other users or team members can access your emails, customer inquiries, calendar deadlines, or tasks.\n\nKey actions:\n1. Click "Distill New Message" or "Compose / Ingest Email" to import incoming client communications.\n2. Ingest WhatsApp, SMS, or VoIP transcripts directly from the sidebar.\n3. Turn on "Privacy Shield" in the top bar to mask your email address during presentations or shared screens.`,
          status: 'unread',
        },
      ];
      return userWelcome;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_OFFICE_MESSAGES;
    if (!parsed.some((m: any) => m.channel === 'slack')) {
      const defaultSlack = INITIAL_OFFICE_MESSAGES.filter((m) => m.channel === 'slack');
      return [...parsed, ...defaultSlack];
    }
    return parsed;
  } catch {
    return INITIAL_OFFICE_MESSAGES;
  }
}

export function saveOfficeMessages(messages: OfficeMessage[], userEmail?: string): void {
  try {
    const key = getKey(BASE_KEYS.MESSAGES, userEmail);
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save office messages', e);
  }
}

export function loadScheduledEvents(userEmail?: string): ScheduledEvent[] {
  try {
    const key = getKey(BASE_KEYS.SCHEDULE, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (!userEmail || userEmail === 'nrkamde333@gmail.com') {
        return INITIAL_SCHEDULED_EVENTS;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SCHEDULED_EVENTS;
  } catch {
    return INITIAL_SCHEDULED_EVENTS;
  }
}

export function saveScheduledEvents(events: ScheduledEvent[], userEmail?: string): void {
  try {
    const key = getKey(BASE_KEYS.SCHEDULE, userEmail);
    localStorage.setItem(key, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save scheduled events', e);
  }
}

export function loadSeeLaterItems(userEmail?: string): SeeLaterItem[] {
  try {
    const key = getKey(BASE_KEYS.SEE_LATER, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (!userEmail || userEmail === 'nrkamde333@gmail.com') {
        return INITIAL_SEE_LATER_ITEMS;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        ...item,
        priority: item.priority || (item.triageState === 'next_checked' ? 'high' : idx % 2 === 0 ? 'medium' : 'low'),
      }));
    }
    return INITIAL_SEE_LATER_ITEMS;
  } catch {
    return INITIAL_SEE_LATER_ITEMS;
  }
}

export function saveSeeLaterItems(items: SeeLaterItem[], userEmail?: string): void {
  try {
    const key = getKey(BASE_KEYS.SEE_LATER, userEmail);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save see later items', e);
  }
}

export function loadConnectors(userEmail?: string): ConnectorConfig[] {
  try {
    const key = getKey(BASE_KEYS.CONNECTORS, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return INITIAL_CONNECTORS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CONNECTORS;
    // Merge with INITIAL_CONNECTORS to ensure newly added connectors like slack are present
    return INITIAL_CONNECTORS.map((def) => {
      const found = parsed.find((p: any) => p.id === def.id);
      return found ? { ...def, ...found } : def;
    });
  } catch {
    return INITIAL_CONNECTORS;
  }
}

export function saveConnectors(connectors: ConnectorConfig[], userEmail?: string): void {
  try {
    const key = getKey(BASE_KEYS.CONNECTORS, userEmail);
    localStorage.setItem(key, JSON.stringify(connectors));
  } catch (e) {
    console.error('Failed to save connectors', e);
  }
}

export function loadAllTasks(userEmail?: string): ExtractedTask[] {
  try {
    const key = getKey(BASE_KEYS.TASKS, userEmail);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAllTasks(tasks: ExtractedTask[], userEmail?: string): void {
  try {
    const key = getKey(BASE_KEYS.TASKS, userEmail);
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}
